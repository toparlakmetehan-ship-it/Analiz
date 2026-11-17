const fs = require('fs');
const s = fs.readFileSync('public/index.html', 'utf8');
const idx = s.indexOf('picked-horses-list');
const nextIdx = s.indexOf('picked-horses-list', idx + 1);
console.log('Next idx:', nextIdx);
console.log(s.slice(nextIdx - 500, nextIdx + 1500));
