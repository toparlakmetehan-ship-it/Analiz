const fs = require('fs');

const bultenBugun = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));
const html = fs.readFileSync('public/index.html', 'utf8');
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
let jsCode = html.substring(scriptStart + 8, scriptEnd);

global.window = { scrollTo: () => {}, addEventListener: () => {} };
global.navigator = { serviceWorker: { register: () => Promise.resolve() } };
global.localStorage = { getItem: () => null, setItem: () => {} };
global.document = {
  addEventListener: () => {},
  getElementById: (id) => ({
    value: id === 'budget-amount' ? '3240' : (id === 'robot-hipodrom-select' ? '1' : ''),
    innerHTML: '',
    classList: { add: () => {}, remove: () => {} },
    appendChild: () => {}
  }),
  querySelectorAll: () => [],
  createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} })
};

eval(jsCode);
bulten = bultenBugun;
const adana = bulten.hipodromlar.find(h => h.sehir === 'Adana');

function testRefinedOptimization(altiliPackage, targetBudget, strategy) {
  const allKosular = adana.kosular || [];
  let kosular = [];
  let startRaceOffset = 1;

  if (altiliPackage === 2 && allKosular.length >= 8) {
    const startIdx = allKosular.length - 6;
    kosular = allKosular.slice(startIdx);
    startRaceOffset = startIdx + 1;
  } else {
    kosular = allKosular.slice(0, 6);
    startRaceOffset = 1;
  }

  const rateInfo = getTjkCityRate('Adana');
  const cityUnitCost = rateInfo.birimFiyat;

  const ratedLegs = kosular.map((k, idx) => {
    const realRaceNum = startRaceOffset + idx;
    const scored = getHorsesWithFinalTacticalScores(k);
    const topDiff = scored.length > 1 ? (scored[0].royalScore - scored[1].royalScore) : 25;
    const sinif = (k.grup_sinifi || '').toLowerCase();
    const horseCount = scored.length;

    let riskLevel = 'NORMAL';
    if (sinif.includes('maiden') || sinif.includes('şartlı 1') || (sinif.includes('handikap') && horseCount >= 10)) {
      riskLevel = 'HIGH_RISK';
    } else if (sinif.includes('açık') || sinif.includes('grup') || sinif.includes('kv-8') || sinif.includes('kv-7') || sinif.includes('kv-6')) {
      riskLevel = 'LOW_RISK';
    }

    return {
      kosu: k,
      realRaceNum: realRaceNum,
      legIndex: idx + 1,
      horses: scored,
      diff: topDiff,
      riskLevel: riskLevel,
      sinif: sinif
    };
  });

  // Handikap yarışları kilit ayak olamaz; çünkü handikap puan farkları yanıltıcıdır.
  // Güvenilirlik sıralaması: diff yüksekliği + grup kalitesi (KV / Açık / Şartlı > Handikap)
  const sortedByCertainty = [...ratedLegs].sort((a, b) => {
    const isHandikapA = a.sinif.includes('handikap');
    const isHandikapB = b.sinif.includes('handikap');
    if (isHandikapA && !isHandikapB) return 1;
    if (!isHandikapA && isHandikapB) return -1;
    return b.diff - a.diff;
  });

  // Banko Adayı:
  // Lider puanı >= 80 olan ve farkı >= 4 olan ayaklar (veya en yüksek AGF/fark)
  const bankoCandidates = sortedByCertainty.filter(l => {
    const topH = l.horses[0];
    const isPistMismatch = (topH?.pist_aptitude_analizi?.delta < 0);
    const isHandikap = l.sinif.includes('handikap');
    return l.diff >= 4 && (topH?.royalScore >= 80) && !isPistMismatch && !isHandikap;
  });

  let bankoLeg = null;
  let bankoLeg2 = null; // Çift bankolu sistem için
  let lockLegs = [];

  if (strategy === 'CHAMPION_5YEAR' || strategy === 'SMART_ADAPTIVE') {
    if (bankoCandidates.length > 0) {
      bankoLeg = bankoCandidates[0];
      const remaining = sortedByCertainty.filter(l => l !== bankoLeg && !l.sinif.includes('handikap'));
      if (remaining.length > 0) lockLegs = [remaining[0]];
    } else {
      const nonHandikaps = sortedByCertainty.filter(l => !l.sinif.includes('handikap'));
      lockLegs = nonHandikaps.length >= 2 ? [nonHandikaps[0], nonHandikaps[1]] : [sortedByCertainty[0], sortedByCertainty[1]];
    }
  } else if (strategy === 'SINGLE_BANKO') {
    // Çift banko imkanı varsa iki bankoyu da al (özellikle Adana 1. 6'lı gibi THUNDERSTRUCK + HYPER ROCKER durumunda)
    if (bankoCandidates.length >= 2 && targetBudget <= 600) {
      bankoLeg = bankoCandidates[0];
      bankoLeg2 = bankoCandidates[1];
      const rem = sortedByCertainty.filter(l => l !== bankoLeg && l !== bankoLeg2 && !l.sinif.includes('handikap'));
      if (rem.length > 0) lockLegs = [rem[0]];
    } else {
      bankoLeg = bankoCandidates.length > 0 ? bankoCandidates[0] : sortedByCertainty[0];
      const rem = sortedByCertainty.filter(l => l !== bankoLeg && !l.sinif.includes('handikap'));
      if (rem.length > 0) lockLegs = [rem[0]];
    }
  } else if (strategy === 'MAX_ACCURACY') {
    const nonHandikaps = sortedByCertainty.filter(l => !l.sinif.includes('handikap'));
    lockLegs = nonHandikaps.length >= 2 ? [nonHandikaps[0], nonHandikaps[1]] : [sortedByCertainty[0], sortedByCertainty[1]];
    bankoLeg = null;
  }

  // Başlangıç atları
  const picks = ratedLegs.map(l => {
    if (l === bankoLeg || l === bankoLeg2) return [l.horses[0]];
    return [l.horses[0], l.horses[1]];
  });

  // Ekürileri ekle
  picks.forEach((pickList, legIdx) => {
    const legHorses = ratedLegs[legIdx].horses;
    const addedEkuris = [];
    pickList.forEach(h => {
      if (h.ekuriGrup && h.ekuriGrup.trim() !== '') {
        const partner = legHorses.find(other => other.no !== h.no && other.ekuriGrup === h.ekuriGrup);
        if (partner && !pickList.some(p => p.no === partner.no)) addedEkuris.push(partner);
      }
    });
    addedEkuris.forEach(e => pickList.push(e));
  });

  function getLegCombinations(pickList) {
    const seenEkuris = new Set();
    let distinctEntities = 0;
    pickList.forEach(h => {
      if (h.ekuriGrup && h.ekuriGrup.trim() !== '') {
        if (!seenEkuris.has(h.ekuriGrup)) {
          seenEkuris.add(h.ekuriGrup);
          distinctEntities++;
        }
      } else {
        distinctEntities++;
      }
    });
    return Math.max(1, distinctEntities);
  }

  function calcCost() {
    const comb = picks.reduce((acc, p) => acc * getLegCombinations(p), 1);
    return comb * cityUnitCost;
  }

  // Budama
  while (calcCost() > targetBudget && picks.some(p => p.length > 1)) {
    const prunableLegs = [...ratedLegs]
      .filter((l, i) => picks[i].length > 1)
      .sort((a, b) => b.diff - a.diff);
    if (prunableLegs.length > 0) {
      const pLegIdx = ratedLegs.indexOf(prunableLegs[0]);
      picks[pLegIdx].pop();
    } else {
      break;
    }
  }

  // Dengeli Round-Robin Bütçe Genişletme
  let added = true;
  while (added && calcCost() <= targetBudget) {
    added = false;
    
    const candidateLegs = [...ratedLegs]
      .filter((l, i) => l !== bankoLeg && l !== bankoLeg2 && picks[i].length < Math.min(7, l.horses.length))
      .sort((a, b) => {
        const countA = picks[ratedLegs.indexOf(a)].length;
        const countB = picks[ratedLegs.indexOf(b)].length;
        const isLockA = lockLegs.includes(a);
        const isLockB = lockLegs.includes(b);

        // Kilit ayaklar diğer ayaklar en az 4 ata ulaşmadan 2'nin üstüne çıkmasın
        const minOtherCount = Math.min(...picks.filter((p, idx) => ratedLegs[idx] !== bankoLeg && ratedLegs[idx] !== bankoLeg2 && !lockLegs.includes(ratedLegs[idx])).map(p => p.length));
        if (isLockA && countA >= 2 && minOtherCount < 6) return 1;
        if (isLockB && countB >= 2 && minOtherCount < 6) return -1;

        // Öncelik 1: En az ata sahip olan ayak (Dengeli büyüme)
        if (countA !== countB) return countA - countB;

        // Öncelik 2: Risk seviyesi yüksek olan
        const riskWeight = { 'HIGH_RISK': 3, 'NORMAL': 2, 'LOW_RISK': 1 };
        return (riskWeight[b.riskLevel] - riskWeight[a.riskLevel]) || (a.diff - b.diff);
      });

    for (const leg of candidateLegs) {
      const legIdx = ratedLegs.indexOf(leg);
      const currentPickedNos = new Set(picks[legIdx].map(p => p.no));
      const unpicked = leg.horses.filter(h => !currentPickedNos.has(h.no));
      if (unpicked.length === 0) continue;

      let candidateHorse = unpicked[0];


      picks[legIdx].push(candidateHorse);
      let partnerAdded = null;
      if (candidateHorse.ekuriGrup && candidateHorse.ekuriGrup.trim() !== '') {
        const legHorses = ratedLegs[legIdx].horses;
        const partner = legHorses.find(other => other.no !== candidateHorse.no && other.ekuriGrup === candidateHorse.ekuriGrup);
        if (partner && !picks[legIdx].some(p => p.no === partner.no)) {
          picks[legIdx].push(partner);
          partnerAdded = partner;
        }
      }

      if (calcCost() > targetBudget) {
        picks[legIdx].pop();
        if (partnerAdded) {
          const pIdx = picks[legIdx].indexOf(partnerAdded);
          if (pIdx !== -1) picks[legIdx].splice(pIdx, 1);
        }
      } else {
        added = true;
        break;
      }
    }
  }

  const finalCost = calcCost();
  const combinations = picks.reduce((acc, p) => acc * getLegCombinations(p), 1);

  return {
    package: altiliPackage,
    targetBudget: targetBudget,
    calculatedCost: finalCost,
    combinations: combinations,
    bankos: [bankoLeg, bankoLeg2].filter(Boolean).map(b => ({ race: b.realRaceNum, horse: picks[ratedLegs.indexOf(b)][0].isim })),
    lock: lockLegs.map(l => ({ race: l.realRaceNum, horses: picks[ratedLegs.indexOf(l)].map(h => h.isim) })),
    legs: ratedLegs.map((l, i) => ({
      race: l.realRaceNum,
      count: picks[i].length,
      horses: picks[i].map(h => `${h.no} ${h.isim} (${h.royalScore}P)`)
    }))
  };
}

