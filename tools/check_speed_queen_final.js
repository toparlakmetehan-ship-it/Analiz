const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf-8');
const b = require('../public/data/bulten_bugun.json');

const pIndexMatch = html.match(/function calculatePowerIndex[\s\S]*?\n\}/);
const pAdjMatch = html.match(/function calculatePaceAdjustment[\s\S]*?\n\}/);
const pEstMatch = html.match(/function estimateRacePace[\s\S]*?\n\}/);
const pYoungMatch = html.match(/function isYoungInexperiencedHorse[\s\S]*?\n\}/);

const fn = new Function('b', pYoungMatch[0] + '\n' + pEstMatch[0] + '\n' + pIndexMatch[0] + '\n' + pAdjMatch[0] + '\n' + `
  const hip = b.hipodromlar.find(h => h.sehir === 'İstanbul');
  const r5 = hip.kosular[4];
  const sq = r5.atlar.find(a => a.isim === 'SPEED QUEEN');
  const power = calculatePowerIndex(sq, r5.atlar);
  const adj = calculatePaceAdjustment(sq, r5);
  console.log('SPEED QUEEN:');
  console.log('Base:', power.royalScore);
  console.log('Pace Delta:', adj.delta);
  console.log('Pace Label:', adj.label);
  console.log('Final Score:', power.royalScore + adj.delta);
`);
fn(b);
