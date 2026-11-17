const fs = require('fs');
const bulten = JSON.parse(fs.readFileSync('public/data/bulten_2026_11_15.json', 'utf8'));
const adana = bulten.hipodromlar.find(h => (h.sehir || h.isim || '').toLowerCase().includes('adana'));
console.log('Adana kosu count:', adana.kosular.length);
adana.kosular.forEach(k => {
  console.log(`Kosu ${k.kosuNo}: pist=${k.pist}, mesafe=${k.mesafe}, sinif=${k.grup_sinifi || k.kosuTuru}, atlar=${k.atlar.length}`);
  k.atlar.slice(0, 4).forEach(a => {
    console.log(`   #${a.no} ${a.isim}: royalScore=${a.royalScore}, puan=${a.puan}`);
  });
});
