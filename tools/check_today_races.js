const fs = require('fs');
const b = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));
b.hipodromlar.forEach(h => {
  console.log(`=== ${h.sehir || h.isim} (${h.kosular.length} Kosu) ===`);
  h.kosular.forEach((k, idx) => {
    console.log(`Race index ${idx}: kosuNo=${k.kosuNo || k.id || (idx+1)}, saat=${k.saat}, altiliAyagi=${k.altiliAyagi}, bahisler=${JSON.stringify(k.bahisler || k.bahisTurleri || k.oyunlar || 'none')}`);
    // Check if there are keys related to altili
    const altiliKeys = Object.keys(k).filter(key => key.toLowerCase().includes('altili') || key.toLowerCase().includes('ganyan') || key.toLowerCase().includes('ayak'));
    if (altiliKeys.length > 0) {
      console.log('   altili keys:', altiliKeys.map(key => `${key}=${k[key]}`));
    }
  });
});
