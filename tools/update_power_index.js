const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Replace calculatePowerIndex and call sites
const oldStart = html.indexOf('function calculatePowerIndex(horse) {');
const oldEnd = html.indexOf('function renderRaceDetails() {');

if (oldStart === -1 || oldEnd === -1) {
  console.error('Could not find target function in index.html');
  process.exit(1);
}

const newFunction = `function calculatePowerIndex(horse, raceHorses = []) {
  // 1. Handikap Dinamik Skalası (Genişletilmiş Sınıf Farkı)
  const allHps = raceHorses.length > 0 ? raceHorses.map(h => h.handikap_puani || 40) : [40, 60];
  const maxHp = Math.max(...allHps);
  const minHp = Math.min(...allHps);
  const hp = horse.handikap_puani || 40;
  
  let hpScore = 60;
  if (maxHp > minHp) {
    hpScore = Math.round(38 + ((hp - minHp) / (maxHp - minHp)) * 56);
  } else {
    hpScore = Math.min(95, Math.max(40, hp));
  }

  // 2. Jokey Sinerjisi & Elit Sınıf
  const eliteJockeys = ['H.KARATAŞ', 'Ö.YILDIRIM', 'A.SÖZEN', 'V.ABİŞ', 'A.KURŞUN', 'G.ÖZÇELİK', 'H.ÇİZİK', 'A.YILDIZ', 'M.KAYA', 'S.KAYA', 'S.BOYRAZ', 'E.AKTUĞ', 'M.AKYAVUZ'];
  const jWinRate = horse.jokey_kazanma_orani || 10;
  let jokeyScore = 52;
  if (eliteJockeys.some(j => (horse.jokey || '').toUpperCase().includes(j))) {
    jokeyScore = Math.round(85 + Math.min(13, jWinRate * 0.6));
  } else if (horse.apranti_indirimi) {
    jokeyScore = Math.round(55 + Math.min(18, jWinRate));
  } else {
    jokeyScore = Math.round(48 + Math.min(30, jWinRate * 1.2));
  }

  // 3. Son Yarış Formu (Tabela Performansı)
  let formScore = 52;
  const past = horse.son_yarislar || '';
  if (past) {
    let pts = 0;
    let counted = 0;
    for (let i = 0; i < Math.min(past.length, 4); i++) {
      const ch = past[i];
      if (ch === '1') pts += 98;
      else if (ch === '2') pts += 84;
      else if (ch === '3') pts += 72;
      else if (ch === '4') pts += 60;
      else if (ch === '5') pts += 46;
      else pts += 20;
      counted++;
    }
    formScore = Math.round(counted > 0 ? pts / counted : 52);
  }

  // 4. Galop / Sprint Sürati (km/s)
  let galopScore = 60;
  if (horse.son_galop && horse.son_galop.son400hiz) {
    const speed = horse.son_galop.son400hiz;
    galopScore = Math.min(98, Math.max(35, Math.round(32 + (speed - 46) * 7.5)));
  }

  // 5. Soy / Pedigri Potansiyeli
  let pedScore = 62;
  const famousSires = ['NATIVE KHAN', 'TOROK', 'LUXOR', 'VICTORY GALLOP', 'PAPA CLEM', 'KANEKO', 'DAREDEVIL', 'BODEMEISTER', 'KAIZBERT', 'ÖZHABER', 'SERHANTAY', 'MYBOYCHARLIE'];
  if (famousSires.some(s => (horse.baba || '').toUpperCase().includes(s))) {
    pedScore = 94;
  }

  // 6. Fiziksel Dinlenme (KGS)
  let physicalScore = 72;
  const kgs = horse.dinlenme_gunu || 20;
  if (kgs >= 14 && kgs <= 40) physicalScore = 95;
  else if (kgs > 90) physicalScore = 50;
  else if (kgs < 7) physicalScore = 58;

  // 7. AGF & Sıklet Etkisi
  const agf = horse.agf_orani || 8;
  const agfWeight = Math.min(98, Math.max(30, Math.round(30 + Math.sqrt(agf) * 11.5)));
  const siklet = horse.siklet || 56;
  const weightScore = Math.min(95, Math.max(45, Math.round(95 - (siklet - 50) * 3.5)));

  // Bütünleşik Ağırlıklı Royal Puanı (Dinamik Ayrışmalı)
  const royalScore = Math.round(
    (hpScore * 0.28) +
    (formScore * 0.22) +
    (jokeyScore * 0.16) +
    (galopScore * 0.14) +
    (agfWeight * 0.10) +
    (pedScore * 0.05) +
    (physicalScore * 0.05)
  );

  return {
    royalScore: Math.min(99, Math.max(35, royalScore)),
    formScore,
    jokeyScore,
    galopScore,
    pedScore,
    physicalScore
  };
}\n\n`;

html = html.substring(0, oldStart) + newFunction + html.substring(oldEnd);

// Also pass kosu.atlar into calculatePowerIndex
html = html.replace('...calculatePowerIndex(h)', '...calculatePowerIndex(h, kosu.atlar)');
html = html.replace('...calculatePowerIndex(h)', '...calculatePowerIndex(h, k.atlar)');

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully updated calculatePowerIndex in index.html');
