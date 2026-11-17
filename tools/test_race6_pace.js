const fs = require('fs');
const bulten = require('../public/data/bulten_bugun.json');

const race6 = bulten.hipodromlar[0].kosular[5];
console.log('İstanbul Race 6:', race6.kosu_adi, race6.mesafe, race6.pist);

race6.atlar.forEach(a => {
  console.log(`#${a.no} ${a.isim.padEnd(20)} | Stil: ${a.kosu_stili} ${a.stil_ikon} | Taktik: ${a.taktik_yorum}`);
});
