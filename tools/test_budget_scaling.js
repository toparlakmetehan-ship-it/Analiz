const fs = require('fs');

const html = fs.readFileSync('public/index.html', 'utf8');
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
let jsCode = html.substring(scriptStart + 8, scriptEnd);

global.window = { scrollTo: () => {}, addEventListener: () => {} };
global.navigator = { serviceWorker: { register: () => Promise.resolve() } };
global.localStorage = { getItem: () => null, setItem: () => {} };

const bultenBugun = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));

let currentTestBudget = '300';
let lastHtml = '';
global.document = {
  addEventListener: () => {},
  getElementById: (id) => ({
    value: id === 'budget-amount' ? currentTestBudget : (id === 'robot-hipodrom-select' ? '1' : ''),
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
currentAltiliPackage = 2; // Adana 2. 6'lı

console.log('=== ADANA 2. 6LI BÜTÇE VE STRATEJİ KARŞILAŞTIRMASI ===\\n');

[300, 600, 1200, 3240].forEach(b => {
  currentTestBudget = String(b);
  ['SINGLE_BANKO', 'CHAMPION_5YEAR', 'MAX_ACCURACY'].forEach(strat => {
    currentPick6Strategy = strat;
    optimizeCoupon();
    
    // Check if Hyper Rocker is in Leg 2
    const reLeg2 = /2\\. AYAK \\(4\\. Koşu\\)[\\s\\S]*?<span[^>]*>([0-9]+) Safkan<\\/span>[\\s\\S]*?<div class=\"picked-horses-list\">([\\s\\S]*?)<\\/div>\\s*<\\/div>/;
    const m2 = reLeg2.exec(lastHtml);
    const count = m2 ? m2[1] : '?';
    const names = m2 ? (m2[2].match(/<span class=\"p-name\">([^<]+)/g) || []).map(s => s.replace('<span class=\"p-name\">', '').trim()) : [];
    const hasHyper = names.some(n => n.includes('HYPER ROCKER'));
    const isSingle = count === '1';

    const costMatch = lastHtml.match(/<div class=\"c-stat-cost\">[\\s\\S]*?<div class=\"v\">([^<]+)/);
    const cost = costMatch ? costMatch[1].trim() : '?';

    console.log('Hedef: ' + b + ' ₺ | Strateji: ' + strat.padEnd(14) + ' | Kupon: ' + cost.padEnd(10) + ' | 2. Ayak (Hyper Rocker): ' + (isSingle ? '★ TEK (' + names[0] + ')' : count + ' At (' + names.join(', ') + ')'));
  });
  console.log('');
});
`;

eval(jsCode + '\n' + runner);
