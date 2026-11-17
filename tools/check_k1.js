const fs = require('fs');
const bulten = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));
const adana = bulten.hipodromlar.find(h => h.sehir === 'Adana');
const k1 = adana.kosular[0];

const html = fs.readFileSync('public/index.html', 'utf8');
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
let jsCode = html.substring(scriptStart + 8, scriptEnd);

global.window = { scrollTo: () => {}, addEventListener: () => {} };
global.navigator = { serviceWorker: { register: () => Promise.resolve() } };
global.localStorage = { getItem: () => null, setItem: () => {} };
global.document = {
  addEventListener: () => {},
  getElementById: () => ({ value: '', innerHTML: '', classList: { add: () => {}, remove: () => {} } }),
  querySelectorAll: () => [],
  createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} })
};

eval(jsCode);

const scored = getHorsesWithFinalTacticalScores(k1);
console.log('--- ALL SCORED HORSES IN KOŞU 1 ---');
scored.forEach((h, i) => {
  console.log(`${i+1}. No: ${h.no} ${h.isim} | RoyalScore: ${h.royalScore} | AGF: ${h.agf_orani}% | Galop400: ${h.son_galop?.son400hiz}`);
});
