# ROYAL TURF — YARIŞ VE MODEL KURALLARI (IMMUTABLE SYSTEM RULES)

Bu kurallar sistemin, yapay zeka modellerinin ve veri işleme motorlarının uymakla yükümlü olduğu kesin ve değişmez yasalardır.

---

## KURAL 1: İLK 3 KOŞUSUNU TAMAMLAMAMIŞ GENÇ SAFKANLAR (≤ 3 KOŞU)
- **Hüküm:** Yarış hayatında 3 ve daha az koşusu olan (`toplamKosu <= 3`, `realRacesCount <= 3`, `pastRaces.length <= 3`, `son_yarislar.replace(/[^0-9]/g, '').length <= 3`, `isFirstTimeStarter === true`) hiçbir safkana **ASLA VE KAT'A KALIPLAŞMIŞ BİR KOŞU STİLİ (GİDİŞAT)** ATANMAZ!
- **İstisna Kontrolü:** 2 yaşındaki safkanlarda eğer resmi toplam koşu sayısı 3'ten büyükse (örneğin Speed Queen gibi 11 yarış) bu safkan tecrübelidir; yalnızca tecrübesiz taylar (≤ 3 koşu) bu kurala girer.
- **Koşu Stili Etiketi:** Bu safkanlar DAİMA `Taktik Serbest (İlk 3 Koşusu)` olarak etiketlenir (`stil_ikon: '🌱'`).
- **Nötr Puanlama:** Bu safkanlara gidişat veya tempo üzerinden asla suni puan eklenemez veya puanı kırılamaz (`0 Puan Nötr`).
- **Gidişat Kutusu Ayrımı:** Bu safkanlar yarışın muhtemel 4-Hat (1. Hat Kaçak, 2. Hat Presçi, 3. Hat Orta Grup, 4. Hat Sprinter) taktik şablonlarına zorla sokulmaz. Şerit üzerinde ve analiz kartlarında ayrı `🎯 TAKTİK SERBEST / GELİŞİM (İLK 3 KOŞUSU)` kutusunda listelenir.
- **Kapsam:** Bu kural münferit atlara özel olmayıp; **tüm hipodromlar, tüm koşular, tüm 2-3 yaşlı taylar ve gelecekteki tüm bültenler için evrenseldir.**

---

## KURAL 2: GERÇEK GEÇMİŞ YARIŞ TAKTİĞİNE SADAKAT VE ASLA UYDURMA GİDİŞAT ATAMAMA (EMPİRİK SEYİR KURALI)
- **Hüküm:** Bir safkanın koşu stili ASLA isminden (örneğin içinde "Speed" geçiyor diye kaçak demek gibi), soy kütüğünden veya hissi tahminlerden türetilemez!
- **Geçmiş Koşu Aksiyonu Esastır:** Tecrübeli safkanların (> 3 koşu) stili YALNIZCA ve YALNIZCA safkanın kendi geçmiş resmî yarışlarında bizzat sergilediği takip pozisyonlarına göre belirlenir:
  1. **Kaçak / Lider:** Yalnızca geçmiş yarışlarında startla birlikte kafayı almayı alışkanlık edinmiş, tescilli kaçak safkanlar (örneğin Sancar gibi) bu kategoriye girer. Kesin teyidi olmayan hiçbir safkana Kaçak denilemez!
  2. **Presçi:** Önceki yarışlarında liderin hemen arkasında (2.-3.lükte) konumlanıp virajda tempoyu artıranlar.
  3. **Orta Grup:** Yarışı 4.-6. sıralarda takip edip viraja kadar yıpranmadan bekleyen dengeli safkanlar.
  4. **Düzlük Sprinteri (Bekleme Atı):** Önceki yarışlarında gruptan kopmadan arkada pusuya yatan ve son 400 metrede patlayıcı sprint atan safkanlar (örneğin Speed Queen, Uzboylu).
- **Hardcoded İsim ve Sahte Taktik Yasağı:** Kod içerisine safkan isimleri yazılarak gerçeğe aykırı yapay stil biçilemez.
- **Güvenlik / Temkinlilik Kuralı (Anti-Hallucination):** Bir safkanın lider kaçtığına dair açık ve net bir geçmiş yarış kanıtı yoksa, o safkan ASLA 1. Hat (Kaçak) olarak gösterilemez. Yarış senaryosunda tek bir sahte kaçak bulunması tüm yarış temposunu bozar ve kuponun batmasına neden olur!

---

## KURAL 3: 6'LI GANYAN BANKO VE AKILLI BÜTÇE DAĞILIMI (SON 4 YILLIK / 1460 GÜNLÜK MAKRO MODEL)
- Körlemesine her kupona zorlama tek banko dayatılması yasaktır.
- Son 4 Yıllık (1460 Günlük / 2022-2026) TJK resmî yarış sonuçları taranarak en yüksek kümülatif başarıyı sağlayan strateji uygulanır.
- Yalnızca puan farkı $\ge 14$, genel güç endeksi $\ge 82$ ve yüksek risk taşımayan net açık/şartlı koşularda "Doğrulanmış Asil Banko (Tek)" kullanılır (4 yıllık makro havuzda %71.4 isabet gücü).
- Net banko bulunmayan programlarda en güvenilir 2 ayak 2'şer atla "Kilit Ayak (Çifte Sigorta)" yapılarak bütçe Maiden ve kalabalık Handikap ayaklarına 3-5 at şeklinde yayılır (Son 4 yıllık veride %38.4 kümülatif getiri ile en yüksek başarı sağlayan yöntem).
