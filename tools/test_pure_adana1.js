const fs = require('fs');
const vm = require('vm');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const jsCode = scriptMatch[1];
const bultenNov15 = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'bulten_2026_11_15.json'), 'utf8'));

const dom = {
  elements: {
    'robot-hipodrom-select': { value: '1' },
    'budget-amount': { value: '540' }
  },
  getElementById(id) {
    if (!this.elements[id]) {
      this.elements[id] = { value: '', innerText: '', innerHTML: '', style: {}, classList: { add: ()=>{}, remove: ()=>{} }, appendChild: ()=>{} };
    }
    return this.elements[id];
  },
  querySelectorAll: () => []
};

const sandbox = {
  document: dom,
  window: { addEventListener: ()=>{}, scrollTo: ()=>{} },
  navigator: { serviceWorker: { register: ()=>Promise.resolve(), addEventListener: ()=>{} } },
  console, setTimeout: ()=>{}, setInterval: ()=>{}
};

vm.createContext(sandbox);
vm.runInContext(jsCode, sandbox);
vm.runInContext('bulten = ' + JSON.stringify(bultenNov15), sandbox);

const hipIdx = bultenNov15.hipodromlar.findIndex(h => h.sehir.toLowerCase().includes('adana'));
dom.elements['robot-hipodrom-select'].value = String(hipIdx);
dom.elements['budget-amount'].value = '540';

vm.runInContext('currentAltiliPackage = 1', sandbox);
vm.runInContext('currentPick6Strategy = "SINGLE_BANKO"', sandbox);
vm.runInContext('loadedWinningCoupon = null', sandbox);

sandbox.optimizeCoupon();

const containerHtml = dom.getElementById('optimized-coupon-container').innerHTML;

const officialWinners = [
  { race: 1, no: 2, name: 'ŞAHKAYA' },
  { race: 2, no: 5, name: 'THUNDERSTRUCK' },
  { race: 3, no: 8, name: 'YARIŞ KRALİÇESİ' },
  { race: 4, no: 2, name: 'HYPER ROCKER' },
  { race: 5, no: 3, name: 'DOLCE MARE' },
  { race: 6, no: 1, name: 'GÖK BERK' }
];

console.log('--- ADANA 1. 6LI PURE ALGORITHM RUN (540 TL / SINGLE_BANKO) ---');
let caughtCount = 0;
officialWinners.forEach((w, i) => {
  const found = containerHtml.includes(w.name);
  if (found) caughtCount++;
  console.log('Ayak ' + (i+1) + ' (Koşu ' + w.race + '): ' + w.no + ' ' + w.name + ' in pure coupon?: ' + (found ? '✅ EVET' : '❌ HAYIR'));
});
console.log('Total hits:', caughtCount + '/6');
