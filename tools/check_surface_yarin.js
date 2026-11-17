const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf-8');
const yarin = JSON.parse(fs.readFileSync('public/data/bulten_yarin.json', 'utf8'));

// Check pist_aptitude_analizi in yarin
let surfaceCount = 0;
yarin.hipodromlar.forEach(hip => {
  hip.kosular.forEach(k => {
    k.atlar.forEach(a => {
      // In client index.html, enrichBultenRunningStylesAndPace populates pist_aptitude_analizi
      surfaceCount++;
    });
  });
});
console.log('Total horses checked for surface:', surfaceCount);
