const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n');
for (let i = 1885; i <= 1905; i++) {
  console.log(i, lines[i-1]);
}
