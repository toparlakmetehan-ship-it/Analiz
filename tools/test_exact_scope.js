const fs = require('fs');

const html = fs.readFileSync('public/index.html', 'utf8');
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
let jsCode = html.substring(scriptStart + 8, scriptEnd);

const bultenBugun = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));
const bultenYarin = JSON.parse(fs.readFileSync('public/data/bulten_yarin.json', 'utf8'));

global.window = { scrollTo: () => {}, addEventListener: () => {} };
global.navigator = { serviceWorker: { register: () => Promise.resolve() } };
global.localStorage = { getItem: () => null, setItem: () => {} };

let lastHtml = '';
global.document = {
  addEventListener: () => {},
  getElementById: (id) => ({
    value: id === 'budget-amount' ? '300' : '0',
    get innerHTML() { return lastHtml; },
    set innerHTML(v) { lastHtml = v; },
    classList: { add: () => {}, remove: () => {} },
    appendChild: () => {}
  }),
  querySelectorAll: () => [],
  createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} })
};

// Add test runner function
const harness = `
function runAuditSuite() {
  const tracks = [
    { name: 'İstanbul 1. 6lı', data: bultenTodayData, hip: 0, pkg: 1 },
    { name: 'İstanbul 2. 6lı', data: bultenTodayData, hip: 0, pkg: 2 },
    { name: 'Adana 1. 6lı', data: bultenTodayData, hip: 1, pkg: 1 },
    { name: 'Adana 2. 6lı', data: bultenTodayData, hip: 1, pkg: 2 },
    { name: 'Bursa 1. 6lı (Yarın)', data: bultenTomorrowData, hip: 0, pkg: 1 }
  ];
  const strats = ['CHAMPION_5YEAR', 'MAX_ACCURACY', 'SINGLE_BANKO', 'MULTI_COVER'];

  tracks.forEach(t => {
    bulten = t.data;
    currentAltiliPackage = t.pkg;
    document.getElementById = (id) => ({
      value: id === 'budget-amount' ? '300' : String(t.hip),
      get innerHTML() { return lastHtml; },
      set innerHTML(v) { lastHtml = v; },
      classList: { add: () => {}, remove: () => {} },
      appendChild: () => {}
    });

    strats.forEach(s => {
      currentPick6Strategy = s;
      optimizeCoupon();
      if (!lastHtml.includes('custom-coupon-card')) throw new Error('No card generated for ' + t.name + ' ' + s);
      console.log('✅ ' + t.name + ' | ' + s + ' -> Başarılı! (Boyut: ' + lastHtml.length + ' karakter)');
    });
  });
}
`;

global.bultenTodayData = bultenBugun;
global.bultenTomorrowData = bultenYarin;

eval(jsCode + '\n' + harness + '\nrunAuditSuite();');

console.log('🎉 BÜTÜN PİSTLER VE BÜTÜN 5 YILLIK ŞAMPİYON KURGULARI %100 BAŞARIYLA ÇALIŞTI!');
