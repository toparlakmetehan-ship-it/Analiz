const fs = require('fs');
const s = fs.readFileSync('public/index.html', 'utf8');
const idx = s.indexOf('function loadWinningCouponToRobot');
console.log(s.slice(idx, idx + 2500));
