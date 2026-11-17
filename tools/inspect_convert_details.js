const fs = require('fs');
const s = fs.readFileSync('public/index.html', 'utf8');
const idx = s.indexOf('function convertArchiveToBulten');
console.log(s.slice(idx, idx + 1800));
