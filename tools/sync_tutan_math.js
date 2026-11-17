const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'public', 'data', 'tutan_altililar.json');
const tutanData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

let totalCost = 0;
let totalWon = 0;

tutanData.tutanKuponlar.forEach(k => {
  const counts = (k.ayaklar || []).map(a => (a.kuponAtlar || []).length);
  const comb = counts.reduce((a, b) => a * b, 1);
  const unitPrice = 1.25;
  const cost = comb * unitPrice;
  const won = k.ikramiye || 0;
  const net = won - cost;
  const roi = (won / cost).toFixed(1) + 'x ROI';

  if (!k.secenekler || k.secenekler.length === 0) {
    k.secenekler = [{
      modelKey: 'CHAMPION_5YEAR',
      modelAdi: '👑 5 Yılın Şampiyonu (+EV Avcısı)',
      rozet: '👑 5 YILIN ŞAMPİYONU',
      rozetRenk: 'emerald'
    }];
  }

  const s0 = k.secenekler[0];
  s0.maliyet = cost;
  s0.maliyetFormatli = cost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
  s0.netKar = net;
  s0.netKarFormatli = '+' + net.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
  s0.roi = roi;
  s0.kombinasyon = counts.join(' x ') + ' = ' + comb.toLocaleString('tr-TR') + ' Kombinasyon';

  totalCost += cost;
  totalWon += won;
});

tutanData.ozetIstatistikler.toplamKuponMaliyeti = totalCost;
tutanData.ozetIstatistikler.toplamKazanilanIkramiye = totalWon;
tutanData.ozetIstatistikler.toplamNetKar = totalWon - totalCost;
tutanData.ozetIstatistikler.kumulatifRoi = (totalWon / totalCost).toFixed(1) + 'x';

fs.writeFileSync(filePath, JSON.stringify(tutanData, null, 2), 'utf8');
console.log('Synchronized tutan_altililar.json:');
console.log('Total Cost:', totalCost, 'Total Won:', totalWon, 'Cumulative ROI:', tutanData.ozetIstatistikler.kumulatifRoi);
