const fs = require('fs');

function detectAltiliConfig(hipodrom) {
  const kosular = hipodrom.kosular || [];
  const total = kosular.length;
  if (total < 6) {
    return { error: 'Yetersiz koşu sayısı (< 6)' };
  }

  // 1. TJK altiliAyagi işaretlerine bakarak 1. 6'lının başlangıç koşusunu bul
  let startIdx1 = kosular.findIndex(k => {
    const a = k.altiliAyagi;
    if (a === 1 || a === '1' || a === '1. Ayak') return true;
    if (typeof a === 'string' && a.trim().startsWith('1')) return true;
    return false;
  });

  // Eğer açıkça 1. ayak bulunamadıysa:
  // Eğer ilk koşunun altiliAyagi null/boş ise ve 2. koşuda bir şey varsa:
  if (startIdx1 === -1) {
    if (kosular[0].altiliAyagi == null && total >= 7) {
      startIdx1 = 1; // 2. koşudan başlar
    } else {
      startIdx1 = 0; // 1. koşudan başlar
    }
  }

  // 1. 6'lı koşuları
  const pkg1Kosular = kosular.slice(startIdx1, startIdx1 + 6);
  const pkg1StartRace = (kosular[startIdx1].kosuNo || (startIdx1 + 1));
  const pkg1EndRace = (kosular[startIdx1 + 5].kosuNo || (startIdx1 + 6));

  // 2. 6'lı Ganyan var mı?
  // TJK kuralı: 2. 6'lı Ganyan YALNIZCA en az 8 koşulu programlarda olur.
  // 7 koşulu programlarda (örn. Bursa 7 koşu, Adana 7 koşu) TJK'da TEK 6'lı vardır!
  let hasPkg2 = false;
  let pkg2Kosular = [];
  let pkg2StartRace = 0;
  let pkg2EndRace = 0;

  if (total >= 8) {
    hasPkg2 = true;
    const startIdx2 = total - 6; // 8 koşuda 3. koşu (index 2), 9 koşuda 4. koşu (index 3)
    pkg2Kosular = kosular.slice(startIdx2, startIdx2 + 6);
    pkg2StartRace = (kosular[startIdx2].kosuNo || (startIdx2 + 1));
    pkg2EndRace = (kosular[total - 1].kosuNo || total);
  }

  return {
    sehir: hipodrom.sehir || hipodrom.isim,
    totalRaces: total,
    pkgCount: hasPkg2 ? 2 : 1,
    pkg1: {
      startIndex: startIdx1,
      startRace: pkg1StartRace,
      endRace: pkg1EndRace,
      races: pkg1Kosular.map(k => k.kosuNo || k.id),
      label: hasPkg2 ? `1. 6'LI GANYAN (${pkg1StartRace}. - ${pkg1EndRace}. KOŞULAR)` : `6'LI GANYAN (${pkg1StartRace}. - ${pkg1EndRace}. KOŞULAR)`
    },
    pkg2: hasPkg2 ? {
      startIndex: total - 6,
      startRace: pkg2StartRace,
      endRace: pkg2EndRace,
      races: pkg2Kosular.map(k => k.kosuNo || k.id),
      label: `2. 6'LI GANYAN (${pkg2StartRace}. - ${pkg2EndRace}. KOŞULAR)`
    } : null
  };
}

['bulten_bugun.json', 'bulten_yarin.json', 'bulten_2026_11_15.json'].forEach(file => {
  console.log(`\n================= ${file} =================`);
  const b = JSON.parse(fs.readFileSync(`public/data/${file}`, 'utf8'));
  b.hipodromlar.forEach(h => {
    console.log(JSON.stringify(detectAltiliConfig(h), null, 2));
  });
});
