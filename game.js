// 1. Temel Kurulum ve Global Değişkenler
const canvas = document.getElementById("gameCanvas");
const miniCanvas = document.getElementById("miniMap");

// Global tanımlıyoruz ki her fonksiyon erişebilsin
let ctx, miniCtx;

const mapSize = 7;
const tileSize = 70;

let map = [];
let rooms = [];
let exitRoom = null;
let enemies = [];
let inBattle = false;
let currentEnemy = null;

// Karakter Görselleri Nesnesi
const images = {
    down: new Image(),
    up: new Image(),
    left: new Image(),
    right: new Image()
};

// Dosya yolları (Türkçe karakterlerden kaçınmak her zaman daha güvenlidir: sag, on vb.)
images.down.src = 'onyeni_karakter.png';
images.up.src = 'arka3_karakter.png';
images.left.src = 'solyeni_karakter.png';
images.right.src = 'sagyeni_karakter.png';

// Tek bir Player nesnesi tanımlıyoruz
const player = {
    x: 0,
    y: 0,
    hp: 10,
    lightRadius: 150,
    direction: 'down'
};

// 2. Harita Oluşturma Mantığı
function generateMap() {
    map = Array.from({ length: mapSize }, () => Array(mapSize).fill(0));
    rooms = [];

    let startX = Math.floor(mapSize / 2);
    let startY = Math.floor(mapSize / 2);
    
    player.x = startX;
    player.y = startY;

    let stack = [{ x: startX, y: startY }];
    map[startY][startX] = 1;
    rooms.push({ x: startX, y: startY });

    let directions = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
    let roomCount = 12;

    while (rooms.length < roomCount && stack.length > 0) {
        let current = stack[Math.floor(Math.random() * stack.length)];
        let dir = directions[Math.floor(Math.random() * directions.length)];
        let nx = current.x + dir.x;
        let ny = current.y + dir.y;

        if (nx >= 0 && ny >= 0 && nx < mapSize && ny < mapSize && map[ny][nx] === 0) {
            map[ny][nx] = 1;
            rooms.push({ x: nx, y: ny });
            stack.push({ x: nx, y: ny });
        }
    }
    findFarthestRoom(startX, startY);
    placeEnemies();
}

function findFarthestRoom(sx, sy) {
    let maxDist = -1;
    rooms.forEach(room => {
        let dist = Math.abs(room.x - sx) + Math.abs(room.y - sy);
        if (dist > maxDist) {
            maxDist = dist;
            exitRoom = room;
        }
    });
}

function placeEnemies() {
    enemies = [];
    rooms.forEach(room => {
        if ((room.x !== player.x || room.y !== player.y) && 
            (room.x !== exitRoom.x || room.y !== exitRoom.y)) {
            if (Math.random() > 0.7) { 
                enemies.push({ x: room.x, y: room.y });
            }
        }
    });
}

// 3. Çizim Fonksiyonları
function draw() {
    if (!ctx) return; // Hata önleyici

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Odaları çiz
    for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
            if (map[y][x] === 1) {
                ctx.fillStyle = "#333";
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
            ctx.strokeStyle = "#222";
            ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }

    // Çıkış (Altın kapı gibi görünür)
    if (exitRoom) {
        ctx.fillStyle = "gold";
        ctx.fillRect(exitRoom.x * tileSize + 20, exitRoom.y * tileSize + 20, tileSize - 40, tileSize - 40);
    }

    // Karakter Çizimi
    const currentImg = images[player.direction];
    if (currentImg.complete && currentImg.naturalWidth !== 0) {
        ctx.drawImage(
            currentImg, 
            player.x * tileSize + 5, 
            player.y * tileSize + 5, 
            tileSize - 10, 
            tileSize - 10
        );
    } else {
        // Resim yüklenmediyse geçici olarak yeşil kare çiz
        ctx.fillStyle = "lime";
        ctx.fillRect(player.x * tileSize + 15, player.y * tileSize + 15, tileSize - 30, tileSize - 30);
    }

    drawFog();
    drawMiniMap();
}

