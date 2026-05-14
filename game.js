// 1. Temel Kurulum ve Global Değişkenler
const canvas = document.getElementById("gameCanvas");
const stepSound = document.getElementById("soundStep");
//const miniCanvas = document.getElementById("miniMap");

// Global tanımlıyoruz ki her fonksiyon erişebilsin
let ctx ;

//Boyut Ayarları
const mapWidth = 30;  // Yatayda 30 oda (1200 / 40)
const mapHeight = 15; // Dikeyde 15 oda (600 / 40)
const tileSize = 40;  // Her oda 40x40 piksel

// Oda sayısını da alanı dolduracak şekilde artıralım
let roomCount = 300;   // 450 toplam alanda 300 oda gezilebilir bir zindan yaratır

let map = [];// Zindan verisini Zemin:1 Duvar:0 şeklinde tutar
let rooms = [];//Zemin olan karelerin koordinat listesi
let exitRoom = null;
let potions = [];
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

images.down.src = 'assets/images/onyeni_karakter.png';
images.up.src = 'assets/images/arka3_karakter.png';
images.left.src = 'assets/images/solyeni_karakter.png';
images.right.src = 'assets/images/sagyeni_karakter.png';

//Player nesnesi
const player = {
    x: 0,
    y: 0,
    hp: 10,
    lightRadius: 150,
    direction: 'down'
};
// Zemin, Duvar ve İksir Görselleri (tileImages nesnesini ekledik)
const tileImages = {
    floor: new Image(),
    wall: new Image()
};
const potionImg = new Image();
tileImages.floor.src = 'assets/images/zemin.png';
tileImages.wall.src = 'assets/images/duvar.png';
potionImg.src = 'assets/images/iksir.png';
// Düşman (Tuzak ve Gardiyan) Görselleri
const enemyImages = [new Image(), new Image(), new Image(), new Image()];
enemyImages[0].src = 'assets/images/su_birikintisi.png'; // 1. düşman görseli (Su)
enemyImages[1].src = 'assets/images/petrol_birikintisi.png'; // 2. düşman görseli (Petrol)
enemyImages[2].src = 'assets/images/yag_birikintisi.png'; // 3. düşman görseli (Yağ)
enemyImages[3].src = 'assets/images/guardian.png'; // 4. düşman görseli (Gardiyan)

const guardImg = enemyImages[3]; // Kolay erişim için referans
// Müzik Döngüsü
let isMusicStarted = false;

