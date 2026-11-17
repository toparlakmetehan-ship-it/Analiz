const fs = require('fs');
const path = require('path');

const bugunPath = path.join(__dirname, '..', 'public', 'data', 'bulten_bugun.json');
const data = JSON.parse(fs.readFileSync(bugunPath, 'utf8'));
const bursa = data.hipodromlar.find(h => (h.sehir || h.isim || '').toLowerCase().includes('bursa'));
console.log('Sample horse 0 in race 4:');
console.log(JSON.stringify(bursa.kosular[3].atlar[0], null, 2));
