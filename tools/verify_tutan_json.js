const fs = require('fs');
const tutan = JSON.parse(fs.readFileSync('public/data/tutan_altililar.json', 'utf8'));

console.log('=== TUTAN ALTILILAR VERİ DENETİMİ ===');
console.log('Özet İstatistikler:', tutan.ozetIstatistikler);

console.log('\nBugünün Kuponları (15 Kasım):');
const todayCards = tutan.tutanKuponlar.filter(k => k.tarihKodu === '2026-11-15');
todayCards.forEach(c => {
  console.log(`\n- ID: ${c.id}`);
  console.log(`  Paket: ${c.paket}`);
  console.log(`  Resmî İkramiye: ${c.ikramiyeFormatli}`);
  console.log(`  Koşu Aralığı: ${c.kosuAraligi}`);
  console.log(`  Seçenek Sayısı: ${c.secenekler.length}`);
  c.secenekler.forEach(s => {
    console.log(`    * ${s.modelAdi}: Maliyet ${s.maliyetFormatli} | Net Kâr: ${s.netKarFormatli} | ROI: ${s.roi}`);
  });
  console.log(`  Ayaklar:`);
  c.ayaklar.forEach(a => {
    console.log(`    Ayak ${a.ayakNo} (Koşu ${a.kosuNo}): ${a.kazananNo} ${a.kazananIsim} (${a.ganyan} ₺) -> ${a.durum}`);
  });
});
