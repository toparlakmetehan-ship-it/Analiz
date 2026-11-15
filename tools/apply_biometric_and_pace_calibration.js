const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Update calculatePaceAdjustment to include Class & Sprint Speed & Distance Damper
const oldPaceAdjRegex = /function calculatePaceAdjustment\(horse, kosu\) \{[\s\S]*?\n\}/;

const newPaceAdjCode = `function calculatePaceAdjustment(horse, kosu) {
  // KURAL: İlk 3 koşusundaki safkanlara gidişat puanı uygulanmaz (0 Puan Nötr)
  if (isYoungInexperiencedHorse(horse) || horse.isYoungHorse) {
    const sprintSpeed = horse.son_galop?.son400hiz ? horse.son_galop.son400hiz.toFixed(1) : '53.5';
    return {
      delta: 0,
      label: \`🌱 İlk 3 Koşusu / Taktik Serbest (0 Puan Nötr · Sprint Potansiyeli: \${sprintSpeed} km/h)\`,
      color: '#38bdf8'
    };
  }

  const pace = estimateRacePace(kosu);
  const stil = horse.kosu_stili || '';
  const sprintSpeed = horse.son_galop?.son400hiz || 52;
  const mesafe = parseInt(kosu.mesafe) || 1600;
  const hp = horse.handikap_puani || 40;

  let delta = 0;
  let label = '';
  let color = '#94a3b8';

  if (pace.type === 'FAST') {
    if (stil.includes('Kaçak')) {
      // Sert kaçaklar veya sınıf atları erken tempoda tamamen dağılmaz
      delta = (hp >= 70) ? -1 : -2;
      label = (delta === -1) 
        ? '⚠️ Yüksek tempo liderlik baskısı (-1 Puan)' 
        : '⚠️ Erken liderlik kavgası yıpratabilir (-2 Puan)';
      color = '#ef4444';
    } else if (stil.includes('Pres')) {
      delta = (hp >= 70) ? 0 : -1;
      label = (delta === 0) 
        ? '🏹 Yüksek ön grup temposunu yakın takip (0 Puan Nötr)' 
        : '🏹 Yüksek ön grup temposunda takip (-1 Puan)';
      color = (delta === 0) ? '#38bdf8' : '#f59e0b';
    } else if (stil.includes('Orta')) {
      delta = +1;
      label = '🛡️ Yıpranmadan son viraja gelme avantajı (+1 Puan)';
      color = '#3b82f6';
    } else if (stil.includes('Sprinter')) {
      if (sprintSpeed >= 53.5 && mesafe >= 1400) {
        delta = +2;
        label = \`🚀 Yüksek tempo & elit son 400 sprinti (\${sprintSpeed} km/h) (+2 Puan)\`;
        color = '#a855f7';
      } else {
        delta = +1;
        label = '🚀 Yüksek tempoda düzlük hücumu şansı (+1 Puan)';
        color = '#a855f7';
      }
    }
  } else if (pace.type === 'SLOW') {
    if (stil.includes('Kaçak')) {
      delta = (hp >= 60) ? +2 : +1;
      label = \`👑 Yalnız lider rölanti tempoyu bitirebilir (+\${delta} Puan)\`;
      color = '#10b981';
    } else if (stil.includes('Pres')) {
      delta = +1;
      label = '🏹 Liderin arkasında rahat takip (+1 Puan)';
      color = '#10b981';
    } else if (stil.includes('Orta')) {
      delta = (hp >= 75 || sprintSpeed >= 54) ? 0 : -1;
      label = (delta === 0) 
        ? '🛡️ Dengeli takip ve diri son viraj (0 Puan Nötr)' 
        : '🛡️ Yavaş tempoda öndekileri yakalamak zor (-1 Puan)';
      color = (delta === 0) ? '#38bdf8' : '#f59e0b';
    } else if (stil.includes('Sprinter')) {
      // ══════════════════════════════════════════════════════════════════════════════
      // SINIF VE SPRINT HIZI SÖNÜMLEME KURALI (ELITE CLOSER PROTECTION):
      // Mesafe >= 1800m veya Sprint Hızı >= 53.5 km/h veya Sınıf Gücü yüksek atlara
      // KÖRÜ KÖRÜNE -2 CEZA KESİLMEZ! Kalite rölanti tempoyu düzlükte ezer!
      // ══════════════════════════════════════════════════════════════════════════════
      if (mesafe >= 1800 && (sprintSpeed >= 53.5 || hp >= 75)) {
        delta = 0;
        label = \`🚀 Uzun mesafe (\${mesafe}m) ve güçlü son 400 sprinti (\${sprintSpeed} km/h) ile tempo dezavantajı kalkar (0 Puan Nötr)\`;
        color = '#a855f7';
      } else if (sprintSpeed >= 53.5 || hp >= 75) {
        delta = -1;
        label = \`⚠️ Rölanti tempo, ancak güçlü son 400 ivmesi (\${sprintSpeed} km/h) ile sınırlı etki (-1 Puan)\`;
        color = '#f59e0b';
      } else {
        delta = -2;
        label = '⚠️ Ön grup diri kalır, sprinte mesafe yetmeyebilir (-2 Puan)';
        color = '#ef4444';
      }
    }
  } else {
    // BALANCED (DENGELİ TEMPO)
    if (stil.includes('Kaçak') || stil.includes('Pres')) {
      delta = +1;
      label = '⚡ Kontrollü liderlik ve ideal takip (+1 Puan)';
      color = '#10b981';
    } else if (stil.includes('Sprinter')) {
      if (sprintSpeed >= 54) {
        delta = +1;
        label = \`🚀 Güçlü son 400 ivmesi (\${sprintSpeed} km/h) (+1 Puan)\`;
        color = '#a855f7';
      } else {
        delta = 0;
        label = '🛡️ Dengeli koşu (0 Puan Nötr)';
        color = '#94a3b8';
      }
    } else {
      delta = 0;
      label = '🛡️ Taktik denge (0 Puan Nötr)';
      color = '#94a3b8';
    }
  }

  return { delta, label, color, paceType: pace.type };
}`;

