const fs = require('fs');
const lines = fs.readFileSync('public/index.html', 'utf8').split('\n');
console.log('Total lines:', lines.length);
for (let i = 1590; i <= 1630; i++) {
  if (lines[i]) console.log(`${i+1}: ${lines[i]}`);
}
