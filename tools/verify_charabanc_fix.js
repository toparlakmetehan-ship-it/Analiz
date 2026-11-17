const bulten = require('../public/data/bulten_bugun.json');
const charabanc = bulten.hipodromlar[0].kosular[5].atlar[0];
console.log('CHARABANC isim:', charabanc.isim);
console.log('CHARABANC stili:', charabanc.kosu_stili);
console.log('CHARABANC ikon:', charabanc.stil_ikon);
console.log('CHARABANC taktik:', charabanc.taktik_yorum);
