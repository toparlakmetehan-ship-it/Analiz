const fs = require('fs');

const html = fs.readFileSync('public/index.html', 'utf8');
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
let jsCode = html.substring(scriptStart + 8, scriptEnd);

global.window = { scrollTo: () => {}, addEventListener: () => {} };
global.navigator = { serviceWorker: { register: () => Promise.resolve() } };
global.localStorage = { getItem: () => null, setItem: () => {} };

const tutanJson = JSON.parse(fs.readFileSync('public/data/tutan_altililar.json', 'utf8'));

let summaryHtml = '';
let cardsHtml = '';
global.document = {
  addEventListener: () => {},
  getElementById: (id) => {
    if (id === 'winners-summary-grid') return { get innerHTML() { return summaryHtml; }, set innerHTML(v) { summaryHtml = v; } };
    if (id === 'winners-cards-container') return { get innerHTML() { return cardsHtml; }, set innerHTML(v) { cardsHtml = v; } };
    return { classList: { add: () => {}, remove: () => {} }, appendChild: () => {}, style: {} };
  },
  querySelectorAll: () => [],
  createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} })
};

global.fetch = () => Promise.resolve({ json: () => Promise.resolve(tutanJson) });

const runner = `
tutanAltililarCache = ${JSON.stringify(tutanJson)};
renderWinnersView('ALL');
console.log('summaryHtml length:', summaryHtml.length);
console.log('cardsHtml length:', cardsHtml.length);
console.log('SUCCESS! renderWinnersView ran with zero errors.');
`;

eval(jsCode + '\n' + runner);
