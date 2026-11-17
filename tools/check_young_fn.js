const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n');
for (let i = 3040; i <= 3070; i++) {
  console.log(i, lines[i-1]);
}