function toggleMusic(play) {
    const music = document.getElementById("loopMusic"); // ID düzeltildi
    if (!music) return;

    if (play) { 
        music.volume =0.3; 
        music.loop = true; // Tarayıcı loop özelliğini zorla aç
        
        music.play().catch(err => {
            console.log("Müzik çalma hatası:", err);
        });
        isMusicStarted = true;
    } else {
        music.pause();
    }

    // Loop özelliğinin tarayıcı tarafından unutulmasına karşı manuel koruma
    music.onended = function() {
        if (isMusicStarted && !inBattle) {
            this.currentTime = 0;
            this.play();
        }
    };
}
// 2. Harita Oluşturma Mantığı
function generateMap() {
    // Haritayı tamamen duvarla (0) doldur
    map = Array.from({ length: mapHeight }, () => Array(mapWidth).fill(0));
    rooms = [];

    // Başlangıç noktasını belirle (merkez yerine rastgele bir yer daha zor olabilir)
    let startX = Math.floor(Math.random() * mapWidth);
    let startY = Math.floor(Math.random() * mapHeight);
    
    player.x = startX;
    player.y = startY;

    let stack = [{ x: startX, y: startY }];
    map[startY][startX] = 1;
    rooms.push({ x: startX, y: startY });

    let directions = [
        { x: 0, y: -1 }, { x: 0, y: 1 }, 
        { x: -1, y: 0 }, { x: 1, y: 0 }
    ];

    /*Stack Mantığı ile Labirent Örme:
	stack.length > 0 olduğu sürece algoritma zindanın derinliklerine dallanmaya devam eder.
	Bu döngü, her adımda yeni bir hücreye gider ve "çıkmaz sokağa" girdiğinde stack'ten geri dönerek 
	henüz keşfedilmemiş yolları arar. Bu, tüm zindanın birbirine bağlı olmasını sağlar.
	*/
    while (stack.length > 0) {
        // En son eklenen odayı al
        let current = stack[stack.length - 1];
        
        // Rastgeleliği arttırmak için komşu odaların sırasını her seferinde karıştırır
        let shuffledDirs = directions.sort(() => Math.random() - 0.5);
        let found = false;

        for (let dir of shuffledDirs) {
            let nx = current.x + dir.x;
            let ny = current.y + dir.y;

            // Labirent kuralı: Gitmek istediğimiz yer harita içinde mi ve boş mu?
            if (nx >= 0 && ny >= 0 && nx < mapWidth && ny < mapHeight && map[ny][nx] === 0) {
                // Ekstra Zorluk: Bir koridorun diğer koridora çok fazla yapışmasını engelle (Labirent dokusu)
                let neighbors = 0;
                for (let d of directions) {
                    let nnx = nx + d.x;
                    let nny = ny + d.y;
                    if (nnx >= 0 && nny >= 0 && nnx < mapWidth && nny < mapHeight) {
                        if (map[nny][nnx] === 1) neighbors++;
                    }
                }

                // Eğer herhangi bir odanın tek komşusu varsa yolu tekli devam ettirip labirenti ızgara olmaktan korur
                if (neighbors <= 1 || Math.random() > 0.8) {
                    map[ny][nx] = 1;
                    rooms.push({ x: nx, y: ny });
                    stack.push({ x: nx, y: ny });
                    found = true;
                    break;
                }
            }
        }

        // Eğer gidecek yer yoksa geri döner 
        if (!found) {
            stack.pop();
        }
        
        // Maksimum oda sınırını korur
        if (rooms.length >= 300) break;
    }

    findFarthestRoom(startX, startY);
    placePotions();
	placeEnemies();
}
//Bitiş noktasını oyuncudan en uzak noktaya atar
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
function placePotions() {
    potions = [];
    rooms.forEach(room => {
        // Başlangıç ve bitiş odası hariç odalara %5 ihtimalle iksir koyar
        if (Math.random() > 0.95 && 
           (room.x !== player.x || room.y !== player.y) && 
           (room.x !== exitRoom.x || room.y !== exitRoom.y)) {
            potions.push({ x: room.x, y: room.y });
        }
    });
}
//Düşmanları rastgele yerleştirmek için
function placeEnemies() {
    // Düşman listesini her üretimde sıfırla
    enemies = [];

    rooms.forEach(room => {
        // Kısıt: Oyuncunun başlangıç noktasında veya çıkış kapısında düşman oluşamaz
        if ((room.x === player.x && room.y === player.y) || 
            (room.x === exitRoom.x && room.y === exitRoom.y)) return;
        
        // Yatay veya dikey dar geçitleri kontrol edip gardiyanların sadece tekli koridorlara yerleştrilmesini sağlar
        let isHorizontalCorridor = (map[room.y][room.x - 1] === 0 && map[room.y][room.x + 1] === 0);
        let isVerticalCorridor = (map[room.y - 1] && map[room.y - 1][room.x] === 0 && map[room.y + 1] && map[room.y + 1][room.x] === 0);

        // Eğer nokta bir koridorsa, %6 ihtimalle bir gardiyan yerleştir
        if (isHorizontalCorridor || isVerticalCorridor) {
            if (Math.random() > 0.94) {
                
                // Manhattan Mesafesi Hesaplama: Çıkışa ne kadar yakınız?
                // Formül: |x1 - x2| + |y1 - y2|
                let distToExit = Math.abs(room.x - exitRoom.x) + Math.abs(room.y - exitRoom.y);
                
                /**
                 * Zorluk Ölçeklendirme Algoritması:
                 * Çıkış kapısına yaklaştıkça gardiyanların can değeri (HP) artar.
                 * 10 birimden yakınsa: 4 HP (Güçlü)
                 * 25 birimden yakınsa: 2 HP (Orta)
                 * Daha uzaksa: 1 HP (Zayıf)
                 */
                let guardHP = distToExit < 10 ? 4 : (distToExit < 25 ? 2 : 1);

                // Düşman objesini oluştur ve diziye ekle
                enemies.push({ 
                    x: room.x, 
                    y: room.y, 
                    type: 3,        // Düşman tip kodu
                    hp: guardHP,    // Mevcut can
                    maxHp: guardHP  // UI üzerinde can barı gösterimi için referans değer
                });
                return; 
            }
        }
        
        // Eğer gardiyan yerleşmediyse tuzak ihtimalini kontrol et
        if (Math.random() > 0.94) {
            enemies.push({ 
                x: room.x, 
                y: room.y, 
                type: Math.floor(Math.random() * 3),
                hp: 1 // Tuzaklar tek vuruşluktur
            });
        }
    });
}

