const fs = require('fs');

const html = fs.readFileSync('public/index.html', 'utf8');
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
let jsCode = html.substring(scriptStart + 8, scriptEnd);

global.window = { scrollTo: () => {}, addEventListener: () => {} };
global.navigator = { serviceWorker: { register: () => Promise.resolve() } };
global.localStorage = { getItem: () => null, setItem: () => {} };

const bultenBugun = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));

let lastHtml = '';
global.document = {
  addEventListener: () => {},
  getElementById: (id) => ({
    value: id === 'budget-amount' ? '3240' : (id === 'robot-hipodrom-select' ? '1' : ''),
    get innerHTML() { return lastHtml; },
    set innerHTML(v) { lastHtml = v; },
    classList: { add: () => {}, remove: () => {} },
    appendChild: () => {}
  }),
  querySelectorAll: () => [],
  createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} })
};

global.bultenData = bultenBugun;

const runner = `
bulten = bultenData;
currentAltiliPackage = 2; // Adana 2. 6'lı (Koşular 3-8)

console.log('=== TEST: ADANA 2. 6LI GANYAN (KOŞULAR 3-8) ===\\n');

['SINGLE_BANKO', 'CHAMPION_5YEAR', 'MAX_ACCURACY'].forEach(strat => {
  currentPick6Strategy = strat;
  optimizeCoupon();
  console.log('--- Strateji: ' + strat + ' (Bütçe: 3240 TL) ---');
  
  const reLeg = /([1-6])\\. AYAK \\(([0-9]+)\\. Koşu\\)[\\s\\S]*?<span[^>]*>([0-9]+) Safkan<\\/span>[\\s\\S]*?<div class=\"picked-horses-list\">([\\s\\S]*?)<\\/div>\\s*<\\/div>/g;
  let m;
  while ((m = reLeg.exec(lastHtml)) !== null) {
    const legNum = m[1];
    const raceNum = m[2];
    const count = m[3];
    const inner = m[4];
    const horseNames = (inner.match(/<span class=\"p-name\">([^<]+)/g) || []).map(s => s.replace('<span class=\"p-name\">', '').trim());
    console.log('  Ayak ' + legNum + ' (Kosu ' + raceNum + '): ' + count + ' At -> ' + horseNames.join(', '));
  }
  
  const costMatch = lastHtml.match(/<div class=\"c-stat-cost\">[\\s\\S]*?<div class=\"v\">([^<]+)/);
  if (costMatch) {
    console.log('  => Kupon Tutarı: ' + costMatch[1].trim());
  }
  console.log('');
});
`;

eval(jsCode + '\n' + runner);
