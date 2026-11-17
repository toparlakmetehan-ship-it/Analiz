const fs = require('fs');
const bultenNov15 = JSON.parse(fs.readFileSync('public/data/bulten_2026_11_15.json', 'utf8'));
const adana = bultenNov15.hipodromlar.find(h => h.sehir.toLowerCase().includes('adana'));
const race4 = adana.kosular[3];
const hyperRocker = race4.atlar.find(a => a.isim.includes('HYPER'));
console.log('Hyper Rocker:', {
  no: hyperRocker.no,
  isim: hyperRocker.isim,
  pist_aptitude_analizi: hyperRocker.pist_aptitude_analizi,
  wetTrack: hyperRocker.wetTrack,
  grup_sinifi: race4.grup_sinifi
});
