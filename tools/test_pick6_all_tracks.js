const fs = require('fs');

console.log('=== VERIFYING SYNTAX AND RUNTIME OF 5-YEAR CHAMPION PICK-6 MODEL ===');

const html = fs.readFileSync('public/index.html', 'utf8');

const scriptStart = html.indexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');

if (scriptStart === -1 || scriptEnd === -1) {
  console.error('Script tags not found in index.html');
  process.exit(1);
}

const jsCode = html.substring(scriptStart + 8, scriptEnd);
console.log('Script code length:', jsCode.length);

// Mock browser globals
global.window = {
  scrollTo: () => {},
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.navigator = {
  serviceWorker: { register: () => Promise.resolve() }
};
global.localStorage = {
  getItem: () => null,
  setItem: () => {}
};
global.document = {
  addEventListener: () => {},
  getElementById: (id) => {
    return {
      value: id === 'budget-amount' ? '300' : (id === 'robot-hipodrom-select' ? '0' : ''),
      innerText: '',
      innerHTML: '',
      classList: {
        add: () => {},
        remove: () => {}
      },
      appendChild: () => {},
      querySelectorAll: () => []
    };
  },
  querySelectorAll: () => [],
  createElement: () => ({
    className: '',
    innerHTML: '',
    innerText: '',
    style: {},
    appendChild: () => {},
    setAttribute: () => {}
  })
};

try {
  eval(jsCode);
  console.log('✅ index.html JavaScript compiled & evaluated successfully with NO errors!');
} catch (e) {
  console.error('❌ Evaluation error in index.html:', e);
  process.exit(1);
}

// Load bulten data
const bultenBugun = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));
const bultenYarin = JSON.parse(fs.readFileSync('public/data/bulten_yarin.json', 'utf8'));

// Test optimizeCoupon on each track and package
const testScenarios = [
  { name: 'İstanbul 1. 6lı', data: bultenBugun, hipIdx: 0, pkg: 1 },
  { name: 'İstanbul 2. 6lı', data: bultenBugun, hipIdx: 0, pkg: 2 },
  { name: 'Adana 1. 6lı', data: bultenBugun, hipIdx: 1, pkg: 1 },
  { name: 'Adana 2. 6lı', data: bultenBugun, hipIdx: 1, pkg: 2 },
  { name: 'Bursa 1. 6lı (Yarın)', data: bultenYarin, hipIdx: 0, pkg: 1 }
];

const strategies = ['CHAMPION_5YEAR', 'MAX_ACCURACY', 'SINGLE_BANKO', 'MULTI_COVER'];

testScenarios.forEach(sc => {
  global.bulten = sc.data;
  global.currentAltiliPackage = sc.pkg;
  let lastHtml = '';
  document.getElementById = (id) => {
    return {
      value: id === 'budget-amount' ? '300' : (id === 'robot-hipodrom-select' ? String(sc.hipIdx) : ''),
      innerText: '',
      get innerHTML() { return lastHtml; },
      set innerHTML(v) { lastHtml = v; },
      classList: { add: () => {}, remove: () => {} },
      appendChild: () => {}
    };
  };

  strategies.forEach(strat => {
    global.currentPick6Strategy = strat;
    try {
      optimizeCoupon();
      if (!lastHtml.includes('custom-coupon-card')) {
        throw new Error('custom-coupon-card not rendered in container!');
      }
      console.log(`✅ ${sc.name} | Strateji: ${strat} -> Başarılı! (Kart uzunluğu: ${lastHtml.length} karakter)`);
    } catch (err) {
      console.error(`❌ ${sc.name} | Strateji: ${strat} -> HATA:`, err);
      process.exit(1);
    }
  });
});

console.log('🎉 TÜM 5 YILLIK ŞAMPİYON MODEL SENARYOLARI KUSURSUZ ÇALIŞTI!');
