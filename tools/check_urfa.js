const fs = require('fs');
const b = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));
const urfa = b.hipodromlar.find(h => (h.sehir || h.isim || '').toLowerCase().includes('şanlıurfa'));
if (urfa) {
  console.log('Urfa kosular:', urfa.kosular.map(k => ({ id: k.id, kosuNo: k.kosuNo, altiliAyagi: k.altiliAyagi, atlar: k.atlar.length })));
}
