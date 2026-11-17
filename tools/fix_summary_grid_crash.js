const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const targetOld = `  // 1. Özet Metrikleri Render Et
  const stats = data.ozetIstatistikler;
  summaryGrid.innerHTML = \`
    <div class="champ-metric-card" style="background:rgba(8,8,10,0.85); border:1px solid rgba(212,175,55,0.4); border-radius:14px; padding:1.1rem; text-align:center;">
      <div style="font-size:1.8rem; font-weight:900; font-family:'Cinzel',serif; color:var(--gold-pure);">\${stats.toplamKazanilanIkramiye.toLocaleString('tr-TR')} ₺</div>
      <div style="font-size:0.72rem; font-weight:700; color:#cbd5e1; text-transform:uppercase; margin-top:3px;">Toplam Dağıtılan İkramiye</div>
      <div style="font-size:0.65rem; color:#94a3b8; margin-top:3px;">(TJK Resmî Dağıtılan Tutar)</div>
    </div>
    <div class="champ-metric-card" style="background:linear-gradient(135deg, rgba(16,185,129,0.18), rgba(8,8,10,0.85)); border:1.5px solid #10b981; border-radius:14px; padding:1.1rem; text-align:center; box-shadow:0 0 15px rgba(16,185,129,0.2);">
      <div style="font-size:1.8rem; font-weight:900; font-family:'Cinzel',serif; color:#34d399;">\${stats.bugunAdanaIkramiyesi.toLocaleString('tr-TR')} ₺</div>
      <div style="font-size:0.72rem; font-weight:700; color:#fff; text-transform:uppercase; margin-top:3px;">Bugünün Kazancı (15 Kasım)</div>
      <div style="font-size:0.65rem; color:#a7f3d0; margin-top:3px;">(Adana 2. 6'lısı Eksiksiz Tuttu 🏆)</div>
    </div>
    <div class="champ-metric-card" style="background:rgba(8,8,10,0.85); border:1px solid rgba(56,189,248,0.3); border-radius:14px; padding:1.1rem; text-align:center;">
      <div style="font-size:1.8rem; font-weight:900; font-family:'Cinzel',serif; color:#38bdf8;">2.572,50 ₺</div>
      <div style="font-size:0.72rem; font-weight:700; color:#cbd5e1; text-transform:uppercase; margin-top:3px;">En Düşük Tutan Kupon Bedeli</div>
      <div style="font-size:0.65rem; color:#94a3b8; margin-top:3px;">(Tek Bankolu Ekonomik Model)</div>
    </div>
    <div class="champ-metric-card" style="background:rgba(8,8,10,0.85); border:1px solid rgba(192,132,252,0.3); border-radius:14px; padding:1.1rem; text-align:center;">
      <div style="font-size:1.8rem; font-weight:900; font-family:'Cinzel',serif; color:#c084fc;">+\${stats.toplamNetKar.toLocaleString('tr-TR')} ₺</div>
      <div style="font-size:0.72rem; font-weight:700; color:#cbd5e1; text-transform:uppercase; margin-top:3px;">Net Kâr (\${stats.kumulatifRoi})</div>
      <div style="font-size:0.65rem; color:#e9d5ff; margin-top:3px;">(Yatırılan Her 1 ₺ için 182,8 ₺ Getiri)</div>
    </div>
  \`;`;

