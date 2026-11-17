const fs = require('fs');

const bultenBugun = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));
const html = fs.readFileSync('public/index.html', 'utf8');
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
let jsCode = html.substring(scriptStart + 8, scriptEnd);

let renderedHtml = '';
global.window = { scrollTo: () => {}, addEventListener: () => {} };
global.navigator = { serviceWorker: { register: () => Promise.resolve() } };
global.localStorage = { getItem: () => null, setItem: () => {} };

let mockBudget = '3240';
let mockHipIdx = '1';

global.document = {
  addEventListener: () => {},
  getElementById: (id) => {
    if (id === 'budget-amount') return { value: mockBudget };
    if (id === 'robot-hipodrom-select') return { value: mockHipIdx, options: [{ text: 'Adana' }] };
    if (id === 'optimized-coupon-container') return {
      set innerHTML(val) { renderedHtml = val; },
      get innerHTML() { return renderedHtml; }
    };
    return {
      value: '',
      innerHTML: '',
      classList: { add: () => {}, remove: () => {} },
      appendChild: () => {},
      style: {}
    };
  },
  querySelectorAll: () => [],
  createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} })
};

eval(jsCode + '; bulten = bultenBugun;');

currentAltiliPackage = 2;
currentPick6Strategy = 'CHAMPION_5YEAR';
mockBudget = '3240';
optimizeCoupon();

// Print each leg box from renderedHtml
const legBlocks = renderedHtml.split('class="leg-box');
legBlocks.slice(1).forEach((block, i) => {
  const headerMatch = block.match(/<span>(\d+\.\s*AYAK[^\<]+)<\/span>/);
  const horses = [];
  const horseRegex = /class="p-no">(\d+)<\/span>\s*<span class="p-name">([^<]+)/g;
  let m;
  while ((m = horseRegex.exec(block)) !== null) {
    horses.push(`${m[1]} ${m[2].trim()}`);
  }
  console.log(`Ayak ${i + 1} (${headerMatch ? headerMatch[1] : ''}): ${horses.join(' | ')}`);
});
