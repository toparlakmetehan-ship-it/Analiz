const fs = require('fs');

const bultenBugun = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));

const html = fs.readFileSync('public/index.html', 'utf8');
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
let jsCode = html.substring(scriptStart + 8, scriptEnd);

global.window = { scrollTo: () => {}, addEventListener: () => {} };
global.navigator = { serviceWorker: { register: () => Promise.resolve() } };
global.localStorage = { getItem: () => null, setItem: () => {} };
global.document = {
  addEventListener: () => {},
  getElementById: (id) => ({
    value: id === 'budget-amount' ? '3240' : (id === 'robot-hipodrom-select' ? '1' : ''),
    innerHTML: '',
    classList: { add: () => {}, remove: () => {} },
    appendChild: () => {}
  }),
  querySelectorAll: () => [],
  createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} })
};

eval(jsCode);

bulten = bultenBugun;
const adana = bulten.hipodromlar.find(h => h.sehir === 'Adana');

console.log('=== REAL SCORES FROM INDEX.HTML FOR ADANA RACES 1 TO 8 ===');
adana.kosular.forEach(k => {
  const scored = getHorsesWithFinalTacticalScores(k);
  const diff = scored.length > 1 ? (scored[0].royalScore - scored[1].royalScore) : 25;
  console.log(`Koşu ${k.id} (${k.grup_sinifi || ''}): Top 1: ${scored[0].no} ${scored[0].isim} (${scored[0].royalScore}P), Top 2: ${scored[1]?.no} ${scored[1]?.isim} (${scored[1]?.royalScore}P) | Diff: ${diff}`);
  console.log('  Top 6:', scored.slice(0, 6).map(h => h.no + ' ' + h.isim + ' (' + h.royalScore + 'P)').join(', '));
});
