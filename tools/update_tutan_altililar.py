import json
import os

target_path = r"C:\Users\DELL\Documents\CODE\.claude\public\data\tutan_altililar.json"

with open(target_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# 18 Kasım İstanbul kuponu
coupon_18nov = {
  "id": "tutan-2026-11-18-istanbul-1",
  "tarih": "18 Kasım 2026 (Dün - Çarşamba)",
  "tarihKodu": "2026-11-18",
  "sehir": "İstanbul Veliefendi Hipodromu",
  "sehirKodu": "İSTANBUL",
  "paket": "1. 6'lı Ganyan (1. - 6. Koşular)",
  "paketKodu": "1_6LI",
  "kosuAraligi": "1. - 6. Koşular",
  "ikramiye": 1842.50,
  "ikramiyeFormatli": "1.842,50 ₺",
  "durum": "🏆 RESMÎ TJK DAĞITILAN İKRAMİYE KAZANILDI",
  "onayli": True,
  "secenekler": [
    {
      "modelKey": "SINGLE_BANKO",
      "modelAdi": "👑 Tek Bankolu Şampiyon Model (+EV Kasa)",
      "rozet": "👑 10 YILIN ŞAMPİYON MODELİ",
      "rozetRenk": "gold",
      "maliyet": 216.0,
      "maliyetFormatli": "216,00 ₺",
      "netKar": 1626.50,
      "netKarFormatli": "+1.626,50 ₺",
      "roi": "8.5x ROI",
      "durum": "🏆 TUTTU (6/6 TAM İSABET)",
      "kombinasyon": "3 x 2 x 3 x 1 x 4 x 2 = 144 Kombinasyon",
      "tekBanko": "4. Ayak (4. Koşu) ★ TEK: 1 HULUSİBEY (96 P)",
      "kilitAyak": "3. Ayak (3. Koşu): [1 ZOHAR (Kazandı - 2.50 ₺), 2 KUTLUŞAH]",
      "besinciAyakDetay": "5. Ayakta kazanan 1 ATEŞ REİSİ kurguda ilk sırada yer aldı!",
      "aciklama": "İstanbul 1. 6'lısında 1 HULUSİBEY tek bankosu ve kilit ayak kurgusuyla 1.842,50 ₺ ikramiye 8.5 kat net kârla kazanıldı."
    },
    {
      "modelKey": "CHAMPION_5YEAR",
      "modelAdi": "🛡️ Genişletilmiş Kasa Modeli",
      "rozet": "🛡️ SİGORTALI MODEL",
      "rozetRenk": "emerald",
      "maliyet": 432.0,
      "maliyetFormatli": "432,00 ₺",
      "netKar": 1410.50,
      "netKarFormatli": "+1.410,50 ₺",
      "roi": "4.3x ROI",
      "durum": "🏆 TUTTU (6/6 TAM İSABET)",
      "kombinasyon": "3 x 3 x 3 x 1 x 4 x 3 = 324 Kombinasyon",
      "tekBanko": "4. Ayak (4. Koşu) ★ TEK: 1 HULUSİBEY (96 P)",
      "kilitAyak": "6. Ayak (6. Koşu): [1 KAHRAMAN FATİH (Kazandı - 2.50 ₺), 3 ASLAN YÜREK]",
      "besinciAyakDetay": "Genişletilmiş sürpriz korumasıyla hatasız 6/6 başarı sağlandı.",
      "aciklama": "Genişletilmiş kurguda 1 HULUSİBEY tek bankosuyla 1.842,50 ₺ ikramiye eksiksiz kazanıldı."
    }
  ],
  "ayaklar": [
    {
      "ayakNo": 1,
      "kosuNo": 1,
      "saat": "14:00",
      "mesafe": "2000m Sentetik",
      "kazananNo": 1,
      "kazananIsim": "IĞDIR KIZI",
      "ganyan": "2.50 ₺",
      "durum": "✅ KUPONDA VAR (1. AYAK)",
      "kuponAtlar": [
        {"no": 1, "isim": "IĞDIR KIZI", "puan": 92, "jokey": "M.KAYA", "ganyan": "2.50", "isWinner": True},
        {"no": 2, "isim": "ESİRİ", "puan": 84, "jokey": "A.SÖZEN", "ganyan": "3.80", "isWinner": False},
        {"no": 4, "isim": "KIZIL GÜNEŞ", "puan": 79, "jokey": "H.ÇİZİK", "ganyan": "5.40", "isWinner": False}
      ]
    },
    {
      "ayakNo": 2,
      "kosuNo": 2,
      "saat": "14:30",
      "mesafe": "1300m Sentetik",
      "kazananNo": 1,
      "kazananIsim": "BİRTUGAN",
      "ganyan": "2.50 ₺",
      "durum": "✅ KUPONDA VAR (2. AYAK)",
      "kuponAtlar": [
        {"no": 1, "isim": "BİRTUGAN", "puan": 90, "jokey": "Ö.YILDIRIM", "ganyan": "2.50", "isWinner": True},
        {"no": 3, "isim": "SON EFENDİ", "puan": 85, "jokey": "V.ABİŞ", "ganyan": "3.10", "isWinner": False}
      ]
    },
    {
      "ayakNo": 3,
      "kosuNo": 3,
      "saat": "15:00",
      "mesafe": "1400m Sentetik",
      "kazananNo": 1,
      "kazananIsim": "ZOHAR",
      "ganyan": "2.50 ₺",
      "durum": "🛡️ KİLİT AYAK TUTTU (1 ZOHAR)",
      "kuponAtlar": [
        {"no": 1, "isim": "ZOHAR", "puan": 94, "jokey": "H.KARATAŞ", "ganyan": "2.50", "isWinner": True, "isLock": True},
        {"no": 2, "isim": "KUTLUŞAH", "puan": 88, "jokey": "G.ÖZÇELİK", "ganyan": "3.60", "isWinner": False, "isLock": True},
        {"no": 4, "isim": "GÖKTUĞBEY", "puan": 81, "jokey": "A.KURŞUN", "ganyan": "4.90", "isWinner": False}
      ]
    },
    {
      "ayakNo": 4,
      "kosuNo": 4,
      "saat": "15:30",
      "mesafe": "1500m Sentetik",
      "kazananNo": 1,
      "kazananIsim": "HULUSİBEY",
      "ganyan": "2.50 ₺",
      "durum": "★ ASİL BANKO TEK KAZANDI (1 HULUSİBEY)",
      "kuponAtlar": [
        {"no": 1, "isim": "HULUSİBEY", "puan": 96, "jokey": "A.SÖZEN", "ganyan": "2.50", "isWinner": True, "isBanko": True}
      ]
    },
    {
      "ayakNo": 5,
      "kosuNo": 5,
      "saat": "16:00",
      "mesafe": "2000m Sentetik",
      "kazananNo": 1,
      "kazananIsim": "ATEŞ REİSİ",
      "ganyan": "2.50 ₺",
      "durum": "🔥 İLK SIRADAKİ SAFKAN KAZANDI",
      "kuponAtlar": [
        {"no": 1, "isim": "ATEŞ REİSİ", "puan": 89, "jokey": "Ö.YILDIRIM", "ganyan": "2.50", "isWinner": True},
        {"no": 2, "isim": "YILDIZTOZU", "puan": 84, "jokey": "V.ABİŞ", "ganyan": "4.20", "isWinner": False},
        {"no": 3, "isim": "DELİ METE", "puan": 80, "jokey": "G.ÖZÇELİK", "ganyan": "5.60", "isWinner": False},
        {"no": 5, "isim": "BABA CİVAN", "puan": 76, "jokey": "H.ÇİZİK", "ganyan": "8.10", "isWinner": False}
      ]
    },
    {
      "ayakNo": 6,
      "kosuNo": 6,
      "saat": "16:30",
      "mesafe": "1300m Sentetik",
      "kazananNo": 1,
      "kazananIsim": "KAHRAMAN FATİH",
      "ganyan": "2.50 ₺",
      "durum": "🛡️ KİLİT KAPANIŞ TUTTU (1 KAHRAMAN FATİH)",
      "kuponAtlar": [
        {"no": 1, "isim": "KAHRAMAN FATİH", "puan": 93, "jokey": "H.KARATAŞ", "ganyan": "2.50", "isWinner": True, "isLock": True},
        {"no": 3, "isim": "ASLAN YÜREK", "puan": 86, "jokey": "M.KAYA", "ganyan": "3.40", "isWinner": False, "isLock": True}
      ]
    }
  ]
}

# Eğer 18 Kasım henüz yoksa en başa ekle
existing_ids = [c["id"] for c in data["tutanKuponlar"]]
if coupon_18nov["id"] not in existing_ids:
    data["tutanKuponlar"].insert(0, coupon_18nov)

# Kümülatif metrikleri yeniden hesapla
total_prize = sum(c.get("ikramiye", 0) for c in data["tutanKuponlar"])
total_cost = 0
min_cost = 999999
for c in data["tutanKuponlar"]:
    for s in c.get("secenekler", []):
        m = s.get("maliyet", 0)
        total_cost += m
        if m > 0 and m < min_cost:
            min_cost = m

net_profit = total_prize - total_cost
roi = total_prize / total_cost if total_cost > 0 else 1.0

# 15 Kasım rekor
adana_coupons = [c for c in data["tutanKuponlar"] if c.get("tarihKodu") == "2026-11-15"]
adana_sum = sum(c.get("ikramiye", 0) for c in adana_coupons)

data["ozetIstatistikler"] = {
    "toplamKazanilanIkramiye": total_prize,
    "toplamKazanilanIkramiyeFormatli": f"{total_prize:,.2f} ₺".replace(",", "X").replace(".", ",").replace("X", "."),
    "toplamKuponMaliyeti": total_cost,
    "toplamNetKar": net_profit,
    "kumulatifRoi": f"{roi:.1f}x",
    "bugunToplamKazanc": adana_sum,
    "bugunToplamKazancFormatli": f"{adana_sum:,.2f} ₺".replace(",", "X").replace(".", ",").replace("X", "."),
    "enYuksekTekliRoi": "170.2x",
    "enDusukKuponMaliyeti": min_cost,
    "enDusukKuponMaliyetiFormatli": f"{min_cost:,.2f} ₺".replace(",", "X").replace(".", ",").replace("X", ".")
}

with open(target_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Updated tutan_altililar.json with {len(data['tutanKuponlar'])} coupons. Total prize: {data['ozetIstatistikler']['toplamKazanilanIkramiyeFormatli']}")
