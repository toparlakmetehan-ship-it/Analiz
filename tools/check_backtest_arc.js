const fs = require('fs');
const arc = JSON.parse(fs.readFileSync('public/data/backtest_archive.json', 'utf8'));
const dates = Object.keys(arc);
console.log('Archive dates:', dates);
dates.forEach(d => {
  const day = arc[d];
  const sample = day.karsilastirmalar?.[0];
  console.log(d, 'sample keys:', sample ? Object.keys(sample) : 'none');
  if (sample?.kazanan) console.log(d, 'kazanan:', sample.kazanan);
  if (sample?.aiTahmin) console.log(d, 'aiTahmin:', sample.aiTahmin);
});
