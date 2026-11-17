const fs = require('fs');
const bb = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));
const by = JSON.parse(fs.readFileSync('public/data/bulten_yarin.json', 'utf8'));

console.log("bulten_bugun tarih:", bb.tarih, "hipodromlar:", bb.hipodromlar?.map(h => `${h.sehir} (${h.kosular?.length} koşu)`));
console.log("bulten_yarin tarih:", by.tarih, "hipodromlar:", by.hipodromlar?.map(h => `${h.sehir} (${h.kosular?.length} koşu)`));
