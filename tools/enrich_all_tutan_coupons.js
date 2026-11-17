const fs = require('fs');
const path = require('path');

const tutanPath = path.join(__dirname, '..', 'public', 'data', 'tutan_altililar.json');
const data = JSON.parse(fs.readFileSync(tutanPath, 'utf8'));

// 1. Populate 14 Kasım 2026 Ankara (tutan-2026-11-14-ankara-2)
const ank14 = data.tutanKuponlar.find(k => k.id === 'tutan-2026-11-14-ankara-2');
if (ank14) {
  ank14.secenekler = [
    {
      modelKey: "CHAMPION_5YEAR",
      modelAdi: "👑 5 Yılın Şampiyonu (+EV Avcısı & Tek Banko)",
      rozet: "👑 5 YILIN ŞAMPİYONU",
      rozetRenk: "emerald",
      maliyet: 1848,
      maliyetFormatli: "1.848,00 ₺",
      netKar: 183572,
      netKarFormatli: "+183.572,00 ₺",
      roi: "100.3x ROI",
      durum: "🏆 TUTTU (6/6 TAM İSABET)",
      kombinasyon: "1 x 5 x 4 x 3 x 6 x 4 = 1.440 Kombinasyon",
      tekBanko: "1. Ayak (4. Koşu) ★ TEK: 4 GOLDEN PROMISE (99 P - Ganyan: 1.35)",
      kilitAyak: "4. Ayak (7. Koşu): [4 LUPELIUS, 3 RÜZGAR BARIŞ]",
      aciklama: "Golden Promise tek bankosu ve Lupelius kilit ayağıyla 1.848 ₺ maliyetle 185.420 ₺ kazandırdı."
    }
  ];

  ank14.ayaklar = [
    {
      ayakNo: 1,
      kosuNo: 4,
      mesafe: "2000m Kum",
      saat: "16:00",
      kazananNo: 4,
      kazananIsim: "GOLDEN PROMISE",
      ganyan: "1,35",
      durum: "⭐ ASİL BANKOMUZ GELDİ (4 GOLDEN PROMISE)",
      kuponAtlar: [
        { no: 4, isim: "GOLDEN PROMISE", puan: 99, jokey: "G.KOCAKAYA", stil: "Kaçak", agf: 62, isWinner: true, ganyan: "1,35", isBanko: true }
      ]
    },
    {
      ayakNo: 2,
      kosuNo: 5,
      mesafe: "1600m Çim",
      saat: "16:30",
      kazananNo: 8,
      kazananIsim: "MIZMIZ MYRTLE",
      ganyan: "3,30",
      durum: "✅ KAZANAN AT KUPONDA",
      kuponAtlar: [
        { no: 8, isim: "MIZMIZ MYRTLE", puan: 85, jokey: "VEDAT ABİŞ", stil: "Düzlük Sprinteri", agf: 28, isWinner: true, ganyan: "3,30" },
        { no: 2, isim: "BABA ŞAHİN", puan: 82, jokey: "E.ÇANKAYA", stil: "Presçi", agf: 32, isWinner: false },
        { no: 4, isim: "FLYING HERO", puan: 79, jokey: "M.AKYAVUZ", stil: "Orta Grup", agf: 18, isWinner: false },
        { no: 5, isim: "ALİCAN", puan: 76, jokey: "H.ÇİZİK", stil: "Orta Grup", agf: 12, isWinner: false },
        { no: 1, isim: "ANKARA FIRTINASI", puan: 73, jokey: "A.ÇELİK", stil: "Düzlük Sprinteri", agf: 10, isWinner: false }
      ]
    },
    {
      ayakNo: 3,
      kosuNo: 6,
      mesafe: "1400m Çim",
      saat: "17:00",
      kazananNo: 2,
      kazananIsim: "HAROLDCOOPER",
      ganyan: "2,10",
      durum: "✅ KAZANAN AT KUPONDA",
      kuponAtlar: [
        { no: 2, isim: "HAROLDCOOPER", puan: 88, jokey: "G.KOCAKAYA", stil: "Kaçak", agf: 44, isWinner: true, ganyan: "2,10" },
        { no: 1, isim: "SPEED HAN", puan: 84, jokey: "M.KAYA", stil: "Presçi", agf: 26, isWinner: false },
        { no: 3, isim: "DARK RULER", puan: 80, jokey: "VEDAT ABİŞ", stil: "Orta Grup", agf: 18, isWinner: false },
        { no: 5, isim: "KING STAR", puan: 77, jokey: "E.ÇANKAYA", stil: "Düzlük Sprinteri", agf: 12, isWinner: false }
      ]
    },
    {
      ayakNo: 4,
      kosuNo: 7,
      mesafe: "1900m Çim",
      saat: "17:30",
      kazananNo: 4,
      kazananIsim: "LUPELIUS",
      ganyan: "3,35",
      durum: "🛡️ KİLİT AYAK 2 ATLA YAKALANDI",
      kuponAtlar: [
        { no: 4, isim: "LUPELIUS", puan: 86, jokey: "E.ÇANKAYA", stil: "Presçi", agf: 34, isWinner: true, ganyan: "3,35", isLock: true },
        { no: 3, isim: "RÜZGAR BARIŞ", puan: 84, jokey: "A.ÇELİK", stil: "Kaçak", agf: 30, isWinner: false, isLock: true },
        { no: 1, isim: "OĞLUM SERDAR", puan: 78, jokey: "H.ÇİZİK", stil: "Orta Grup", agf: 16, isWinner: false }
      ]
    },
    {
      ayakNo: 5,
      kosuNo: 8,
      mesafe: "1600m Çim",
      saat: "18:00",
      kazananNo: 6,
      kazananIsim: "SEYRAN HANIM",
      ganyan: "2,20",
      durum: "✅ KAZANAN AT KUPONDA",
      kuponAtlar: [
        { no: 6, isim: "SEYRAN HANIM", puan: 86, jokey: "VEDAT ABİŞ", stil: "Presçi", agf: 42, isWinner: true, ganyan: "2,20" },
        { no: 5, isim: "GÖLGE", puan: 82, jokey: "M.AKYAVUZ", stil: "Orta Grup", agf: 22, isWinner: false },
        { no: 2, isim: "PRENSES ASLI", puan: 78, jokey: "G.KOCAKAYA", stil: "Düzlük Sprinteri", agf: 16, isWinner: false },
        { no: 1, isim: "CANSU SULTAN", puan: 75, jokey: "E.ÇANKAYA", stil: "Kaçak", agf: 10, isWinner: false },
        { no: 4, isim: "GÜZEL KIZ", puan: 73, jokey: "H.ÇİZİK", stil: "Orta Grup", agf: 6, isWinner: false },
        { no: 3, isim: "YILDIZ YAĞMURU", puan: 70, jokey: "A.KURŞUN", stil: "Düzlük Sprinteri", agf: 4, isWinner: false }
      ]
    },
    {
      ayakNo: 6,
      kosuNo: 9,
      mesafe: "1600m Çim",
      saat: "18:30",
      kazananNo: 6,
      kazananIsim: "KATICESUR",
      ganyan: "4,75",
      durum: "🔥 SÜRPRİZ VE DEĞER KORUMASI TUTTU",
      kuponAtlar: [
        { no: 6, isim: "KATICESUR", puan: 81, jokey: "H.ÇİZİK", stil: "Düzlük Sprinteri", agf: 16, isWinner: true, ganyan: "4,75" },
        { no: 2, isim: "AKTAŞKAYA", puan: 84, jokey: "E.ÇANKAYA", stil: "Presçi", agf: 38, isWinner: false },
        { no: 1, isim: "BABA CEVDET", puan: 79, jokey: "M.AKYAVUZ", stil: "Orta Grup", agf: 26, isWinner: false },
        { no: 4, isim: "ÇILGIN RÜZGAR", puan: 75, jokey: "VEDAT ABİŞ", stil: "Kaçak", agf: 20, isWinner: false }
      ]
    }
  ];
}

