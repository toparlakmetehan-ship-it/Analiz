const fs = require('fs');
const arc = JSON.parse(fs.readFileSync('public/data/backtest_archive.json', 'utf8'));

function convertArchiveToBulten(arcDay) {
  if (!arcDay || !arcDay.karsilastirmalar) return null;
  const hipodromsMap = {};
  
  arcDay.karsilastirmalar.forEach(k => {
    const cityName = k.sehir;
    if (!hipodromsMap[cityName]) {
      hipodromsMap[cityName] = {
        isim: cityName + ' Hipodromu',
        sehir: cityName,
        tarih: arcDay.tarih,
        kosular: []
      };
    }
    
    // Horse list reconstruction from setler & kazanan
    const atlar = [];
    const usedNos = new Set();
    
    // Kazanan horse
    if (k.kazanan) {
      usedNos.add(k.kazanan.no);
      atlar.push({
        atNo: k.kazanan.no,
        atIsmi: k.kazanan.isim,
        jokey: k.kazanan.jokey || 'M.KAYA',
        genelPuan: (k.aiTahmin && k.aiTahmin.modelSira === 1) ? (k.aiTahmin.birinciOneri.skor || 88) : 82,
        agf: k.kazanan.agf || '%25(1)',
        ganyan: k.kazanan.ganyan || '2.50',
        son_yarislar: '121342',
        stil: 'Düzlük Sprinteri',
        stil_ikon: '⚡'
      });
    }
    
    // Top predictions
    if (k.aiTahmin && k.aiTahmin.birinciOneri && !usedNos.has(k.aiTahmin.birinciOneri.no)) {
      usedNos.add(k.aiTahmin.birinciOneri.no);
      atlar.push({
        atNo: k.aiTahmin.birinciOneri.no,
        atIsmi: k.aiTahmin.birinciOneri.isim,
        jokey: 'Ö.YILDIRIM',
        genelPuan: k.aiTahmin.birinciOneri.skor || 85,
        agf: '%28(1)',
        ganyan: '3.10',
        son_yarislar: '213124',
        stil: 'Presçi',
        stil_ikon: '⚔️'
      });
    }
    
    // Add other horses from top sets
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

    // Ensure at least 6 horses
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

const b = convertArchiveToBulten(arc['2026-11-14']);
console.log('Converted Bulten Tarih:', b.tarih);
console.log('Hipodromlar:', b.hipodromlar.map(h => `${h.isim} (${h.kosular.length} koşu)`));
console.log('Ankara Koşu 1 at sayısı:', b.hipodromlar[0].kosular[0].atlar.length);
console.log('Sample atlar:', b.hipodromlar[0].kosular[0].atlar.map(a => `${a.atNo} ${a.atIsmi} (${a.genelPuan} P)`));
