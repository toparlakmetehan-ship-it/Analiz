const fs = require('fs');
const path = require('path');

const bulten = require('../public/data/bulten_bugun.json');
const backtestArchive = require('../public/data/backtest_archive.json');

// Reconstruct historical multi-horse races from pastRaces dataset
const historicalRaces = [];
const raceGroups = {};

bulten.hipodromlar.forEach(hip => {
  hip.kosular.forEach(k => {
    k.atlar.forEach(a => {
      (a.pastRaces || []).forEach(pr => {
        if (!pr.finishRank) return;
        const key = pr.tarih + '_' + pr.sehir + '_' + pr.pist + '_' + pr.mesafe;
        if (!raceGroups[key]) raceGroups[key] = [];
        raceGroups[key].push({
          horseName: a.isim,
          baba: a.baba,
          anne: a.anne,
          kisrak_babasi: a.kisrak_babasi,
          handikap: a.handikap_puani || 45,
          siklet: pr.siklet || a.siklet || 56,
          jokey: pr.jokey || a.jokey,
          jokeyWinRate: a.jokey_kazanma_orani || 11,
          finishRank: pr.finishRank,
          ganyan: parseFloat(pr.ganyan) || 5.0,
          earlyPace: pr.earlyPace || 80,
          latePace: pr.latePace || 80,
          accelerationType: pr.accelerationType,
          son400hiz: a.son_galop ? a.son_galop.son400hiz : 50,
          kgs: a.dinlenme_gunu || 21,
          takilar: a.takilar || [],
          kulvar: a.kulvar || 4,
          anneKardesleriScore: (a.anne_kardesleri && a.anne_kardesleri.score) || 65,
          pistGenetikDelta: (a.pist_genetik_analizi && a.pist_genetik_analizi.delta) || 0
        });
      });
    });
  });
});

for (let k in raceGroups) {
  if (raceGroups[k].length >= 2) {
    const seen = new Set();
    const cleanList = [];
    raceGroups[k].forEach(h => {
      if (!seen.has(h.horseName)) {
        seen.add(h.horseName);
        cleanList.push(h);
      }
    });
    if (cleanList.length >= 2) {
      historicalRaces.push({
        id: k,
        horses: cleanList
      });
    }
  }
}

console.log('Total historical multi-horse test races:', historicalRaces.length);

function scoreHorse(h, w, raceHorses) {
  // 1. Handikap
  const hps = raceHorses.map(x => x.handikap);
  const maxHp = Math.max(...hps);
  const minHp = Math.min(...hps);
  let hpScore = 60;
  if (maxHp > minHp) {
    hpScore = 38 + ((h.handikap - minHp) / (maxHp - minHp)) * 58;
  }

  // 2. Form & İvmelenme
  let formScore = (h.earlyPace * 0.4) + (h.latePace * 0.6);
  if (h.accelerationType && h.accelerationType.includes('Hızlanan')) formScore += 6;

  // 3. Pedigri & Kardeş Başarısı
  let pedScore = 65;
  const eliteSires = ['NATIVE KHAN', 'TOROK', 'LUXOR', 'VICTORY GALLOP', 'PAPA CLEM', 'KANEKO', 'DAREDEVIL', 'KAIZBERT', 'ÖZHABER', 'SERHANTAY'];
  if (eliteSires.some(s => (h.baba || '').toUpperCase().includes(s))) pedScore += 18;
  const famousDams = ['RENGİN', 'SUZİ GOLD', 'PLAYA DEL AMOR', 'EYE IN THE SKY', 'AMAZING LOVE', 'CERENİM', 'KINALI KUZU', 'NIGHTINGALE'];
  if (famousDams.some(d => (h.anne || '').toUpperCase().includes(d))) pedScore += 15;
  pedScore = Math.round((pedScore * 0.45) + (h.anneKardesleriScore * 0.55)) + h.pistGenetikDelta;

  // 4. Galop Hızı
  let galopScore = Math.min(100, Math.max(40, 30 + (h.son400hiz - 46) * 7.5));

  // 5. Kulvar / Geometri
  let trackScore = h.kulvar <= 4 ? 90 : (h.kulvar <= 8 ? 75 : 55);

  // 6. KGS
  let kgsScore = (h.kgs >= 14 && h.kgs <= 35) ? 95 : (h.kgs > 90 ? 50 : 70);

  // 7. Sıklet
  let sikletScore = Math.min(95, Math.max(45, 95 - (h.siklet - 50) * 3.5));

  // 8. Jokey
  let jokeyScore = 50 + Math.min(40, h.jokeyWinRate * 1.8);

  // 9. Ekipman
  let takiScore = h.takilar.length >= 2 ? 88 : 70;

  return (
    (hpScore * (w.handikap || 0)) +
    (formScore * (w.form || 0)) +
    (pedScore * (w.pedigri || 0)) +
    (galopScore * (w.galop || 0)) +
    (trackScore * (w.kulvar || 0)) +
    (kgsScore * (w.kgs || 0)) +
    (sikletScore * (w.siklet || 0)) +
    (jokeyScore * (w.jokey || 0)) +
    (takiScore * (w.ekipman || 0))
  );
}

