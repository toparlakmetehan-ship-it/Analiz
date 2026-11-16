const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
let jsCode = scriptMatch[1];

// Mock DOM
const dom = {
  elements: {},
  getElementById(id) {
    if (!this.elements[id]) {
      this.elements[id] = {
        value: '',
        innerText: '',
        innerHTML: '',
        style: {},
        classList: {
          add: () => {},
          remove: () => {},
          toggle: () => {},
          contains: () => false
        },
        querySelectorAll: () => [],
        appendChild: () => {},
        options: []
      };
    }
    return this.elements[id];
  },
  querySelectorAll: () => []
};

const sandbox = {
  document: dom,
  window: { addEventListener: () => {} },
  navigator: { serviceWorker: { register: () => Promise.resolve(), addEventListener: () => {} } },
  console: console,
  setTimeout: () => {},
  setInterval: () => {},
  fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
  showToast: () => {},
  currentHipIdx: 0,
  currentKosuIdx: 0,
  currentProgramDate: 'bugun',
  currentPick6Strategy: 'CHAMPION_5YEAR',
  currentAltiliPackage: 2,
  archiveBultenCache: {}
};

vm.createContext(sandbox);
vm.runInContext(jsCode, sandbox);

// Test 1: Load 15 Kasım archive and test Adana 2. 6'lı
const bulten15 = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'bulten_2026_11_15.json'), 'utf8'));
vm.runInContext('bulten = ' + JSON.stringify(bulten15), sandbox);
vm.runInContext('enrichBultenRunningStylesAndPace(bulten)', sandbox);

const adanaIdx = bulten15.hipodromlar.findIndex(h => h.sehir === 'Adana');
dom.getElementById('robot-hipodrom-select').value = String(adanaIdx);
vm.runInContext(`currentHipIdx = ${adanaIdx}; currentAltiliPackage = 2; currentPick6Strategy = 'CHAMPION_5YEAR';`, sandbox);
dom.getElementById('budget-amount').value = '3240';

vm.runInContext('optimizeCoupon()', sandbox);

const outHtml2 = dom.getElementById('optimized-coupon-container').innerHTML;
console.log('Adana 2. 6\'lı HTML length:', outHtml2.length);

const winnersAdana2 = [
  { leg: 1, no: 8, name: "YARIŞ KRALİÇESİ" },
  { leg: 2, no: 2, name: "HYPER ROCKER" },
  { leg: 3, no: 3, name: "DOLCE MARE" },
  { leg: 4, no: 1, name: "GÖK BERK" },
  { leg: 5, no: 3, name: "NOBLE CREST" },
  { leg: 6, no: 4, name: "ANOTHER BANGER" }
];

let hits2 = 0;
winnersAdana2.forEach(w => {
  const hasHorse = outHtml2.includes(w.name);
  if (hasHorse) hits2++;
  console.log(`Ayak ${w.leg}: Winner ${w.no} ${w.name} -> ${hasHorse ? '✅ VAR' : '❌ YOK'}`);
});
console.log(`Adana 2. 6'lı Sonuç: ${hits2}/6 ${hits2 === 6 ? 'TAM İSABET! 🎯' : 'Kayıp'}`);

// Test 2: Adana 1. 6'lı (540 TL)
vm.runInContext(`currentAltiliPackage = 1; currentPick6Strategy = 'SINGLE_BANKO';`, sandbox);
dom.getElementById('budget-amount').value = '540';
vm.runInContext('optimizeCoupon()', sandbox);

const outHtml1 = dom.getElementById('optimized-coupon-container').innerHTML;
console.log('\nAdana 1. 6\'lı HTML length:', outHtml1.length);

const winnersAdana1 = [
  { leg: 1, no: 4, name: "ALİMENDER" },
  { leg: 2, no: 5, name: "THUNDERSTRUCK" },
  { leg: 3, no: 8, name: "YARIŞ KRALİÇESİ" },
  { leg: 4, no: 2, name: "HYPER ROCKER" },
  { leg: 5, no: 3, name: "DOLCE MARE" },
  { leg: 6, no: 1, name: "GÖK BERK" }
];

let hits1 = 0;
winnersAdana1.forEach(w => {
  const hasHorse = outHtml1.includes(w.name);
  if (hasHorse) hits1++;
  console.log(`Ayak ${w.leg}: Winner ${w.no} ${w.name} -> ${hasHorse ? '✅ VAR' : '❌ YOK'}`);
});
console.log(`Adana 1. 6'lı Sonuç: ${hits1}/6 ${hits1 === 6 ? 'TAM İSABET! 🎯' : 'Kayıp'}`);

// Test 3: Today 16 Kasım Bursa 6'lı
const bulten16 = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'bulten_bugun.json'), 'utf8'));
vm.runInContext('bulten = ' + JSON.stringify(bulten16), sandbox);
vm.runInContext('enrichBultenRunningStylesAndPace(bulten)', sandbox);
vm.runInContext(`currentHipIdx = 0; currentAltiliPackage = 1; currentPick6Strategy = 'CHAMPION_5YEAR';`, sandbox);
dom.getElementById('budget-amount').value = '600';
vm.runInContext('optimizeCoupon()', sandbox);

const outHtmlBursa = dom.getElementById('optimized-coupon-container').innerHTML;
console.log('\nBursa 16 Kasım Bugün 6\'lı HTML length:', outHtmlBursa.length);
const bursaCostMatch = outHtmlBursa.match(/Hesaplanan:\s*([\d\.,]+)\s*₺/);
console.log(`Bursa Kupon Tutarı: ${bursaCostMatch ? bursaCostMatch[1] : 'N/A'} ₺`);
