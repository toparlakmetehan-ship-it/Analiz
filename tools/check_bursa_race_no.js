const fs = require('fs');
const b = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));
const bursa = b.hipodromlar[0];
bursa.kosular.forEach((k, i) => {
  console.log(`Race index ${i}: id=${k.id}, kosuNo=${k.kosuNo}, saat=${k.saat}`);
});
