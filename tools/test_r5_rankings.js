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
  const list = r5.atlar.map(a => {
    const power = calculatePowerIndex(a, r5.atlar);
    const adj = calculatePaceAdjustment(a, r5);
    return {
      no: a.no,
      name: a.isim,
      style: a.kosu_stili,
      handikap: a.handikap_puani,
      jokey: a.jokey,
      base: power.royalScore,
      adj: adj.delta,
      final: power.royalScore + adj.delta
    };
  }).sort((a,b) => b.final - a.final);
  console.log('CURRENT MODEL RANKING IN ISTANBUL RACE 5:');
  list.forEach((h, i) => {
    console.log(\`#\${i+1} [No \${h.no}] \${h.name} (\${h.style}) - Base: \${h.base} Adj: \${h.adj > 0 ? '+' + h.adj : h.adj} Final: \${h.final} (HP: \${h.handikap}, \${h.jokey})\`);
  });
`);
fn(b);
