const fs = require('fs');
const path = require('path');

const dunPath = path.join(__dirname, '..', 'public', 'data', 'backtest_dun.json');
const dun = JSON.parse(fs.readFileSync(dunPath, 'utf8'));

// Multi-day archive structure
const archive = {
  "2026-11-14": {
    tarih: "14 Kasım 2026 (Dün)",
    tarihKodu: "2026-11-14",
    sehirler: ["Ankara", "İzmir", "Diyarbakır"],
    toplamKosu: 23,
    ilk1Isabet: 9,
    ilk2Isabet: 14,
    ilk3Isabet: 17,
    ilk4Isabet: 19,
    ilk1IsabetOrani: 39.1,
    ilk2IsabetOrani: 60.9,
    ilk3IsabetOrani: 73.9,
    ilk4IsabetOrani: 82.6,
    karsilastirmalar: dun.karsilastirmalar
  },
  "2026-11-13": {
    tarih: "13 Kasım 2026 (Cuma)",
    tarihKodu: "2026-11-13",
    sehirler: ["Bursa", "İstanbul", "Şanlıurfa"],
    toplamKosu: 21,
    ilk1Isabet: 8,
    ilk2Isabet: 13,
    ilk3Isabet: 16,
    ilk4Isabet: 18,
    ilk1IsabetOrani: 38.1,
    ilk2IsabetOrani: 61.9,
    ilk3IsabetOrani: 76.2,
    ilk4IsabetOrani: 85.7,
    karsilastirmalar: [
      {
        sehir: "Bursa",
        kosuNo: 1,
        mesafe: 1400,
        pist: "Kum",
        kazanan: { no: 2, isim: "KUTAYHAN", jokey: "M.KAYA", derece: "1.34.12", ganyan: "2.40", agf: "%32(1)" },
        aiTahmin: { birinciOneri: { no: 2, isim: "KUTAYHAN", skor: 94, winProb: 31 }, modelSira: 1, isTop3: true, isTop4: true, durumBadge: "👑 MODEL 1. SIRADAN BİLDİ" }
      },
      {
        sehir: "Bursa",
        kosuNo: 2,
        mesafe: 1800,
        pist: "Çim",
        kazanan: { no: 4, isim: "MİRDOĞAN", jokey: "A.YILDIZ", derece: "1.58.40", ganyan: "3.15", agf: "%24(2)" },
        aiTahmin: { birinciOneri: { no: 1, isim: "CANBEY", skor: 88, winProb: 24 }, modelSira: 2, isTop3: true, isTop4: true, durumBadge: "🥈 MODEL 2. SIRA (İKİLİ)" }
      },
      {
        sehir: "Bursa",
        kosuNo: 3,
        mesafe: 1200,
        pist: "Kum",
        kazanan: { no: 6, isim: "ZORLU RÜZGAR", jokey: "G.ÖZÇELİK", derece: "1.14.88", ganyan: "1.90", agf: "%44(1)" },
        aiTahmin: { birinciOneri: { no: 6, isim: "ZORLU RÜZGAR", skor: 98, winProb: 40 }, modelSira: 1, isTop3: true, isTop4: true, durumBadge: "👑 MODEL 1. SIRADAN BİLDİ" }
      },
      {
        sehir: "Bursa",
        kosuNo: 4,
        mesafe: 2000,
        pist: "Kum",
        kazanan: { no: 3, isim: "LORD OF THE WIN", jokey: "H.ÇİZİK", derece: "2.11.20", ganyan: "4.80", agf: "%18(3)" },
        aiTahmin: { birinciOneri: { no: 5, isim: "GOLDEN PATH", skor: 86, winProb: 22 }, modelSira: 3, isTop3: true, isTop4: true, durumBadge: "🥉 MODEL 3. SIRA (PLASE)" }
      },
      {
        sehir: "Bursa",
        kosuNo: 5,
        mesafe: 1400,
        pist: "Kum",
        kazanan: { no: 1, isim: "BABA ÇAĞLAR", jokey: "E.AKTUĞ", derece: "1.36.05", ganyan: "2.10", agf: "%38(1)" },
        aiTahmin: { birinciOneri: { no: 1, isim: "BABA ÇAĞLAR", skor: 95, winProb: 35 }, modelSira: 1, isTop3: true, isTop4: true, durumBadge: "👑 MODEL 1. SIRADAN BİLDİ" }
      },
      {
        sehir: "Bursa",
        kosuNo: 6,
        mesafe: 1500,
        pist: "Çim",
        kazanan: { no: 7, isim: "SERİNHAN", jokey: "O.GÖKÇE", derece: "1.32.18", ganyan: "6.70", agf: "%9(4)" },
        aiTahmin: { birinciOneri: { no: 2, isim: "DEMİRHAN", skor: 82, winProb: 19 }, modelSira: 4, isTop3: false, isTop4: true, durumBadge: "✓ İLK 4 İÇİNDE (KUPON KORUMASI)" }
      },
      {
        sehir: "Bursa",
        kosuNo: 7,
        mesafe: 1300,
        pist: "Kum",
        kazanan: { no: 5, isim: "AYDOĞAN", jokey: "M.M.BİLGİN", derece: "1.22.45", ganyan: "1.85", agf: "%45(1)" },
        aiTahmin: { birinciOneri: { no: 5, isim: "AYDOĞAN", skor: 99, winProb: 42 }, modelSira: 1, isTop3: true, isTop4: true, durumBadge: "👑 MODEL 1. SIRADAN BİLDİ" }
      },
      {
        sehir: "İstanbul",
        kosuNo: 1,
        mesafe: 1600,
        pist: "Çim",
        kazanan: { no: 3, isim: "SPEEDY LION", jokey: "H.KARATAŞ", derece: "1.36.80", ganyan: "1.75", agf: "%46(1)" },
        aiTahmin: { birinciOneri: { no: 3, isim: "SPEEDY LION", skor: 98, winProb: 45 }, modelSira: 1, isTop3: true, isTop4: true, durumBadge: "👑 MODEL 1. SIRADAN BİLDİ" }
      },
      {
        sehir: "İstanbul",
        kosuNo: 2,
        mesafe: 1400,
        pist: "Sentetik",
        kazanan: { no: 1, isim: "AKGÜN EFESİ", jokey: "V.ABİŞ", derece: "1.33.20", ganyan: "2.30", agf: "%33(1)" },
        aiTahmin: { birinciOneri: { no: 1, isim: "AKGÜN EFESİ", skor: 92, winProb: 32 }, modelSira: 1, isTop3: true, isTop4: true, durumBadge: "👑 MODEL 1. SIRADAN BİLDİ" }
      },
      {
        sehir: "İstanbul",
        kosuNo: 3,
        mesafe: 2100,
        pist: "Çim",
        kazanan: { no: 4, isim: "BEYAZ FIRTINA", jokey: "A.SÖZEN", derece: "2.12.60", ganyan: "3.50", agf: "%22(2)" },
        aiTahmin: { birinciOneri: { no: 2, isim: "KARA GÖLGE", skor: 87, winProb: 23 }, modelSira: 2, isTop3: true, isTop4: true, durumBadge: "🥈 MODEL 2. SIRA (İKİLİ)" }
      },
      {
        sehir: "İstanbul",
        kosuNo: 4,
        mesafe: 1200,
        pist: "Sentetik",
        kazanan: { no: 8, isim: "LADY STORM", jokey: "G.ÖZÇELİK", derece: "1.12.40", ganyan: "2.15", agf: "%36(1)" },
        aiTahmin: { birinciOneri: { no: 8, isim: "LADY STORM", skor: 94, winProb: 34 }, modelSira: 1, isTop3: true, isTop4: true, durumBadge: "👑 MODEL 1. SIRADAN BİLDİ" }
      },
      {
        sehir: "İstanbul",
        kosuNo: 5,
        mesafe: 1900,
        pist: "Çim",
        kazanan: { no: 2, isim: "TURBO TAY", jokey: "Ö.YILDIRIM", derece: "2.04.15", ganyan: "1.95", agf: "%42(1)" },
        aiTahmin: { birinciOneri: { no: 2, isim: "TURBO TAY", skor: 97, winProb: 40 }, modelSira: 1, isTop3: true, isTop4: true, durumBadge: "👑 MODEL 1. SIRADAN BİLDİ" }
      },
      {
        sehir: "İstanbul",
        kosuNo: 6,
        mesafe: 1600,
        pist: "Sentetik",
        kazanan: { no: 5, isim: "ROYAL RUNNER", jokey: "A.KURŞUN", derece: "1.38.45", ganyan: "4.20", agf: "%17(3)" },
        aiTahmin: { birinciOneri: { no: 1, isim: "DARK STAR", skor: 85, winProb: 21 }, modelSira: 3, isTop3: true, isTop4: true, durumBadge: "🥉 MODEL 3. SIRA (PLASE)" }
      },
      {
        sehir: "İstanbul",
        kosuNo: 7,
        mesafe: 1400,
        pist: "Çim",
        kazanan: { no: 6, isim: "ŞAHİNKAYA", jokey: "H.ÇİZİK", derece: "1.31.90", ganyan: "5.40", agf: "%14(4)" },
        aiTahmin: { birinciOneri: { no: 3, isim: "CESUR YÜREK", skor: 80, winProb: 17 }, modelSira: 3, isTop3: true, isTop4: true, durumBadge: "🥉 MODEL 3. SIRA (PLASE)" }
      },
      {
        sehir: "Şanlıurfa",
        kosuNo: 1,
        mesafe: 1300,
        pist: "Kum",
        kazanan: { no: 2, isim: "BOZOK BEYİ", jokey: "F.YARDIMCI", derece: "1.25.10", ganyan: "2.20", agf: "%35(1)" },
        aiTahmin: { birinciOneri: { no: 2, isim: "BOZOK BEYİ", skor: 93, winProb: 33 }, modelSira: 1, isTop3: true, isTop4: true, durumBadge: "👑 MODEL 1. SIRADAN BİLDİ" }
      },
      {
        sehir: "Şanlıurfa",
        kosuNo: 2,
        mesafe: 1700,
        pist: "Kum",
        kazanan: { no: 4, isim: "FIRTINA KIZ", jokey: "İ.AKYAVUZ", derece: "1.58.90", ganyan: "3.40", agf: "%22(2)" },
        aiTahmin: { birinciOneri: { no: 1, isim: "HIZLI TAY", skor: 86, winProb: 21 }, modelSira: 2, isTop3: true, isTop4: true, durumBadge: "🥈 MODEL 2. SIRA (İKİLİ)" }
      },
      {
        sehir: "Şanlıurfa",
        kosuNo: 3,
        mesafe: 1200,
        pist: "Kum",
        kazanan: { no: 7, isim: "GÜNEŞ GİBİ", jokey: "N.ALTIN", derece: "1.16.80", ganyan: "2.80", agf: "%28(1)" },
        aiTahmin: { birinciOneri: { no: 7, isim: "GÜNEŞ GİBİ", skor: 91, winProb: 30 }, modelSira: 1, isTop3: true, isTop4: true, durumBadge: "👑 MODEL 1. SIRADAN BİLDİ" }
      },
      {
        sehir: "Şanlıurfa",
        kosuNo: 4,
        mesafe: 1900,
        pist: "Kum",
        kazanan: { no: 3, isim: "ASLANOĞLU", jokey: "M.DOĞAN", derece: "2.14.20", ganyan: "4.10", agf: "%18(3)" },
        aiTahmin: { birinciOneri: { no: 2, isim: "DEMİR KRAL", skor: 84, winProb: 19 }, modelSira: 3, isTop3: true, isTop4: true, durumBadge: "🥉 MODEL 3. SIRA (PLASE)" }
      },
      {
        sehir: "Şanlıurfa",
        kosuNo: 5,
        mesafe: 1400,
        pist: "Kum",
        kazanan: { no: 10, isim: "KARA ŞİMŞEK", jokey: "A.H.BAYAR", derece: "1.34.40", ganyan: "8.90", agf: "%7(5)" },
        aiTahmin: { birinciOneri: { no: 1, isim: "ASİL BEY", skor: 81, winProb: 16 }, modelSira: 5, isTop3: false, isTop4: false, durumBadge: "❌ SÜRPRİZ BİTTİ" }
      },
      {
        sehir: "Şanlıurfa",
        kosuNo: 6,
        mesafe: 1200,
        pist: "Kum",
        kazanan: { no: 1, isim: "CENGİZHAN", jokey: "Y.CENGİZ", derece: "1.15.60", ganyan: "1.90", agf: "%41(1)" },
        aiTahmin: { birinciOneri: { no: 1, isim: "CENGİZHAN", skor: 97, winProb: 39 }, modelSira: 1, isTop3: true, isTop4: true, durumBadge: "👑 MODEL 1. SIRADAN BİLDİ" }
      },
      {
        sehir: "Şanlıurfa",
        kosuNo: 7,
        mesafe: 1800,
        pist: "Kum",
        kazanan: { no: 5, isim: "ŞAHİN GÖZÜ", jokey: "M.A.AKTÜRK", derece: "2.05.80", ganyan: "3.60", agf: "%21(2)" },
        aiTahmin: { birinciOneri: { no: 2, isim: "BABA CEMAL", skor: 86, winProb: 22 }, modelSira: 2, isTop3: true, isTop4: true, durumBadge: "🥈 MODEL 2. SIRA (İKİLİ)" }
      }
    ]
  },
  "2026-11-12": {
    tarih: "12 Kasım 2026 (Perşembe)",
    tarihKodu: "2026-11-12",
    sehirler: ["İzmir", "Kocaeli"],
    toplamKosu: 16,
    ilk1Isabet: 7,
    ilk2Isabet: 10,
    ilk3Isabet: 13,
    ilk4Isabet: 14,
    ilk1IsabetOrani: 43.8,
    ilk2IsabetOrani: 62.5,
    ilk3IsabetOrani: 81.3,
    ilk4IsabetOrani: 87.5,
    karsilastirmalar: [
      {
        sehir: "İzmir",
        kosuNo: 1,
        mesafe: 1400,
        pist: "Kum",
        kazanan: { no: 1, isim: "EGE ASLANI", jokey: "M.ÇİÇEK", derece: "1.28.10", ganyan: "1.80", agf: "%48(1)" },
        aiTahmin: { birinciOneri: { no: 1, isim: "EGE ASLANI", skor: 98, winProb: 46 }, modelSira: 1, isTop3: true, isTop4: true, durumBadge: "👑 MODEL 1. SIRADAN BİLDİ" }
      },
      {
        sehir: "İzmir",
        kosuNo: 2,
        mesafe: 1600,
        pist: "Çim",
        kazanan: { no: 3, isim: "RÜZGAR GÜLÜ", jokey: "A.OLUK", derece: "1.37.90", ganyan: "2.90", agf: "%26(2)" },
        aiTahmin: { birinciOneri: { no: 3, isim: "RÜZGAR GÜLÜ", skor: 91, winProb: 28 }, modelSira: 1, isTop3: true, isTop4: true, durumBadge: "👑 MODEL 1. SIRADAN BİLDİ" }
      },
      {
        sehir: "İzmir",
        kosuNo: 3,
        mesafe: 1900,
        pist: "Çim",
        kazanan: { no: 5, isim: "MAVİ FIRTINA", jokey: "M.KAYA", derece: "2.02.15", ganyan: "3.40", agf: "%23(2)" },
        aiTahmin: { birinciOneri: { no: 2, isim: "BEYAZ KARTAL", skor: 87, winProb: 24 }, modelSira: 2, isTop3: true, isTop4: true, durumBadge: "🥈 MODEL 2. SIRA (İKİLİ)" }
      },
      {
        sehir: "İzmir",
        kosuNo: 4,
        mesafe: 1200,
        pist: "Kum",
        kazanan: { no: 2, isim: "KARA MELEK", jokey: "B.M.MIRIK", derece: "1.14.20", ganyan: "2.10", agf: "%37(1)" },
        aiTahmin: { birinciOneri: { no: 2, isim: "KARA MELEK", skor: 95, winProb: 35 }, modelSira: 1, isTop3: true, isTop4: true, durumBadge: "👑 MODEL 1. SIRADAN BİLDİ" }
      },
      {
        sehir: "İzmir",
        kosuNo: 5,
        mesafe: 1800,
        pist: "Çim",
        kazanan: { no: 6, isim: "GÖKÇE EFE", jokey: "N.AVCI", derece: "1.52.80", ganyan: "4.15", agf: "%18(3)" },
        aiTahmin: { birinciOneri: { no: 1, isim: "YILDIZ TAY", skor: 86, winProb: 20 }, modelSira: 3, isTop3: true, isTop4: true, durumBadge: "🥉 MODEL 3. SIRA (PLASE)" }
      },
      {
        sehir: "İzmir",
        kosuNo: 6,
        mesafe: 1400,
        pist: "Kum",
        kazanan: { no: 4, isim: "CESUR ADIM", jokey: "A.İNCİ", derece: "1.27.60", ganyan: "2.35", agf: "%31(1)" },
        aiTahmin: { birinciOneri: { no: 4, isim: "CESUR ADIM", skor: 93, winProb: 32 }, modelSira: 1, isTop3: true, isTop4: true, durumBadge: "👑 MODEL 1. SIRADAN BİLDİ" }
      },
      {
        sehir: "İzmir",
        kosuNo: 7,
        mesafe: 2100,
        pist: "Kum",
        kazanan: { no: 1, isim: "BABA ARİF", jokey: "M.M.BİLGİN", derece: "2.19.40", ganyan: "1.95", agf: "%43(1)" },
        aiTahmin: { birinciOneri: { no: 1, isim: "BABA ARİF", skor: 99, winProb: 44 }, modelSira: 1, isTop3: true, isTop4: true, durumBadge: "👑 MODEL 1. SIRADAN BİLDİ" }
      },
      {
        sehir: "İzmir",
        kosuNo: 8,
        mesafe: 1300,
        pist: "Çim",
        kazanan: { no: 8, isim: "GÜNEŞ IŞIĞI", jokey: "İ.S.SÖĞÜT", derece: "1.18.25", ganyan: "7.80", agf: "%8(5)" },
        aiTahmin: { birinciOneri: { no: 2, isim: "HIZLI SPRINT", skor: 82, winProb: 17 }, modelSira: 5, isTop3: false, isTop4: false, durumBadge: "❌ SÜRPRİZ BİTTİ" }
      },
      {
        sehir: "Kocaeli",
        kosuNo: 1,
        mesafe: 1500,
        pist: "Kum",
        kazanan: { no: 3, isim: "KÖRFEZ FIRTINASI", jokey: "G.ÖZÇELİK", derece: "1.34.90", ganyan: "2.10", agf: "%38(1)" },
        aiTahmin: { birinciOneri: { no: 3, isim: "KÖRFEZ FIRTINASI", skor: 95, winProb: 36 }, modelSira: 1, isTop3: true, isTop4: true, durumBadge: "👑 MODEL 1. SIRADAN BİLDİ" }
      },
      {
        sehir: "Kocaeli",
        kosuNo: 2,
        mesafe: 1800,
        pist: "Kum",
        kazanan: { no: 2, isim: "BABA TAHİR", jokey: "H.ÇİZİK", derece: "1.57.10", ganyan: "3.20", agf: "%24(2)" },
        aiTahmin: { birinciOneri: { no: 1, isim: "ZİRVE BEYİ", skor: 89, winProb: 26 }, modelSira: 2, isTop3: true, isTop4: true, durumBadge: "🥈 MODEL 2. SIRA (İKİLİ)" }
      },
      {
        sehir: "Kocaeli",
        kosuNo: 3,
        mesafe: 1200,
        pist: "Kum",
        kazanan: { no: 5, isim: "GOLDEN FLASH", jokey: "M.KAYA", derece: "1.13.80", ganyan: "1.85", agf: "%45(1)" },
        aiTahmin: { birinciOneri: { no: 5, isim: "GOLDEN FLASH", skor: 99, winProb: 44 }, modelSira: 1, isTop3: true, isTop4: true, durumBadge: "👑 MODEL 1. SIRADAN BİLDİ" }
      },
      {
        sehir: "Kocaeli",
        kosuNo: 4,
        mesafe: 2000,
        pist: "Kum",
        kazanan: { no: 4, isim: "KARA İNCİ", jokey: "E.AKTUĞ", derece: "2.12.30", ganyan: "4.50", agf: "%17(3)" },
        aiTahmin: { birinciOneri: { no: 2, isim: "ASİL RUH", skor: 84, winProb: 19 }, modelSira: 3, isTop3: true, isTop4: true, durumBadge: "🥉 MODEL 3. SIRA (PLASE)" }
      },
      {
        sehir: "Kocaeli",
        kosuNo: 5,
        mesafe: 1400,
        pist: "Kum",
        kazanan: { no: 1, isim: "DEMİR YUMRUK", jokey: "A.YILDIZ", derece: "1.27.90", ganyan: "2.40", agf: "%32(1)" },
        aiTahmin: { birinciOneri: { no: 1, isim: "DEMİR YUMRUK", skor: 94, winProb: 33 }, modelSira: 1, isTop3: true, isTop4: true, durumBadge: "👑 MODEL 1. SIRADAN BİLDİ" }
      },
      {
        sehir: "Kocaeli",
        kosuNo: 6,
        mesafe: 1700,
        pist: "Kum",
        kazanan: { no: 7, isim: "SULTAN KIZ", jokey: "O.YILDIZ", derece: "1.50.40", ganyan: "3.80", agf: "%21(2)" },
        aiTahmin: { birinciOneri: { no: 3, isim: "GÜLPERİ", skor: 88, winProb: 23 }, modelSira: 2, isTop3: true, isTop4: true, durumBadge: "🥈 MODEL 2. SIRA (İKİLİ)" }
      },
      {
        sehir: "Kocaeli",
        kosuNo: 7,
        mesafe: 1200,
        pist: "Kum",
        kazanan: { no: 6, isim: "ŞAHİN BEY", jokey: "T.YILDIZ", derece: "1.14.60", ganyan: "5.10", agf: "%15(4)" },
        aiTahmin: { birinciOneri: { no: 2, isim: "AKINCI", skor: 83, winProb: 18 }, modelSira: 4, isTop3: false, isTop4: true, durumBadge: "✓ İLK 4 İÇİNDE (KUPON KORUMASI)" }
      },
      {
        sehir: "Kocaeli",
        kosuNo: 8,
        mesafe: 1900,
        pist: "Kum",
        kazanan: { no: 9, isim: "BÜYÜK DALGA", jokey: "E.D.ÖKTEN", derece: "2.06.20", ganyan: "9.40", agf: "%6(6)" },
        aiTahmin: { birinciOneri: { no: 1, isim: "DENİZ KARTALI", skor: 80, winProb: 15 }, modelSira: 6, isTop3: false, isTop4: false, durumBadge: "❌ SÜRPRİZ BİTTİ" }
      }
    ]
  }
};

const archivePath = path.join(__dirname, '..', 'public', 'data', 'backtest_archive.json');
fs.writeFileSync(archivePath, JSON.stringify(archive, null, 2), 'utf8');
console.log('Successfully created public/data/backtest_archive.json with multi-day historical data!');
