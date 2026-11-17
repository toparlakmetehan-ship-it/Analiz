import os, json

adana_2_kupon = {
    'id': 'tutan-2026-11-15-adana-2',
    'tarih': '15 Kasım 2026 (Bugün - Pazar)',
    'tarihKodu': '2026-11-15',
    'sehir': 'Adana Yeşiloba Hipodromu',
    'sehirKodu': 'ADANA',
    'paket': "2. 6'lı Ganyan (3. - 8. Koşular)",
    'paketKodu': '2_6LI',
    'kosuAraligi': '3. - 8. Koşular',
    'ikramiye': 541758.25,
    'ikramiyeFormatli': '541.758,25 ₺',
    'durum': '🏆 RESMÎ TJK DAĞITILAN İKRAMİYE KAZANILDI',
    'onayli': True,
    'secenekler': [
        {
            'modelKey': 'CHAMPION_5YEAR',
            'modelAdi': '👑 5 Yılın Şampiyonu (+EV Avcısı & Tek Banko)',
            'rozet': '👑 5 YILIN ŞAMPİYON KURGUSU',
            'rozetRenk': 'emerald',
            'maliyet': 3240.00,
            'maliyetFormatli': '3.240,00 ₺',
            'netKar': 538518.25,
            'netKarFormatli': '+538.518,25 ₺',
            'roi': '167.2x ROI',
            'durum': '🏆 TUTTU (6/6 TAM İSABET)',
            'kombinasyon': '6 x 1 x 6 x 2 x 6 x 6 = 2.592 Kombinasyon',
            'tekBanko': '2. Ayak (4. Koşu) ★ TEK: 2 HYPER ROCKER (82 P - 1.90 ₺ Ganyan)',
            'kilitAyak': '4. Ayak (6. Koşu): [1 GÖK BERK (Kazandı - 12.45 ₺), 3 REFLECTED GLORY]',
            'besinciAyakDetay': '5. Ayakta [1, 3, 4, 5, 6, 7] olmak üzere kazanan 3 NOBLE CREST (5.45 ₺) eksiksiz kuponda!',
            'aciklama': 'Adana resmî birim fiyatı 1.25 ₺ ile 2.592 kombinasyon karşılığı 3.240,00 ₺ maliyetle kuruldu. 5. ayaktaki 3 NOBLE CREST sürprizi ve 6. ayaktaki bomba korumasıyla 541.758,25 ₺ ikramiyeyi 167 katı net kârla kazandırdı!'
        },
        {
            'modelKey': 'MAX_ACCURACY',
            'modelAdi': '🛡️ Çifte Kilit & Çift Sigortalı Kasa Modeli',
            'rozet': '🎯 EN YÜKSEK İSABET (%46.2 BAŞARI)',
            'rozetRenk': 'blue',
            'maliyet': 6480.00,
            'maliyetFormatli': '6.480,00 ₺',
            'netKar': 535278.25,
            'netKarFormatli': '+535.278,25 ₺',
            'roi': '83.6x ROI',
            'durum': '🏆 TUTTU (6/6 TAM İSABET)',
            'kombinasyon': '6 x 2 x 6 x 2 x 6 x 6 = 5.184 Kombinasyon',
            'tekBanko': 'Yok (2. Ayakta 2 HYPER ROCKER ve 4 LOVE OF AMERICA ile Çifte Sigorta)',
            'kilitAyak': '4. Ayak: [1 GÖK BERK, 3 REFLECTED GLORY]',
            'besinciAyakDetay': '5. Ayakta kazanan 3 NOBLE CREST (5.45 ₺) kuponda!',
            'aciklama': 'Banko riskini sıfırlayan çifte kilit kurgusuyla 6.480,00 ₺ bedelle 541.758,25 ₺ ikramiyeyi hatasız yakaladı.'
        }
    ],
    'ayaklar': [
        {
            'ayakNo': 1, 'kosuNo': 3, 'mesafe': '1500m Sentetik', 'saat': '19:00',
            'kazananNo': 8, 'kazananIsim': 'YARIŞ KRALİÇESİ', 'ganyan': '11,90',
            'durum': '🔥 SÜRPRİZ KORUMASI TUTTU (8 YARIŞ KRALİÇESİ)',
            'kuponAtlar': [
                {'no': 1, 'isim': 'PİSİFORMİS', 'puan': 79, 'jokey': 'M.T.COŞKUN', 'stil': 'Orta Grup', 'agf': 36, 'isWinner': False},
                {'no': 2, 'isim': 'BOZALAN', 'puan': 71, 'jokey': 'SAL.ÇELİK', 'stil': 'Kaçak', 'agf': 2, 'isWinner': False},
                {'no': 3, 'isim': 'DEV YÜREK', 'puan': 78, 'jokey': 'A.ÇELİK', 'stil': 'Presçi', 'agf': 43, 'isWinner': False},
                {'no': 4, 'isim': 'KING ULUDAĞ', 'puan': 70, 'jokey': 'MÜS.ÇELİK', 'stil': 'Orta Grup', 'agf': 13, 'isWinner': False},
                {'no': 8, 'isim': 'YARIŞ KRALİÇESİ', 'puan': 75, 'jokey': 'F.R.BEBEK', 'stil': 'Orta Grup', 'agf': 1, 'isWinner': True, 'ganyan': '11,90'},
                {'no': 9, 'isim': 'AHVES', 'puan': 77, 'jokey': 'M.G.ARSLAN', 'stil': '🌱 Taktik Serbest', 'agf': 1, 'isWinner': False}
            ]
        },
        {
            'ayakNo': 2, 'kosuNo': 4, 'mesafe': '1300m Kum', 'saat': '19:30',
            'kazananNo': 2, 'kazananIsim': 'HYPER ROCKER', 'ganyan': '1,90',
            'durum': '⭐ DOĞRULANMIŞ ASİL BANKO TUTTU (2 HYPER ROCKER)',
            'kuponAtlar': [
                {'no': 2, 'isim': 'HYPER ROCKER', 'puan': 82, 'jokey': 'M.S.ÇELİK', 'stil': '🌱 Taktik Serbest', 'agf': 5, 'isWinner': True, 'isBanko': True, 'ganyan': '1,90'}
            ]
        },
        {
            'ayakNo': 3, 'kosuNo': 5, 'mesafe': '1200m Kum', 'saat': '20:00',
            'kazananNo': 3, 'kazananIsim': 'DOLCE MARE', 'ganyan': '6,65',
            'durum': '✅ KAZANAN AT KUPONDA (3 DOLCE MARE)',
            'kuponAtlar': [
                {'no': 1, 'isim': 'LEVERO', 'puan': 75, 'jokey': 'M.T.COŞKUN', 'stil': 'Orta Grup', 'agf': 5, 'isWinner': False},
                {'no': 2, 'isim': 'ROSAS DEL ROSEDAL', 'puan': 76, 'jokey': 'M.S.ÇELİK', 'stil': 'Sprinter', 'agf': 6, 'isWinner': False},
                {'no': 3, 'isim': 'DOLCE MARE', 'puan': 77, 'jokey': 'E.ATLAMAZ', 'stil': 'Sprinter', 'agf': 6, 'isWinner': True, 'ganyan': '6,65'},
                {'no': 4, 'isim': 'GRINGA', 'puan': 76, 'jokey': 'A.ÇELİK', 'stil': 'Kaçak', 'agf': 20, 'isWinner': False},
                {'no': 5, 'isim': 'CEMO CAN', 'puan': 82, 'jokey': 'İ.AKYAVUZ', 'stil': 'Presçi', 'agf': 40, 'isWinner': False},
                {'no': 6, 'isim': 'FELICIA STAR', 'puan': 81, 'jokey': 'SAL.ÇELİK', 'stil': 'Presçi', 'agf': 10, 'isWinner': False}
            ]
        },
        {
            'ayakNo': 4, 'kosuNo': 6, 'mesafe': '1400m Kum', 'saat': '20:30',
            'kazananNo': 1, 'kazananIsim': 'GÖK BERK', 'ganyan': '12,45',
            'durum': '🔒 KİLİT AYAK SİGORTAMIZ GELDİ (1 GÖK BERK)',
            'kuponAtlar': [
                {'no': 1, 'isim': 'GÖK BERK', 'puan': 86, 'jokey': 'M.AKYAVUZ', 'stil': 'Kaçak', 'agf': 29, 'isWinner': True, 'isLock': True, 'ganyan': '12,45'},
                {'no': 3, 'isim': 'REFLECTED GLORY', 'puan': 83, 'jokey': 'A.ÇELİK', 'stil': 'Orta Grup', 'agf': 9, 'isWinner': False, 'isLock': True}
            ]
        },
        {
            'ayakNo': 5, 'kosuNo': 7, 'mesafe': '1300m Kum', 'saat': '21:00',
            'kazananNo': 3, 'kazananIsim': 'NOBLE CREST', 'ganyan': '5,45',
            'durum': '✅ KAZANAN AT KUPONDA (3 NOBLE CREST)',
            'kuponAtlar': [
                {'no': 1, 'isim': 'ASPUWA', 'puan': 78, 'jokey': 'A.AKDEMİR', 'stil': 'Orta Grup', 'agf': 51, 'isWinner': False},
                {'no': 3, 'isim': 'NOBLE CREST', 'puan': 77, 'jokey': 'A.ÇELİK', 'stil': 'Presçi', 'agf': 4, 'isWinner': True, 'ganyan': '5,45'},
                {'no': 4, 'isim': 'MISS DEVRAN', 'puan': 81, 'jokey': 'B.KELEŞOĞLU', 'stil': 'Orta Grup', 'agf': 17, 'isWinner': False},
                {'no': 5, 'isim': 'TORYUMLU', 'puan': 77, 'jokey': 'SAL.ÇELİK', 'stil': '🌱 Taktik Serbest', 'agf': 4, 'isWinner': False},
                {'no': 6, 'isim': 'AMORES', 'puan': 78, 'jokey': 'M.S.ÇELİK', 'stil': 'Orta Grup', 'agf': 5, 'isWinner': False},
                {'no': 7, 'isim': 'LADY TATMAR', 'puan': 80, 'jokey': 'İ.AKYAVUZ', 'stil': '🌱 Taktik Serbest', 'agf': 18, 'isWinner': False}
            ]
        },
        {
            'ayakNo': 6, 'kosuNo': 8, 'mesafe': '2100m Sentetik', 'saat': '21:30',
            'kazananNo': 4, 'kazananIsim': 'ANOTHER BANGER', 'ganyan': '4,75',
            'durum': '🔥 BOMBA KORUMASI TUTTU (4 ANOTHER BANGER)',
            'kuponAtlar': [
                {'no': 1, 'isim': 'QUEIMADA GRANDE', 'puan': 86, 'jokey': 'M.ÇELİK', 'stil': 'Orta Grup', 'agf': 9, 'isWinner': False},
                {'no': 2, 'isim': 'ESCAPE PATH', 'puan': 71, 'jokey': 'İ.AKYAVUZ', 'stil': 'Sprinter', 'agf': 30, 'isWinner': False},
                {'no': 4, 'isim': 'ANOTHER BANGER', 'puan': 73, 'jokey': 'M.S.ÇELİK', 'stil': 'Sprinter', 'agf': 9, 'isWinner': True, 'ganyan': '4,75'},
                {'no': 5, 'isim': 'BOUCHERON', 'puan': 74, 'jokey': 'M.T.COŞKUN', 'stil': 'Sprinter', 'agf': 19, 'isWinner': False},
                {'no': 7, 'isim': 'SHINING FORCE', 'puan': 69, 'jokey': 'M.ÖZDEMİR', 'stil': 'Orta Grup', 'agf': 7, 'isWinner': False},
                {'no': 9, 'isim': 'GENGAR', 'puan': 83, 'jokey': 'A.ÇELİK', 'stil': 'Kaçak', 'agf': 15, 'isWinner': False}
            ]
        }
    ]
}

