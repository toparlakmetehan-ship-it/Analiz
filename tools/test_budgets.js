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
  getElementById: () => ({ value: '', innerHTML: '', classList: { add: () => {}, remove: () => {} } }),
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

  const sortedByCertainty = [...ratedLegs].sort((a, b) => {
    const isHandikapA = a.sinif.includes('handikap');
    const isHandikapB = b.sinif.includes('handikap');
    if (isHandikapA && !isHandikapB) return 1;
    if (!isHandikapA && isHandikapB) return -1;
    return b.diff - a.diff;
  });

  const bankoCandidates = sortedByCertainty.filter(l => {
    const topH = l.horses[0];
    const isPistMismatch = (topH?.pist_aptitude_analizi?.delta < 0);
    const isHandikap = l.sinif.includes('handikap');
    return l.diff >= 4 && (topH?.royalScore >= 80) && !isPistMismatch && !isHandikap;
  });

  let bankoLeg = null;
  let bankoLeg2 = null;
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

  const picks = ratedLegs.map(l => {
    if (l === bankoLeg || l === bankoLeg2) return [l.horses[0]];
    return [l.horses[0], l.horses[1]];
  });

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

        const nonLockCounts = picks.filter((p, idx) => ratedLegs[idx] !== bankoLeg && ratedLegs[idx] !== bankoLeg2 && !lockLegs.includes(ratedLegs[idx])).map(p => p.length);
        const minOtherCount = nonLockCounts.length > 0 ? Math.min(...nonLockCounts) : 6;
        if (isLockA && countA >= 2 && minOtherCount < 6) return 1;
        if (isLockB && countB >= 2 && minOtherCount < 6) return -1;

        if (countA !== countB) return countA - countB;

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

[600, 1200, 2000, 3240, 6480].forEach(b => {
  const r = testRefinedOptimization(2, b, 'CHAMPION_5YEAR');
  console.log(`Bütçe: ${b} TL -> Hesaplanan: ${r.calculatedCost} TL | Komb: ${r.combinations} | Ayaklar: ${r.legs.map(l => l.count).join(' x ')}`);
});
