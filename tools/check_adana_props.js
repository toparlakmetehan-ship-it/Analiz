const fs = require('fs');

const bulten = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));
const adana = bulten.hipodromlar.find(h => (h.isim || h.sehir).toLowerCase().includes('adana'));

console.log('Kosu keys:', Object.keys(adana.kosular[0]));
console.log('Horse keys:', Object.keys(adana.kosular[0].atlar[0]));
console.log('Sample horse:', adana.kosular[0].atlar[0]);