// 3. Çizim Fonksiyonları
function draw() {
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Önce zemini ve duvarları çiz (Döngü bittikten sonra düşmanlara geçeceğiz)
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            let posX = x * tileSize;
            let posY = y * tileSize;

            if (map[y][x] === 1) {
                if (tileImages.floor.complete && tileImages.floor.naturalWidth !== 0) {
                    ctx.drawImage(tileImages.floor, posX, posY, tileSize, tileSize);
                } else {
                    ctx.fillStyle = "#333";
                    ctx.fillRect(posX, posY, tileSize, tileSize);
                }
            } else {
                if (tileImages.wall.complete && tileImages.wall.naturalWidth !== 0) {
                    ctx.drawImage(tileImages.wall, posX, posY, tileSize, tileSize);
                } else {
                    ctx.fillStyle = "#111";
                    ctx.fillRect(posX, posY, tileSize, tileSize);
                }
            }
        }
    }
	// Haritadaki can iksirlerini çiz
	potions.forEach(p => {
    ctx.drawImage(potionImg, p.x * tileSize + 4, p.y * tileSize + 4, 32, 32);
	});
    // Düşmanları (tuzak ve gardiyanlar) çiz
	enemies.forEach(enemy => {
		let dx = Math.abs(player.x - enemy.x);
		let dy = Math.abs(player.y - enemy.y);

		// Zorluğu dengelemek adına sadece oyuncunun etrafındaki 3x3 alandakileri çiz (Sis mantığı)
		if (dx <= 1 && dy <= 1) {
			const eImg = enemyImages[enemy.type];
			
			if (eImg && eImg.complete && eImg.naturalWidth !== 0) {
				
				//Gardiyan tek tile içine tamamen sığdırılır
				if (enemy.type === 3) {
					ctx.drawImage(
						eImg, 
						enemy.x * tileSize, 
						enemy.y * tileSize, 
						tileSize, 
						tileSize
					);
				} else {
					//Tuzaklar için kenarlardan 5px boşluk bırakılır
					ctx.drawImage(
						eImg, 
						enemy.x * tileSize + 5, 
						enemy.y * tileSize + 5, 
						tileSize - 10, 
						tileSize - 10
					);
				}
				// -----------------------------
			}
		}
	});

    // 3. Çıkış Kapısını çiz(altın kare)
    if (exitRoom) {
        ctx.fillStyle = "gold";
        ctx.fillRect(exitRoom.x * tileSize + 10, exitRoom.y * tileSize + 10, tileSize - 20, tileSize - 20);
    }

    // 4. Karakteri çiz
    const currentImg = images[player.direction];
    if (currentImg.complete && currentImg.naturalWidth !== 0) {
        ctx.drawImage(currentImg, player.x * tileSize + 3, player.y * tileSize + 3, tileSize - 6, tileSize - 6);
    }

    // 5. En son sisi çiz (Her şeyin üstünü örtsün diye)
    drawFog();
}
/**
 * Oyuncunun etrafındaki aydınlık alanı hesaplar ve geri kalan her şeyi karanlıkta bırakır.
 * "Destination-out" kompozisyon yöntemini kullanarak dinamik bir ışık halkası oluşturur.
 */
