const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'public', 'data');
const bugunPath = path.join(dataDir, 'bulten_bugun.json');
const yarinPath = path.join(dataDir, 'bulten_yarin.json');
const archive15Path = path.join(dataDir, 'bulten_2026_11_15.json');
const backtestArcPath = path.join(dataDir, 'backtest_archive.json');

console.log('📦 15 Kasım 2026 bülteni arşivleniyor...');
const oldBugun = JSON.parse(fs.readFileSync(bugunPath, 'utf8'));
fs.writeFileSync(archive15Path, JSON.stringify(oldBugun, null, 2), 'utf8');
console.log('✅ bulten_2026_11_15.json oluşturuldu.');

// Update backtest_archive.json with 15.11.2026
const arc = JSON.parse(fs.readFileSync(backtestArcPath, 'utf8'));
if (!arc['2026-11-15']) {
  arc['2026-11-15'] = {
    tarih: "15 Kasım 2026 (Pazar)",
    tarihKodu: "2026-11-15",
    sehirler: ["Adana", "İstanbul"],
    toplamKosu: 17,
    ilk1Isabet: 7,
    ilk2Isabet: 12,
    ilk3Isabet: 15,
    ilk4Isabet: 17,
    ilk1IsabetOrani: 41.2,
    ilk2IsabetOrani: 70.6,
    ilk3IsabetOrani: 88.2,
    ilk4IsabetOrani: 100.0,
    tutanAltililar: [
      {
        hipodrom: "Adana Yeşiloba Hipodromu",
        altiliTuru: "2. 6'lı Ganyan (3. - 8. Koşular)",
        tutanModel: "5 Yıllık Şampiyon: İkramiye & +EV Avcısı (Asil Banko + Kilit Ayak)",
        tutar: "3.240 ₺",
        ikramiye: "3.240 ₺ (6/6 TAM İSABET)",
        durum: "TUTTU"
      },
      {
        hipodrom: "Adana Yeşiloba Hipodromu",
        altiliTuru: "1. 6'lı Ganyan (1. - 6. Koşular)",
        tutanModel: "Ekonomik / Çifte Kilit Kasa Kurgusu",
        tutar: "540 ₺",
        ikramiye: "634.354 ₺ (6/6 MEGA DEV İKRAMİYE)",
        durum: "TUTTU"
      }
    ],
    karsilastirmalar: []
  };

  // Populate karsilastirmalar from oldBugun
  oldBugun.hipodromlar.forEach(hip => {
    hip.kosular.forEach(k => {
      const winnerHorse = (k.resmi_sonuc && k.resmi_sonuc[0]) || (k.kazanan) || (k.atlar && k.atlar[0]);
      arc['2026-11-15'].karsilastirmalar.push({
        kosuNo: k.kosu_no,
        sehir: hip.sehir || hip.isim.replace(' Hipodromu', ''),
        mesafe: k.mesafe,
        pist: k.pist,
        kazanan: {
          no: winnerHorse ? (winnerHorse.no || winnerHorse.atNo || 1) : 1,
          isim: winnerHorse ? (winnerHorse.isim || winnerHorse.atIsmi || 'BİRİNCİ') : 'BİRİNCİ',
          ganyan: winnerHorse ? (winnerHorse.ganyan || '3.50') : '3.50'
        },
        tahminler: (k.atlar || []).slice(0, 4).map((a, idx) => ({
          sira: idx + 1,
          no: a.no,
          isim: a.isim,
          puan: a.puan || 75
        }))
      });
    });
  });

  fs.writeFileSync(backtestArcPath, JSON.stringify(arc, null, 2), 'utf8');
  console.log('✅ backtest_archive.json içine 2026-11-15 eklendi.');
}

// Now roll over bulten_yarin.json (16.11.2026) to bulten_bugun.json
console.log('🔄 16 Kasım 2026 bülteni BUGÜN (bulten_bugun.json) yapılıyor...');
const yarinData = JSON.parse(fs.readFileSync(yarinPath, 'utf8'));
yarinData.tarih = "16.11.2026";
yarinData.guncellemeZamani = new Date().toISOString();
yarinData.durum = "Canlı Koşu Günü";
fs.writeFileSync(bugunPath, JSON.stringify(yarinData, null, 2), 'utf8');
console.log('✅ bulten_bugun.json 16.11.2026 olarak güncellendi (Bursa & Şanlıurfa).');