function evaluateWeights(w) {
  let top1Hit = 0;
  let top2Hit = 0;
  let top3Hit = 0;
  let validCount = 0;

  historicalRaces.forEach(r => {
    const scored = r.horses.map(h => ({
      name: h.horseName,
      finishRank: h.finishRank,
      score: scoreHorse(h, w, r.horses)
    }));
    scored.sort((a, b) => b.score - a.score);

    const winner = r.horses.find(h => h.finishRank === 1);
    if (!winner) return;
    validCount++;

    if (scored[0].name === winner.horseName) top1Hit++;
    if (scored.slice(0, 2).some(s => s.name === winner.horseName)) top2Hit++;
    if (scored.slice(0, 3).some(s => s.name === winner.horseName)) top3Hit++;
  });

  return {
    top1Pct: (top1Hit / validCount) * 100,
    top2Pct: (top2Hit / validCount) * 100,
    top3Pct: (top3Hit / validCount) * 100,
    top1Hit,
    validCount
  };
}

// Systematic Grid Search around Macro 4-Year Season Hypothesis
// 1. Form/İvme: 24 - 30%
// 2. Pedigri & Kardeşler (4-year macro precision): 20 - 26%
// 3. Handikap: 10 - 15%
// 4. KGS: 8 - 12%
// 5. Galop: 6 - 10%
// 6. Sıklet: 6 - 9%
// 7. Jokey: 5 - 8% (Strictly <= 10%)
// 8. Kulvar: 3 - 5%
// 9. Ekipman: 2 - 4%

const candidates = [
  // Current 2-year baseline
  {
    name: 'Mevcut (2 Yıllık Kalibrasyon)',
    weights: { form: 0.26, pedigri: 0.20, handikap: 0.14, kgs: 0.10, galop: 0.09, siklet: 0.08, jokey: 0.06, kulvar: 0.04, ekipman: 0.03 }
  },
  // Candidate A: 4-Year Macro Genetic Focus (Pedigri %24, Form %27)
  {
    name: '4-Yıl Model A: Pedigri & Form Zirvesi',
    weights: { form: 0.27, pedigri: 0.24, handikap: 0.12, kgs: 0.09, galop: 0.08, siklet: 0.07, jokey: 0.06, kulvar: 0.04, ekipman: 0.03 }
  },
  // Candidate B: 4-Year Macro Balanced (Form %28, Pedigri %22)
  {
    name: '4-Yıl Model B: Dengeli Makro Güç',
    weights: { form: 0.28, pedigri: 0.22, handikap: 0.12, kgs: 0.09, galop: 0.08, siklet: 0.08, jokey: 0.06, kulvar: 0.04, ekipman: 0.03 }
  },
  // Candidate C: 4-Year Macro Pure Biomechanical (Form %29, Pedigri %23, Handikap %10)
  {
    name: '4-Yıl Model C: Saf Biyomekanik (Handikap %10 Düşürülmüş)',
    weights: { form: 0.29, pedigri: 0.23, handikap: 0.10, kgs: 0.09, galop: 0.08, siklet: 0.08, jokey: 0.06, kulvar: 0.04, ekipman: 0.03 }
  },
  // Candidate D: 4-Year Macro High Sibling (Form %26, Pedigri %25, Handikap %11, Galop %8, Jokey %7)
  {
    name: '4-Yıl Model D: Soy & Kardeş Makro Baskın',
    weights: { form: 0.26, pedigri: 0.25, handikap: 0.11, kgs: 0.09, galop: 0.08, siklet: 0.07, jokey: 0.07, kulvar: 0.04, ekipman: 0.03 }
  },
  // Candidate E: Form %28, Pedigri %24, Handikap %11, KGS %9, Galop %8, Sıklet %7, Jokey %6, Kulvar %4, Ekipman %3
  {
    name: '4-Yıl Model E: 100 Tam Toplam (Form 28, Pedigri 24, Handikap 11)',
    weights: { form: 0.28, pedigri: 0.24, handikap: 0.11, kgs: 0.09, galop: 0.08, siklet: 0.07, jokey: 0.06, kulvar: 0.04, ekipman: 0.03 }
  }
];

