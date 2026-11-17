const fs = require('fs');
const vm = require('vm');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const jsCode = scriptMatch[1];
const bultenNov15 = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'bulten_2026_11_15.json'), 'utf8'));

function runSimulation(strategy, budget) {
  const dom = {
    elements: {
      'robot-hipodrom-select': { value: '0' },
      'budget-amount': { value: String(budget) },
      'optimized-coupon-container': { innerHTML: '' }
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
  vm.runInContext('enrichBultenRunningStylesAndPace(bulten)', sandbox);

  const hipIdx = bultenNov15.hipodromlar.findIndex(h => h.sehir.toLowerCase().includes('adana'));
  dom.elements['robot-hipodrom-select'].value = String(hipIdx);
  dom.elements['budget-amount'].value = String(budget);

  vm.runInContext('currentAltiliPackage = 2', sandbox);
  vm.runInContext(`currentPick6Strategy = "${strategy}"`, sandbox);
  vm.runInContext('loadedWinningCoupon = null', sandbox);
  vm.runInContext('optimizeCoupon()', sandbox);

  const containerHtml = dom.elements['optimized-coupon-container'].innerHTML;
  
  // Extract legs and horses
  const legs = [];
  const legMatches = containerHtml.match(/<div class="leg-box[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g) || [];
  
  // Also extract calculated budget and header text
  const mathMatch = containerHtml.match(/Hedef:\s*(\d+)\s*₺\s*\|\s*Hesaplanan:\s*([\d\.]+)\s*₺/);
  const badgeMatch = containerHtml.match(/<div class="coupon-tag-badge">([^<]+)<\/div>/);

  return {
    strategy,
    budget,
    math: mathMatch ? { target: mathMatch[1], calculated: mathMatch[2] } : null,
    badge: badgeMatch ? badgeMatch[1] : null,
    htmlSnippet: containerHtml.slice(0, 400)
  };
}

console.log('CHAMPION_5YEAR @ 3240:');
console.log(runSimulation('CHAMPION_5YEAR', 3240));

console.log('MAX_ACCURACY @ 6480:');
console.log(runSimulation('MAX_ACCURACY', 6480));

console.log('MAX_ACCURACY @ 3240:');
console.log(runSimulation('MAX_ACCURACY', 3240));
