const fs = require('fs');
const b = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));
b.hipodromlar.forEach((h, i) => console.log(i, h.sehir, h.kosular.length));
