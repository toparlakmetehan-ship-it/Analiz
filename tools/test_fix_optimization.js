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

function testCouponOptimization(altiliPackage, targetBudget, strategy) {
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
    if (sinif.includes('maiden') || sinif.includes('şartlı 1') || (sinif.includes('handikap') && horseCount >= 12)) {
      riskLevel = 'HIGH_RISK';
    } else if ((sinif.includes('açık') || sinif.includes('grup') || sinif.includes('kv-8')) && topDiff >= 10) {
      riskLevel = 'LOW_RISK';
    }

    return {
      kosu: k,
      realRaceNum: realRaceNum,
      legIndex: idx + 1,
      horses: scored,
      diff: topDiff,
      riskLevel: riskLevel
    };
  });

  const sortedByCertainty = [...ratedLegs].sort((a, b) => b.diff - a.diff);

  // Banko adayı: En yüksek puan farkına sahip, liderin puanı >= 80 olan ayak
  // Eğer Maiden bile olsa, model puanı 80+ ve rakiplerine fark atmışsa (veya net favori ise) banko adayıdır
  const bankoCandidates = sortedByCertainty.filter(l => {
    const topH = l.horses[0];
    const isPistMismatch = (topH?.pist_aptitude_analizi?.delta < 0);
    // diff >= 4 ve puan >= 80 ve pist uyumu bozuk değilse
    return l.diff >= 4 && (topH?.royalScore >= 80) && !isPistMismatch;
  });

  let bankoLeg = null;
  let lockLegs = [];

  if (strategy === 'CHAMPION_5YEAR' || strategy === 'SMART_ADAPTIVE') {
    if (bankoCandidates.length > 0) {
      bankoLeg = bankoCandidates[0];
      const remaining = sortedByCertainty.filter(l => l !== bankoLeg);
      if (remaining.length > 0) lockLegs = [remaining[0]];
    } else {
      lockLegs = [sortedByCertainty[0], sortedByCertainty[1]];
    }
  } else if (strategy === 'MAX_ACCURACY') {
    lockLegs = [sortedByCertainty[0], sortedByCertainty[1]];
    bankoLeg = null;
  } else if (strategy === 'SINGLE_BANKO') {
    bankoLeg = bankoCandidates.length > 0 ? bankoCandidates[0] : sortedByCertainty[0];
    const rem = sortedByCertainty.filter(l => l !== bankoLeg);
    if (rem.length > 0) lockLegs = [rem[0]];
  }

  // Başlangıç atları
  const picks = ratedLegs.map(l => {
    if (l === bankoLeg) return [l.horses[0]];
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

  // Düşük hedef bütçelerde budama
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

  // DENGELİ ROUND-ROBIN BÜTÇE GENİŞLETME
  // Ayakları dengeli büyüt: Önce en az ata sahip olan açık ayakları (kilit olmayanları) büyüt.
  // Her ayak 6 ata ulaşana kadar dengeli dağıt, bütçe yeterse 7. atı ekle.
  let added = true;
  while (added && calcCost() <= targetBudget) {
    added = false;
    
    // Açık ayaklar (banko hariç, ve lockLegs 2 atın üstüne çıkmasın öncelikli olarak)
    const candidateLegs = [...ratedLegs]
      .filter((l, i) => l !== bankoLeg && picks[i].length < Math.min(7, l.horses.length))
      .sort((a, b) => {
        const countA = picks[ratedLegs.indexOf(a)].length;
        const countB = picks[ratedLegs.indexOf(b)].length;
        const isLockA = lockLegs.includes(a);
        const isLockB = lockLegs.includes(b);

        // Kilit ayaklar sadece 2 atta tutulmak istenir (diğer ayaklar henüz 6 ata ulaşmamışsa)
        if (isLockA && countA >= 2 && (!isLockB || countB < 2)) return 1;
        if (isLockB && countB >= 2 && (!isLockA || countA < 2)) return -1;

        // Öncelik 1: En az ata sahip olan ayak (Dengeli büyüme - starvation'ı önler!)
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
      // Yüksek riskli ayaklarda +EV sürprizleri öne al
      if (leg.riskLevel === 'HIGH_RISK') {
        const rankedByValue = [...unpicked].sort((a, b) => {
          const agfA = parseFloat(a.agf_orani) || 10;
          const agfB = parseFloat(b.agf_orani) || 10;
          const bonusA = (agfA <= 14 && (a.royalScore >= 66 || (a.son_galop && a.son_galop.son400hiz >= 53.5))) ? 16 : 0;
          const bonusB = (agfB <= 14 && (b.royalScore >= 66 || (b.son_galop && b.son_galop.son400hiz >= 53.5))) ? 16 : 0;
          return (b.royalScore + bonusA) - (a.royalScore + bonusB);
        });
        candidateHorse = rankedByValue[0];
      }

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
    banko: bankoLeg ? { race: bankoLeg.realRaceNum, horse: picks[ratedLegs.indexOf(bankoLeg)][0].isim } : null,
    lock: lockLegs.map(l => ({ race: l.realRaceNum, horses: picks[ratedLegs.indexOf(l)].map(h => h.isim) })),
    legs: ratedLegs.map((l, i) => ({
      race: l.realRaceNum,
      count: picks[i].length,
      horses: picks[i].map(h => `${h.no} ${h.isim} (${h.royalScore}P)`)
    }))
  };
}

console.log('=== TEST 1: ADANA 2. 6\'LI (BÜTÇE 3.240 TL) ===');
const res2 = testCouponOptimization(2, 3240, 'CHAMPION_5YEAR');
console.log(`Hedef: ${res2.targetBudget} TL | Hesaplanan: ${res2.calculatedCost} TL | Kombinasyon: ${res2.combinations}`);
console.log('Banko:', res2.banko);
console.log('Kilit Ayak:', res2.lock);
res2.legs.forEach(l => {
  console.log(`Koşu ${l.race} (${l.count} at): ${l.horses.join(', ')}`);
});

// Official 2. 6'lı Winners
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
console.log(`\nADANA 2. 6'LI SONUÇ: ${won2 ? '🏆🏆🏆 6/6 TAM İSABET KAZANDI (634.341 TL)!' : '❌ YATTI'}\n`);

console.log('=== TEST 2: ADANA 1. 6\'LI (BÜTÇE 540 TL) ===');
const res1 = testCouponOptimization(1, 540, 'CHAMPION_5YEAR');
console.log(`Hedef: ${res1.targetBudget} TL | Hesaplanan: ${res1.calculatedCost} TL | Kombinasyon: ${res1.combinations}`);
console.log('Banko:', res1.banko);
console.log('Kilit Ayak:', res1.lock);
res1.legs.forEach(l => {
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

let won1 = true;
winners1.forEach((w, idx) => {
  const legPick = res1.legs[idx];
  const hasWon = legPick.horses.some(h => h.startsWith(w.no + ' ') || h.includes(w.name));
  console.log(`Ayak ${idx + 1} (Koşu ${w.race}) Winner: ${w.no} ${w.name} -> ${hasWon ? '✅ TUTTU' : '❌ YATTI'}`);
  if (!hasWon) won1 = false;
});
console.log(`\nADANA 1. 6'LI SONUÇ: ${won1 ? '🏆🏆🏆 6/6 TAM İSABET KAZANDI (1.050 TL)!' : '❌ YATTI'}\n`);
