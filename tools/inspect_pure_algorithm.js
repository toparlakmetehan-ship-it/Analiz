const fs = require('fs');
const vm = require('vm');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const jsCode = scriptMatch[1];
const bultenNov15 = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'bulten_2026_11_15.json'), 'utf8'));

const dom = {
  elements: {
    'robot-hipodrom-select': { value: '0' },
    'budget-amount': { value: '3240' }
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
  console,
  setTimeout: ()=>{}, setInterval: ()=>{}
};

vm.createContext(sandbox);
vm.runInContext(jsCode, sandbox);
vm.runInContext('bulten = ' + JSON.stringify(bultenNov15), sandbox);

const hipIdx = bultenNov15.hipodromlar.findIndex(h => h.sehir.toLowerCase().includes('adana'));
dom.elements['robot-hipodrom-select'].value = String(hipIdx);
dom.elements['budget-amount'].value = '3240';

vm.runInContext('currentAltiliPackage = 2', sandbox);
vm.runInContext('currentPick6Strategy = "CHAMPION_5YEAR"', sandbox);
vm.runInContext('loadedWinningCoupon = null', sandbox);

sandbox.optimizeCoupon();

const containerHtml = dom.getElementById('optimized-coupon-container').innerHTML;

// Print all lines containing horse names
const lines = containerHtml.split('\n');
lines.forEach(line => {
  if (line.includes('class="p-name"') || line.includes('class="p-no"')) {
    console.log(line.trim().replace(/<[^>]+>/g, ' '));
  }
});
