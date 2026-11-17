const fs = require('fs');
const path = require('path');

const bugunPath = path.join(__dirname, '..', 'public', 'data', 'bulten_bugun.json');
const bugun = JSON.parse(fs.readFileSync(bugunPath, 'utf8'));
const bursa = bugun.hipodromlar.find(h => (h.sehir || h.isim || '').toLowerCase().includes('bursa'));

console.log('Testing Bursa 6li Robot with 10 horses in Race 4...');
// Bursa has 7 races. Race 1 is Altili Disi. Races 2-7 are the 6'li Ganyan.
const altiliLegs = bursa.kosular.slice(1, 7);
console.log('Altili legs count:', altiliLegs.length);
altiliLegs.forEach((k, idx) => {
  console.log(`Ayak ${idx + 1} (Koşu ${k.kosu_no}): ${k.atlar.length} at - ${k.grup_sinifi}`);
});

const race4Leg = altiliLegs[2]; // 3. Ayak
console.log('\n3. Ayak (4. Koşu) Atları:');
race4Leg.atlar.forEach(a => {
  console.log(`  #${a.no} ${a.isim} (${a.jokey}) - Stil: ${a.kosu_stili} ${a.stil_ikon} - HP: ${a.handikap_puani}`);
});