console.log('\n--- 4 YILLIK MAKRO SEZON AĞIRLIK KALİBRASYON TESTİ ---');
candidates.forEach(c => {
  const sum = Object.values(c.weights).reduce((a, b) => a + b, 0);
  const res = evaluateWeights(c.weights);
  console.log(`\nModel: ${c.name} (Ağırlık Toplamı: %${Math.round(sum * 100)})`);
  console.log(`  Dağılım: Form %${c.weights.form*100}, Soy/Kardeş %${c.weights.pedigri*100}, Handikap %${c.weights.handikap*100}, KGS %${c.weights.kgs*100}, Galop %${c.weights.galop*100}, Sıklet %${c.weights.siklet*100}, Jokey %${c.weights.jokey*100}, Kulvar %${c.weights.kulvar*100}, Ekipman %${c.weights.ekipman*100}`);
  console.log(`  1. Sıradaki Tek İsabeti: %${res.top1Pct.toFixed(1)} (${res.top1Hit}/${res.validCount})`);
  console.log(`  İlk 2 İçi İkili:         %${res.top2Pct.toFixed(1)}`);
  console.log(`  İlk 3 İçi Plase/Kupon:   %${res.top3Pct.toFixed(1)}`);
});

// Fine Grid Search around Model B
console.log('\n--- HASSAS GRID SEARCH (MODEL B ETRAFI) ---');
let bestModel = null;
let maxScore = -1;

for (let form = 27; form <= 30; form++) {
  for (let ped = 21; ped <= 24; ped++) {
    for (let hnd = 11; hnd <= 13; hnd++) {
      for (let kgs = 8; kgs <= 10; kgs++) {
        for (let gal = 7; gal <= 9; gal++) {
          for (let skl = 7; skl <= 9; skl++) {
            const jky = 6; // strictly <= 10%
            const klv = 4;
            const ekp = 3;
            if (form + ped + hnd + kgs + gal + skl + jky + klv + ekp === 100) {
              const w = {
                form: form / 100,
                pedigri: ped / 100,
                handikap: hnd / 100,
                kgs: kgs / 100,
                galop: gal / 100,
                siklet: skl / 100,
                jokey: jky / 100,
                kulvar: klv / 100,
                ekipman: ekp / 100
              };
              const res = evaluateWeights(w);
              const composite = (res.top1Pct * 2) + res.top2Pct + res.top3Pct;
              if (composite > maxScore) {
                maxScore = composite;
                bestModel = {
                  form, ped, hnd, kgs, gal, skl, jky, klv, ekp,
                  res
                };
              }
            }
          }
        }
      }
    }
  }
}

console.log('EN İYİ MAKRO 4 YILLIK OPTİMAL MODEL:');
console.log(`Form: %${bestModel.form}`);
console.log(`Soy & Kardeşler: %${bestModel.ped}`);
console.log(`Handikap: %${bestModel.hnd}`);
console.log(`KGS: %${bestModel.kgs}`);
console.log(`Galop: %${bestModel.gal}`);
console.log(`Sıklet: %${bestModel.skl}`);
console.log(`Jokey: %${bestModel.jky}`);
console.log(`Kulvar: %${bestModel.klv}`);
console.log(`Ekipman: %${bestModel.ekp}`);
console.log(`Toplam: %${bestModel.form + bestModel.ped + bestModel.hnd + bestModel.kgs + bestModel.gal + bestModel.skl + bestModel.jky + bestModel.klv + bestModel.ekp}`);
console.log(`Tek İsabeti: %${bestModel.res.top1Pct.toFixed(1)} (${bestModel.res.top1Hit}/${bestModel.res.validCount})`);
console.log(`İlk 2 İkili: %${bestModel.res.top2Pct.toFixed(1)}`);
console.log(`İlk 3 Kupon: %${bestModel.res.top3Pct.toFixed(1)}`);
