# Yapay Zeka Kullanım Şekilleri
Bu projede Gemini 3 Flash yardımcı olarak kullanılmıştır
## Kod İskeleti 
* Projenin başlangıcında HTML5 Canvas ve Javascript için genel iskelet yapay zekaya oluşturulmuştur. 
* Sonradan iskeletin temel yapısı tekrar tekrar değiştirilmiştir.
* Sonraki aşamalarda bu konu hakkında sadece debug için kullanılmıştır.
## Kullanılan Metotlar
* Proje başlangıcında projede kullanılacak metotların listesini yapay zekaya "Top-Down 2D RPG oyunlarında ne gibi teknikler kullanılır" tarzı promptlarla sorarak hem bilgi alınmış hem de kullanılacak metotlar belirlenmiştir.
* Projenin ilerleyen aşamalarında metotların algoritmalarında oluşan mantık hatalarını düzenlemek ve drawFog algoritmasını öğrenmek için kullanılmıştır.
## Diğer Kullanımlar
* HTML ve CSS tarafları en başta belirlenirken tasarım yardımları alınmıştır. Daha sonra buralarda tamamen manuel düzeltmeler yapılmıştır.
* Algoritmik mantık proje üyeleri tarafından kurgulanmış, yapay zeka ise bu mantığın JavaScript Canvas API standartlarına uygun şekilde prototiplenmesinde yardımcı araç olarak kullanılmıştır.
* Yazılan metotların algoritmalarında yapay zeka katkısı sadece algoritmayı syntaxa dökebilme düzeyinde ve kısıtlıdır. 
## Kullanılan Bazı Promptlar ve Cevapları
Not: Proje geliştirme sürecinde yapay zeka ile yapılan tüm teknik diyaloglar, dosya boyutunu makul tutmak adına en kritik 5 aşamaya indirgenerek aşağıda temsilen örneklendirilmiştir. Konuşmaların odağı algoritma mantığı ve teknik hata ayıklama üzerinedir.

Prompt:2D Top-Down Rpg oyunumda karakterin labirentte etrafını görememesi için ekranı karartıp belirli bi yarıçapı nasıl aydınlatırım öncelikle kod vermeden nasıl yapılacağı ile başla.

Cevap:Canvas üzerinde bunu yapmanın en verimli ve temiz yolu, ana oyun ekranının üzerine siyah bir "perde" çekip, oyuncunun olduğu yeri silerek (saydamlaştırarak) alt katmanı görmemizi sağlamaktır.
Adım adım algoritmayı ve koda nasıl dökebileceğimizi kuralım:
Algoritmik Mantık:
* Oyunun her karesini (draw()) çizerken, tüm zemini ve duvarları çizdikten hemen sonra sisi çizmeliyiz.
* Tüm sahneyi siyah bir dikdörtgenle kaplayacağız.
* Ardından oyuncunun merkez koordinatlarını baz alan, belirli bir yarıçapta (player.lightRadius) bir daire çizeceğiz.
* Bu daireyi globalCompositeOperation = 'destination-out' moduna alarak, siyah perdenin içinden "kazıyacağız". Bu mod, yeni çizilen şeklin (daire), mevcut çizimin (siyah perde) üst üste binen kısımlarını saydamlaştırmasını sağlar.

Prompt:Bunun kodunu yazabilmek için gereken metotları ve parametrelerini ver:

Cevap:1. drawFog() (Savaş Sisi ve Aydınlatma)
Bu metot, oyuncunun etrafındaki görüş alanını belirlemek için Canvas'ın maskeleme özelliklerini kullanır.
* tempCtx.createRadialGradient(x0, y0, r0, x1, y1, r1): Işık halkasını oluşturur.
* x0, y0, r0: İç dairenin merkezi ve yarıçapı (Tam aydınlık kısım).
* x1, y1, r1: Dış dairenin merkezi ve yarıçapı (Karanlığa geçiş sınırı).
* tempCtx.globalCompositeOperation = "destination-out": Siyah perdeyi ışıkla "silmek" için kullanılan moddur.
* tempCtx.arc(x, y, radius, startAngle, endAngle): Işık dairesinin sınırlarını belirler.

Prompt: "game.js" (tüm js dosyasını yükleyip) kodun genel bütünlüğü nasıl