function drawFog() {
    let tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    let tempCtx = tempCanvas.getContext('2d');

    tempCtx.fillStyle = "black";
    tempCtx.fillRect(0, 0, canvas.width, canvas.height);

    tempCtx.globalCompositeOperation = "destination-out";
    let gradient = tempCtx.createRadialGradient(
        player.x * tileSize + tileSize / 2,
        player.y * tileSize + tileSize / 2,
        10,
        player.x * tileSize + tileSize / 2,
        player.y * tileSize + tileSize / 2,
        player.lightRadius
    );
    gradient.addColorStop(0, "rgba(0,0,0,1)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    
    tempCtx.fillStyle = gradient;
    tempCtx.beginPath();
    tempCtx.arc(player.x * tileSize + tileSize/2, player.y * tileSize + tileSize/2, player.lightRadius, 0, Math.PI*2);
    tempCtx.fill();

    ctx.drawImage(tempCanvas, 0, 0);
}

function drawMiniMap() {
    if (!miniCtx) return;
    let s = 20;
    miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);
    for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
            if (map[y][x] === 1) {
                miniCtx.fillStyle = (x === player.x && y === player.y) ? "lime" : "#555";
                if (exitRoom && x === exitRoom.x && y === exitRoom.y) miniCtx.fillStyle = "gold";
                miniCtx.fillRect(x * s, y * s, s - 2, s - 2);
            }
        }
    }
}

// 4. Hareket ve Savaş Mantığı
function movePlayer(dx, dy) {
    if (inBattle) return;

    if (dx > 0) player.direction = 'right';
    else if (dx < 0) player.direction = 'left';
    else if (dy > 0) player.direction = 'down';
    else if (dy < 0) player.direction = 'up';

    let nx = player.x + dx;
    let ny = player.y + dy;

    if (nx >= 0 && ny >= 0 && nx < mapSize && ny < mapSize && map[ny][nx] === 1) {
        player.x = nx;
        player.y = ny;
        
        checkEnemy();
        
        if (exitRoom && player.x === exitRoom.x && player.y === exitRoom.y) {
            setTimeout(() => {
                alert("TEBRİKLER! Zindandan kaçtınız.");
                location.reload();
            }, 100);
        }
        draw();
    }
}

function checkEnemy() {
    let ei = enemies.findIndex(e => e.x === player.x && e.y === player.y);
    if (ei !== -1) {
        inBattle = true;
        currentEnemy = { index: ei };
        document.getElementById("diceScreen").classList.remove("hidden");
    }
}

function rollDice() {
    let p = Math.ceil(Math.random() * 6);
    let e = Math.ceil(Math.random() * 6);
    document.getElementById("playerDice").innerText = p;
    document.getElementById("enemyDice").innerText = e;
    
    setTimeout(() => {
        if (p >= e) {
            alert("Kazandın!");
            enemies.splice(currentEnemy.index, 1);
            inBattle = false;
            document.getElementById("diceScreen").classList.add("hidden");
            draw();
        } else {
            player.hp -= 2;
            alert("Hasar aldın! Kalan Can: " + player.hp);
            document.getElementById("hpValue").innerText = player.hp;

            const hpElement = document.getElementById("hpValue");
            const hpBar = document.getElementById("hpBar");

            if (hpElement) hpElement.innerText = player.hp; // Sayıyı günceller
            
            if (hpBar) {
                let hpPercent = (player.hp / 10) * 100; // Can yüzdesini hesaplar
                if (hpPercent < 0) hpPercent = 0;
                hpBar.style.width = hpPercent + "%"; // Bar genişliğini günceller
            }

            if (player.hp <= 0) {
                alert("Öldün...");
                location.reload();
            }
        }
    }, 500);
}

// 5. Başlatıcı ve Olay Dinleyiciler
window.onload = () => {
    // Canvas bağlantılarını burada kuruyoruz (null hatasını önler)
    if (canvas && miniCanvas) {
        ctx = canvas.getContext("2d");
        miniCtx = miniCanvas.getContext("2d");
        
        generateMap();
        draw();
    } else {
        console.error("Canvas elementleri bulunamadı!");
    }
};

document.addEventListener("keydown", (e) => {
    if (inBattle) return;
    if (e.key === "ArrowUp") movePlayer(0, -1);
    if (e.key === "ArrowDown") movePlayer(0, 1);
    if (e.key === "ArrowLeft") movePlayer(-1, 0);
    if (e.key === "ArrowRight") movePlayer(1, 0);
});