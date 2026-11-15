const fs = require('fs');
const bulten = JSON.parse(fs.readFileSync('C:/Users/DELL/Desktop/.claude/public/data/bulten_bugun.json', 'utf8'));

console.log('--- Hipodrom Özeti ---');
bulten.hipodromlar.forEach(h => {
  const atSayisi = h.kosular.reduce((acc, k) => acc + (k.atlar ? k.atlar.length : 0), 0);
  console.log(h.isim + ' (' + h.sehir + '): ' + h.kosular.length + ' Koşu, ' + atSayisi + ' At');
});

const sampleHorse = bulten.hipodromlar[0].kosular[0].atlar[0];
console.log('--- Örnek Safkan Parametreleri ---');
console.log('İsim:', sampleHorse.isim);
console.log('Orijin:', sampleHorse.baba, 'x', sampleHorse.anne, '/', sampleHorse.kisrak_babasi);
console.log('Jokey & Kazanma:', sampleHorse.jokey, '%' + sampleHorse.jokey_kazanma_orani);
console.log('Sıklet & KGS:', sampleHorse.siklet + ' kg', 'Dinlenme:', sampleHorse.dinlenme_gunu + ' gün');
console.log('Koşu Stili:', sampleHorse.kosu_stili);
console.log('Galop Bilgisi:', sampleHorse.son_galop);
console.log('Komiser Notu:', sampleHorse.komiser_notu);
console.log('Mevcut Alanlar:', Object.keys(sampleHorse).join(', '));
