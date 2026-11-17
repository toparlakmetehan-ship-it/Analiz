const fs = require('fs');
const s = fs.readFileSync('public/index.html', 'utf8');
const idx = s.indexOf('custom-coupon-card');
const secondIdx = s.indexOf('custom-coupon-card', idx + 1);
console.log('Second idx:', secondIdx);
console.log(s.slice(secondIdx, secondIdx + 2000));
