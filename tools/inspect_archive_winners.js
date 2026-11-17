const path = require('path');
const arc = require(path.join(__dirname, '..', 'public', 'data', 'backtest_archive.json'));

const targets = ['2026-11-14', '2026-11-13', '2026-11-10', '2026-11-07'];

targets.forEach(date => {
  const d = arc[date];
  if (!d) {
    console.log(`Missing date: ${date}`);
    return;
  }
  console.log(`\n=== ${date} (${d.tarih}) ===`);
  const cities = {};
  (d.karsilastirmalar || []).forEach(k => {
    if (!cities[k.sehir]) cities[k.sehir] = [];
    cities[k.sehir].push(k);
  });
  for (const [city, races] of Object.entries(cities)) {
    console.log(` Hipodrom: ${city} (${races.length} koşu)`);
    races.forEach(r => {
      console.log(`   Koşu ${r.kosuNo}: Kazanan ${r.kazanan.no} ${r.kazanan.isim} (${r.kazanan.ganyan} TL) | Mesafe: ${r.mesafe}m ${r.pist}`);
    });
  }
});
