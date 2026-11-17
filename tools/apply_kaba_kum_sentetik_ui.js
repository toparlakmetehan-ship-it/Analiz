const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Update calculatePowerIndex surfaceDelta
const targetSurfaceCalc = `  // PİST YATKINLIĞI CEZASI / BONUSU (Kardeşleri Çimde Kötü Koşuyorsa Ceza, Uzmansa Bonus)
  let surfaceDelta = 0;
  if (horse.pist_genetik_analizi && horse.pist_genetik_analizi.delta) {
    surfaceDelta = horse.pist_genetik_analizi.delta; // -6 ceza veya +5 bonus
  }`;

const replacementSurfaceCalc = `  // ══════════════════════════════════════════════════════════════════════════════════
  // KABA KUM / SENTETİK VE PİST YATKINLIĞI ETKİSİ (EMPİRİK PİST DENEYİMİ + GENETİK)
  // ══════════════════════════════════════════════════════════════════════════════════
  let surfaceDelta = 0;
  if (horse.pist_aptitude_analizi && horse.pist_aptitude_analizi.delta !== undefined) {
    surfaceDelta = horse.pist_aptitude_analizi.delta; // Kaba Kum vs Sentetik uzmanlığı (+5), dual (+4) veya ters pist cezası (-5)
  } else if (horse.pist_genetik_analizi && horse.pist_genetik_analizi.delta) {
    surfaceDelta = horse.pist_genetik_analizi.delta;
  }`;

if (html.includes(targetSurfaceCalc)) {
  html = html.replace(targetSurfaceCalc, replacementSurfaceCalc);
  console.log('✅ calculatePowerIndex surfaceDelta güncellendi (LF match)');
} else {
  // Try CRLF match
  const targetCRLF = targetSurfaceCalc.replace(/\n/g, '\r\n');
  const replCRLF = replacementSurfaceCalc.replace(/\n/g, '\r\n');
  if (html.includes(targetCRLF)) {
    html = html.replace(targetCRLF, replCRLF);
    console.log('✅ calculatePowerIndex surfaceDelta güncellendi (CRLF match)');
  } else {
    console.warn('⚠️ calculatePowerIndex target bulunamadı, regex ile denenecek...');
    html = html.replace(/let surfaceDelta = 0;\s+if \(horse\.pist_genetik_analizi && horse\.pist_genetik_analizi\.delta\) \{\s+surfaceDelta = horse\.pist_genetik_analizi\.delta;\s*\}/, replacementSurfaceCalc);
    console.log('✅ calculatePowerIndex regex ile güncellendi');
  }
}

// 2. Add Dedicated Kaba Kum / Sentetik Box into Horse Card Template
const targetCardPoint = `      \${(h.mudDelta !== 0 || currentTrackCondition !== 'CANLI') ? \``;

const kabaKumCardBox = `      \${(h.pist_aptitude_analizi && h.pist_aptitude_analizi.badge) ? \`
      <div style="background:\${h.pist_aptitude_analizi.delta > 0 ? 'rgba(16,185,129,0.12)' : (h.pist_aptitude_analizi.delta < 0 ? 'rgba(239,68,68,0.12)' : 'rgba(212,175,55,0.06)')}; border:1px solid \${h.pist_aptitude_analizi.color || 'rgba(212,175,55,0.3)'}; padding:0.55rem 0.85rem; border-radius:10px; margin:0.6rem 0;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
          <span style="font-size:0.76rem; font-weight:800; color:\${h.pist_aptitude_analizi.color}; font-family:'Cinzel',serif; display:flex; align-items:center; gap:0.35rem;">
            \${h.pist_aptitude_analizi.badge}
          </span>
          <span style="font-size:0.72rem; font-weight:800; font-family:'JetBrains Mono'; color:\${h.pist_aptitude_analizi.color}; background:rgba(0,0,0,0.5); padding:1px 6px; border-radius:4px;">
            \${h.pist_aptitude_analizi.delta > 0 ? '+' + h.pist_aptitude_analizi.delta : h.pist_aptitude_analizi.delta} PUAN
          </span>
        </div>
        <div style="font-size:0.72rem; color:#cbd5e1; line-height:1.35;">
          \${h.pist_aptitude_analizi.desc}
        </div>
      </div>
      \` : ''}

      \${(h.mudDelta !== 0 || currentTrackCondition !== 'CANLI') ? \``;