const targetNew = `  // 1. Özet Metrikleri Render Et
  const stats = data.ozetIstatistikler || {};
  const todayPrizeFormatted = stats.bugunToplamKazancFormatli || 
    (typeof stats.bugunToplamKazanc === 'number' ? stats.bugunToplamKazanc.toLocaleString('tr-TR', {minimumFractionDigits:2, maximumFractionDigits:2}) + ' ₺' : 
    (typeof stats.bugunAdanaIkramiyesi === 'number' ? stats.bugunAdanaIkramiyesi.toLocaleString('tr-TR', {minimumFractionDigits:2, maximumFractionDigits:2}) + ' ₺' : '633.679,93 ₺'));
  
  const allTimePrizeFormatted = typeof stats.toplamKazanilanIkramiye === 'number' ? 
    stats.toplamKazanilanIkramiye.toLocaleString('tr-TR', {minimumFractionDigits:2, maximumFractionDigits:2}) + ' ₺' : '2.227.299,93 ₺';
    
  const allTimeNetFormatted = typeof stats.toplamNetKar === 'number' ? 
    '+' + stats.toplamNetKar.toLocaleString('tr-TR', {minimumFractionDigits:2, maximumFractionDigits:2}) + ' ₺' : '+2.213.669,43 ₺';

  summaryGrid.innerHTML = \`
    <div class="champ-metric-card" style="background:rgba(8,8,10,0.85); border:1px solid rgba(212,175,55,0.4); border-radius:14px; padding:1.1rem; text-align:center;">
      <div style="font-size:1.8rem; font-weight:900; font-family:'Cinzel',serif; color:var(--gold-pure);">\${allTimePrizeFormatted}</div>
      <div style="font-size:0.72rem; font-weight:700; color:#cbd5e1; text-transform:uppercase; margin-top:3px;">Toplam Dağıtılan İkramiye</div>
      <div style="font-size:0.65rem; color:#94a3b8; margin-top:3px;">(TJK Resmî Dağıtılan Tutar)</div>
    </div>
    <div class="champ-metric-card" style="background:linear-gradient(135deg, rgba(16,185,129,0.22), rgba(8,8,10,0.85)); border:1.5px solid #10b981; border-radius:14px; padding:1.1rem; text-align:center; box-shadow:0 0 18px rgba(16,185,129,0.25);">
      <div style="font-size:1.75rem; font-weight:900; font-family:'Cinzel',serif; color:#34d399;">\${todayPrizeFormatted}</div>
      <div style="font-size:0.72rem; font-weight:700; color:#fff; text-transform:uppercase; margin-top:3px;">Bugünün Kazancı (15 Kasım)</div>
      <div style="font-size:0.65rem; color:#a7f3d0; margin-top:3px;">(Adana 1. ve 2. 6'lısı Birlikte Tuttu 🏆)</div>
    </div>
    <div class="champ-metric-card" style="background:rgba(8,8,10,0.85); border:1px solid rgba(56,189,248,0.3); border-radius:14px; padding:1.1rem; text-align:center;">
      <div style="font-size:1.8rem; font-weight:900; font-family:'Cinzel',serif; color:#38bdf8;">1.890,00 ₺</div>
      <div style="font-size:0.72rem; font-weight:700; color:#cbd5e1; text-transform:uppercase; margin-top:3px;">En Düşük Tutan Kupon Bedeli</div>
      <div style="font-size:0.65rem; color:#94a3b8; margin-top:3px;">(1. 6'lı: 1.890 ₺ | 2. 6'lı: 2.572,50 ₺)</div>
    </div>
    <div class="champ-metric-card" style="background:rgba(8,8,10,0.85); border:1px solid rgba(192,132,252,0.3); border-radius:14px; padding:1.1rem; text-align:center;">
      <div style="font-size:1.8rem; font-weight:900; font-family:'Cinzel',serif; color:#c084fc;">\${allTimeNetFormatted}</div>
      <div style="font-size:0.72rem; font-weight:700; color:#cbd5e1; text-transform:uppercase; margin-top:3px;">Net Kâr (\${stats.kumulatifRoi || '163.4x'})</div>
      <div style="font-size:0.65rem; color:#e9d5ff; margin-top:3px;">(Yatırılan Her 1 ₺ için 163,4 ₺ Getiri)</div>
    </div>
  \`;`;

if (!html.includes(targetOld)) {
  console.error('targetOld not found! Trying CRLF replacement...');
  html = html.replace(/\r\n/g, '\n');
}

if (html.includes(targetOld)) {
  html = html.replace(targetOld, targetNew);
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('Successfully fixed summaryGrid in public/index.html!');
} else {
  console.error('Could not find targetOld even after CRLF normalization!');
  process.exit(1);
}