Cevap:Kodun genel bütünlüğü, bir bilgisayar mühendisliği öğrencisi için "modüler" ve "sistemli" bir yaklaşım sergiliyor. Projeyi sadece bir oyun değil, bir yazılım projesi gibi katmanlara ayırmışsın.
Kodunu şu 4 ana kriter üzerinden analiz ettim:
* 1. Mimari ve Veri Yapısı (Architecture):Kodun iskeletini global değişkenlerle (map, rooms, player, enemies) kurman, fonksiyonların birbirine veri aktarmasını kolaylaştırmış.
* 2. Algoritmik Derinlik (Algorithmic Depth): Zindan Üretimi: Recursive Backtracking kullanarak her zaman "geçilebilir" (reachable) bir harita oluşturman çok kritik. stack yapısını kullanarak çıkmaz sokaklardan geri dönme mantığın harika çalışıyor. Dinamik Zorluk: placeEnemies fonksiyonunda kullandığın Manhattan Distance (distToExit) hesabı, oyun tasarımında "Progression" (İlerleme) mantığını bildiğini gösteriyor. Çıkışa yaklaştıkça gardiyanların canının artması, koduna bir "zeka" katmış.
* 3. Görselleştirme ve Grafik Yönetimi: Maskeleme: drawFog içinde kullandığın destination-out tekniği, projenin "zenginlik" puanını garantiliyor.
* 4. Olay Yönetimi ve State Machine: Durum Kontrolü: inBattle değişkeni ile oyuncunun hareketini kısıtlaman, kodun içinde bir "State Machine" (Durum Makinesi) mantığı olduğunu gösteriyor. (Keşif Durumu vs. Savaş Durumu).
* Gözlemlediğim Küçük Eksikler / İyileştirmeler: Kod Tekrarı: placeEnemies fonksiyonunun sonunda havada kalan o parça (tuzakları ekleyen kısım) syntax hatasına yol açabilir, orayı ana fonksiyonun içine if-else ile birleştirmelisin. Temizlik: checkPotion içinde yorum satırına alınmış ama silinmemiş ses kodları var. Teslimden önce "dead code" (ölü kod) temizliği yapman kodun kalitesini artırır.

Prompt:Gardiyanı sadece tekli koridorlara atarken dikey ve yatay olarak karşılaştırma yapmamız gerekiyor değil mi kodda nasıl yazacağız bunu

Cevap:(kodu verir) 
* Neden || (VEYA) kullanıyoruz? Çünkü bir hücre aynı anda hem dikey hem yatay koridor olamaz (o zaman etrafı tamamen duvarla çevrili hapis bir hücre olurdu). Hücrenin ya sağ-solu kapalıdır ya da üst-altı.
* Stratejik Avantaj: Bu kontrol sayesinde gardiyanlar zindanın "boğaz" noktalarına yerleşir. Oyuncu bu dar yoldan geçmek zorundaysa savaşa girmek zorunda kalır. Bu da oyunun "zorluk" (challenge) dengesini sağlar.

Prompt:rollDice ilk açılışta düzgün açılıyor ikincisinde önceki ekran geliyor ve tuş disabled oluyor nedeni ne olabilir

Cevap:rollDice ilk açılışta düzgün açılıyor ikincisinde önceki ekran geliyor ve tuş disabled oluyor nedeni ne olabilir
Bu sorun, bilgisayar mühendisliğinde sıkça karşılaşılan bir "State Management" (Durum Yönetimi) hatasıdır. Fonksiyonun bir önceki çalışmasından kalan değerlerin temizlenmemesi (resetlenmemesi), kodun "sıkışmasına" neden oluyor. Analizime göre sorunun iki ana kaynağı var:
* disabled Durumunun Sıfırlanmaması: rollDice fonksiyonunun başında rollBtn.disabled = true; yapıyorsun ama savaş bittiğinde (closeBattle) bu butonu tekrar aktif hale getirmiyorsun. İkinci açılışta buton, bir önceki savaştan kalan disabled halini koruyor.
* UI ve Değişkenlerin Temizlenmemesi: Zar ekranındaki metinler (? işaretleri veya eski rakamlar) ve currentEnemy verisi temizlenmediği için, ekran açıldığında eski verilerle yükleniyor.
Kesin Çözüm: checkEnemy İçinde Resetleme
Zar ekranını açan checkEnemy fonksiyonunun en başına, arayüzü fabrika ayarlarına döndüren şu satırları eklemelisin (kod).
