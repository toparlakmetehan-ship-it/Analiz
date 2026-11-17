const fs = require('fs');
const s = fs.readFileSync('public/index.html', 'utf8');
const idx = s.indexOf('Second idx: 98796') !== -1 ? 98796 : s.indexOf('RESMÎ TUTAN 6\'LI GANYAN KUPONU');
console.log(s.slice(idx, idx + 4000));
