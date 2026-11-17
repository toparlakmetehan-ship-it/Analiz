const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n');
console.log('=== LINES 1840 to 1870 ===');
for (let i = 1840; i <= 1870; i++) {
  console.log(i, lines[i-1]);
}