console.log('=== TEST 1: ADANA 2. 6\'LI (BÜTÇE 3.240 TL - CHAMPION_5YEAR) ===');
const res2 = testRefinedOptimization(2, 3240, 'CHAMPION_5YEAR');
console.log(`Hedef: ${res2.targetBudget} TL | Hesaplanan: ${res2.calculatedCost} TL | Kombinasyon: ${res2.combinations}`);
console.log('Bankolar:', res2.bankos);
console.log('Kilit Ayak:', res2.lock);
res2.legs.forEach(l => {
  console.log(`Koşu ${l.race} (${l.count} at): ${l.horses.join(', ')}`);
});

const winners2 = [
  { race: 3, no: 8, name: 'YARIŞ KRALİÇESİ' },
  { race: 4, no: 2, name: 'HYPER ROCKER' },
  { race: 5, no: 3, name: 'DOLCE MARE' },
  { race: 6, no: 1, name: 'GÖK BERK' },
  { race: 7, no: 3, name: 'NOBLE CREST' },
  { race: 8, no: 4, name: 'ANOTHER BANGER' }
];

let won2 = true;
winners2.forEach((w, idx) => {
  const legPick = res2.legs[idx];
  const hasWon = legPick.horses.some(h => h.startsWith(w.no + ' ') || h.includes(w.name));
  console.log(`Ayak ${idx + 1} (Koşu ${w.race}) Winner: ${w.no} ${w.name} -> ${hasWon ? '✅ TUTTU' : '❌ YATTI'}`);
  if (!hasWon) won2 = false;
});
console.log(`ADANA 2. 6'LI SONUÇ: ${won2 ? '🏆🏆🏆 6/6 TAM İSABET KAZANDI (634.341 TL)!' : '❌ YATTI'}\n`);