if (!html.includes('h.pist_aptitude_analizi.badge')) {
  if (html.includes(targetCardPoint)) {
    html = html.replace(targetCardPoint, kabaKumCardBox);
    console.log('✅ Horse Card Kaba Kum & Sentetik kutusu eklendi (LF)');
  } else {
    const targetCardCRLF = targetCardPoint.replace(/\n/g, '\r\n');
    const boxCRLF = kabaKumCardBox.replace(/\n/g, '\r\n');
    if (html.includes(targetCardCRLF)) {
      html = html.replace(targetCardCRLF, boxCRLF);
      console.log('✅ Horse Card Kaba Kum & Sentetik kutusu eklendi (CRLF)');
    }
  }
}

// 3. Add Pist Uyumu into Analytica Bars
const targetBarsPoint = `        <div class="bar-entry">
          <span class="bar-name" style="color:\${h.paceColor};">⏱️ Tempo Etkisi (\${h.paceDelta >= 0 ? '+' + h.paceDelta : h.paceDelta})</span>`;

const replacementBars = `        \${(h.pist_aptitude_analizi && h.pist_aptitude_analizi.delta !== 0) ? \`
        <div class="bar-entry">
          <span class="bar-name" style="color:\${h.pist_aptitude_analizi.color};">🏟️ Pist (\${h.pist_aptitude_analizi.delta > 0 ? '+' + h.pist_aptitude_analizi.delta : h.pist_aptitude_analizi.delta})</span>
          <div class="bar-track"><div class="bar-fill-gold" style="width:\${Math.max(15, Math.min(100, 50 + (h.pist_aptitude_analizi.delta * 8)))}%; background:\${h.pist_aptitude_analizi.delta > 0 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #ef4444, #f87171)'};"></div></div>
          <span class="bar-digit" style="color:\${h.pist_aptitude_analizi.color};">\${h.pist_aptitude_analizi.delta > 0 ? '+' + h.pist_aptitude_analizi.delta : h.pist_aptitude_analizi.delta}</span>
        </div>
        \` : ''}
        <div class="bar-entry">
          <span class="bar-name" style="color:\${h.paceColor};">⏱️ Tempo Etkisi (\${h.paceDelta >= 0 ? '+' + h.paceDelta : h.paceDelta})</span>`;

if (!html.includes('🏟️ Pist (${h.pist_aptitude_analizi.delta')) {
  if (html.includes(targetBarsPoint)) {
    html = html.replace(targetBarsPoint, replacementBars);
    console.log('✅ Analytica Bars Pist barı eklendi (LF)');
  } else {
    const targetBarsCRLF = targetBarsPoint.replace(/\n/g, '\r\n');
    const replBarsCRLF = replacementBars.replace(/\n/g, '\r\n');
    if (html.includes(targetBarsCRLF)) {
      html = html.replace(targetBarsCRLF, replBarsCRLF);
      console.log('✅ Analytica Bars Pist barı eklendi (CRLF)');
    }
  }
}

// 4. Update rawPist checking to prioritize Sentetik over Kum
html = html.replace(
  `const pistClean = rawPist.includes('kum') ? 'Kum' : (rawPist.includes('sentetik') ? 'Sentetik' : 'Çim');`,
  `const pistClean = rawPist.includes('sentetik') ? 'Sentetik' : (rawPist.includes('kum') ? 'Kum' : 'Çim');`
);
console.log('✅ Sentetik vs Kum öncelik kontrolü güncellendi');

fs.writeFileSync(indexPath, html, 'utf8');
console.log('📁 public/index.html başarıyla güncellendi!');
