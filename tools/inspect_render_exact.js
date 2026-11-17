const fs = require('fs');
const s = fs.readFileSync('public/index.html', 'utf8');
const idx = s.indexOf('function renderExactWinningCouponInRobot');
console.log(s.slice(idx, idx + 3500));
