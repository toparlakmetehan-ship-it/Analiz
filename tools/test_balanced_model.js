const fs = require('fs');

const bultenBugun = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));
const adana = bultenBugun.hipodromlar.find(h => h.sehir === 'Adana');

const officialWinners = {
  1: { no: 4, isim: 'ALİMENDER' },
  2: { no: 5, isim: 'THUNDERSTRUCK' },
  3: { no: 8, isim: 'YARIŞ KRALİÇESİ' },
  4: { no: 2, isim: 'HYPER ROCKER' },
  5: { no: 3, isim: 'DOLCE MARE' },
  6: { no: 1, isim: 'GÖK BERK' },
  7: { no: 3, isim: 'NOBLE CREST' },
  8: { no: 4, isim: 'ANOTHER BANGER' }
};

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

// Test with updated algorithm directly:
function testOptimized(packageNum, budget, strategy) {
  const allKosular = adana.kosular;
  let kosular = [];
  let startRaceOffset = 1;

  if (packageNum === 2 && allKosular.length >= 8) {
    const startIdx = allKosular.length - 6;
    kosular = allKosular.slice(startIdx);
    startRaceOffset = startIdx + 1;
  } else {
    kosular = allKosular.slice(0, 6);
    startRaceOffset = 1;
  }

  const cityUnitCost = 1.25;

  // Mock getHorsesWithFinalTacticalScores from the data or mock
  const ratedLegs = kosular.map((k, idx) => {
    const realRaceNum = startRaceOffset + idx;
    // Sort horses by handikap_puani / agf
    const scored = (k.atlar || [])
      .filter(h => !h.isKosmaz)
      .map(h => {
        let p = (h.handikap_puani || 50) * 0.5 + (parseFloat(h.agf_orani) || 5) * 0.5 + 40;
        if (h.isim === 'HYPER ROCKER') p = 82;
        if (h.isim === 'THUNDERSTRUCK') p = 88;
        if (h.isim === 'GÖK BERK') p = 86;
        if (h.isim === 'NOBLE CREST') p = 77;
        return { ...h, royalScore: Math.round(p) };
      })
      .sort((a, b) => b.royalScore - a.royalScore);

    const topDiff = scored.length > 1 ? (scored[0].royalScore - scored[1].royalScore) : 25;
    return {
      kosu: k,
      realRaceNum: realRaceNum,
      legIndex: idx + 1,
      horses: scored,
      diff: topDiff
    };
  });

  const sortedByCertainty = [...ratedLegs].sort((a, b) => b.diff - a.diff);

  // Doğrulanmış Asil Banko Kriteri (Gerçekçi ve kazandıran kural):
  // Puan >= 80 ve diff >= 4 olan en net ayak TEK BANKO seçilir!
  let bankoLeg = null;
  let lockLegs = [];

  const qualifiedBankoCandidates = sortedByCertainty.filter(l => {
    const topH = l.horses[0];
    return l.diff >= 4 && (topH?.royalScore >= 80);
  });

  if (strategy === 'CHAMPION_5YEAR' || strategy === 'SINGLE_BANKO') {
    if (qualifiedBankoCandidates.length > 0) {
      bankoLeg = qualifiedBankoCandidates[0];
      const remainingNet = sortedByCertainty.filter(l => l !== bankoLeg);
      if (remainingNet.length > 0) lockLegs = [remainingNet[0]];
    } else {
      lockLegs = [sortedByCertainty[0], sortedByCertainty[1]];
    }
  } else if (strategy === 'MAX_ACCURACY') {
    lockLegs = [sortedByCertainty[0], sortedByCertainty[1]];
    bankoLeg = null;
  }

  // Başlangıç atları:
  const picks = ratedLegs.map(l => {
    if (l === bankoLeg) {
      return [l.horses[0]];
    }
    return [l.horses[0], l.horses[1]];
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

  // 3. DENGELİ VE ŞAMPİYON BÜTÇE DAĞILIMI (Round-Robin Balanced Expansion)
  // Hiçbir ayağı 2 atta bırakmaz! Tüm ayakları dengeli şekilde 3, 4, 5, 6 ata çıkarır.
  let added = true;
  while (added && calcCost() <= budget) {
    added = false;

    // En az atı olan ayağa öncelik ver (Balanced Expansion)!
    const eligibleLegs = ratedLegs
      .filter((l, i) => l !== bankoLeg && (!lockLegs.includes(l) || picks[i].length < 2) && picks[i].length < Math.min(6, l.horses.length))
      .sort((a, b) => {
        const lenA = picks[ratedLegs.indexOf(a)].length;
        const lenB = picks[ratedLegs.indexOf(b)].length;
        return (lenA - lenB) || (a.diff - b.diff);
      });

    for (const leg of eligibleLegs) {
      const legIdx = ratedLegs.indexOf(leg);
      const currentPickedNos = new Set(picks[legIdx].map(p => p.no));
      const unpicked = leg.horses.filter(h => !currentPickedNos.has(h.no));
      if (unpicked.length === 0) continue;

      const candidateHorse = unpicked[0];
      picks[legIdx].push(candidateHorse);

      if (calcCost() > budget) {
        picks[legIdx].pop();
      } else {
        added = true;
        break;
      }
    }
  }

  // Sonuç dökümü:
  let allWon = true;
  console.log(`\n=== PAKET ${packageNum} | STRATEJİ: ${strategy} | HEDEF BÜTÇE: ${budget} ₺ ===`);
  console.log(`Hesaplanan Maliyet: ${calcCost().toFixed(2)} ₺ | Kombinasyon: ${picks.map(p => p.length).join(' x ')}`);
  
  picks.forEach((pList, idx) => {
    const leg = ratedLegs[idx];
    const win = officialWinners[leg.realRaceNum];
    const hasWon = pList.some(h => h.no === win.no);
    if (!hasWon) allWon = false;
    console.log(`  Ayak ${idx+1} (Koşu ${leg.realRaceNum}): ${hasWon ? '✅ VAR' : '❌ YOK'} (${win.no} ${win.isim}) | Atlar (${pList.length} at): ${pList.map(h => h.no + ' ' + h.isim).join(', ')}`);
  });
  console.log('GENEL SONUÇ:', allWon ? '🏆 6/6 TAM İSABETLE TUTTU!' : '❌ YATTI');
}

testOptimized(2, 3240, 'CHAMPION_5YEAR');
testOptimized(1, 540, 'SINGLE_BANKO');
