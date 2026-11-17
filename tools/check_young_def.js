const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('function isYoungInexperiencedHorse')) {
    for (let j = i; j <= i + 35; j++) {
      console.log(j + 1, lines[j]);
    }
  }
});
