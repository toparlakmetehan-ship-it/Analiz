const fs = require('fs');

const bultenBugun = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));
const html = fs.readFileSync('public/index.html', 'utf8');
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
let jsCode = html.substring(scriptStart + 8, scriptEnd);

global.window = { scrollTo: () => {}, addEventListener: () => {} };
global.navigator = { serviceWorker: { register: () => Promise.resolve() } };
global.localStorage = { getItem: () => null, setItem: () => {} };

let mockBudget = '540';
let mockHipIdx = '1';

global.document = {
  addEventListener: () => {},
  getElementById: (id) => {
    if (id === 'budget-amount') return { value: mockBudget };
    if (id === 'robot-hipodrom-select') return { value: mockHipIdx, options: [{ text: 'İstanbul' }, { text: 'Adana' }] };
    if (id === 'optimized-coupon-container') return { innerHTML: '' };
    return { value: '', innerHTML: '', classList: { add: () => {}, remove: () => {} }, appendChild: () => {}, style: {} };
  },
  querySelectorAll: () => [],
  createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} })
};

eval(jsCode + '; bulten = bultenBugun;');

currentAltiliPackage = 1;
currentPick6Strategy = 'SINGLE_BANKO';
mockBudget = '540';

// Trace inside optimizeCoupon
const hip = bultenBugun.hipodromlar[1];
const kosular = hip.kosular.slice(0, 6);
const ratedLegs = kosular.map((k, idx) => {
  const scored = getHorsesWithFinalTacticalScores(k);
  const topDiff = scored.length > 1 ? (scored[0].royalScore - scored[1].royalScore) : 25;
  return {
    kosu: k,
    realRaceNum: idx + 1,
    horses: scored,
    diff: topDiff
  };
});

const sortedByCertainty = [...ratedLegs].sort((a, b) => {
  const isHandikapA = (a.kosu.grup_sinifi || '').toLowerCase().includes('handikap');
  const isHandikapB = (b.kosu.grup_sinifi || '').toLowerCase().includes('handikap');
  if (isHandikapA && !isHandikapB) return 1;
  if (!isHandikapA && isHandikapB) return -1;
  return b.diff - a.diff;
});

const qualifiedBankoCandidates = sortedByCertainty.filter(l => {
  const topH = l.horses[0];
  const isPistMismatch = (topH?.pist_aptitude_analizi?.delta < 0);
  const isHandikap = (l.kosu.grup_sinifi || '').toLowerCase().includes('handikap');
  return l.diff >= 4 && (topH?.royalScore >= 80) && !isPistMismatch && !isHandikap;
});

console.log('qualifiedBankoCandidates length:', qualifiedBankoCandidates.length);
qualifiedBankoCandidates.forEach(c => console.log('Candidate:', c.realRaceNum, c.horses[0].isim));

let targetBudget = 540;
let bankoLeg = null, bankoLeg2 = null;
if (qualifiedBankoCandidates.length >= 2 && targetBudget <= 600) {
  bankoLeg = qualifiedBankoCandidates[0];
  bankoLeg2 = qualifiedBankoCandidates[1];
}
console.log('bankoLeg:', bankoLeg?.realRaceNum, 'bankoLeg2:', bankoLeg2?.realRaceNum);

process.exit(0);
