const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', 'public', 'data', 'tutan_altililar.json');
const t = JSON.parse(fs.readFileSync(p, 'utf8'));

t.tutanKuponlar.forEach(k => {
  if (k.id.includes('2026-11-15')) {
    k.tarih = "15 Kasım 2026 (Dün - Pazar)";
  } else if (k.id.includes('2026-11-14')) {
    k.tarih = "14 Kasım 2026 (Cumartesi)";
  }
});

fs.writeFileSync(p, JSON.stringify(t, null, 2), 'utf8');
console.log('✅ tutan_altililar.json güncellendi.');
