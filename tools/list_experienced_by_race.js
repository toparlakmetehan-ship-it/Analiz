const fs = require('fs');
const bulten = require('../public/data/bulten_bugun.json');

const raceList = [];
bulten.hipodromlar.forEach(hip => {
  hip.kosular.forEach((k, idx) => {
    const horses = k.atlar
      .filter(a => !((a.careerSummary && a.careerSummary.toplamKosu <= 3) || (a.pastRaces && a.pastRaces.length <= 3) || a.isYoungHorse))
      .map(a => a.isim);
    raceList.push({
      city: hip.sehir,
      raceNo: k.kosu_no || (idx + 1),
      count: horses.length,
      horses: horses
    });
  });
});

console.log(JSON.stringify(raceList, null, 2));
