const fs = require('fs');
const s = fs.readFileSync('public/index.html', 'utf8');
const idx = s.indexOf('picked-horses-list');
console.log(s.slice(idx - 1500, idx + 100));
