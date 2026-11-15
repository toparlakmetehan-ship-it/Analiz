# ROYAL TURF — YARIŞ VE MODEL KURALLARI (IMMUTABLE SYSTEM RULES)

Bu kurallar sistemin, yapay zeka modellerinin ve veri işleme motorlarının uymakla yükümlü olduğu kesin ve değişmez yasalardır.

---

## KURAL 1: İLK 3 KOŞUSUNU TAMAMLAMAMIŞ GENÇ SAFKANLAR (≤ 3 KOŞU)
- **Hüküm:** Yarış hayatında 3 ve daha az koşusu olan (`toplamKosu <= 3`, `realRacesCount <= 3`, `pastRaces.length <= 3`, `son_yarislar.replace(/[^0-9]/g, '').length <= 3`, `isFirstTimeStarter === true` veya `yas === 2`) hiçbir safkana **ASLA VE KAT'A KALIPLAŞMIŞ BİR KOŞU STİLİ (GİDİŞAT)** ATANMAZ!
- **Koşu Stili Etiketi:** Bu safkanlar DAİMA `Taktik Serbest (İlk 3 Koşusu)` olarak etiketlenir (`stil_ikon: '🌱'`).
- **Nötr Puanlama:** Bu safkanlara gidişat veya tempo üzerinden asla suni puan eklenemez veya puanı kırılamaz (`0 Puan Nötr`).
- **Gidişat Kutusu Ayrımı:** Bu safkanlar yarışın muhtemel 4-Hat (1. Hat Kaçak, 2. Hat Presçi, 3. Hat Orta Grup, 4. Hat Sprinter) taktik şablonlarına zorla sokulmaz. Şerit üzerinde ve analiz kartlarında ayrı `🎯 TAKTİK SERBEST / GELİŞİM (İLK 3 KOŞUSU)` kutusunda listelenir.
- **Kapsam:** Bu kural Don Çiçi veya Thunderstruck gibi münferit atlara özel olmayıp; **tüm hipodromlar, tüm koşular, tüm 2 yaşlı taylar ve gelecekteki tüm bültenler için evrenseldir.**

---

## KURAL 2: SOY KÜTÜĞÜNDEN (ANNE / BABA / KISRAK BABASI) GİDİŞAT TAYİNİ YASAĞI
- **Hüküm:** Bir safkanın koşu karakteri ASLA annesi, babası veya kısrak babası üzerinden (pedigri regex'leri ile) belirlenemez.
- **Geçmiş Koşu Aksiyonu Esastır:** Tecrübeli safkanların (> 3 koşu) stili YALNIZCA ve YALNIZCA safkanın kendi geçmiş resmî yarış koşu çizgileri (`runningLine`) ve yarış içi takip pozisyonları (son 2 yarışına 2 kat ağırlık verilerek) incelenerek hesaplanır.
- **Hardcoded İsim Yasağı:** Kod içerisine safkan isimleri (`^THUNDERSTRUCK$`, `^SPEED QUEEN$` vb.) hardcoded olarak yazılarak yapay stil biçilemez.

---

## KURAL 3: 6'LI GANYAN BANKO VE AKILLI BÜTÇE DAĞILIMI
- Körlemesine her kupona zorlama tek banko dayatılması yasaktır.
- Yalnızca puan farkı $\ge 14$, genel güç endeksi $\ge 82$ ve yüksek risk taşımayan net açık/şartlı koşularda "Doğrulanmış Asil Banko (Tek)" kullanılır.
- Net banko bulunmayan programlarda en güvenilir 2 ayak 2'şer atla "Kilit Ayak (Çifte Sigorta)" yapılarak bütçe Maiden ve kalabalık Handikap ayaklarına 3-5 at şeklinde yayılır (Geriye dönük %36 en yüksek başarı sağlayan yöntem).