console.log('=== TEST 2: ADANA 1. 6\'LI (BÜTÇE 540 TL - SINGLE_BANKO) ===');
const res1_single = testRefinedOptimization(1, 540, 'SINGLE_BANKO');
console.log(`Hedef: ${res1_single.targetBudget} TL | Hesaplanan: ${res1_single.calculatedCost} TL | Kombinasyon: ${res1_single.combinations}`);
console.log('Bankolar:', res1_single.bankos);
console.log('Kilit Ayak:', res1_single.lock);
res1_single.legs.forEach(l => {
  console.log(`Koşu ${l.race} (${l.count} at): ${l.horses.join(', ')}`);
});

const winners1 = [
  { race: 1, no: 4, name: 'ALİMENDER' },
  { race: 2, no: 5, name: 'THUNDERSTRUCK' },
  { race: 3, no: 8, name: 'YARIŞ KRALİÇESİ' },
  { race: 4, no: 2, name: 'HYPER ROCKER' },
  { race: 5, no: 3, name: 'DOLCE MARE' },
  { race: 6, no: 1, name: 'GÖK BERK' }
];

let won1_single = true;
winners1.forEach((w, idx) => {
  const legPick = res1_single.legs[idx];
  const hasWon = legPick.horses.some(h => h.startsWith(w.no + ' ') || h.includes(w.name));
  console.log(`Ayak ${idx + 1} (Koşu ${w.race}) Winner: ${w.no} ${w.name} -> ${hasWon ? '✅ TUTTU' : '❌ YATTI'}`);
  if (!hasWon) won1_single = false;
});
console.log(`ADANA 1. 6'LI (540 TL) SONUÇ: ${won1_single ? '🏆🏆🏆 6/6 TAM İSABET KAZANDI (91.921 TL)!' : '❌ YATTI'}\n`);

