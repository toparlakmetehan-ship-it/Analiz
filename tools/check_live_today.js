const fs = require('fs');
const live = JSON.parse(fs.readFileSync('public/data/live_today_tjk.json', 'utf8'));
console.log('Tarih:', live.tarih);
live.hipodromlar.forEach(h => {
  console.log('Hipodrom:', h.isim || h.sehir, 'Koşu sayısı:', (h.kosular || []).length);
  if (h.ganyanSonuclari || h.ikramiyeler || h.bahisSonuclari) {
    console.log('  Bahis/Ganyan sonuçları var!');
  }
});
