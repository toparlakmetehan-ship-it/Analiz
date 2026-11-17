const fs = require('fs');
const s = fs.readFileSync('public/index.html', 'utf8');
const idx = s.indexOf('picked-horses-list');
console.log('picked-horses-list idx:', idx);
console.log(s.slice(idx, idx + 2000));
