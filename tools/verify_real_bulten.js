const fs = require('fs');
const b = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));
console.log('Tarih:', b.tarih);
console.log('Kaynak:', b.kaynak);
console.log('Hipodromlar:');
b.hipodromlar.forEach(h => {
  const totalHorses = h.kosular.reduce((s, k) => s + k.atlar.length, 0);
  console.log(`- ${h.isim}: ${h.kosular.length} koşu, Toplam at: ${totalHorses}`);
  h.kosular.forEach(k => {
    console.log(`    Koşu ${k.kosu_no} (${k.saat}, ${k.mesafe}m ${k.pist}): ${k.atlar.length} at - ${k.grup_sinifi}`);
  });
});
