# Dungeon Inferno
Bu proje, HTML5 Canvas ve Vanilla JavaScript kullanılarak geliştirilmiş, prosedürel harita üretimi ve sıra tabanlı (turn-based) savaş mekaniklerine sahip bir 2D Dungeon Crawler oyunudur.
Proje; oyun döngüsü (game loop), rastgele zindan oluşturma algoritmaları ve koordinat tabanlı çarpışma denetimi gibi temel oyun programlama konseptlerini uygulamak amacıyla geliştirilmiştir.

## Temel Özellikler
* Prosedürel Zindan Üretimi: generateMap() fonksiyonu, her oyun başında benzersiz odalar ve koridorlar inşa eder.

* Sıra Tabanlı Savaş Sistemi: Gardiyanlarla karşılaşıldığında devreye giren, zar olasılıklarına dayalı dinamik savaş ekranı.

* Varlık ve Envanter Yönetimi: Can (HP) sistemini etkileyen iksir (potion) toplama ve bitiş noktasına (exit) ulaşma hedefleri.

* Ses Entegrasyonu: Atmosferik fon müziği ve hareket/etkileşim anları için tetiklenen ses efektleri.

## Teknik Detaylar
* Projenin mimarisi, modüler ve genişletilebilir bir yapıdadır.
* 

* Render Motoru: draw() fonksiyonu üzerinden Canvas API kullanılarak 60 FPS hedefli çizim döngüsü.

* Harita Algoritması: Zindan, roomCount değişkenine bağlı olarak rastgele koordinatlarda oluşturulan odaların bir veri dizisi (map[]) üzerinde saklanmasıyla yönetilir.

* Varlık Yönetimi: Karakter, düşmanlar ve eşyalar koordinat tabanlı nesneler olarak ({x, y}) saklanır ve her karede (frame) çarpışma kontrolleri yapılır.

* Dosya Yapısı: Projenin sürdürülebilirliği için varlıklar kategorize edilmiştir:

* /assets/images/: Karakter sprite'ları ve çevre görselleri.

* /assets/sounds/: Ses efektleri ve döngüsel müzikler.
## Oynanış
* Karakter ok tuşlarıyla hareket eder.
* Bir zindanın ortasında başlar ve labirentte engelleri aşarak çıkışa ulaşmaya çalışır.
### Ekibimiz
* İsmail Emre Taşbilek
* Merve Nur Sayın
