const fs = require('fs');
const races = JSON.parse(fs.readFileSync('./tools/full_race_horses.json', 'utf8'));

races.forEach(r => {
  console.log(`\n════════ ${r.city.toUpperCase()} KOŞU ${r.raceNo} (${r.distance}m ${r.track}) ════════`);
  r.horses.forEach(h => {
    const youngTag = h.starts <= 3 ? '🌱 [GENÇ <=3]' : '  [TECRÜBELİ]';
    console.log(`${youngTag} #${h.no.toString().padStart(2)} ${h.name.padEnd(20)} (${h.starts} koşu) | Mevcut: ${h.currentStyle} | Baba: ${h.sire} | Jokey: ${h.jockey}`);
  });
});
