const fs = require('fs');
const bulten = require('../public/data/bulten_bugun.json');

const races = [];

bulten.hipodromlar.forEach(hip => {
  hip.kosular.forEach((k, idx) => {
    const raceObj = {
      city: hip.sehir,
      raceNo: k.kosu_no || (idx + 1),
      raceName: k.kosu_adi || '',
      distance: k.mesafe,
      track: k.pist,
      horses: k.atlar.map(a => ({
        no: a.no,
        name: a.isim,
        age: a.yas,
        sire: a.baba,
        dam: a.anne,
        starts: (a.careerSummary && a.careerSummary.toplamKosu) || (a.pastRaces || []).length,
        currentStyle: a.kosu_stili,
        gear: a.takilar,
        jockey: a.jokey
      }))
    };
    races.push(raceObj);
  });
});

fs.writeFileSync('./tools/full_race_horses.json', JSON.stringify(races, null, 2), 'utf8');
console.log('Saved full_race_horses.json. Total races:', races.length);
