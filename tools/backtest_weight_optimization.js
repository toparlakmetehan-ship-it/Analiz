const fs = require('fs');
const path = require('path');

const bulten = require('../public/data/bulten_bugun.json');
const backtestDun = require('../public/data/backtest_dun.json');

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
          kulvar: a.kulvar || 4
        });
      });
    });
  });
});

for (let k in raceGroups) {
  if (raceGroups[k].length >= 2) {
    // deduplicate horses in the same race
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

// Weight profiles to test
const profiles = [
  {
    name: '1. Eski Model (Handikap & Galop Ağırlıklı - Naive)',
    weights: {
      handikap: 0.22,
      pedigri: 0.16,
      galop: 0.15,
      form: 0.14,
      kulvar: 0.10,
      kgs: 0.08,
      siklet: 0.08,
      jokey: 0.07,
      ekipman: 0.06
    }
  },
  {
    name: '2. Handikap Zirveli (Handikap %35 - Aşırı)',
    weights: {
      handikap: 0.35,
      pedigri: 0.15,
      galop: 0.15,
      form: 0.10,
      kulvar: 0.08,
      kgs: 0.05,
      siklet: 0.05,
      jokey: 0.05,
      ekipman: 0.02
    }
  },
  {
    name: '3. Form & Pedigri Odaklı (Kardeş Başarılı, Galop & Handikap Düşürülmüş)',
    weights: {
      form: 0.26,
      pedigri: 0.20,      // Aygır + Anne + Anne Kardeşleri
      handikap: 0.14,     // %22'den %14'e indirildi
      galop: 0.09,        // %15'ten %9'a indirildi
      kgs: 0.09,
      siklet: 0.08,
      jokey: 0.07,        // ≤ %10 kuralı korundu (%7)
      kulvar: 0.04,       // %10'dan %4'e indirildi
      ekipman: 0.03
    }
  },
  {
    name: '4. Safkan Gücü & Tabela İvmesi (Optimum Biyomekanik Model)',
    weights: {
      form: 0.28,
      pedigri: 0.22,      // Kardeşler + Kan Hattı
      handikap: 0.12,     // Handikap %12
      galop: 0.08,        // Galop %8
      kgs: 0.09,
      siklet: 0.08,
      jokey: 0.06,        // Jokey %6 (Kural altı)
      kulvar: 0.04,       // Kulvar %4
      ekipman: 0.03
    }
  }
];

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
  // Sibling boost (anne kardeşleri)
  const famousDams = ['RENGİN', 'SUZİ GOLD', 'PLAYA DEL AMOR', 'EYE IN THE SKY', 'AMAZING LOVE', 'CERENİM', 'KINALI KUZU', 'NIGHTINGALE'];
  if (famousDams.some(d => (h.anne || '').toUpperCase().includes(d))) pedScore += 15;

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

// Run simulation
profiles.forEach(p => {
  let top1Hit = 0;
  let top2Hit = 0;
  let top3Hit = 0;
  let totalEvaluated = 0;

  historicalRaces.forEach(r => {
    // Sort horses by their actual finish rank to find the winner
    const sortedActual = [...r.horses].sort((a, b) => a.finishRank - b.finishRank);
    const winner = sortedActual[0];
    if (!winner || winner.finishRank > 1) return; // skip if no actual winner record

    // Score with profile
    const scored = r.horses.map(h => ({
      horseName: h.horseName,
      score: scoreHorse(h, p.weights, r.horses)
    })).sort((a, b) => b.score - a.score);

    totalEvaluated++;
    if (scored[0].horseName === winner.horseName) top1Hit++;
    if (scored.slice(0, 2).some(x => x.horseName === winner.horseName)) top2Hit++;
    if (scored.slice(0, 3).some(x => x.horseName === winner.horseName)) top3Hit++;
  });

  const top1Rate = ((top1Hit / totalEvaluated) * 100).toFixed(1);
  const top2Rate = ((top2Hit / totalEvaluated) * 100).toFixed(1);
  const top3Rate = ((top3Hit / totalEvaluated) * 100).toFixed(1);

  console.log('───────────────────────────────────────────────────────');
  console.log(p.name);
  console.log(`Değerlendirilen Koşu: ${totalEvaluated}`);
  console.log(`1. Sıradaki Tek İsabeti: %${top1Rate} (${top1Hit}/${totalEvaluated})`);
  console.log(`İlk 2 İçi Kapsama:       %${top2Rate} (${top2Hit}/${totalEvaluated})`);
  console.log(`İlk 3 İçi Plase/Kupon:   %${top3Rate} (${top3Hit}/${totalEvaluated})`);
});
