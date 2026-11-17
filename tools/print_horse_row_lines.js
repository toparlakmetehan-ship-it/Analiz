const fs = require('fs');
const s = fs.readFileSync('public/index.html', 'utf8');
const idx = s.indexOf('function optimizeCoupon');
const sub = s.slice(idx, idx + 15000);
const lines = sub.split('\n');
for (let i = 270; i < Math.min(lines.length, 335); i++) {
  console.log(`${i}: ${lines[i]}`);
}
