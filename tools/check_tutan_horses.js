const fs = require('fs');
const tutan = JSON.parse(fs.readFileSync('public/data/tutan_altililar.json', 'utf8'));
console.log('Tutan keys:', Object.keys(tutan));
(tutan.tutanKuponlar || []).forEach(k => {
  console.log(`\nCoupon ID: ${k.id}, Hipodrom: ${k.hipodrom}, Tarih: ${k.tarih}`);
  (k.ayaklar || []).forEach((a, i) => {
    const sample = (a.kuponAtlar || [])[0];
    console.log(`  Ayak ${i+1}: sample horse:`, sample);
  });
});
