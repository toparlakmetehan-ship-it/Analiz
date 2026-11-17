const fs = require('fs');

const files = fs.readdirSync('public/data').filter(f => f.startsWith('bulten_') && f.endsWith('.json'));
console.log('Bulletin files:', files);

files.forEach(f => {
  const b = JSON.parse(fs.readFileSync(`public/data/${f}`, 'utf8'));
  console.log(`\n=== FILE: ${f} (Tarih: ${b.tarih}) ===`);
  b.hipodromlar.forEach(h => {
    console.log(`\n  Hipodrom: ${h.sehir || h.isim} (${h.kosular.length} Koşu)`);
    h.kosular.forEach((k, idx) => {
      console.log(`    Koşu ${k.kosuNo || (idx+1)}: altiliAyagi=${JSON.stringify(k.altiliAyagi)}, altiliAyagi2=${JSON.stringify(k.altiliAyagi2 || null)}, saat=${k.saat}`);
    });
  });
});
