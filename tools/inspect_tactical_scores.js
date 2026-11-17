const fs = require('fs');
const s = fs.readFileSync('public/index.html', 'utf8');
const idx = s.indexOf('function getHorsesWithFinalTacticalScores');
console.log(s.slice(idx, idx + 2000));
