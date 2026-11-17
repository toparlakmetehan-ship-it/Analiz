const fs = require('fs');
const vm = require('vm');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const jsCode = scriptMatch[1];

const bultenBugun = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'bulten_bugun.json'), 'utf8'));
const bultenNov15 = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'bulten_2026_11_15.json'), 'utf8'));

const dom = {
  elements: {
    'robot-hipodrom-select': { value: '0', appendChild: ()=>{} },
    'budget-amount': { value: '300' },
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
  console,
  setTimeout: ()=>{}, setInterval: ()=>{}
};

vm.createContext(sandbox);
vm.runInContext(jsCode, sandbox);

console.log('=== TEST 1: BUGÜN BURSA (7 KOŞU - TEK 6\'LI 2. KOŞUDA BAŞLIYOR) ===');
vm.runInContext('bulten = ' + JSON.stringify(bultenBugun), sandbox);
vm.runInContext('currentHipIdx = 0', sandbox);
dom.elements['robot-hipodrom-select'].value = '0';
vm.runInContext('initRobotSelector()', sandbox);

const pkgsBursa = vm.runInContext('getHipodromAltiliPackages(bulten.hipodromlar[0])', sandbox);
console.log('Bursa Paket Sayısı:', pkgsBursa.length);
console.log('Bursa Paket 1:', {
  label: pkgsBursa[0].label,
  startRaceNum: pkgsBursa[0].startRaceNum,
  endRaceNum: pkgsBursa[0].endRaceNum,
  startIndex: pkgsBursa[0].startIndex,
  endIndex: pkgsBursa[0].endIndex
});

vm.runInContext('optimizeCoupon()', sandbox);
const couponBursa = dom.elements['optimized-coupon-container'].innerHTML;

// Check leg titles in Bursa coupon
const legHeaderMatches = couponBursa.match(/\d+\.\s*AYAK\s*\(\d+\.\s*Koşu\)/g);
console.log('Bursa Ayak Başlıkları:', legHeaderMatches);

console.log('\n=== TEST 2: 15 KASIM ADANA (8 KOŞU - 2 ADET 6\'LI) ===');
vm.runInContext('bulten = ' + JSON.stringify(bultenNov15), sandbox);
const adanaIdx = bultenNov15.hipodromlar.findIndex(h => (h.sehir || h.isim || '').toLowerCase().includes('adana'));
dom.elements['robot-hipodrom-select'].value = String(adanaIdx);
vm.runInContext(`currentHipIdx = ${adanaIdx}`, sandbox);
vm.runInContext('initRobotSelector()', sandbox);

const pkgsAdana = vm.runInContext(`getHipodromAltiliPackages(bulten.hipodromlar[${adanaIdx}])`, sandbox);
console.log('Adana Paket Sayısı:', pkgsAdana.length);
pkgsAdana.forEach(p => console.log(`   Paket ${p.pkgNum}: ${p.label}`));

// Paket 2'yi seç ve 3240 TL bütçe ile çalıştır
vm.runInContext('selectAltiliPackage(2)', sandbox);
vm.runInContext('setBudget(3240)', sandbox);
const couponAdana2 = dom.elements['optimized-coupon-container'].innerHTML;
const adana2Headers = couponAdana2.match(/\d+\.\s*AYAK\s*\(\d+\.\s*Koşu\)/g);
console.log('Adana 2. 6\'lı Ayak Başlıkları:', adana2Headers);
console.log('3240 TL Adana 2. 6\'lı Winner Check: Hyper Rocker ASİL BANKO var mı?:', couponAdana2.includes('HYPER ROCKER') && couponAdana2.includes('ASİL BANKO'));
