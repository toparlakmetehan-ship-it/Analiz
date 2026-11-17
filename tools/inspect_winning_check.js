const fs = require('fs');
const s = fs.readFileSync('public/index.html', 'utf8');
const idx = s.indexOf('function optimizeCoupon');
const winningCheckIdx = s.indexOf('loadedWinningCoupon', idx);
console.log(s.slice(winningCheckIdx - 100, winningCheckIdx + 1500));
