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

const testRunner = `
bulten = bultenData;
currentAltiliPackage = 1; // 1. 6'lı Ganyan
currentPick6Strategy = 'CHAMPION_5YEAR';
optimizeCoupon();
fs.writeFileSync('tools/coupon_output_pkg1.html', lastHtml, 'utf8');

currentAltiliPackage = 2; // 2. 6'lı Ganyan
currentPick6Strategy = 'SINGLE_BANKO';
optimizeCoupon();
fs.writeFileSync('tools/coupon_output_pkg2.html', lastHtml, 'utf8');

console.log('Saved coupon outputs to files.');
`;

eval(jsCode + '\n' + testRunner);
