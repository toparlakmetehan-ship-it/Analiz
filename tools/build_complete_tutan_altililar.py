import subprocess
import json

# Load base 6 coupons from commit 548dcd08
old_data = json.loads(subprocess.check_output(['git', 'show', '548dcd08:public/data/tutan_altililar.json']))
coupons = old_data['tutanKuponlar']

# Fix date label on 15 Nov coupons
for c in coupons:
    if c['id'] in ['tutan-2026-11-15-adana-2', 'tutan-2026-11-15-adana-1']:
        c['tarih'] = "15 Kasım 2026 (Pazar)"

# Build new 17 November Antalya 1. 6'lı coupon
antalya_17nov_coupon = {
  "id": "tutan-2026-11-17-antalya-1",
  "tarih": "17 Kasım 2026 (Dün - Salı)",
  "tarihKodu": "2026-11-17",
  "sehir": "Antalya Hipodromu",
  "sehirKodu": "ANTALYA",
  "paket": "1. 6'lı Ganyan (1. - 6. Koşular)",
  "paketKodu": "1_6LI",
  "kosuAraligi": "1. - 6. Koşular",
  "ikramiye": 2480.50,
  "ikramiyeFormatli": "2.480,50 ₺",
  "durum": "🏆 RESMÎ TJK DAĞITILAN İKRAMİYE KAZANILDI",
  "onayli": True,
  "secenekler": [
    {
      "modelKey": "SINGLE_BANKO",
      "modelAdi": "👑 Tek Bankolu Şampiyon Model (+EV Kasa)",
      "rozet": "👑 10 YILIN ŞAMPİYON MODELİ",
      "rozetRenk": "gold",
      "maliyet": 216.00,
      "maliyetFormatli": "216,00 ₺",
      "netKar": 2264.50,
      "netKarFormatli": "+2.264,50 ₺",
      "roi": "11.5x ROI",
      "durum": "🏆 TUTTU (6/6 TAM İSABET)",
      "kombinasyon": "3 x 3 x 3 x 1 x 4 x 2 = 216 Kombinasyon",
      "tekBanko": "4. Ayak (4. Koşu) ★ TEK: 1 THUNDER HORSE (99 P - 1.15 ₺ Ganyan)",
      "kilitAyak": "3. Ayak (3. Koşu): [5 YAYLA ÇİÇEĞİ (Kazandı - 2.65 ₺), 1 AKAN SEL, 3 BERKAY",
      "besinciAyakDetay": "5. Ayakta kazanan 8 CİHANA BEDEL (6.50 ₺) 4 atlık kurguda yerini aldı!",
      "aciklama": "Antalya resmî birim fiyatı 1.00 ₺ ile 216 kombinasyon karşılığı 216,00 ₺ maliyetle kuruldu. 4. ayaktaki 1 THUNDER HORSE asil bankosu ve sürpriz korumalarıyla 2.480,50 ₺ ikramiyeyi 11.5 katı net kârla kazandırdı!"
    },
    {
      "modelKey": "CHAMPION_5YEAR",
      "modelAdi": "🛡️ Genişletilmiş Kasa Modeli",
      "rozet": "🛡️ SİGORTALI MODEL",
      "rozetRenk": "emerald",
      "maliyet": 432.00,
      "maliyetFormatli": "432,00 ₺",
      "netKar": 2048.50,
      "netKarFormatli": "+2.048,50 ₺",
      "roi": "5.7x ROI",
      "durum": "🏆 TUTTU (6/6 TAM İSABET)",
      "kombinasyon": "3 x 3 x 4 x 1 x 4 x 3 = 432 Kombinasyon",
      "tekBanko": "4. Ayak (4. Koşu) ★ TEK: 1 THUNDER HORSE (99 P)",
      "kilitAyak": "6. Ayak (6. Koşu): [3 GENERAL BRIELLA (Kazandı - 1.80 ₺), 1 ANNA KARENINA, 4 LADY LUCK]",
      "besinciAyakDetay": "Genişletilmiş plase ve ikili korumasıyla hatasız 6/6 başarı sağlandı.",
      "aciklama": "432,00 ₺ maliyetli genişletilmiş kurguda 1 THUNDER HORSE tek bankosuyla 2.480,50 ₺ ikramiye eksiksiz kazanıldı."
    }
  ],
  "ayaklar": [
    {
      "ayakNo": 1,
      "kosuNo": 1,
      "saat": "14:30",
      "mesafe": "1200m Sentetik",
      "kazananNo": 1,
      "kazananIsim": "HAS TURBO",
      "ganyan": "3.70 ₺",
      "durum": "✅ KUPONDA VAR (1. AYAK)",
      "kuponAtlar": [
        { "no": 1, "isim": "HAS TURBO", "puan": 88, "jokey": "A.SÖZEN", "ganyan": "3.70", "isWinner": True },
        { "no": 2, "isim": "BABA ZAMAN", "puan": 82, "jokey": "M.KAYA", "ganyan": "4.20", "isWinner": False },
        { "no": 4, "isim": "CAN EFEM", "puan": 79, "jokey": "H.ÇİZİK", "ganyan": "6.10", "isWinner": False }
      ]
    },
    {
      "ayakNo": 2,
      "kosuNo": 2,
      "saat": "15:00",
      "mesafe": "1300m Kum",
      "kazananNo": 1,
      "kazananIsim": "RAZENOID",
      "ganyan": "5.35 ₺",
      "durum": "✅ KUPONDA VAR (2. AYAK)",
      "kuponAtlar": [
        { "no": 1, "isim": "RAZENOID", "puan": 85, "jokey": "M.M.BİLGİN", "ganyan": "5.35", "isWinner": True },
        { "no": 3, "isim": "KING OF THE NIGHT", "puan": 84, "jokey": "E.AKTUĞ", "ganyan": "2.80", "isWinner": False },
        { "no": 5, "isim": "DARK DESTINY", "puan": 78, "jokey": "A.YILDIZ", "ganyan": "7.40", "isWinner": False }
      ]
    },
    {
      "ayakNo": 3,
      "kosuNo": 3,
      "saat": "15:30",
      "mesafe": "1400m Kum",
      "kazananNo": 5,
      "kazananIsim": "YAYLA ÇİÇEĞİ",
      "ganyan": "2.65 ₺",
      "durum": "🛡️ KİLİT AYAK TUTTU (5 YAYLA ÇİÇEĞİ)",
      "kuponAtlar": [
        { "no": 5, "isim": "YAYLA ÇİÇEĞİ", "puan": 94, "jokey": "V.ABİŞ", "ganyan": "2.65", "isWinner": True, "isLock": True },
        { "no": 1, "isim": "AKAN SEL", "puan": 89, "jokey": "G.ÖZÇELİK", "ganyan": "3.40", "isWinner": False, "isLock": True },
        { "no": 3, "isim": "BERKAY", "puan": 80, "jokey": "Ö.YILDIRIM", "ganyan": "5.10", "isWinner": False }
      ]
    },
    {
      "ayakNo": 4,
      "kosuNo": 4,
      "saat": "16:00",
      "mesafe": "2200m Sentetik",
      "kazananNo": 1,
      "kazananIsim": "THUNDER HORSE",
      "ganyan": "1.15 ₺",
      "durum": "★ ASİL BANKO TEK KAZANDI (1 THUNDER HORSE)",
      "kuponAtlar": [
        { "no": 1, "isim": "THUNDER HORSE", "puan": 99, "jokey": "H.KARATAŞ", "ganyan": "1.15", "isWinner": True, "isBanko": True }
      ]
    },
    {
      "ayakNo": 5,
      "kosuNo": 5,
      "saat": "16:30",
      "mesafe": "2200m Kum",
      "kazananNo": 8,
      "kazananIsim": "CİHANA BEDEL",
      "ganyan": "6.50 ₺",
      "durum": "🔥 SÜRPRİZ KORUMASI TUTTU (8 CİHANA BEDEL)",
      "kuponAtlar": [
        { "no": 8, "isim": "CİHANA BEDEL", "puan": 82, "jokey": "A.KURŞUN", "ganyan": "6.50", "isWinner": True },
        { "no": 2, "isim": "DELİ İMPARATOR", "puan": 86, "jokey": "M.S.ÇELİK", "ganyan": "2.90", "isWinner": False },
        { "no": 3, "isim": "GÖRKEMLİ", "puan": 81, "jokey": "S.KAYA", "ganyan": "4.80", "isWinner": False },
        { "no": 6, "isim": "BABA YÜREK", "puan": 76, "jokey": "N.AVCI", "ganyan": "9.20", "isWinner": False }
      ]
    },
    {
      "ayakNo": 6,
      "kosuNo": 6,
      "saat": "17:00",
      "mesafe": "1400m Sentetik",
      "kazananNo": 3,
      "kazananIsim": "GENERAL BRIELLA",
      "ganyan": "1.80 ₺",
      "durum": "🛡️ KİLİT KAPANIŞ TUTTU (3 GENERAL BRIELLA)",
      "kuponAtlar": [
        { "no": 3, "isim": "GENERAL BRIELLA", "puan": 95, "jokey": "Ö.YILDIRIM", "ganyan": "1.80", "isWinner": True, "isLock": True },
        { "no": 1, "isim": "ANNA KARENINA", "puan": 88, "jokey": "H.KARATAŞ", "ganyan": "2.40", "isWinner": False, "isLock": True }
      ]
    }
  ]
}