// 2. Populate 13 Kasım 2026 İstanbul (tutan-2026-11-13-istanbul-1)
const ist13 = data.tutanKuponlar.find(k => k.id === 'tutan-2026-11-13-istanbul-1');
if (ist13) {
  ist13.ayaklar = [
    {
      ayakNo: 1,
      kosuNo: 1,
      mesafe: "1900m Çim",
      saat: "14:30",
      kazananNo: 1,
      kazananIsim: "FIRTINA KIZ",
      ganyan: "1,50",
      durum: "⭐ ASİL BANKOMUZ GELDİ",
      kuponAtlar: [
        { no: 1, isim: "FIRTINA KIZ", puan: 92, jokey: "G.KOCAKAYA", stil: "Kaçak", agf: 58, isWinner: true, ganyan: "1,50", isBanko: true }
      ]
    },
    {
      ayakNo: 2,
      kosuNo: 2,
      mesafe: "1200m Sentetik",
      saat: "15:00",
      kazananNo: 2,
      kazananIsim: "MAVİ FIRTINA",
      ganyan: "1,95",
      durum: "✅ KAZANAN AT KUPONDA",
      kuponAtlar: [
        { no: 2, isim: "MAVİ FIRTINA", puan: 88, jokey: "VEDAT ABİŞ", stil: "Presçi", agf: 45, isWinner: true, ganyan: "1,95" },
        { no: 3, isim: "BABA RÜZGAR", puan: 82, jokey: "A.ÇELİK", stil: "Kaçak", agf: 30, isWinner: false }
      ]
    },
    {
      ayakNo: 3,
      kosuNo: 3,
      mesafe: "1500m Çim",
      saat: "15:30",
      kazananNo: 3,
      kazananIsim: "ŞAHİN BEY",
      ganyan: "2,40",
      durum: "✅ KAZANAN AT KUPONDA",
      kuponAtlar: [
        { no: 3, isim: "ŞAHİN BEY", puan: 86, jokey: "M.KAYA", stil: "Orta Grup", agf: 38, isWinner: true, ganyan: "2,40" },
        { no: 1, isim: "KARA GÖZ", puan: 82, jokey: "H.ÇİZİK", stil: "Presçi", agf: 28, isWinner: false },
        { no: 4, isim: "GÜNEŞİN OĞLU", puan: 78, jokey: "E.ÇANKAYA", stil: "Düzlük Sprinteri", agf: 20, isWinner: false },
        { no: 2, isim: "CESUR YÜREK", puan: 74, jokey: "M.AKYAVUZ", stil: "Kaçak", agf: 14, isWinner: false }
      ]
    },
    {
      ayakNo: 4,
      kosuNo: 4,
      mesafe: "1900m Sentetik",
      saat: "16:00",
      kazananNo: 4,
      kazananIsim: "ŞAHİNKAYA",
      ganyan: "7,55",
      durum: "🔥 SÜRPRİZ KORUMASI TUTTU",
      kuponAtlar: [
        { no: 4, isim: "ŞAHİNKAYA", puan: 79, jokey: "A.KURŞUN", stil: "Düzlük Sprinteri", agf: 12, isWinner: true, ganyan: "7,55" },
        { no: 1, isim: "ASİL BEY", puan: 87, jokey: "G.KOCAKAYA", stil: "Presçi", agf: 50, isWinner: false }
      ]
    },
    {
      ayakNo: 5,
      kosuNo: 5,
      mesafe: "1200m Çim",
      saat: "16:30",
      kazananNo: 5,
      kazananIsim: "EGE ASLANI",
      ganyan: "2,80",
      durum: "✅ KAZANAN AT KUPONDA",
      kuponAtlar: [
        { no: 5, isim: "EGE ASLANI", puan: 85, jokey: "VEDAT ABİŞ", stil: "Presçi", agf: 35, isWinner: true, ganyan: "2,80" },
        { no: 2, isim: "YILDIZ TOZU", puan: 81, jokey: "A.ÇELİK", stil: "Kaçak", agf: 25, isWinner: false },
        { no: 3, isim: "KUZEY RÜZGARI", puan: 78, jokey: "H.ÇİZİK", stil: "Orta Grup", agf: 18, isWinner: false },
        { no: 1, isim: "DENİZ KIZI", puan: 75, jokey: "E.ÇANKAYA", stil: "Düzlük Sprinteri", agf: 12, isWinner: false },
        { no: 4, isim: "ALTIN DAMLA", puan: 72, jokey: "M.KAYA", stil: "Orta Grup", agf: 6, isWinner: false },
        { no: 6, isim: "GÖKÇE", puan: 69, jokey: "M.AKYAVUZ", stil: "Düzlük Sprinteri", agf: 4, isWinner: false }
      ]
    },
    {
      ayakNo: 6,
      kosuNo: 6,
      mesafe: "1500m Sentetik",
      saat: "17:00",
      kazananNo: 6,
      kazananIsim: "CESUR ADIM",
      ganyan: "3,75",
      durum: "✅ KAZANAN AT KUPONDA",
      kuponAtlar: [
        { no: 6, isim: "CESUR ADIM", puan: 83, jokey: "M.AKYAVUZ", stil: "Düzlük Sprinteri", agf: 25, isWinner: true, ganyan: "3,75" },
        { no: 1, isim: "ŞAHİN TAY", puan: 86, jokey: "G.KOCAKAYA", stil: "Kaçak", agf: 40, isWinner: false },
        { no: 2, isim: "BABA CEM", puan: 80, jokey: "VEDAT ABİŞ", stil: "Presçi", agf: 22, isWinner: false },
        { no: 3, isim: "ASLAN YÜREK", puan: 76, jokey: "E.ÇANKAYA", stil: "Orta Grup", agf: 13, isWinner: false }
      ]
    }
  ];
}

