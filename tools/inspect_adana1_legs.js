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

let mockBudget = '540';
let mockHipIdx = '1';

global.document = {
  addEventListener: () => {},
  getElementById: (id) => {
    if (id === 'budget-amount') return { value: mockBudget };
    if (id === 'robot-hipodrom-select') return { value: mockHipIdx, options: [{ text: 'İstanbul' }, { text: 'Adana' }] };
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

selectAltiliPackage(1);
currentPick6Strategy = 'SINGLE_BANKO';
mockBudget = '540';
optimizeCoupon();

const legBlocks = renderedHtml.split('class="leg-box');
legBlocks.slice(1).forEach((block, i) => {
  const horses = [];
  const horseRegex = /class="p-no">(\d+)<\/span>\s*<span class="p-name">([^<]+)/g;
  let m;
  while ((m = horseRegex.exec(block)) !== null) {
    horses.push(`${m[1]} ${m[2].trim()}`);
  }
  console.log(`Ayak ${i + 1} (${horses.length} at): ${horses.join(' | ')}`);
});
process.exit(0);
