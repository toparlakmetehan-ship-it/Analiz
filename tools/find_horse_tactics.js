const fs = require('fs');
const bulten = require('../public/data/bulten_bugun.json');

// Let's inspect calculatePowerIndex and horse tactical determination from index.html
const indexHtml = fs.readFileSync('./public/index.html', 'utf8');

console.log('Searching for horses with past races and how they are classified...');
bulten.hipodromlar.forEach(hip => {
  hip.kosular.forEach(k => {
    k.atlar.forEach(a => {
      const past = a.pastRaces || [];
      const leaderCount = past.filter(p => (p.earlyPace && p.earlyPace >= 85) || (p.trackingPos && p.trackingPos <= 2)).length;
      console.log(`[${hip.sehir} K${k.kosu_no} #${a.no} ${a.isim}] pastRaces: ${past.length}, total: ${(a.careerSummary||{}).toplamKosu || 0}, leaderRaces: ${leaderCount}`);
    });
  });
});
