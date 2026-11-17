const fs = require('fs');
const path = require('path');

const bugunPath = path.join(__dirname, '..', 'public', 'data', 'bulten_bugun.json');
const data = JSON.parse(fs.readFileSync(bugunPath, 'utf8'));
const bursa = data.hipodromlar.find(h => (h.sehir || h.isim || '').toLowerCase().includes('bursa'));

console.log('Bursa hipodrom found:', !!bursa);
console.log('Bursa races count:', bursa.kosular.length);
console.log('Race 4 info:', {
  kosu_no: bursa.kosular[3].kosu_no,
  saat: bursa.kosular[3].saat,
  grup_sinifi: bursa.kosular[3].grup_sinifi,
  pist: bursa.kosular[3].pist,
  mesafe: bursa.kosular[3].mesafe,
  atlar_count: bursa.kosular[3].atlar.length
});