function drawFog() {
	//Ana sahneyi bozmamak için geçici bir canvas oluşturur
    let tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    let tempCtx = tempCanvas.getContext('2d');
	//Tüm ekranı siyah bir örtüyle kaplar
    tempCtx.fillStyle = "black";
    tempCtx.fillRect(0, 0, canvas.width, canvas.height);
	//Siyah örtüyü oyuncunun alpha değeri olarak belirttiğimiz değişken miktarında kazır ve altındakilerin görünmesini sağlar
    tempCtx.globalCompositeOperation = "destination-out";
	//Oyuncunun merkzinden dışarı doğru yumuşak bir ışık kaynağı oluşturur
    let gradient = tempCtx.createRadialGradient(
        player.x * tileSize + tileSize / 2,
        player.y * tileSize + tileSize / 2,
        10,//İç yarıçap (tam aydınlık kısım)
        player.x * tileSize + tileSize / 2,
        player.y * tileSize + tileSize / 2,
        player.lightRadius//Dış yarıçap (kararmaya başlayan kısım)
    );
    gradient.addColorStop(0, "rgba(0,0,0,1)");//Merkez saydam 
    gradient.addColorStop(1, "rgba(0,0,0,0)");//Kenarlar opak
    
	//Belirlenen değerlerle ışık dairesini çiz
    tempCtx.fillStyle = gradient;
    tempCtx.beginPath();
    tempCtx.arc(player.x * tileSize + tileSize/2, player.y * tileSize + tileSize/2, player.lightRadius, 0, Math.PI*2);
    tempCtx.fill();
 	//Sis tabakasını üst katman yap
    ctx.drawImage(tempCanvas, 0, 0);
}
//Sis çizdirmeye başladıktan sonra kaldırdık ama fikir olarak kalabilir
/*function drawMiniMap() {
    if (!miniCtx) return;
    let s = 10; // 
    miniCtx.clearRect(0, 0, miniCanvas.width, miniCanvas.height);
	
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            if (map[y][x] === 1) {
                miniCtx.fillStyle = (x === player.x && y === player.y) ? "lime" : "#932d2d";
                if (exitRoom && x === exitRoom.x && y === exitRoom.y) miniCtx.fillStyle = "gold";
                miniCtx.fillRect(x * s, y * s, s - 1, s - 1);
            }
        }
    }
}*/
// 4. Hareket ve Savaş Mantığı
function movePlayer(dx, dy) {
    if (inBattle) return;

    if (dx > 0) player.direction = 'right';
    else if (dx < 0) player.direction = 'left';
    else if (dy > 0) player.direction = 'down';
    else if (dy < 0) player.direction = 'up';

    let nx = player.x + dx;
    let ny = player.y + dy;

if (nx >= 0 && ny >= 0 && nx < mapWidth && ny < mapHeight && map[ny][nx] === 1) {
            player.x = nx;
        player.y = ny;
        
        checkEnemy();
		checkPotion();
        
        // Çıkış odasına ulaşıldı mı?
        if (exitRoom && player.x === exitRoom.x && player.y === exitRoom.y) {
    inBattle = true; // Hareketi dondur
    
    // Zafer müziğini başlat
    const victoryMusic = document.getElementById("soundVictoryLoop");
    if (victoryMusic) {
        victoryMusic.currentTime = 0;
        victoryMusic.play();
    }

    // WinScreen'i göster
    document.getElementById("winScreen").classList.remove("hidden");
    draw();
}
        draw();
    }
}

function checkPotion() {
    // Mevcut konumdaki iksiri bul
    let pIndex = potions.findIndex(p => p.x === player.x && p.y === player.y);
    
    if (pIndex !== -1) {
        const potionSound = document.getElementById("soundPotion");
        if (potionSound) {
            potionSound.currentTime = 0; // Sesin her seferinde baştan çalması için
            potionSound.play();
        }
        // Mekanik: 2 Can Yenile (Max 10)
        player.hp = Math.min(10, player.hp + 2);
        
        updateUI();
        // Arayüzü Güncelle
        const hpLabel = document.getElementById("hpValue");
        if (hpLabel) hpLabel.innerText = player.hp;

        // Efekt: Ses çal
       /* const healSound = document.getElementById("soundHeal");
        if (healSound) {
            healSound.currentTime = 0;
            healSound.play().catch(() => {});
        }*/
        potions.splice(pIndex, 1);
        draw(); 
        console.log("İksir toplandı! Yeni HP: " + player.hp);
    }
}
//Dışardaki can değerini dinamik olarak günceller
function updateUI() {
    const hpElement = document.getElementById("hpValue");

    if (hpElement) hpElement.innerText = player.hp;
    
}

