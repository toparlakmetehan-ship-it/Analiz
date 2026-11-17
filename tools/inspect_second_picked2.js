const fs = require('fs');
const s = fs.readFileSync('public/index.html', 'utf8');
const nextIdx = 249621;
console.log(s.slice(nextIdx + 1000, nextIdx + 2000));
