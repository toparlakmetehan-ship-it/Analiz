const fs = require('fs');
const s = fs.readFileSync('public/index.html', 'utf8');
let pos = 0;
while (true) {
  const found = s.indexOf('loadedWinningCoupon', pos);
  if (found === -1) break;
  console.log('Found at:', found, s.slice(found - 50, found + 150));
  pos = found + 1;
}
