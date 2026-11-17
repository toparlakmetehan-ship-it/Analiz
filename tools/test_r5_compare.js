const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf-8');
const b = require('../public/data/bulten_bugun.json');

// Let's inspect race 5 (Speed Queen's race) and see what happens to the rankings!
const hip = b.hipodromlar.find(h => h.sehir === 'İstanbul');
const r5 = hip.kosular[4]; // Race 5 (İstanbul K5)

console.log('--- ISTANBUL RACE 5 COMPARISON ---');
r5.atlar.forEach(a => {
  // Let's compute base power with:
  // Model A (Current): 28, 22, 12, 9, 8, 8, 6, 4, 3
  // Model B (Calibrated): 26, 20, 14, 9, 8, 7, 9, 4, 3
  console.log(a.no, a.isim, a.kosu_stili, 'Handikap:', a.handikap_puani, 'Jokey:', a.jokey);
});
