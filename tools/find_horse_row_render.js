const fs = require('fs');
const s = fs.readFileSync('public/index.html', 'utf8');

// Find where horse rows are generated in optimizeCoupon
const idx = s.indexOf('function optimizeCoupon');
const sub = s.slice(idx, idx + 15000);
const lines = sub.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('horse-pick-row') || lines[i].includes('+EV') || lines[i].includes('BOMBA') || lines[i].includes('P -') || lines[i].includes('P +') || lines[i].includes('royalScore')) {
    console.log(`${i}: ${lines[i]}`);
  }
}