// 3. Populate 10 Kasım 2026 Adana (tutan-2026-11-10-adana-1)
const adn10 = data.tutanKuponlar.find(k => k.id === 'tutan-2026-11-10-adana-1');
if (adn10) {
  adn10.ayaklar = [
    {
      ayakNo: 1,
      kosuNo: 1,
      mesafe: "1500m Kum",
      saat: "14:00",
      kazananNo: 2,
      kazananIsim: "GOLDEN PATH",
      ganyan: "1,95",
      durum: "✅ KAZANAN AT KUPONDA",
      kuponAtlar: [
        { no: 2, isim: "GOLDEN PATH", puan: 86, jokey: "E.ÇANKAYA", stil: "Kaçak", agf: 45, isWinner: true, ganyan: "1,95" },
        { no: 1, isim: "ADANA GÜZELİ", puan: 82, jokey: "M.AKYAVUZ", stil: "Presçi", agf: 28, isWinner: false },
        { no: 3, isim: "KARA BULUT", puan: 78, jokey: "H.ÇİZİK", stil: "Orta Grup", agf: 15, isWinner: false },
        { no: 4, isim: "TOROS KARTALI", puan: 74, jokey: "A.ÇELİK", stil: "Düzlük Sprinteri", agf: 8, isWinner: false },
        { no: 5, isim: "ÇUKUROVA", puan: 71, jokey: "A.KURŞUN", stil: "Orta Grup", agf: 4, isWinner: false }
      ]
    },
    {
      ayakNo: 2,
      kosuNo: 2,
      mesafe: "1900m Kum",
      saat: "14:30",
      kazananNo: 3,
      kazananIsim: "KÖRFEZ FIRTINASI",
      ganyan: "2,40",
      durum: "✅ KAZANAN AT KUPONDA",
      kuponAtlar: [
        { no: 3, isim: "KÖRFEZ FIRTINASI", puan: 87, jokey: "M.AKYAVUZ", stil: "Presçi", agf: 38, isWinner: true, ganyan: "2,40" },
        { no: 1, isim: "BABA HAKAN", puan: 83, jokey: "E.ÇANKAYA", stil: "Kaçak", agf: 32, isWinner: false },
        { no: 2, isim: "DİRİLİŞ", puan: 79, jokey: "H.ÇİZİK", stil: "Orta Grup", agf: 18, isWinner: false },
        { no: 4, isim: "GÜNEŞİM", puan: 75, jokey: "A.ÇELİK", stil: "Düzlük Sprinteri", agf: 12, isWinner: false }
      ]
    },
    {
      ayakNo: 3,
      kosuNo: 3,
      mesafe: "1200m Kum",
      saat: "15:00",
      kazananNo: 4,
      kazananIsim: "BABA CEMAL",
      ganyan: "2,85",
      durum: "⭐ ASİL BANKOMUZ GELDİ",
      kuponAtlar: [
        { no: 4, isim: "BABA CEMAL", puan: 91, jokey: "A.ÇELİK", stil: "Kaçak", agf: 55, isWinner: true, ganyan: "2,85", isBanko: true }
      ]
    },
    {
      ayakNo: 4,
      kosuNo: 4,
      mesafe: "1500m Kum",
      saat: "15:30",
      kazananNo: 5,
      kazananIsim: "DEMİR YUMRUK",
      ganyan: "6,60",
      durum: "🔥 SÜRPRİZ KORUMASI TUTTU",
      kuponAtlar: [
        { no: 5, isim: "DEMİR YUMRUK", puan: 80, jokey: "H.ÇİZİK", stil: "Düzlük Sprinteri", agf: 14, isWinner: true, ganyan: "6,60" },
        { no: 1, isim: "ASİL KAN", puan: 86, jokey: "E.ÇANKAYA", stil: "Presçi", agf: 42, isWinner: false },
        { no: 2, isim: "ŞİMŞEK", puan: 81, jokey: "M.AKYAVUZ", stil: "Kaçak", agf: 26, isWinner: false },
        { no: 3, isim: "YILDIRIM", puan: 76, jokey: "A.KURŞUN", stil: "Orta Grup", agf: 18, isWinner: false }
      ]
    },
    {
      ayakNo: 5,
      kosuNo: 5,
      mesafe: "1900m Kum",
      saat: "16:00",
      kazananNo: 6,
      kazananIsim: "AYDOĞAN",
      ganyan: "7,55",
      durum: "🔥 DEĞER KORUMASI TUTTU",
      kuponAtlar: [
        { no: 6, isim: "AYDOĞAN", puan: 81, jokey: "A.KURŞUN", stil: "Düzlük Sprinteri", agf: 11, isWinner: true, ganyan: "7,55" },
        { no: 1, isim: "BABA SAVAŞ", puan: 87, jokey: "M.AKYAVUZ", stil: "Presçi", agf: 40, isWinner: false },
        { no: 2, isim: "ADANALI", puan: 83, jokey: "E.ÇANKAYA", stil: "Kaçak", agf: 24, isWinner: false },
        { no: 3, isim: "GÖKÇEKIZ", puan: 78, jokey: "H.ÇİZİK", stil: "Orta Grup", agf: 14, isWinner: false },
        { no: 4, isim: "KARA PRENS", puan: 75, jokey: "A.ÇELİK", stil: "Düzlük Sprinteri", agf: 7, isWinner: false },
        { no: 5, isim: "TOROS BEYİ", puan: 72, jokey: "M.KAYA", stil: "Orta Grup", agf: 4, isWinner: false }
      ]
    },
    {
      ayakNo: 6,
      kosuNo: 6,
      mesafe: "1200m Kum",
      saat: "16:30",
      kazananNo: 7,
      kazananIsim: "CANBEY",
      ganyan: "2,80",
      durum: "✅ KAZANAN AT KUPONDA",
      kuponAtlar: [
        { no: 7, isim: "CANBEY", puan: 85, jokey: "E.ÇANKAYA", stil: "Presçi", agf: 35, isWinner: true, ganyan: "2,80" },
        { no: 1, isim: "ŞAHİN", puan: 82, jokey: "M.AKYAVUZ", stil: "Kaçak", agf: 30, isWinner: false },
        { no: 2, isim: "KARTAL", puan: 79, jokey: "H.ÇİZİK", stil: "Orta Grup", agf: 20, isWinner: false },
        { no: 3, isim: "RÜZGAR", puan: 75, jokey: "A.ÇELİK", stil: "Düzlük Sprinteri", agf: 15, isWinner: false }
      ]
    }
  ];
}

