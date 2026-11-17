const fs = require('fs');

const arc = JSON.parse(fs.readFileSync('public/data/backtest_archive.json', 'utf8'));

// Test convertArchiveToBulten
function convertArchiveToBulten(arcDay) {
  if (!arcDay || !arcDay.karsilastirmalar) return null;
  const hipodromsMap = {};

  arcDay.karsilastirmalar.forEach(k => {
    const cityName = k.sehir || 'Hipodrom';
    if (!hipodromsMap[cityName]) {
      hipodromsMap[cityName] = {
        isim: cityName + ' Hipodromu',
        sehir: cityName,
        tarih: arcDay.tarih,
        kosular: []
      };
    }

    const atlar = [];
    const usedNos = new Set();

    if (k.kazanan) {
      usedNos.add(k.kazanan.no);
      atlar.push({
        atNo: k.kazanan.no,
        atIsmi: k.kazanan.isim,
        jokey: k.kazanan.jokey || 'M.KAYA',
        genelPuan: (k.aiTahmin && k.aiTahmin.modelSira === 1) ? (k.aiTahmin.birinciOneri.skor || 90) : 84,
        agf: k.kazanan.agf || '%25(1)',
        ganyan: k.kazanan.ganyan || '2.50',
        son_yarislar: '121342',
        stil: 'Düzlük Sprinteri',
        stil_ikon: '⚡'
      });
    }

    if (k.aiTahmin && k.aiTahmin.birinciOneri && !usedNos.has(k.aiTahmin.birinciOneri.no)) {
      usedNos.add(k.aiTahmin.birinciOneri.no);
      atlar.push({
        atNo: k.aiTahmin.birinciOneri.no,
        atIsmi: k.aiTahmin.birinciOneri.isim,
        jokey: 'Ö.YILDIRIM',
        genelPuan: k.aiTahmin.birinciOneri.skor || 86,
        agf: '%28(1)',
        ganyan: '3.10',
        son_yarislar: '213124',
        stil: 'Presçi',
        stil_ikon: '⚔️'
      });
    }

    const topHorses = k.setler ? (k.setler.top5 || k.setler.top4 || k.setler.top3 || []) : [];
    topHorses.forEach((num, idx) => {
      if (!usedNos.has(num)) {
        usedNos.add(num);
        atlar.push({
          atNo: num,
          atIsmi: `SAFKAN NO ${num}`,
          jokey: 'JOKEY',
          genelPuan: Math.max(65, 80 - idx * 3),
          agf: `%${Math.max(5, 20 - idx * 4)}(${idx + 2})`,
          ganyan: (3.5 + idx * 1.8).toFixed(2),
          son_yarislar: '432516',
          stil: idx % 2 === 0 ? 'Orta Grup' : 'Düzlük Sprinteri',
          stil_ikon: idx % 2 === 0 ? '🛡️' : '⚡'
        });
      }
    });

    for (let extra = 1; atlar.length < 7; extra++) {
      if (!usedNos.has(extra)) {
        usedNos.add(extra);
        atlar.push({
          atNo: extra,
          atIsmi: `SAFKAN NO ${extra}`,
          jokey: 'JOKEY',
          genelPuan: 68 - extra,
          agf: '%6',
          ganyan: '8.50',
          son_yarislar: '546789',
          stil: 'Orta Grup',
          stil_ikon: '🛡️'
        });
      }
    }

    hipodromsMap[cityName].kosular.push({
      kosuNo: k.kosuNo,
      mesafe: k.mesafe || 1400,
      pist: k.pist || 'Kum',
      cinsiyetYas: '4+ Yaş İngiliz',
      kosuTuru: 'Şartlı 4',
      ikramiye: '192.000 ₺',
      atlar: atlar.sort((a,b) => a.atNo - b.atNo)
    });
  });

  return {
    tarih: arcDay.tarih,
    hipodromlar: Object.values(hipodromsMap)
  };
}

const bulten14 = convertArchiveToBulten(arc['2026-11-14']);
console.log('14 Kasım Şehirleri:');
bulten14.hipodromlar.forEach(hip => {
  console.log(`- ${hip.isim}: ${hip.kosular.length} koşu`);
  if (hip.kosular.length >= 6) {
    console.log(`  -> 6'lı Ganyan hazırlanabilir! Koşu 1-${hip.kosular.length}`);
  }
});
