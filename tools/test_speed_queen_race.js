const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf-8');
const b = require('../public/data/bulten_bugun.json');

const pIndexMatch = html.match(/function calculatePowerIndex[\s\S]*?\n\}/);
const pAdjMatch = html.match(/function calculatePaceAdjustment[\s\S]*?\n\}/);
const pEstMatch = html.match(/function estimateRacePace[\s\S]*?\n\}/);
const pYoungMatch = html.match(/function isYoungInexperiencedHorse[\s\S]*?\n\}/);

const fn = new Function('b', pYoungMatch[0] + '\n' + pEstMatch[0] + '\n' + pIndexMatch[0] + '\n' + pAdjMatch[0] + '\n' + `
  const hip = b.hipodromlar.find(h => h.sehir === 'İstanbul');
  let sqRace;
  hip.kosular.forEach(k => {
    if (k.atlar.some(a => a.isim === 'SPEED QUEEN')) sqRace = k;
  });
  console.log('Race pace estimate:', estimateRacePace(sqRace));
  sqRace.atlar.forEach(a => {
    const power = calculatePowerIndex(a, sqRace.atlar);
    const adj = calculatePaceAdjustment(a, sqRace);
    console.log(a.no, a.isim, a.kosu_stili, 'Base:', power.royalScore, 'Adj:', adj.delta, adj.label);
  });
`);
fn(b);
