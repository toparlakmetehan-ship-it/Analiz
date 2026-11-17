const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
let jsCode = scriptMatch[1];

const dom = {
  elements: {},
  createElement(tag) {
    return {
      tagName: tag,
      className: '',
      innerHTML: '',
      style: {},
      classList: { add: () => {}, remove: () => {}, toggle: () => {} },
      appendChild: () => {},
      setAttribute: () => {},
      addEventListener: () => {}
    };
  },
  getElementById(id) {
    if (!this.elements[id]) {
      this.elements[id] = {
        value: '',
        innerText: '',
        innerHTML: '',
        style: {},
        classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
        querySelectorAll: () => [],
        appendChild: () => {},
        scrollIntoView: () => {},
        options: [
          { text: 'Ankara Hipodromu (9 koşu)' },
          { text: 'İzmir Hipodromu (8 koşu)' },
          { text: 'Diyarbakır Hipodromu (6 koşu)' }
        ],
        selectedIndex: 0
      };
    }
    return this.elements[id];
  },
  querySelectorAll: () => []
};

const sandbox = {
  document: dom,
  window: { addEventListener: () => {}, scrollTo: () => {} },
  navigator: { serviceWorker: { register: () => Promise.resolve(), addEventListener: () => {} } },
  console: console,
  setTimeout: () => {},
  setInterval: () => {},
  fetch: (url) => {
    if (url.includes('backtest_archive.json')) {
      const arc = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'backtest_archive.json'), 'utf8'));
      return Promise.resolve({ ok: true, json: () => Promise.resolve(arc) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  },
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

// Load tutan_altililar.json
const tutanData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'tutan_altililar.json'), 'utf8'));
vm.runInContext('tutanAltililarCache = ' + JSON.stringify(tutanData), sandbox);

// Test loadWinningCouponToRobot for tutan-2026-11-14-ankara-2
const ankaraCoupon = tutanData.tutanKuponlar.find(k => k.id === 'tutan-2026-11-14-ankara-2');
console.log('Testing Ankara coupon:', ankaraCoupon.id, ankaraCoupon.sehir);

async function run() {
  await vm.runInContext(`loadWinningCouponToRobot('tutan-2026-11-14-ankara-2', 'CHAMPION_5YEAR')`, sandbox);

  const cardHtml = dom.getElementById('optimized-coupon-container').innerHTML;
  console.log('Ankara Card rendered HTML length:', cardHtml.length);
  const costMatch = cardHtml.match(/Hesaplanan:\s*([\d\.,]+)\s*₺/);
  console.log('Rendered Cost in card:', costMatch ? costMatch[0] : 'Not found');
  const hedefMatch = cardHtml.match(/Hedef:\s*([\d\.,]+)\s*₺/);
  console.log('Rendered Hedef in card:', hedefMatch ? hedefMatch[0] : 'Not found');

  // Check if any undefined is present in the rendered HTML
  const hasUndefined = cardHtml.includes('undefined');
  console.log('Contains undefined?:', hasUndefined ? '❌ YES (BUG)' : '✅ NO (CLEAN)');

  // Verify winners
  const winners = [
    'GOLDEN PROMISE',
    'MIZMIZ MYRTLE',
    'HAROLDCOOPER',
    'LUPELIUS',
    'SEYRAN HANIM',
    'KATICESUR'
  ];

  let foundWinners = 0;
  winners.forEach(w => {
    const present = cardHtml.includes(w);
    if (present) foundWinners++;
    console.log(`- Winner ${w}: ${present ? '✅ VAR' : '❌ YOK'}`);
  });

  console.log(`Winning horses verified: ${foundWinners}/${winners.length}`);
}

run().catch(console.error);
