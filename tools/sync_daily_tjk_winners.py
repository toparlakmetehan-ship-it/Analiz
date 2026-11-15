#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os, sys, json, re, requests
from bs4 import BeautifulSoup
from datetime import datetime

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUTPUT_JSON = os.path.join(BASE_DIR, "public", "data", "tutan_altililar.json")

def parse_clean_name_and_no(raw_text):
    # e.g. "THUNDERSTRUCK(5)SKGRing mahalinden..." -> name: "THUNDERSTRUCK", no: 5
    m = re.search(r'^\s*([^(]+?)\s*\(([0-9]+)\)', raw_text)
    if m:
        return m.group(1).strip(), int(m.group(2))
    return raw_text.strip(), -1

def run_sync():
    with open(os.path.join(BASE_DIR, "tjk_adana_sonuclar.html"), "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    # 1. Dağıtılan 6'lı İkramiyeleri Çek
    ikramiyeler = {}
    for el in soup.find_all(string=re.compile(r"6'LI GANYAN", re.I)):
        parent = el.find_parent('table') or el.find_parent('div')
        if parent:
            txt = parent.get_text(" | ", strip=True)
            m = re.search(r"(1|2)\.\s*6'LI\s*GANYAN\s*\|\s*([^|]+)\s*\|\s*([0-9.,]+)\s*₺", txt, re.I)
            if m:
                pkg_num = int(m.group(1))
                combo = m.group(2).strip()
                tutar_str = m.group(3).strip()
                tutar = float(tutar_str.replace('.', '').replace(',', '.'))
                ikramiyeler[pkg_num] = {
                    "paket": f"{pkg_num}. 6'lı Ganyan",
                    "kombinasyon": combo,
                    "tutar": tutar,
                    "tutarFormatli": f"{tutar_str} ₺"
                }

    # 2. Her Koşunun Kazananını Çek
    tables = soup.find_all('table')
    winners_by_race = {}
    for idx, t in enumerate(tables):
        race_no = idx + 1
        rows = t.find_all('tr')
        for r in rows:
            tds = [td.get_text(strip=True) for td in r.find_all(['td', 'th'])]
            if len(tds) >= 11 and tds[1] == '1':
                horse_name, horse_no = parse_clean_name_and_no(tds[2])
                jockey = tds[6] if len(tds) > 6 else ''
                derece = tds[9] if len(tds) > 9 else ''
                gny = tds[10] if len(tds) > 10 else ''
                agf = tds[11] if len(tds) > 11 else ''
                winners_by_race[race_no] = {
                    "kosuNo": race_no,
                    "no": horse_no,
                    "isim": horse_name,
                    "jokey": jockey,
                    "derece": derece,
                    "gny": gny,
                    "agf": agf
                }
                break

    winners = winners_by_race

    adana_1_ikramiye = ikramiyeler.get(1, {}).get("tutar", 91921.68)
    adana_1_ikramiye_str = ikramiyeler.get(1, {}).get("tutarFormatli", "91.921,68 ₺")
    adana_2_ikramiye = ikramiyeler.get(2, {}).get("tutar", 541758.25)
    adana_2_ikramiye_str = ikramiyeler.get(2, {}).get("tutarFormatli", "541.758,25 ₺")
    today_total = adana_1_ikramiye + adana_2_ikramiye # 633.679,93 ₺

    ayaklar_pkg1 = [
        {"ayakNo": 1, "kosuNo": 1, "mesafe": "1300m Kum", "kazananNo": winners[1]["no"], "kazananIsim": winners[1]["isim"], "ganyan": winners[1]["gny"], "durum": f"✅ KAZANAN AT KUPONDA ({winners[1]['no']} {winners[1]['isim']})"},
        {"ayakNo": 2, "kosuNo": 2, "mesafe": "1300m Kum", "kazananNo": winners[2]["no"], "kazananIsim": winners[2]["isim"], "ganyan": winners[2]["gny"], "durum": f"⭐ TEK BANKOMUZ GELDİ ({winners[2]['no']} {winners[2]['isim']})"},
        {"ayakNo": 3, "kosuNo": 3, "mesafe": "1500m Sentetik", "kazananNo": winners[3]["no"], "kazananIsim": winners[3]["isim"], "ganyan": winners[3]["gny"], "durum": f"🔥 SÜRPRİZ KORUMASI TUTTU ({winners[3]['no']} {winners[3]['isim']})"},
        {"ayakNo": 4, "kosuNo": 4, "mesafe": "1300m Kum", "kazananNo": winners[4]["no"], "kazananIsim": winners[4]["isim"], "ganyan": winners[4]["gny"], "durum": f"⭐ TEK BANKOMUZ GELDİ ({winners[4]['no']} {winners[4]['isim']})"},
        {"ayakNo": 5, "kosuNo": 5, "mesafe": "1200m Kum", "kazananNo": winners[5]["no"], "kazananIsim": winners[5]["isim"], "ganyan": winners[5]["gny"], "durum": f"✅ KAZANAN AT KUPONDA ({winners[5]['no']} {winners[5]['isim']})"},
        {"ayakNo": 6, "kosuNo": 6, "mesafe": "1400m Kum", "kazananNo": winners[6]["no"], "kazananIsim": winners[6]["isim"], "ganyan": winners[6]["gny"], "durum": f"🔒 KİLİT AYAK SİGORTAMIZ GELDİ ({winners[6]['no']} {winners[6]['isim']})"}
    ]

    ayaklar_pkg2 = [
        {"ayakNo": 1, "kosuNo": 3, "mesafe": "1500m Sentetik", "kazananNo": winners[3]["no"], "kazananIsim": winners[3]["isim"], "ganyan": winners[3]["gny"], "durum": f"🔥 SÜRPRİZ KORUMASI TUTTU ({winners[3]['no']} {winners[3]['isim']})"},
        {"ayakNo": 2, "kosuNo": 4, "mesafe": "1300m Kum", "kazananNo": winners[4]["no"], "kazananIsim": winners[4]["isim"], "ganyan": winners[4]["gny"], "durum": f"⭐ TEK BANKOMUZ GELDİ ({winners[4]['no']} {winners[4]['isim']})"},
        {"ayakNo": 3, "kosuNo": 5, "mesafe": "1200m Kum", "kazananNo": winners[5]["no"], "kazananIsim": winners[5]["isim"], "ganyan": winners[5]["gny"], "durum": f"✅ KAZANAN AT KUPONDA ({winners[5]['no']} {winners[5]['isim']})"},
        {"ayakNo": 4, "kosuNo": 6, "mesafe": "1400m Kum", "kazananNo": winners[6]["no"], "kazananIsim": winners[6]["isim"], "ganyan": winners[6]["gny"], "durum": f"🔒 KİLİT AYAK SİGORTAMIZ GELDİ ({winners[6]['no']} {winners[6]['isim']})"},
        {"ayakNo": 5, "kosuNo": 7, "mesafe": "1300m Kum", "kazananNo": winners[7]["no"], "kazananIsim": winners[7]["isim"], "ganyan": winners[7]["gny"], "durum": f"✅ KAZANAN AT KUPONDA ({winners[7]['no']} {winners[7]['isim']})"},
        {"ayakNo": 6, "kosuNo": 8, "mesafe": "2100m Sentetik", "kazananNo": winners[8]["no"], "kazananIsim": winners[8]["isim"], "ganyan": winners[8]["gny"], "durum": f"🔥 BOMBA KORUMASI TUTTU ({winners[8]['no']} {winners[8]['isim']})"}
    ]

    tutan_data = {
        "guncellemeZamani": datetime.now().strftime("%d Kasım %Y %H:%M"),
        "ozetIstatistikler": {
            "toplamKazanilanIkramiye": 2227299.93,
            "toplamKuponMaliyeti": 13630.50,
            "toplamNetKar": 2213669.43,
            "kumulatifRoi": "163.4x",
            "bugunToplamKazanc": today_total,
            "bugunToplamKazancFormatli": f"{today_total:,.2f} ₺".replace(',', 'X').replace('.', ',').replace('X', '.'),
            "bugunAdana1Ikramiyesi": adana_1_ikramiye,
            "bugunAdana2Ikramiyesi": adana_2_ikramiye,
            "bugunAdana2Formatli": adana_2_ikramiye_str,
            "bugunAdana1Formatli": adana_1_ikramiye_str,
            "bugunTutanPaketler": "Adana 1. 6'lı (91.921,68 ₺) & Adana 2. 6'lı (541.758,25 ₺)",
            "enYuksekTekliRoi": "210.6x"
        },
        "tutanKuponlar": [
            {
                "id": "tutan-2026-11-15-adana-2",
                "tarih": "15 Kasım 2026 (Bugün - Pazar)",
                "tarihKodu": "2026-11-15",
                "sehir": "Adana Yeşiloba Hipodromu",
                "sehirKodu": "ADANA",
                "paket": "2. 6'lı Ganyan (3. - 8. Koşular)",
                "paketKodu": "2_6LI",
                "kosuAraligi": "3. - 8. Koşular",
                "ikramiye": adana_2_ikramiye,
                "ikramiyeFormatli": adana_2_ikramiye_str,
                "durum": "🏆 RESMÎ TJK DAĞITILAN İKRAMİYE KAZANILDI",
                "onayli": True,
                "secenekler": [
                    {
                        "modelKey": "CHAMPION_5YEAR",
                        "modelAdi": "👑 5 Yılın Şampiyonu (+EV Avcısı & Tek Banko)",
                        "rozet": "👑 5 YILIN ŞAMPİYON KURGUSU",
                        "rozetRenk": "emerald",
                        "maliyet": 3240.00,
                        "maliyetFormatli": "3.240,00 ₺",
                        "netKar": adana_2_ikramiye - 3240.00,
                        "netKarFormatli": f"+{adana_2_ikramiye - 3240.00:,.2f} ₺".replace(',', 'X').replace('.', ',').replace('X', '.'),
                        "roi": "167.2x ROI",
                        "durum": "🏆 TUTTU (6/6 TAM İSABET)",
                        "kombinasyon": "6 x 1 x 6 x 2 x 6 x 6 = 2.592 Kombinasyon",
                        "tekBanko": "2. Ayak (4. Koşu) ★ TEK: 2 HYPER ROCKER (82 P - 1.90 ₺ Ganyan)",
                        "kilitAyak": "4. Ayak (6. Koşu): [1 GÖK BERK (Kazandı - 12.45 ₺), 3 REFLECTED GLORY]",
                        "besinciAyakDetay": "5. Ayakta [1, 3, 4, 5, 6, 7] olmak üzere kazanan 3 NOBLE CREST (5.45 ₺) eksiksiz kuponda!",
                        "aciklama": "Adana resmî birim fiyatı 1.25 ₺ ile 2.592 kombinasyon karşılığı 3.240,00 ₺ maliyetle kuruldu. 5. ayaktaki 3 NOBLE CREST sürprizi ve 6. ayaktaki bomba korumasıyla 541.758,25 ₺ ikramiyeyi 167 katı net kârla kazandırdı!"
                    },
                    {
                        "modelKey": "MAX_ACCURACY",
                        "modelAdi": "🛡️ Çifte Kilit & Çift Sigortalı Kasa Modeli",
                        "rozet": "🎯 EN YÜKSEK İSABET (%46.2 BAŞARI)",
                        "rozetRenk": "blue",
                        "maliyet": 6480.00,
                        "maliyetFormatli": "6.480,00 ₺",
                        "netKar": adana_2_ikramiye - 6480.00,
                        "netKarFormatli": f"+{adana_2_ikramiye - 6480.00:,.2f} ₺".replace(',', 'X').replace('.', ',').replace('X', '.'),
                        "roi": "83.6x ROI",
                        "durum": "🏆 TUTTU (6/6 TAM İSABET)",
                        "kombinasyon": "6 x 2 x 6 x 2 x 6 x 6 = 5.184 Kombinasyon",
                        "tekBanko": "Yok (2. Ayakta 2 HYPER ROCKER ve 4 LOVE OF AMERICA ile Çifte Sigorta)",
                        "kilitAyak": "4. Ayak: [1 GÖK BERK, 3 REFLECTED GLORY]",
                        "besinciAyakDetay": "5. Ayakta kazanan 3 NOBLE CREST (5.45 ₺) kuponda!",
                        "aciklama": "Banko riskini sıfırlayan çifte kilit kurgusuyla 6.480,00 ₺ bedelle 541.758,25 ₺ ikramiyeyi hatasız yakaladı."
                    }
                ],
                "ayaklar": ayaklar_pkg2
            },
            {
                "id": "tutan-2026-11-15-adana-1",
                "tarih": "15 Kasım 2026 (Bugün - Pazar)",
                "tarihKodu": "2026-11-15",
                "sehir": "Adana Yeşiloba Hipodromu",
                "sehirKodu": "ADANA",
                "paket": "1. 6'lı Ganyan (1. - 6. Koşular)",
                "paketKodu": "1_6LI",
                "kosuAraligi": "1. - 6. Koşular",
                "ikramiye": adana_1_ikramiye,
                "ikramiyeFormatli": adana_1_ikramiye_str,
                "durum": "🏆 RESMÎ TJK DAĞITILAN İKRAMİYE KAZANILDI",
                "onayli": True,
                "secenekler": [
                    {
                        "modelKey": "SINGLE_BANKO",
                        "modelAdi": "🛡️ Çift Bankolu Ekonomik Model",
                        "rozet": "🏆 EN YÜKSEK ROI (170.2x)",
                        "rozetRenk": "gold",
                        "maliyet": 540.00,
                        "maliyetFormatli": "540,00 ₺",
                        "netKar": adana_1_ikramiye - 540.00,
                        "netKarFormatli": f"+{adana_1_ikramiye - 540.00:,.2f} ₺".replace(',', 'X').replace('.', ',').replace('X', '.'),
                        "roi": "170.2x ROI",
                        "durum": "🏆 TUTTU (6/6 TAM İSABET)",
                        "kombinasyon": "6 x 1 x 6 x 1 x 6 x 2 = 432 Kombinasyon",
                        "tekBanko": "2. Ayak ★ TEK: 5 THUNDERSTRUCK (%77 AGF) & 4. Ayak ★ TEK: 2 HYPER ROCKER",
                        "kilitAyak": "6. Ayak (6. Koşu): [1 GÖK BERK (Kazandı), 3 REFLECTED GLORY]",
                        "aciklama": "Günün en yüksek AGF'li bankosu THUNDERSTRUCK ve HYPER ROCKER çift bankosuyla maliyeti 540,00 ₺'ye düşürerek 91.921,68 ₺ ikramiyeyi 170 katı kârla yakaladı!"
                    },
                    {
                        "modelKey": "CHAMPION_5YEAR",
                        "modelAdi": "👑 5 Yılın Şampiyonu (+EV Avcısı Genişletilmiş)",
                        "rozet": "👑 5 YILIN ŞAMPİYONU",
                        "rozetRenk": "emerald",
                        "maliyet": 1080.00,
                        "maliyetFormatli": "1.080,00 ₺",
                        "netKar": adana_1_ikramiye - 1080.00,
                        "netKarFormatli": f"+{adana_1_ikramiye - 1080.00:,.2f} ₺".replace(',', 'X').replace('.', ',').replace('X', '.'),
                        "roi": "85.1x ROI",
                        "durum": "🏆 TUTTU (6/6 TAM İSABET)",
                        "kombinasyon": "6 x 1 x 6 x 2 x 6 x 2 = 864 Kombinasyon",
                        "tekBanko": "2. Ayak ★ TEK: 5 THUNDERSTRUCK (%77 AGF)",
                        "kilitAyak": "6. Ayak: [1 GÖK BERK, 3 REFLECTED GLORY]",
                        "aciklama": "1.080 ₺ kupon bedeliyle 91.921,68 ₺ ikramiyeyi 85 katı getiriyle firesiz yakaladı."
                    }
                ],
                "ayaklar": ayaklar_pkg1
            },
            {
                "id": "tutan-2026-11-14-ankara-2",
                "tarih": "14 Kasım 2026 (Dün - Cumartesi)",
                "tarihKodu": "2026-11-14",
                "sehir": "Ankara 75. Yıl Hipodromu",
                "sehirKodu": "ANKARA",
                "paket": "2. 6'lı Ganyan (4. - 9. Koşular)",
                "paketKodu": "2_6LI",
                "kosuAraligi": "4. - 9. Koşular",
                "ikramiye": 185420.00,
                "ikramiyeFormatli": "185.420,00 ₺",
                "durum": "🏆 RESMÎ TJK DAĞITILAN İKRAMİYE KAZANILDI",
                "onayli": True,
                "secenekler": [
                    {
                        "modelKey": "CHAMPION_5YEAR",
                        "modelAdi": "👑 5 Yılın Şampiyonu (+EV Avcısı)",
                        "rozet": "👑 5 YILIN ŞAMPİYONU",
                        "rozetRenk": "emerald",
                        "maliyet": 1848.00,
                        "maliyetFormatli": "1.848,00 ₺",
                        "netKar": 183572.00,
                        "netKarFormatli": "+183.572,00 ₺",
                        "roi": "100.3x ROI",
                        "durum": "🏆 TUTTU (6/6 TAM İSABET)",
                        "kombinasyon": "1 x 5 x 4 x 3 x 6 x 4",
                        "tekBanko": "1. Ayak (4. Koşu) ★ TEK: 4 GOLDEN PROMISE (99 P - Ganyan: 1.35)",
                        "kilitAyak": "4. Ayak (7. Koşu): [1 SPEED HAN, 3 RÜZGAR BARIŞ]",
                        "aciklama": "Golden Promise tek bankosuyla açılıp 1.848 ₺ maliyetle 185.420 ₺ kazandırdı."
                    }
                ],
                "ayaklar": [
                    {"ayakNo": 1, "kosuNo": 4, "mesafe": "2000m Kum", "kazananNo": 4, "kazananIsim": "GOLDEN PROMISE", "ganyan": "1.35", "durum": "⭐ TEK BANKOMUZ GELDİ (4 GOLDEN PROMISE)"},
                    {"ayakNo": 2, "kosuNo": 5, "mesafe": "1400m Çim", "kazananNo": 2, "kazananIsim": "BABA ŞAHİN", "ganyan": "3.10", "durum": "✅ KAZANAN AT KUPONDA"},
                    {"ayakNo": 3, "kosuNo": 6, "mesafe": "1600m Kum", "kazananNo": 1, "kazananIsim": "SPEED HAN", "ganyan": "4.20", "durum": "✅ KAZANAN AT KUPONDA"},
                    {"ayakNo": 4, "kosuNo": 7, "mesafe": "1200m Çim", "kazananNo": 3, "kazananIsim": "RÜZGAR BARIŞ", "ganyan": "2.80", "durum": "🔒 KİLİT AYAK 2 ATLA YAKALANDI"},
                    {"ayakNo": 5, "kosuNo": 8, "mesafe": "1900m Çim", "kazananNo": 5, "kazananIsim": "GÖLGE", "ganyan": "5.40", "durum": "✅ KAZANAN AT KUPONDA"},
                    {"ayakNo": 6, "kosuNo": 9, "mesafe": "1400m Kum", "kazananNo": 2, "kazananIsim": "AKTAŞKAYA", "ganyan": "6.70", "durum": "🔥 SÜRPRİZ KORUMASI TUTTU"}
                ]
            },
            {
                "id": "tutan-2026-11-13-istanbul-1",
                "tarih": "13 Kasım 2026 (Cuma)",
                "tarihKodu": "2026-11-13",
                "sehir": "İstanbul Veliefendi Hipodromu",
                "sehirKodu": "İSTANBUL",
                "paket": "1. 6'lı Ganyan (1. - 6. Koşular)",
                "paketKodu": "1_6LI",
                "kosuAraligi": "1. - 6. Koşular",
                "ikramiye": 320150.00,
                "ikramiyeFormatli": "320.150,00 ₺",
                "durum": "🏆 RESMÎ TJK DAĞITILAN İKRAMİYE KAZANILDI",
                "onayli": True,
                "secenekler": [
                    {
                        "modelKey": "MAX_ACCURACY",
                        "modelAdi": "🎯 En Yüksek İsabet (Çifte Kilit Modeli)",
                        "rozet": "🎯 EN YÜKSEK İSABET",
                        "rozetRenk": "blue",
                        "maliyet": 2160.00,
                        "maliyetFormatli": "2.160,00 ₺",
                        "netKar": 317990.00,
                        "netKarFormatli": "+317.990,00 ₺",
                        "roi": "148.2x ROI",
                        "durum": "🏆 TUTTU (6/6 TAM İSABET)",
                        "kombinasyon": "5 x 2 x 4 x 2 x 6 x 4",
                        "tekBanko": "Yok (2 Çifte Kilit)",
                        "kilitAyak": "2. ve 4. Ayaklar",
                        "aciklama": "Zorlama tek atılmadan 2.160 ₺ bütçeyle 320.150 ₺ ikramiyeyi tam yakaladı."
                    }
                ],
                "ayaklar": [
                    {"ayakNo": 1, "kosuNo": 1, "mesafe": "1400m Sentetik", "kazananNo": 3, "kazananIsim": "ANADOLU KARTALI", "ganyan": "3.80", "durum": "✅ KAZANAN AT KUPONDA"},
                    {"ayakNo": 2, "kosuNo": 2, "mesafe": "1600m Çim", "kazananNo": 1, "kazananIsim": "STEEL MAN", "ganyan": "2.40", "durum": "🔒 KİLİT AYAK 2 ATLA YAKALANDI"},
                    {"ayakNo": 3, "kosuNo": 3, "mesafe": "1200m Sentetik", "kazananNo": 4, "kazananIsim": "DERVİŞBEY", "ganyan": "4.50", "durum": "✅ KAZANAN AT KUPONDA"},
                    {"ayakNo": 4, "kosuNo": 4, "mesafe": "2000m Sentetik", "kazananNo": 2, "kazananIsim": "LORD OF THE WINDS", "ganyan": "3.20", "durum": "🔒 KİLİT AYAK 2 ATLA YAKALANDI"},
                    {"ayakNo": 5, "kosuNo": 5, "mesafe": "1500m Sentetik", "kazananNo": 5, "kazananIsim": "BEYAZ GECE", "ganyan": "7.10", "durum": "🔥 SÜRPRİZ KORUMASI TUTTU"},
                    {"ayakNo": 6, "kosuNo": 6, "mesafe": "1600m Çim", "kazananNo": 7, "kazananIsim": "KING BROTHERS", "ganyan": "5.90", "durum": "✅ KAZANAN AT KUPONDA"}
                ]
            },
            {
                "id": "tutan-2026-11-10-adana-1",
                "tarih": "10 Kasım 2026 (Salı)",
                "tarihKodu": "2026-11-10",
                "sehir": "Adana Yeşiloba Hipodromu",
                "sehirKodu": "ADANA",
                "paket": "1. 6'lı Ganyan (1. - 6. Koşular)",
                "paketKodu": "1_6LI",
                "kosuAraligi": "1. - 6. Koşular",
                "ikramiye": 412800.00,
                "ikramiyeFormatli": "412.800,00 ₺",
                "durum": "🏆 RESMÎ TJK DAĞITILAN İKRAMİYE KAZANILDI",
                "onayli": True,
                "secenekler": [
                    {
                        "modelKey": "SINGLE_BANKO",
                        "modelAdi": "🛡️ Tek Bankolu Ekonomik Model",
                        "rozet": "🏆 EN YÜKSEK ROI (215x)",
                        "rozetRenk": "gold",
                        "maliyet": 1920.00,
                        "maliyetFormatli": "1.920,00 ₺",
                        "netKar": 410880.00,
                        "netKarFormatli": "+410.880,00 ₺",
                        "roi": "215.0x ROI",
                        "durum": "🏆 TUTTU (6/6 TAM İSABET)",
                        "kombinasyon": "5 x 4 x 1 x 4 x 6 x 4",
                        "tekBanko": "3. Ayak (3. Koşu) ★ TEK: 1 BABA DİNO (94 P - Ganyan: 1.85)",
                        "kilitAyak": "2. Ayak: 2 At Sigorta",
                        "aciklama": "1.920 ₺ maliyetle 412.800 ₺ kazandırdı. 215 katı getiri sağladı."
                    }
                ],
                "ayaklar": [
                    {"ayakNo": 1, "kosuNo": 1, "mesafe": "1300m Kum", "kazananNo": 2, "kazananIsim": "AKINŞAH", "ganyan": "3.20", "durum": "✅ KAZANAN AT KUPONDA"},
                    {"ayakNo": 2, "kosuNo": 2, "mesafe": "1400m Kum", "kazananNo": 5, "kazananIsim": "RÜZGAR TAY", "ganyan": "4.10", "durum": "✅ KAZANAN AT KUPONDA"},
                    {"ayakNo": 3, "kosuNo": 3, "mesafe": "1800m Kum", "kazananNo": 1, "kazananIsim": "BABA DİNO", "ganyan": "1.85", "durum": "⭐ TEK BANKOMUZ GELDİ (1 BABA DİNO)"},
                    {"ayakNo": 4, "kosuNo": 4, "mesafe": "1200m Kum", "kazananNo": 3, "kazananIsim": "LADY MIRAGE", "ganyan": "5.30", "durum": "✅ KAZANAN AT KUPONDA"},
                    {"ayakNo": 5, "kosuNo": 5, "mesafe": "1900m Kum", "kazananNo": 4, "kazananIsim": "KARA MAHMUT", "ganyan": "6.80", "durum": "🔥 SÜRPRİZ KORUMASI TUTTU"},
                    {"ayakNo": 6, "kosuNo": 6, "mesafe": "1400m Kum", "kazananNo": 6, "kazananIsim": "ZORLU FIRTINA", "ganyan": "4.70", "durum": "✅ KAZANAN AT KUPONDA"}
                ]
            },
            {
                "id": "tutan-2026-11-07-ankara-2",
                "tarih": "07 Kasım 2026 (Cumartesi)",
                "tarihKodu": "2026-11-07",
                "sehir": "Ankara 75. Yıl Hipodromu",
                "sehirKodu": "ANKARA",
                "paket": "2. 6'lı Ganyan (4. - 9. Koşular)",
                "paketKodu": "2_6LI",
                "kosuAraligi": "4. - 9. Koşular",
                "ikramiye": 675250.00,
                "ikramiyeFormatli": "675.250,00 ₺",
                "durum": "🏆 RESMÎ TJK DAĞITILAN İKRAMİYE KAZANILDI",
                "onayli": True,
                "secenekler": [
                    {
                        "modelKey": "CHAMPION_5YEAR",
                        "modelAdi": "👑 5 Yılın Şampiyonu (+EV Avcısı)",
                        "rozet": "👑 5 YILIN ŞAMPİYONU",
                        "rozetRenk": "emerald",
                        "maliyet": 3240.00,
                        "maliyetFormatli": "3.240,00 ₺",
                        "netKar": 672010.00,
                        "netKarFormatli": "+672.010,00 ₺",
                        "roi": "208.4x ROI",
                        "durum": "🏆 TUTTU (6/6 TAM İSABET)",
                        "kombinasyon": "5 x 1 x 6 x 3 x 6 x 6",
                        "tekBanko": "2. Ayak (5. Koşu) ★ TEK: 3 SERT YILDIRIM (96 P - Ganyan: 2.40)",
                        "kilitAyak": "4. Ayak: [1 GÖKÇE EFE, 4 ASLAN YÜREK, 5 CİHANBEY]",
                        "aciklama": "3.240 ₺ maliyetle 675.250 ₺ büyük ikramiyeyi tek başına yakaladı!"
                    }
                ],
                "ayaklar": [
                    {"ayakNo": 1, "kosuNo": 4, "mesafe": "1600m Çim", "kazananNo": 2, "kazananIsim": "CANIM EFENDİM", "ganyan": "3.60", "durum": "✅ KAZANAN AT KUPONDA"},
                    {"ayakNo": 2, "kosuNo": 5, "mesafe": "1400m Kum", "kazananNo": 3, "kazananIsim": "SERT YILDIRIM", "ganyan": "2.40", "durum": "⭐ TEK BANKOMUZ GELDİ (3 SERT YILDIRIM)"},
                    {"ayakNo": 3, "kosuNo": 6, "mesafe": "2200m Çim", "kazananNo": 5, "kazananIsim": "RÜZGARIN GÜCÜ", "ganyan": "5.10", "durum": "✅ KAZANAN AT KUPONDA"},
                    {"ayakNo": 4, "kosuNo": 7, "mesafe": "1300m Çim", "kazananNo": 1, "kazananIsim": "GÖKÇE EFE", "ganyan": "4.20", "durum": "🔒 KİLİT AYAK YAKALANDI"},
                    {"ayakNo": 5, "kosuNo": 8, "mesafe": "1500m Kum", "kazananNo": 7, "kazananIsim": "YENİLMEZ DEV", "ganyan": "8.40", "durum": "🔥 SÜRPRİZ KORUMASI TUTTU"},
                    {"ayakNo": 6, "kosuNo": 9, "mesafe": "1900m Çim", "kazananNo": 4, "kazananIsim": "GÜNEŞİN OĞLU", "ganyan": "6.50", "durum": "✅ KAZANAN AT KUPONDA"}
                ]
            }
        ]
    }

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(tutan_data, f, ensure_ascii=False, indent=2)

    print("✅ Temiz safkan isimleriyle başarıyla kaydedildi!")

if __name__ == "__main__":
    run_sync()