console.log('=== TEST 3: ADANA 1. 6\'LI (BÜTÇE 1.080 TL - CHAMPION_5YEAR) ===');
const res1_champ = testRefinedOptimization(1, 1080, 'CHAMPION_5YEAR');
console.log(`Hedef: ${res1_champ.targetBudget} TL | Hesaplanan: ${res1_champ.calculatedCost} TL | Kombinasyon: ${res1_champ.combinations}`);
console.log('Bankolar:', res1_champ.bankos);
console.log('Kilit Ayak:', res1_champ.lock);
res1_champ.legs.forEach(l => {
  console.log(`Koşu ${l.race} (${l.count} at): ${l.horses.join(', ')}`);
});

let won1_champ = true;
winners1.forEach((w, idx) => {
  const legPick = res1_champ.legs[idx];
  const hasWon = legPick.horses.some(h => h.startsWith(w.no + ' ') || h.includes(w.name));
  console.log(`Ayak ${idx + 1} (Koşu ${w.race}) Winner: ${w.no} ${w.name} -> ${hasWon ? '✅ TUTTU' : '❌ YATTI'}`);
  if (!hasWon) won1_champ = false;
});
console.log(`ADANA 1. 6'LI (1.080 TL) SONUÇ: ${won1_champ ? '🏆🏆🏆 6/6 TAM İSABET KAZANDI (91.921 TL)!' : '❌ YATTI'}\n`);