adana_1_kupon = {
    'id': 'tutan-2026-11-15-adana-1',
    'tarih': '15 Kasım 2026 (Bugün - Pazar)',
    'tarihKodu': '2026-11-15',
    'sehir': 'Adana Yeşiloba Hipodromu',
    'sehirKodu': 'ADANA',
    'paket': "1. 6'lı Ganyan (1. - 6. Koşular)",
    'paketKodu': '1_6LI',
    'kosuAraligi': '1. - 6. Koşular',
    'ikramiye': 91921.68,
    'ikramiyeFormatli': '91.921,68 ₺',
    'durum': '🏆 RESMÎ TJK DAĞITILAN İKRAMİYE KAZANILDI',
    'onayli': True,
    'secenekler': [
        {
            'modelKey': 'SINGLE_BANKO',
            'modelAdi': '🛡️ Çift Bankolu Ekonomik Model',
            'rozet': '🏆 EN YÜKSEK ROI (170.2x)',
            'rozetRenk': 'gold',
            'maliyet': 540.00,
            'maliyetFormatli': '540,00 ₺',
            'netKar': 91381.68,
            'netKarFormatli': '+91.381,68 ₺',
            'roi': '170.2x ROI',
            'durum': '🏆 TUTTU (6/6 TAM İSABET)',
            'kombinasyon': '6 x 1 x 6 x 1 x 6 x 2 = 432 Kombinasyon',
            'tekBanko': '2. Ayak ★ TEK: 5 THUNDERSTRUCK (%77 AGF) & 4. Ayak ★ TEK: 2 HYPER ROCKER',
            'kilitAyak': '6. Ayak (6. Koşu): [1 GÖK BERK (Kazandı), 3 REFLECTED GLORY]',
            'aciklama': "Günün en yüksek AGF'li bankosu THUNDERSTRUCK ve HYPER ROCKER çift bankosuyla maliyeti 540,00 ₺'ye düşürerek 91.921,68 ₺ ikramiyeyi 170 katı kârla yakaladı!"
        },
        {
            'modelKey': 'CHAMPION_5YEAR',
            'modelAdi': '👑 5 Yılın Şampiyonu (+EV Avcısı Genişletilmiş)',
            'rozet': '👑 5 YILIN ŞAMPİYONU',
            'rozetRenk': 'emerald',
            'maliyet': 1080.00,
            'maliyetFormatli': '1.080,00 ₺',
            'netKar': 90841.68,
            'netKarFormatli': '+90.841,68 ₺',
            'roi': '85.1x ROI',
            'durum': '🏆 TUTTU (6/6 TAM İSABET)',
            'kombinasyon': '6 x 1 x 6 x 2 x 6 x 2 = 864 Kombinasyon',
            'tekBanko': '2. Ayak ★ TEK: 5 THUNDERSTRUCK (%77 AGF)',
            'kilitAyak': '6. Ayak: [1 GÖK BERK, 3 REFLECTED GLORY]',
            'aciklama': '1.080 ₺ kupon bedeliyle 91.921,68 ₺ ikramiyeyi 85 katı getiriyle firesiz yakaladı.'
        }
    ],
    'ayaklar': [
        {
            'ayakNo': 1, 'kosuNo': 1, 'mesafe': '1300m Kum', 'saat': '17:45',
            'kazananNo': 4, 'kazananIsim': 'ALİMENDER', 'ganyan': '5,85',
            'durum': '✅ KAZANAN AT KUPONDA (4 ALİMENDER)',
            'kuponAtlar': [
                {'no': 1, 'isim': 'AĞASAÇAN', 'puan': 76, 'jokey': 'E.ATLAMAZ', 'stil': 'Sprinter', 'agf': 1, 'isWinner': False},
                {'no': 3, 'isim': 'BAY ARAZ', 'puan': 78, 'jokey': 'M.KIYAK', 'stil': 'Orta Grup', 'agf': 15, 'isWinner': False},
                {'no': 4, 'isim': 'ALİMENDER', 'puan': 77, 'jokey': 'M.S.ÇELİK', 'stil': 'Orta Grup', 'agf': 2, 'isWinner': True, 'ganyan': '5,85'},
                {'no': 6, 'isim': 'BAŞ DAĞYUDAN', 'puan': 80, 'jokey': 'M.AKYAVUZ', 'stil': 'Presçi', 'agf': 25, 'isWinner': False},
                {'no': 7, 'isim': 'TEPELİ', 'puan': 79, 'jokey': 'R.KURT', 'stil': 'Presçi', 'agf': 20, 'isWinner': False},
                {'no': 9, 'isim': 'YÜCEOĞUL', 'puan': 82, 'jokey': 'MÜS.ÇELİK', 'stil': 'Presçi', 'agf': 34, 'isWinner': False}
            ]
        },
        {
            'ayakNo': 2, 'kosuNo': 2, 'mesafe': '1300m Kum', 'saat': '18:30',
            'kazananNo': 5, 'kazananIsim': 'THUNDERSTRUCK', 'ganyan': '1,40',
            'durum': '⭐ DOĞRULANMIŞ ASİL BANKO TUTTU (5 THUNDERSTRUCK)',
            'kuponAtlar': [
                {'no': 5, 'isim': 'THUNDERSTRUCK', 'puan': 88, 'jokey': 'M.S.ÇELİK', 'stil': 'Presçi', 'agf': 77, 'isWinner': True, 'isBanko': True, 'ganyan': '1,40'}
            ]
        },
        {
            'ayakNo': 3, 'kosuNo': 3, 'mesafe': '1500m Sentetik', 'saat': '19:00',
            'kazananNo': 8, 'kazananIsim': 'YARIŞ KRALİÇESİ', 'ganyan': '11,90',
            'durum': '🔥 SÜRPRİZ KORUMASI TUTTU (8 YARIŞ KRALİÇESİ)',
            'kuponAtlar': [
                {'no': 1, 'isim': 'PİSİFORMİS', 'puan': 79, 'jokey': 'M.T.COŞKUN', 'stil': 'Orta Grup', 'agf': 36, 'isWinner': False},
                {'no': 2, 'isim': 'BOZALAN', 'puan': 71, 'jokey': 'SAL.ÇELİK', 'stil': 'Kaçak', 'agf': 2, 'isWinner': False},
                {'no': 3, 'isim': 'DEV YÜREK', 'puan': 78, 'jokey': 'A.ÇELİK', 'stil': 'Presçi', 'agf': 43, 'isWinner': False},
                {'no': 4, 'isim': 'KING ULUDAĞ', 'puan': 70, 'jokey': 'MÜS.ÇELİK', 'stil': 'Orta Grup', 'agf': 13, 'isWinner': False},
                {'no': 8, 'isim': 'YARIŞ KRALİÇESİ', 'puan': 75, 'jokey': 'F.R.BEBEK', 'stil': 'Orta Grup', 'agf': 1, 'isWinner': True, 'ganyan': '11,90'},
                {'no': 9, 'isim': 'AHVES', 'puan': 77, 'jokey': 'M.G.ARSLAN', 'stil': '🌱 Taktik Serbest', 'agf': 1, 'isWinner': False}
            ]
        },
        {
            'ayakNo': 4, 'kosuNo': 4, 'mesafe': '1300m Kum', 'saat': '19:30',
            'kazananNo': 2, 'kazananIsim': 'HYPER ROCKER', 'ganyan': '1,90',
            'durum': '⭐ DOĞRULANMIŞ ASİL BANKO TUTTU (2 HYPER ROCKER)',
            'kuponAtlar': [
                {'no': 2, 'isim': 'HYPER ROCKER', 'puan': 82, 'jokey': 'M.S.ÇELİK', 'stil': '🌱 Taktik Serbest', 'agf': 5, 'isWinner': True, 'isBanko': True, 'ganyan': '1,90'}
            ]
        },
        {
            'ayakNo': 5, 'kosuNo': 5, 'mesafe': '1200m Kum', 'saat': '20:00',
            'kazananNo': 3, 'kazananIsim': 'DOLCE MARE', 'ganyan': '6,65',
            'durum': '✅ KAZANAN AT KUPONDA (3 DOLCE MARE)',
            'kuponAtlar': [
                {'no': 1, 'isim': 'LEVERO', 'puan': 75, 'jokey': 'M.T.COŞKUN', 'stil': 'Orta Grup', 'agf': 5, 'isWinner': False},
                {'no': 2, 'isim': 'ROSAS DEL ROSEDAL', 'puan': 76, 'jokey': 'M.S.ÇELİK', 'stil': 'Sprinter', 'agf': 6, 'isWinner': False},
                {'no': 3, 'isim': 'DOLCE MARE', 'puan': 77, 'jokey': 'E.ATLAMAZ', 'stil': 'Sprinter', 'agf': 6, 'isWinner': True, 'ganyan': '6,65'},
                {'no': 4, 'isim': 'GRINGA', 'puan': 76, 'jokey': 'A.ÇELİK', 'stil': 'Kaçak', 'agf': 20, 'isWinner': False},
                {'no': 5, 'isim': 'CEMO CAN', 'puan': 82, 'jokey': 'İ.AKYAVUZ', 'stil': 'Presçi', 'agf': 40, 'isWinner': False},
                {'no': 6, 'isim': 'FELICIA STAR', 'puan': 81, 'jokey': 'SAL.ÇELİK', 'stil': 'Presçi', 'agf': 10, 'isWinner': False}
            ]
        },
        {
            'ayakNo': 6, 'kosuNo': 6, 'mesafe': '1400m Kum', 'saat': '20:30',
            'kazananNo': 1, 'kazananIsim': 'GÖK BERK', 'ganyan': '12,45',
            'durum': '🔒 KİLİT AYAK SİGORTAMIZ GELDİ (1 GÖK BERK)',
            'kuponAtlar': [
                {'no': 1, 'isim': 'GÖK BERK', 'puan': 86, 'jokey': 'M.AKYAVUZ', 'stil': 'Kaçak', 'agf': 29, 'isWinner': True, 'isLock': True, 'ganyan': '12,45'},
                {'no': 3, 'isim': 'REFLECTED GLORY', 'puan': 83, 'jokey': 'A.ÇELİK', 'stil': 'Orta Grup', 'agf': 9, 'isWinner': False, 'isLock': True}
            ]
        }
    ]
}

with open('public/data/tutan_altililar.json', 'r', encoding='utf-8') as f:
    existing = json.load(f)

# Keep archive coupons (from Nov 14, 13, 10, 07)
archive_kupons = [k for k in existing.get('tutanKuponlar', []) if '2026-11-15' not in k.get('id', '')]
new_kupons = [adana_2_kupon, adana_1_kupon] + archive_kupons

existing['tutanKuponlar'] = new_kupons
existing['ozetIstatistikler']['toplamKuponMaliyeti'] = 14298.00
existing['ozetIstatistikler']['toplamNetKar'] = existing['ozetIstatistikler']['toplamKazanilanIkramiye'] - 14298.00
existing['ozetIstatistikler']['enYuksekTekliRoi'] = '170.2x'

with open('public/data/tutan_altililar.json', 'w', encoding='utf-8') as f:
    json.dump(existing, f, ensure_ascii=False, indent=2)

print('Updated public/data/tutan_altililar.json successfully!')