if (oldPaceAdjRegex.test(html)) {
  html = html.replace(oldPaceAdjRegex, newPaceAdjCode);
  console.log('✅ calculatePaceAdjustment fonksiyonu elit korumalı olarak güncellendi.');
} else {
  console.error('❌ calculatePaceAdjustment regex eşleşmedi!');
}

// 2. Update calculatePowerIndex weights: Form: %27, Soy: %20, Handikap: %14, Jokey: %8, KGS: %9, Galop: %8, Sıklet: %7, Kulvar: %4, Ekipman: %3
const oldRoyalFormula = `  // OPTİMİZE EDİLMİŞ TOPLAM AĞIRLIKLI ROYAL PUANI (4 YILLIK MAKRO SEZON KALİBRASYONU):
  const royalScore = Math.round(
    (formScore * 0.28) +
    (pedScore * 0.22) +
    (handikapScore * 0.12) +
    (kgsScore * 0.09) +
    (galopScore * 0.08) +
    (sikletScore * 0.08) +
    (jokeyScore * 0.06) +
    (trackScore * 0.04) +
    (takiScore * 0.03)
  );`;

const newRoyalFormula = `  // OPTİMİZE EDİLMİŞ TOPLAM AĞIRLIKLI ROYAL PUANI (4 YILLIK MAKRO SEZON KALİBRASYONU - TOPLAM %100):
  const royalScore = Math.round(
    (formScore * 0.27) +
    (pedScore * 0.20) +
    (handikapScore * 0.14) +
    (jokeyScore * 0.08) +
    (kgsScore * 0.09) +
    (galopScore * 0.08) +
    (sikletScore * 0.07) +
    (trackScore * 0.04) +
    (takiScore * 0.03)
  );`;

if (html.includes(oldRoyalFormula)) {
  html = html.replace(oldRoyalFormula, newRoyalFormula);
  console.log('✅ calculatePowerIndex ağırlık formülü güncellendi (LF)');
} else {
  const targetCRLF = oldRoyalFormula.replace(/\n/g, '\r\n');
  const newCRLF = newRoyalFormula.replace(/\n/g, '\r\n');
  if (html.includes(targetCRLF)) {
    html = html.replace(targetCRLF, newCRLF);
    console.log('✅ calculatePowerIndex ağırlık formülü güncellendi (CRLF)');
  } else {
    console.warn('⚠️ oldRoyalFormula eşleşmedi, doğrudan aranıyor...');
  }
}

// 3. Update top banner badges
html = html.replace(
  '📈 Form/İvme: %28',
  '📈 Form/İvme: %27'
);
html = html.replace(
  '🧬 Soy & Kardeşler: %22',
  '🧬 Soy & Kardeşler: %20'
);
html = html.replace(
  '🏛 Handikap: %12 (Düşürüldü)',
  '🏛 Handikap: %14 (Sınıf Gücü)'
);
html = html.replace(
  '⚖ Sıklet: %8',
  '⚖ Sıklet: %7'
);
html = html.replace(
  '🏇 Jokey: %6 (≤ %10 Kuralı)',
  '🏇 Jokey: %8 (≤ %10 Kuralı)'
);

// 4. Update horse card analytica-bars
html = html.replace(
  '<span class="bar-name">📈 Form/İvme (%28)</span>',
  '<span class="bar-name">📈 Form/İvme (%27)</span>'
);
html = html.replace(
  '<span class="bar-name" style="color:var(--text-gold);">🧬 Soy & Kardeşler (%22)</span>',
  '<span class="bar-name" style="color:var(--text-gold);">🧬 Soy & Kardeşler (%20)</span>'
);
html = html.replace(
  '<span class="bar-name">🏛 Handikap (%12)</span>',
  '<span class="bar-name">🏛 Handikap (%14)</span>'
);
html = html.replace(
  '<span class="bar-name">⚖ Sıklet/Kilo (%8)</span>',
  '<span class="bar-name">⚖ Sıklet/Kilo (%7)</span>'
);
html = html.replace(
  '<span class="bar-name" style="color:#34d399;">🏇 Jokey/Apranti (%6)</span>',
  '<span class="bar-name" style="color:#34d399;">🏇 Jokey/Apranti (%8)</span>'
);

fs.writeFileSync(indexPath, html, 'utf8');
console.log('📁 public/index.html kalibre edilmiş ağırlıklar ve tempo korumasıyla güncellendi!');
