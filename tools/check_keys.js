const fs = require('fs');
const bulten = JSON.parse(fs.readFileSync('public/data/bulten_2026_11_15.json', 'utf8'));
const adana = bulten.hipodromlar.find(h => (h.sehir || h.isim || '').toLowerCase().includes('adana'));
console.log('Adana race 0 keys:', Object.keys(adana.kosular[0]));
console.log('Adana race 0 horse 0:', adana.kosular[0].atlar[0]);