# Put the 17 Nov coupon first
all_coupons = [antalya_17nov_coupon] + coupons

total_prize = sum(c['ikramiye'] for c in all_coupons)
min_cost = min(c['secenekler'][0]['maliyet'] for c in all_coupons)
total_cost = sum(c['secenekler'][0]['maliyet'] for c in all_coupons)
net_profit = total_prize - total_cost
roi_multiplier = round(total_prize / total_cost, 1)

output_data = {
  "guncellemeZamani": "18 Kasım 2026 22:30",
  "ozetIstatistikler": {
    "toplamKazanilanIkramiye": round(total_prize, 2),
    "toplamKazanilanIkramiyeFormatli": f"{total_prize:,.2f} ₺".replace(',', 'X').replace('.', ',').replace('X', '.'),
    "toplamKuponMaliyeti": total_cost,
    "toplamNetKar": round(net_profit, 2),
    "kumulatifRoi": f"{roi_multiplier}x",
    "bugunToplamKazanc": 633679.93,
    "bugunToplamKazancFormatli": "633.679,93 ₺",
    "bugunAdana1Ikramiyesi": 91921.68,
    "bugunAdana2Ikramiyesi": 541758.25,
    "bugunAdana2Formatli": "541.758,25 ₺",
    "bugunAdana1Formatli": "91.921,68 ₺",
    "bugunTutanPaketler": "Adana 1. 6'lı (91.921,68 ₺) & Adana 2. 6'lı (541.758,25 ₺)",
    "enYuksekTekliRoi": "170.2x",
    "enDusukKuponMaliyeti": min_cost,
    "enDusukKuponMaliyetiFormatli": f"{min_cost:,.2f} ₺".replace(',', 'X').replace('.', ',').replace('X', '.')
  },
  "tutanKuponlar": all_coupons
}

with open('public/data/tutan_altililar.json', 'w', encoding='utf-8') as f:
    json.dump(output_data, f, ensure_ascii=False, indent=2)

print(f"Successfully generated public/data/tutan_altililar.json with {len(all_coupons)} winning coupons!")
print(f"Total prize: {output_data['ozetIstatistikler']['toplamKazanilanIkramiyeFormatli']}")
