const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf-8');
const b = require('../public/data/bulten_bugun.json');

const pIndexMatch = html.match(/function calculatePowerIndex[\s\S]*?\n\}/);
const pAdjMatch = html.match(/function calculatePaceAdjustment[\s\S]*?\n\}/);
const pEstMatch = html.match(/function estimateRacePace[\s\S]*?\n\}/);
const pYoungMatch = html.match(/function isYoungInexperiencedHorse[\s\S]*?\n\}/);

if (!pIndexMatch || !pAdjMatch || !pEstMatch || !pYoungMatch) {
  console.log('Regex failed');
  process.exit(1);
}

const context = {
  b,
  console
};

const scriptCode = `
${pYoungMatch[0]}
${pEstMatch[0]}
${pIndexMatch[0]}
${pAdjMatch[0]}

let matches = [];
b.hipodromlar.forEach(hip => {
  hip.kosular.forEach(k => {
    k.atlar.forEach(a => {
      const power = calculatePowerIndex(a, k.atlar);
      const adj = calculatePaceAdjustment(a, k);
      if (adj.delta === -2) {
        matches.push({ sehir: hip.sehir, kosu: k.kosu_no, horse: a.isim, no: a.no, base: power.royalScore, final: power.royalScore + adj.delta, label: adj.label });
      }
    });
  });
});
console.log('Matches:', matches);
`;

const vm = require('vm');
vm.createContext(context);
vm.runInContext(scriptCode, context);
