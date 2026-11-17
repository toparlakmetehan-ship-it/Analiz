const fs = require('fs');

const bulten = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));
const adana = bulten.hipodromlar.find(h => (h.isim || h.sehir).toLowerCase().includes('adana'));

console.log('=== ADANA BÜLTENİ KOŞULARI VE ATLAR ===');
adana.kosular.forEach(k => {
  console.log(`\n--- Koşu ${k.kosuNo} (${k.mesafe}m ${k.pist}) ---`);
  const sorted = [...k.atlar].sort((a,b) => (b.genelPuan || 0) - (a.genelPuan || 0));
  sorted.slice(0, 6).forEach((a, idx) => {
    console.log(`  ${idx+1}. No: ${a.atNo} ${a.atIsmi} - Puan: ${a.genelPuan} - Jokey: ${a.jokey} - AGF: ${a.agf}`);
  });
});
