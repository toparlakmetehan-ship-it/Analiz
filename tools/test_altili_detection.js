const fs = require('fs');

function inspectHipodromAltilis(hipodrom) {
  const kosular = hipodrom.kosular || [];
  console.log(`\nHipodrom: ${hipodrom.sehir || hipodrom.isim} (${kosular.length} Koşu)`);
  
  kosular.forEach((k, idx) => {
    const rawAyak = k.altiliAyagi;
    const num = k.kosuNo || (idx + 1);
    console.log(`   Koşu ${num}: altiliAyagi=${JSON.stringify(rawAyak)}`);
  });
}

const bugun = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));
bugun.hipodromlar.forEach(inspectHipodromAltilis);

const yarin = JSON.parse(fs.readFileSync('public/data/bulten_yarin.json', 'utf8'));
yarin.hipodromlar.forEach(inspectHipodromAltilis);

const nov15 = JSON.parse(fs.readFileSync('public/data/bulten_2026_11_15.json', 'utf8'));
nov15.hipodromlar.forEach(inspectHipodromAltilis);
