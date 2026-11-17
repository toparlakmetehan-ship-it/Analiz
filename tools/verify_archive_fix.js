const fs = require('fs');
const vm = require('vm');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const jsCode = scriptMatch[1];

const bultenNov15 = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'bulten_2026_11_15.json'), 'utf8'));
const backtestArchive = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'backtest_archive.json'), 'utf8'));

const dom = {
  elements: {
    'robot-hipodrom-select': { value: '1', options: [{ value: '0', text: 'İstanbul' }, { value: '1', text: 'Adana' }], appendChild: ()=>{} },
    'budget-amount': { value: '3240' },
    'optimized-coupon-container': { innerHTML: '', scrollIntoView: ()=>{} },
    'altili-package-pills': { innerHTML: '', appendChild: ()=>{} }
  },
  getElementById(id) {
    if (!this.elements[id]) {
      this.elements[id] = { value: '', innerText: '', innerHTML: '', style: {}, classList: { add: ()=>{}, remove: ()=>{}, toggle: ()=>{} }, appendChild: ()=>{} };
    }
    return this.elements[id];
  },
  createElement(tag) {
    return { value: '', innerText: '', innerHTML: '', style: {}, classList: { add: ()=>{}, remove: ()=>{}, toggle: ()=>{} }, appendChild: ()=>{} };
  },
  querySelectorAll: () => []
};

const sandbox = {
  document: dom,
  window: { addEventListener: ()=>{}, scrollTo: ()=>{} },
  navigator: { serviceWorker: { register: ()=>Promise.resolve(), addEventListener: ()=>{} } },
  fetch: (url) => {
    if (url.includes('bulten_2026_11_15.json')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(JSON.parse(JSON.stringify(bultenNov15))) });
    }
    if (url.includes('backtest_archive.json')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve(JSON.parse(JSON.stringify(backtestArchive))) });
    }
    return Promise.resolve({ ok: false });
  },
  console,
  setTimeout: ()=>{}, setInterval: ()=>{}
};

vm.createContext(sandbox);
vm.runInContext(jsCode, sandbox);

async function test() {
  console.log('--- TEST 1: switchRobotProgramDate(\'2026-11-15\') ---');
  await vm.runInContext('switchRobotProgramDate("2026-11-15")', sandbox);

  const bultenLoaded = vm.runInContext('bulten', sandbox);
  console.log('Bulten loaded tarih:', bultenLoaded.tarih);
  console.log('Hipodroms count:', bultenLoaded.hipodromlar.length);
  const adana = bultenLoaded.hipodromlar.find(h => (h.sehir || h.isim || '').toLowerCase().includes('adana'));
  console.log('Adana kosular count (should be 8):', adana.kosular.length);

  const adanaIdx = bultenNov15.hipodromlar.findIndex(h => (h.sehir || h.isim || '').toLowerCase().includes('adana'));
  dom.elements['robot-hipodrom-select'].value = String(adanaIdx);

  console.log('\n--- TEST 2: Adana 2. 6\'lı @ 3240 TL with CHAMPION_5YEAR ---');
  vm.runInContext('selectAltiliPackage(2)', sandbox);
  vm.runInContext('setPick6Strategy("CHAMPION_5YEAR")', sandbox);
  vm.runInContext('setBudget(3240)', sandbox);

  const couponHtml2 = dom.elements['optimized-coupon-container'].innerHTML;
  const mathMatch2 = couponHtml2.match(/Hedef:\s*(\d+)\s*₺\s*\|\s*Hesaplanan:\s*([\d\.]+)\s*₺/);
  console.log('Coupon 2 Math:', mathMatch2 ? mathMatch2[0] : 'No match');

  // Check if winners are in coupon 2
  const adana2Winners = [
    { leg: 1, race: 3, name: 'YARIŞ KRALİÇESİ' },
    { leg: 2, race: 4, name: 'HYPER ROCKER' },
    { leg: 3, race: 5, name: 'DOLCE MARE' },
    { leg: 4, race: 6, name: 'GÖK BERK' },
    { leg: 5, race: 7, name: 'LADY TATMAR' },
    { leg: 6, race: 8, name: 'GENGAR' }
  ];

  let c2Hits = 0;
  adana2Winners.forEach(w => {
    const present = couponHtml2.includes(w.name);
    console.log(`Leg ${w.leg} (${w.name}): ${present ? '✅ VAR' : '❌ YOK'}`);
    if (present) c2Hits++;
  });
  console.log(`Adana 2. 6'lı Total Hits: ${c2Hits}/6`);

  console.log('\n--- TEST 3: Adana 1. 6\'lı @ 540 TL with SINGLE_BANKO ---');
  vm.runInContext('selectAltiliPackage(1)', sandbox);
  vm.runInContext('setPick6Strategy("SINGLE_BANKO")', sandbox);
  vm.runInContext('setBudget(540)', sandbox);

  const couponHtml1 = dom.elements['optimized-coupon-container'].innerHTML;
  const mathMatch1 = couponHtml1.match(/Hedef:\s*(\d+)\s*₺\s*\|\s*Hesaplanan:\s*([\d\.]+)\s*₺/);
  console.log('Coupon 1 Math:', mathMatch1 ? mathMatch1[0] : 'No match');

  const adana1Winners = [
    { leg: 1, race: 1, name: 'ŞAHKAYA' },
    { leg: 2, race: 2, name: 'THUNDERSTRUCK' },
    { leg: 3, race: 3, name: 'YARIŞ KRALİÇESİ' },
    { leg: 4, race: 4, name: 'HYPER ROCKER' },
    { leg: 5, race: 5, name: 'DOLCE MARE' },
    { leg: 6, race: 6, name: 'GÖK BERK' }
  ];

  let c1Hits = 0;
  adana1Winners.forEach(w => {
    const present = couponHtml1.includes(w.name);
    console.log(`Leg ${w.leg} (${w.name}): ${present ? '✅ VAR' : '❌ YOK'}`);
    if (present) c1Hits++;
  });
  console.log(`Adana 1. 6'lı Total Hits: ${c1Hits}/6`);
}

test().catch(console.error);
