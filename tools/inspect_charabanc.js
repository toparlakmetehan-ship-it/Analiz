const fs = require('fs');
const bulten = require('../public/data/bulten_bugun.json');

const charabanc = bulten.hipodromlar[0].kosular[5].atlar.find(a => a.isim === 'CHARABANC');
console.log('CHARABANC object:', JSON.stringify(charabanc, null, 2));
