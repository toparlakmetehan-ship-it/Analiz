const fs = require('fs');
const bulten = require('../public/data/bulten_bugun.json');

const horsesList = [];

bulten.hipodromlar.forEach(hip => {
  hip.kosular.forEach((k, kIdx) => {
    k.atlar.forEach(a => {
      const isYoung = (a.careerSummary && a.careerSummary.toplamKosu <= 3) || (a.pastRaces && a.pastRaces.length <= 3) || a.isYoungHorse;
      horsesList.push({
        city: hip.sehir,
        raceNo: k.kosu_no || (kIdx + 1),
        horseNo: a.no,
        name: a.isim,
        isYoung: isYoung,
        currentStyle: a.kosu_stili,
        takilar: a.takilar,
        jokey: a.jokey,
        toplamKosu: (a.careerSummary && a.careerSummary.toplamKosu) || (a.pastRaces || []).length
      });
    });
  });
});

console.log('Total horses:', horsesList.length);
console.log('Young horses (<=3 races):', horsesList.filter(h => h.isYoung).length);
console.log('Experienced horses (>3 races):', horsesList.filter(h => !h.isYoung).length);

const experienced = horsesList.filter(h => !h.isYoung);
fs.writeFileSync('./tools/experienced_horses.json', JSON.stringify(experienced, null, 2), 'utf8');
console.log('Written experienced horses to ./tools/experienced_horses.json');