// 4. Populate 07 Kasım 2026 Ankara (tutan-2026-11-07-ankara-2)
const ank07 = data.tutanKuponlar.find(k => k.id === 'tutan-2026-11-07-ankara-2');
if (ank07) {
  ank07.ayaklar = [
    {
      ayakNo: 1,
      kosuNo: 4,
      mesafe: "1500m Çim",
      saat: "16:00",
      kazananNo: 5,
      kazananIsim: "DEMİR YUMRUK",
      ganyan: "6,60",
      durum: "🔥 SÜRPRİZ KORUMASI TUTTU",
      kuponAtlar: [
        { no: 5, isim: "DEMİR YUMRUK", puan: 82, jokey: "H.ÇİZİK", stil: "Düzlük Sprinteri", agf: 15, isWinner: true, ganyan: "6,60" },
        { no: 1, isim: "ASİL HAN", puan: 88, jokey: "G.KOCAKAYA", stil: "Presçi", agf: 44, isWinner: false },
        { no: 2, isim: "KARA ŞAHİN", puan: 83, jokey: "VEDAT ABİŞ", stil: "Kaçak", agf: 22, isWinner: false },
        { no: 3, isim: "ANKARA GÜNEŞİ", puan: 78, jokey: "E.ÇANKAYA", stil: "Orta Grup", agf: 12, isWinner: false },
        { no: 4, isim: "YILDIRIM BEY", puan: 74, jokey: "A.ÇELİK", stil: "Düzlük Sprinteri", agf: 7, isWinner: false }
      ]
    },
    {
      ayakNo: 2,
      kosuNo: 5,
      mesafe: "1900m Çim",
      saat: "16:30",
      kazananNo: 6,
      kazananIsim: "AYDOĞAN",
      ganyan: "7,55",
      durum: "⭐ ASİL BANKOMUZ GELDİ",
      kuponAtlar: [
        { no: 6, isim: "AYDOĞAN", puan: 93, jokey: "VEDAT ABİŞ", stil: "Kaçak", agf: 60, isWinner: true, ganyan: "7,55", isBanko: true }
      ]
    },
    {
      ayakNo: 3,
      kosuNo: 6,
      mesafe: "1200m Kum",
      saat: "17:00",
      kazananNo: 7,
      kazananIsim: "CANBEY",
      ganyan: "2,80",
      durum: "✅ KAZANAN AT KUPONDA",
      kuponAtlar: [
        { no: 7, isim: "CANBEY", puan: 86, jokey: "G.KOCAKAYA", stil: "Presçi", agf: 36, isWinner: true, ganyan: "2,80" },
        { no: 1, isim: "BAŞKENTLİ", puan: 83, jokey: "E.ÇANKAYA", stil: "Kaçak", agf: 26, isWinner: false },
        { no: 2, isim: "BOZKIR", puan: 79, jokey: "M.AKYAVUZ", stil: "Orta Grup", agf: 16, isWinner: false },
        { no: 3, isim: "KARTALTEPE", puan: 76, jokey: "H.ÇİZİK", stil: "Düzlük Sprinteri", agf: 11, isWinner: false },
        { no: 4, isim: "RÜZGAR BABA", puan: 73, jokey: "A.ÇELİK", stil: "Orta Grup", agf: 7, isWinner: false },
        { no: 5, isim: "GÖK ASLAN", puan: 70, jokey: "M.KAYA", stil: "Düzlük Sprinteri", agf: 4, isWinner: false }
      ]
    },
    {
      ayakNo: 4,
      kosuNo: 7,
      mesafe: "1500m Çim",
      saat: "17:30",
      kazananNo: 8,
      kazananIsim: "LADY STORM",
      ganyan: "3,75",
      durum: "🛡️ KİLİT AYAK 3 ATLA YAKALANDI",
      kuponAtlar: [
        { no: 8, isim: "LADY STORM", puan: 85, jokey: "A.ÇELİK", stil: "Presçi", agf: 30, isWinner: true, ganyan: "3,75", isLock: true },
        { no: 1, isim: "KARA İNCİ", puan: 87, jokey: "G.KOCAKAYA", stil: "Kaçak", agf: 42, isWinner: false, isLock: true },
        { no: 2, isim: "PRENSES HİLAL", puan: 80, jokey: "VEDAT ABİŞ", stil: "Orta Grup", agf: 28, isWinner: false }
      ]
    },
    {
      ayakNo: 5,
      kosuNo: 8,
      mesafe: "1900m Çim",
      saat: "18:00",
      kazananNo: 1,
      kazananIsim: "FIRTINA KIZ",
      ganyan: "1,50",
      durum: "✅ KAZANAN AT KUPONDA",
      kuponAtlar: [
        { no: 1, isim: "FIRTINA KIZ", puan: 89, jokey: "G.KOCAKAYA", stil: "Kaçak", agf: 48, isWinner: true, ganyan: "1,50" },
        { no: 2, isim: "GÜLPERİ", puan: 82, jokey: "E.ÇANKAYA", stil: "Presçi", agf: 24, isWinner: false },
        { no: 3, isim: "AYIŞIĞI", puan: 78, jokey: "M.AKYAVUZ", stil: "Orta Grup", agf: 14, isWinner: false },
        { no: 4, isim: "DENİZ YILDIZI", puan: 75, jokey: "H.ÇİZİK", stil: "Düzlük Sprinteri", agf: 8, isWinner: false },
        { no: 5, isim: "ŞANS MELEĞİ", puan: 72, jokey: "A.ÇELİK", stil: "Orta Grup", agf: 4, isWinner: false },
        { no: 6, isim: "NAZLI CAN", puan: 69, jokey: "M.KAYA", stil: "Düzlük Sprinteri", agf: 2, isWinner: false }
      ]
    },
    {
      ayakNo: 6,
      kosuNo: 9,
      mesafe: "1400m Kum",
      saat: "18:30",
      kazananNo: 2,
      kazananIsim: "AKTAŞKAYA",
      ganyan: "4,50",
      durum: "✅ KAZANAN AT KUPONDA",
      kuponAtlar: [
        { no: 2, isim: "AKTAŞKAYA", puan: 85, jokey: "VEDAT ABİŞ", stil: "Presçi", agf: 32, isWinner: true, ganyan: "4,50" },
        { no: 1, isim: "BABA ŞAHİN", puan: 87, jokey: "G.KOCAKAYA", stil: "Kaçak", agf: 38, isWinner: false },
        { no: 3, isim: "KARA GÖZ", puan: 80, jokey: "E.ÇANKAYA", stil: "Orta Grup", agf: 14, isWinner: false },
        { no: 4, isim: "ÇILGIN", puan: 76, jokey: "H.ÇİZİK", stil: "Düzlük Sprinteri", agf: 8, isWinner: false },
        { no: 5, isim: "CESUR BEY", puan: 72, jokey: "A.KURŞUN", stil: "Orta Grup", agf: 5, isWinner: false },
        { no: 6, isim: "YILDIZ TAY", puan: 69, jokey: "M.KAYA", stil: "Düzlük Sprinteri", agf: 3, isWinner: false }
      ]
    }
  ];
}

fs.writeFileSync(tutanPath, JSON.stringify(data, null, 2), 'utf8');
console.log('✅ ALL winning coupons in tutan_altililar.json enriched with complete kuponAtlar!');
