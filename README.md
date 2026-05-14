
## Oyun Ekran Görüntüleri

| Labirent Üretimi ve Savaş Sisi | Zar Tabanlı Savaş Sistemi | Oyun Karakteri | Kazanma Ekranı | Gardiyan Karşılaşmasında Çıkan Ekran |
|:---:|:---:|:---:|:---:|:---:|
| <img height="300" src="https://github.com/user-attachments/assets/81e44155-3763-4ce3-a7e7-93a4820cdd32" /> | <img height="300" src="https://github.com/user-attachments/assets/48823592-21ca-461a-a1fd-5ce88928b9b0" /> | <img height="300" src="https://github.com/ismailemret/DungeonInferno/blob/main/assets/images/onyeni_karakter.png" /> | <img width="350" height="227" alt="kazanma_Ekran görüntüsü " src="https://github.com/user-attachments/assets/e0e3f4db-7b7e-418c-9163-c693b6c25f5d" /> | <img width="369" height="406" alt="gardiyanZar_Ekran görüntüsü" src="https://github.com/user-attachments/assets/84edea9e-7b72-4cba-9318-bb63b363dcad" /> |




# ⛓️ Dungeon Inferno
Bu proje, HTML5 Canvas ve Vanilla JavaScript kullanılarak geliştirilmiş, prosedürel harita üretimi ve sıra tabanlı (turn-based) savaş mekaniklerine sahip bir 2D Dungeon Crawler oyunudur.
Proje; oyun döngüsü (game loop), rastgele zindan oluşturma algoritmaları ve koordinat tabanlı çarpışma denetimi gibi temel oyun programlama konseptlerini uygulamak amacıyla geliştirilmiştir.

## Oyun Amacı
Karakteri bloklar üzerinde, karanlık ve sadece kendi bulunduğu bloğun çevresini görebileceği şekilde adım adım ilerletilerek labirent şeklindeki zindandan çıkarmak yani çıkış bloğuna varmak amaçlanır.
Karakter bu labirentte ilerlerken çeşitli tuzaklarla karşılaşır.

## Kullanılan Teknolojiler
* HTML5 Canvas
* CSS
* JavaScript
* Ses efektleri ve müzik yönetimi
* Sprite (Görsel dosya) tabanlı karakter sistemi

## Temel Özellikler
* Prosedürel Zindan Üretimi: generateMap() fonksiyonu, her oyun başında benzersiz odalar ve koridorlar inşa eder.

* Sıra Tabanlı Savaş Sistemi: Gardiyanlarla karşılaşıldığında devreye giren, zar olasılıklarına dayalı dinamik savaş ekranı.

* Varlık ve Envanter Yönetimi: Can (HP) sistemini etkileyen iksir (potion) toplama ve bitiş noktasına (exit) ulaşma hedefleri.

* Ses Entegrasyonu: Atmosferik fon müziği ve hareket/etkileşim anları için tetiklenen ses efektleri.

## Teknik Detaylar
* Projenin mimarisi, modüler ve genişletilebilir bir yapıdadır.  
* Render Motoru: draw() fonksiyonu üzerinden Canvas API kullanılarak 60 FPS hedefli çizim döngüsü.
* Harita Algoritması: Zindan, roomCount değişkenine bağlı olarak rastgele koordinatlarda oluşturulan odaların bir veri dizisi (map[]) üzerinde saklanmasıyla yönetilir.

* Varlık Yönetimi: Karakter, düşmanlar ve eşyalar koordinat tabanlı nesneler olarak ({x, y}) saklanır ve her karede (frame) çarpışma kontrolleri yapılır.

* Dosya Yapısı: Projenin sürdürülebilirliği için varlıklar kategorize edilmiştir:

* /assets/images/: Karakter sprite'ları ve çevre görselleri.

* /assets/sounds/: Ses efektleri ve döngüsel müzikler.
  
## Oynanış
Oyuncumuz, karanlık labirentte hareket ettirilirken karşısına 4 çeşit engelden rastgele herhangi biri çıkabilir. Bu engeller; yağ, su,  petrol birikintilerinden biri veya onlardan daha güçlü bir engel olan gardiyan olabilir.
Oyuncu bu tuzaklara sahip olan bloklara yanlışlıkla basarsa karşısına ‘Die in the Dungeon’ den referans alınan zar oyunu çıkar.
Karakterin en başta sabit ve ‘10’ olan bu canına; yağ, su, petrol birikintilerinden birine basarsa ve zar oyununda kaybederse ‘-1’, gardiyanla karşılaşır ve zar oyununda kaybederse ‘-3’ puan yansır.

* Karakter ok tuşlarıyla hareket eder.
* Bir zindanın ortasında başlar ve labirentte engelleri aşarak çıkışa ulaşmaya çalışır.
* Oyunu önden inceleyebilmek için "https://ismailemret.github.io/DungeonInferno/" sitesine gidebilirsiniz.

## Harita Oluşturma Algoritması
* Backtracking benzeri labirent algoritması kullanıldı
* 30x15 boyutunda harita oluşturuldu
* Odalar rastgele üretildi
* En uzak oda çıkış noktası olarak seçildi

## Savaş Sistemi
* Zar atma mekanizması ile çatışma
* Tuzaklarda sabit hedef değeri
* Gardiyanlarda karşılıklı zar sistemi
* Can sistemi ve hasar hesaplama

## Grafik ve Atmosfer
* Pixel-art tarzı görseller
* Dinamik sis efekti
* Animasyonlu zar sistemi
* Adım, hasar ve zafer ses efektleri

## Ekibimiz
* İsmail Emre Taşbilek
* Merve Nur Sayın
  
# Kaynakça
Harita yapımında kullanılan görseller için:
* Shutterstock. (t.y.). Pixelated wall stone illustrations. Shutterstock. https://www.shutterstock.com/tr/search/pixelated-wall-stone?image_type=illustration

Karakter oluşumunda kullanılan görsel için:
* Reddit kullanıcısı r/PixelArt. (t.y.). 16x16 topdown character sprite [Reddit gönderisi].
* Reddit. https://www.reddit.com/r/PixelArt/comments/1krxwzk/16x16_topdown_character_sprite/https://

Bilgi almak için:
* W3Schools. (t.y.). HTML canvas introduction. W3Schools. https://www.w3schools.com/graphics/canvas_intro.asp 
* Mozilla Developer Network. (t.y.). JavaScript. MDN Web Docs. https://developer.mozilla.org/en-US/docs/Web/JavaScript 
* Mozilla Developer Network. (t.y.). HTML. MDN Web Docs. https://developer.mozilla.org/en-US/docs/Web/HTML 

Ses dosyaları için:
*  https://opengameart.org/content/sound-fx-0
*  https://pixabay.com/sound-effects/search/8%20bit%20walking/

Die in the Dungeon (Referans alınan oyun)
* https://alarts.itch.io/die-in-the-dungeon
