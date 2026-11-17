const fs = require('fs');

function checkFile(filename) {
  console.log(`\n=================== ${filename} ===================`);
  const b = JSON.parse(fs.readFileSync(`public/data/${filename}`, 'utf8'));
  b.hipodromlar.forEach(h => {
    console.log(`--- Hipodrom: ${h.sehir || h.isim} (${h.kosular.length} Koşu) ---`);
    h.kosular.forEach((k, idx) => {
      console.log(`   Koşu ${k.kosuNo || (idx+1)} (Saat: ${k.saat}): altiliAyagi=${k.altiliAyagi}`);
    });
  });
}

checkFile('bulten_bugun.json');
checkFile('bulten_yarin.json');
checkFile('bulten_2026_11_15.json');