function checkEnemy() {
    let ei = enemies.findIndex(e => e.x === player.x && e.y === player.y);
    if (ei === -1) return;

    //mevcut düşmanı indexe atayıp savaş modunu aktif eder ileride roll dice ekranını çağırmak için
    currentEnemy = { index: ei }; 
    inBattle = true;
    //tanımlamalar
    const enemyData = enemies[ei];
    const battleTitle = document.getElementById("battleTitle");
    const enemyLabel = document.getElementById("enemyLabel");
    const statusText = document.getElementById("battleStatus");
    const vsArea = document.querySelector(".vs");
    const enemyWrapper = document.getElementById("enemyDice")?.parentElement;

    //rollDice ekranının önceki verilerini burada sıfırlıyoruz
    document.getElementById("playerDice").innerText = "?";
    document.getElementById("enemyDice").innerText = "?";
    document.getElementById("rollBtn").disabled = false;
if (enemyData.type === 3) {
    //Gardiyan için ayrı tuzaklar için ayrı başlıklar gelebilmesi için direk html başlıklarına atama yaptık
    const h2Title = document.querySelector("#diceScreen h2") || document.getElementById("battleTitle");
    if (h2Title) h2Title.innerText = "⚔️ GARDİYANLA SAVAŞ!";
    const labels = document.querySelectorAll("#diceScreen .dice-container span");
    if (labels.length > 1) labels[1].innerText = "GARDİYAN";

    // Görünürlük ayarları
    if (vsArea) vsArea.style.display = "inline-block";
    if (enemyWrapper) enemyWrapper.style.display = "block";

    if (statusText) {
        statusText.innerText = `Gardiyan Canı: ${enemyData.hp}`;
        statusText.style.color = "white";
    }
} else {
    //Aynı şekilde tuzaklar için 
    const h2Title = document.querySelector("#diceScreen h2") || document.getElementById("battleTitle");
    if (h2Title) h2Title.innerText = "⚠️ TUZAKTAN KURTUL!";

    const labels = document.querySelectorAll("#diceScreen .dice-container span");
    if (labels.length > 1) labels[1].innerText = "TUZAK";

    if (vsArea) vsArea.style.display = "none";
    if (enemyWrapper) enemyWrapper.style.display = "none";

    const trapNames = ["Su", "Petrol", "Yağ"];
    if (statusText) {
        statusText.innerText = `${trapNames[enemyData.type]} Birikintisi!`;
        statusText.style.color = "white";
    }
}
	//En son zar ekranını çağırır
    document.getElementById("diceScreen").classList.remove("hidden");
}
function rollDice() {
    const rollBtn = document.getElementById("rollBtn");
    const pDice = document.getElementById("playerDice");
    const eDice = document.getElementById("enemyDice");
    const statusText = document.getElementById("battleStatus");
    const hpValue = document.getElementById("hpValue");
    const shakingSound = document.getElementById("soundDiceShaking");

    if (!currentEnemy || inBattle === false) return;
    rollBtn.disabled = true;

    //Sesi başlatır
    if (shakingSound) {
        shakingSound.currentTime = 0; // Her atışta baştan başlar
        shakingSound.play();
    }
    const enemyData = enemies[currentEnemy.index];
    
    pDice.classList.add("shaking");
    eDice.classList.add("shaking"); // Gardiyan gelirse her iki zar da sallanır

    setTimeout(() => {
        //Sesi Durdurur
        if (shakingSound) {
            shakingSound.pause(); // Sallanma bitince sesi keser
        }

        pDice.classList.remove("shaking");
        eDice.classList.remove("shaking");
        
        // Zarları belirler
        const p = Math.ceil(Math.random() * 6);
        let e; // Düşman zar değeri

        if (enemyData.type === 3) {
            // Gardiyanla karşılıklı zar atılır
            e = Math.ceil(Math.random() * 6);
        } else {
            //Tuzaklar için sabit 3 hedefi
            e = 3; 
        }
        
        // 2. Görselleştir
        pDice.innerText = p;
        eDice.innerText = e;

        setTimeout(() => {
            // Karşılaştır 
            let targetValue = e; 

            //Eşitlik durumunda  hiçbişey yapmamasını sağlar
            if (p === targetValue) {
                statusText.innerText = "EŞİTLİK! Tekrar at.";
                statusText.style.color = "white";
                rollBtn.disabled = false;
                return;
            }
			//Eğer oyuncu daha yüksek atarsa kazanır
            let win = p > targetValue;
			//Kaybetme durumunda gardiyandan 3 tuzaktan 1 hasar alınır 
            let dmg = (enemyData.type === 3) ? 3 : 1;
			//Büyük zar gelme durumları
            if (win) {
                //başarılı vuruş sesi
				const successSound = document.getElementById("soundSuccess");
                if (successSound) {
                    
                    successSound.currentTime = 0;
                    successSound.play();
                }
				//Eğer rakip gardiyansa 1 hasar vurup kalan canını gösterir
                if (enemyData.type === 3) {
                    enemyData.hp--; 
                    if (enemyData.hp > 0) {
                        statusText.innerText = `DARBE! Kalan Can: ${enemyData.hp}`;
                        statusText.style.color = "#00ffff";
                        rollBtn.disabled = false; //bitmediyse tekrar zar attırır
                    } else {
                        statusText.innerText = "GARDİYAN DÜŞTÜ!";
                        statusText.style.color = "#00ff00";
                        setTimeout(closeBattle, 1000);
                    }
					//Tuzaklar için sadece kurtulma durumu
                } else {
                    statusText.innerText = "BAŞARILI!";
                    statusText.style.color = "#00ff00";
                    setTimeout(closeBattle, 1000);
                }
            } else {
                //Hasar alma durumu
                player.hp -= dmg;
                updateUI(); // Arayüzü günceller
                
                if (hpValue) hpValue.innerText = player.hp;
                statusText.innerText = `BAŞARISIZ! -${dmg} CAN`;
                statusText.style.color = "#ff4444";

                const damageSound = document.getElementById("soundDamage");
                if (damageSound) {
                    damageSound.currentTime = 0;
                    damageSound.play();
                }

                if (player.hp <= 0) {
                    inBattle = true; // Hareketi dondur
                    document.getElementById("soundDiceShaking")?.pause();
                    
                    setTimeout(() => {
                        // Zar ekranını gizle, kaybetme ekranını göster
                        document.getElementById("diceScreen").classList.add("hidden");
                        document.getElementById("loseScreen").classList.remove("hidden");
    
                        //Yenilgi sesini çal
                        document.getElementById("soundVictoryLoop")?.play();

                        if (defeatMusic) {
                        defeatMusic.currentTime = 0;
                        defeatMusic.play();
                        }
                    }, 300);
                    
                } else {
                    rollBtn.disabled = false; // Hayattaysa tekrar atabilsin
                }
            }
        }, 500);
    }, 800);
}
//rollDice ekranını kapatıp müziği tekrar başlatır arayüzü sıfırlar ve değişkenleri varsayılana döndürür
function closeBattle() {
    toggleMusic(true);

    if (currentEnemy && currentEnemy.index !== undefined) {
        enemies.splice(currentEnemy.index, 1);
    }
    
    inBattle = false;
    currentEnemy = null;
    
    const diceScreen = document.getElementById("diceScreen");
    if (diceScreen) {
        diceScreen.classList.add("hidden");
    }

    // UI'ı varsayılana döndür (Görünürlükleri aç)
    const vsText = document.querySelector(".vs");
    const enemyWrapper = document.getElementById("enemyDice").parentElement;
    
    if (vsText) vsText.style.display = "inline-block";
    if (enemyWrapper) enemyWrapper.style.display = "block";

    draw();
}

