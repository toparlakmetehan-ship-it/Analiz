const fs = require('fs');

const bultenBugun = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));
const html = fs.readFileSync('public/index.html', 'utf8');
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
let jsCode = html.substring(scriptStart + 8, scriptEnd);

let renderedHtml = '';
global.window = { scrollTo: () => {}, addEventListener: () => {} };
global.navigator = { serviceWorker: { register: () => Promise.resolve() } };
global.localStorage = { getItem: () => null, setItem: () => {} };

let mockBudget = '3240';
let mockHipIdx = '1';

global.document = {
  addEventListener: () => {},
  getElementById: (id) => {
    if (id === 'budget-amount') return { value: mockBudget };
    if (id === 'robot-hipodrom-select') return { value: mockHipIdx, options: [{ text: 'İstanbul' }, { text: 'Adana' }] };
    if (id === 'optimized-coupon-container') return {
      set innerHTML(val) { renderedHtml = val; },
      get innerHTML() { return renderedHtml; }
    };
    return {
      value: '',
      innerHTML: '',
      classList: { add: () => {}, remove: () => {} },
      appendChild: () => {},
      style: {}
    };
  },
  querySelectorAll: () => [],
  createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} })
};

eval(jsCode + '; bulten = bultenBugun;');

console.log('====================================================');
console.log('LIVE optimizeCoupon() TEST FOR ADANA 2. 6\'LI');
console.log('====================================================');

// Set package 2 using selectAltiliPackage(2)
selectAltiliPackage(2);
currentPick6Strategy = 'CHAMPION_5YEAR';
mockBudget = '3240';
optimizeCoupon();

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
  const legRegex = new RegExp(`${idx + 1}\\. AYAK[\\s\\S]*?${w.no}<\\/span>[\\s\\S]*?${w.name}`, 'i');
  const hasWon = legRegex.test(renderedHtml);
  console.log(`Ayak ${idx + 1} (Koşu ${w.race}) Winner: ${w.no} ${w.name} -> ${hasWon ? '✅ VAR (TUTTU)' : '❌ YOK'}`);
  if (!hasWon) won2 = false;
});

const costMatch = renderedHtml.match(/Hesaplanan:\s*([\d\.,]+)\s*₺/);
const combMatch = renderedHtml.match(/(\d+)\s*Adet/);
console.log(`Hesaplanan Tutar: ${costMatch ? costMatch[1] : 'N/A'} ₺ | Kombinasyon: ${combMatch ? combMatch[1] : 'N/A'}`);
console.log(`ADANA 2. 6'LI CANLI ROBOT SONUÇ: ${won2 ? '🏆🏆🏆 6/6 TAM İSABET KAZANDI (634.341 TL)!' : '❌ YATTI'}\n`);

console.log('====================================================');
console.log('LIVE optimizeCoupon() TEST FOR ADANA 1. 6\'LI (540 TL)');
console.log('====================================================');

selectAltiliPackage(1);
currentPick6Strategy = 'SINGLE_BANKO';
mockBudget = '540';
optimizeCoupon();

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
  const legRegex = new RegExp(`${idx + 1}\\. AYAK[\\s\\S]*?${w.no}<\\/span>[\\s\\S]*?${w.name}`, 'i');
  const hasWon = legRegex.test(renderedHtml);
  console.log(`Ayak ${idx + 1} (Koşu ${w.race}) Winner: ${w.no} ${w.name} -> ${hasWon ? '✅ VAR (TUTTU)' : '❌ YOK'}`);
  if (!hasWon) won1 = false;
});

const costMatch1 = renderedHtml.match(/Hesaplanan:\s*([\d\.,]+)\s*₺/);
const combMatch1 = renderedHtml.match(/(\d+)\s*Adet/);
console.log(`Hesaplanan Tutar: ${costMatch1 ? costMatch1[1] : 'N/A'} ₺ | Kombinasyon: ${combMatch1 ? combMatch1[1] : 'N/A'}`);
console.log(`ADANA 1. 6'LI CANLI ROBOT SONUÇ: ${won1 ? '🏆🏆🏆 6/6 TAM İSABET KAZANDI (91.921 TL)!' : '❌ YATTI'}\n`);

process.exit(0);
