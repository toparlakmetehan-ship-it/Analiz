const fs = require('fs');
const b = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));
const bursa = b.hipodromlar.find(h => (h.sehir || h.isim || '').toLowerCase().includes('bursa'));
console.log('=== BURSA ALL RACES IN bulten_bugun.json ===');
bursa.kosular.forEach((k, idx) => {
  console.log(`\nKoşu ${idx + 1} (Saat: ${k.saat}, Pist: ${k.pist} ${k.mesafe}m, Grup: ${k.grup_sinifi}): ${k.atlar.length} at`);
  k.atlar.forEach(a => {
    console.log(`   #${a.no} ${a.isim} (Jokey: ${a.jokey}, Kilo: ${a.siklet}, Kulvar: ${a.kulvar}, Handikap: ${a.handikap_puani})`);
  });
});