// 5. Başlatıcı ve Olay Dinleyiciler
window.onload = () => {
        ctx = canvas.getContext("2d");
        
        generateMap();
        draw();
    
};

document.addEventListener("keydown", (e) => {
    // Savaş sırasında hareketi ve sesleri engelle
    if (inBattle) return;

    const moveKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    
    // Eğer basılan tuş bir yön tuşuysa
    if (moveKeys.includes(e.key)) {
        
        // 1. Müzik henüz başlamadıysa ilk harekette başlat
        if (!isMusicStarted) {
            toggleMusic(true);
        }

        // 2. Adım sesini (stepSound) tetikle
        const stepSound = document.getElementById("soundStep");
        if (stepSound) {
            stepSound.currentTime = 0; // Sesi başa sar
            stepSound.play().catch(() => {}); // Tarayıcı engellerine karşı boş catch
        }

        // 3. Karakter Hareket Mantığı (else if ile optimize edildi)
        if (e.key === "ArrowUp") {
            movePlayer(0, -1);
        } else if (e.key === "ArrowDown") {
            movePlayer(0, 1);
        } else if (e.key === "ArrowLeft") {
            movePlayer(-1, 0);
        } else if (e.key === "ArrowRight") {
            movePlayer(1, 0);
        }
    }
});
