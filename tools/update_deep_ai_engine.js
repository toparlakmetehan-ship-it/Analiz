const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// The new multi-factorial engine
const newEngineCode = `
// ══════════════════════════════════════════════════════════════════════════════════
// GRAND TURF QUANTITATIVE AI ENGINE (100% ÇOK FAKTÖRLÜ BİYOMEKANİK & EKONOMETRİK MODEL)
// KATSAYI DAĞILIMI (TOPLAM %100 - JOKEY KESİNLİKLE MAKSİMUM %10 KURALINA UYGUNDUR: %7):
// 1. TJK Resmî Handikap & Yarış Sınıfı: %22
// 2. Pedigri & Genetik Kan Hattı Uyumu: %16
// 3. Resmî Galop & Son 400 Kopuş Sürati: %15
// 4. Son Koşular & Form İstikrarı: %14
// 5. Pist Geometrisi & Kulvar Avantajı: %10
// 6. Fiziksel Kondisyon & KGS (Dinlenme): %8
// 7. Sıklet (Kilo) & Taşıma Kapasitesi: %8
// 8. Jokey & Apranti Faktörü (MAKS %10 KURALI): %7
// 9. Ekipman & Takı Biyomekaniği (Tırnak, Gözlük, DB): %6
// ══════════════════════════════════════════════════════════════════════════════════
function calculatePowerIndex(horse, raceHorses = []) {
  // [Faktör 1: TJK Handikap & Sınıf Gücü - %22]
  const allHps = raceHorses.length > 0 ? raceHorses.map(h => h.handikap_puani || 40) : [40, 60];
  const maxHp = Math.max(...allHps);
  const minHp = Math.min(...allHps);
  const hp = horse.handikap_puani || 40;
  let handikapScore = 60;
  if (maxHp > minHp) {
    handikapScore = Math.round(35 + ((hp - minHp) / (maxHp - minHp)) * 60);
  } else {
    handikapScore = Math.min(96, Math.max(38, hp));
  }

  // [Faktör 2: Pedigri & Genetik Kan Hattı - %16]
  let pedScore = 62;
  const eliteSires = ['NATIVE KHAN', 'TOROK', 'LUXOR', 'VICTORY GALLOP', 'PAPA CLEM', 'KANEKO', 'DAREDEVIL', 'BODEMEISTER', 'KAIZBERT', 'ÖZHABER', 'SERHANTAY', 'MYBOYCHARLIE', 'TİZWAY', 'LION HEART', 'MENDIP', 'FAST 'N' FAMOUS', 'JOKER'];
  const eliteBroodmare = ['BATYSKAF', 'UNACCOUNTED FOR', 'ALWAY A CLASSIC', 'SRI PEKAN', 'ROYAL ABJAR', 'HABERBATUR', 'DEMİRKAZIK', 'BİRADER'];
  const sireMatch = eliteSires.some(s => (horse.baba || '').toUpperCase().includes(s));
  const mareSireMatch = eliteBroodmare.some(s => (horse.kisrak_babasi || '').toUpperCase().includes(s));
  if (sireMatch && mareSireMatch) pedScore = 96;
  else if (sireMatch) pedScore = 88;
  else if (mareSireMatch) pedScore = 80;
  else pedScore = 64;

  // [Faktör 3: Resmî Galop & Son 400 Kopuş Sürati - %15]
  let galopScore = 62;
  if (horse.son_galop && horse.son_galop.son400hiz) {
    const speed = horse.son_galop.son400hiz; // 46 - 56 km/s aralığı
    galopScore = Math.min(99, Math.max(35, Math.round(30 + (speed - 46) * 7.2)));
  }

  // [Faktör 4: Son Koşular Formu & Tabela İstikrarı - %14]
  let formScore = 52;
  const past = horse.son_yarislar || '';
  if (past) {
    let pts = 0;
    let counted = 0;
    for (let i = 0; i < Math.min(past.length, 5); i++) {
      const ch = past[i];
      if (ch === '1') pts += 98;
      else if (ch === '2') pts += 85;
      else if (ch === '3') pts += 72;
      else if (ch === '4') pts += 60;
      else if (ch === '5') pts += 48;
      else pts += 20;
      counted++;
    }
    formScore = Math.round(counted > 0 ? pts / counted : 52);
  }

  // [Faktör 5: Pist Geometrisi & Kulvar Avantajı - %10]
  let trackScore = 70;
  const kulvar = horse.kulvar || horse.no || 5;
  if (kulvar >= 1 && kulvar <= 4) trackScore = 92; // İç kulvar viraj koruması
  else if (kulvar <= 8) trackScore = 76;
  else trackScore = 58; // Dış kulvar viraj savrulması
  if (horse.trackGeometry && horse.trackGeometry.status === 'ADVANTAGE') trackScore = Math.min(98, trackScore + 8);

  // [Faktör 6: Fiziksel Kondisyon & KGS Penceresi - %8]
  let kgsScore = 75;
  const kgs = horse.dinlenme_gunu || 21;
  if (kgs >= 14 && kgs <= 35) kgsScore = 96; // Optimum form döngüsü
  else if (kgs >= 7 && kgs < 14) kgsScore = 80;
  else if (kgs > 35 && kgs <= 70) kgsScore = 72;
  else if (kgs > 120) kgsScore = 48; // Uzun ara / nefes eksikliği
  else if (kgs < 7) kgsScore = 55; // Yorgunluk riski

  // [Faktör 7: Sıklet (Kilo) Taşıma Kapasitesi - %8]
  const siklet = horse.siklet || 56;
  let sikletScore = Math.min(96, Math.max(45, Math.round(96 - (siklet - 50) * 3.8)));

  // [Faktör 8: Jokey Faktörü - KESİNLİKLE %10 ALTI (%7) - %7]
  const eliteJockeys = ['H.KARATAŞ', 'Ö.YILDIRIM', 'A.SÖZEN', 'V.ABİŞ', 'A.KURŞUN', 'G.ÖZÇELİK', 'H.ÇİZİK', 'A.YILDIZ', 'M.KAYA', 'S.KAYA', 'S.BOYRAZ', 'E.AKTUĞ', 'M.AKYAVUZ'];
  const jWinRate = horse.jokey_kazanma_orani || 10;
  let jokeyScore = 52;
  if (eliteJockeys.some(j => (horse.jokey || '').toUpperCase().includes(j))) {
    jokeyScore = Math.round(84 + Math.min(14, jWinRate * 0.6));
  } else if (horse.apranti_indirimi) {
    jokeyScore = Math.round(58 + Math.min(18, jWinRate));
  } else {
    jokeyScore = Math.round(48 + Math.min(30, jWinRate * 1.2));
  }

  // [Faktör 9: Ekipman & Takı Biyomekaniği (Tırnak, Gözlük, DB) - %6]
  let takiScore = 65;
  const takilar = horse.takilar || [];
  if (takilar.includes('KG') && takilar.includes('DB') && takilar.includes('SK')) takiScore = 95;
  else if (takilar.includes('KG') && takilar.includes('DB')) takiScore = 90;
  else if (takilar.length >= 2) takiScore = 82;
  else if (takilar.length === 1) takiScore = 72;
  if (horse.taki_degisimi_pozitif) takiScore = Math.min(99, takiScore + 6);

  // TOPLAM AĞIRLIKLI ROYAL PUANI (100% DAĞILIM):
  // 0.22 Handikap + 0.16 Pedigri + 0.15 Galop + 0.14 Form + 0.10 Kulvar + 0.08 KGS + 0.08 Sıklet + 0.07 Jokey + 0.06 Ekipman
  const royalScore = Math.round(
    (handikapScore * 0.22) +
    (pedScore * 0.16) +
    (galopScore * 0.15) +
    (formScore * 0.14) +
    (trackScore * 0.10) +
    (kgsScore * 0.08) +
    (sikletScore * 0.08) +
    (jokeyScore * 0.07) +
    (takiScore * 0.06)
  );

  return {
    royalScore: Math.min(99, Math.max(35, royalScore)),
    handikapScore,
    pedScore,
    galopScore,
    formScore,
    trackScore,
    kgsScore,
    sikletScore,
    jokeyScore,
    takiScore
  };
}
`;

// Replace function in index.html
const startIdx = html.indexOf('function calculatePowerIndex(horse, raceHorses = []) {');
const endIdx = html.indexOf('function renderRaceDetails() {');

if (startIdx === -1 || endIdx === -1) {
  console.error('Target function calculatePowerIndex not found!');
  process.exit(1);
}

html = html.substring(0, startIdx) + newEngineCode.trim() + '\n\n' + html.substring(endIdx);

// Now update the factor bars in horse card render
const oldAnalyticaBars = `<div class="analytica-bars">
        <div class="bar-entry">
          <span class="bar-name">Soy / Genetik</span>
          <div class="bar-track"><div class="bar-fill-gold" style="width:\${h.pedScore}%"></div></div>
          <span class="bar-digit">\${h.pedScore}</span>
        </div>
        <div class="bar-entry">
          <span class="bar-name">Jokey Uyumu</span>
          <div class="bar-track"><div class="bar-fill-gold" style="width:\${h.jokeyScore}%"></div></div>
          <span class="bar-digit">\${h.jokeyScore}</span>
        </div>
        <div class="bar-entry">
          <span class="bar-name">İdman Derecesi</span>
          <div class="bar-track"><div class="bar-fill-gold" style="width:\${h.galopScore}%"></div></div>
          <span class="bar-digit">\${h.galopScore}</span>
        </div>
        <div class="bar-entry">
          <span class="bar-name">Fiziksel Form</span>
          <div class="bar-track"><div class="bar-fill-gold" style="width:\${h.physicalScore}%"></div></div>
          <span class="bar-digit">\${h.physicalScore}</span>
        </div>
      </div>`;

const newAnalyticaBars = `<div class="analytica-bars" style="grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-top: 1.1rem; padding-top: 0.9rem; border-top: 1px solid rgba(212,175,55,0.15);">
        <div class="bar-entry">
          <span class="bar-name">🏛 Handikap (%22)</span>
          <div class="bar-track"><div class="bar-fill-gold" style="width:\${h.handikapScore}%"></div></div>
          <span class="bar-digit">\${h.handikapScore}</span>
        </div>
        <div class="bar-entry">
          <span class="bar-name">🧬 Soy/Pedigri (%16)</span>
          <div class="bar-track"><div class="bar-fill-gold" style="width:\${h.pedScore}%"></div></div>
          <span class="bar-digit">\${h.pedScore}</span>
        </div>
        <div class="bar-entry">
          <span class="bar-name">⚡ Galop Hızı (%15)</span>
          <div class="bar-track"><div class="bar-fill-gold" style="width:\${h.galopScore}%"></div></div>
          <span class="bar-digit">\${h.galopScore}</span>
        </div>
        <div class="bar-entry">
          <span class="bar-name">📈 Form/Tabela (%14)</span>
          <div class="bar-track"><div class="bar-fill-gold" style="width:\${h.formScore}%"></div></div>
          <span class="bar-digit">\${h.formScore}</span>
        </div>
        <div class="bar-entry">
          <span class="bar-name">🎯 Kulvar/Pist (%10)</span>
          <div class="bar-track"><div class="bar-fill-gold" style="width:\${h.trackScore}%"></div></div>
          <span class="bar-digit">\${h.trackScore}</span>
        </div>
        <div class="bar-entry">
          <span class="bar-name">⏳ KGS/Dinlenme (%8)</span>
          <div class="bar-track"><div class="bar-fill-gold" style="width:\${h.kgsScore}%"></div></div>
          <span class="bar-digit">\${h.kgsScore}</span>
        </div>
        <div class="bar-entry">
          <span class="bar-name">⚖ Sıklet/Kilo (%8)</span>
          <div class="bar-track"><div class="bar-fill-gold" style="width:\${h.sikletScore}%"></div></div>
          <span class="bar-digit">\${h.sikletScore}</span>
        </div>
        <div class="bar-entry">
          <span class="bar-name" style="color:var(--text-gold);">🏇 Jokey/Apranti (%7)</span>
          <div class="bar-track"><div class="bar-fill-gold" style="width:\${h.jokeyScore}%; background:linear-gradient(90deg, #d4af37, #f3e5ab);"></div></div>
          <span class="bar-digit" style="color:var(--text-gold);">\${h.jokeyScore}</span>
        </div>
        <div class="bar-entry">
          <span class="bar-name">🛡 Ekipman/Takı (%6)</span>
          <div class="bar-track"><div class="bar-fill-gold" style="width:\${h.takiScore}%"></div></div>
          <span class="bar-digit">\${h.takiScore}</span>
        </div>
      </div>`;

if (html.includes(oldAnalyticaBars)) {
  html = html.replace(oldAnalyticaBars, newAnalyticaBars);
} else {
  // Replace via regex if whitespace differs
  const r = /<div class="analytica-bars">[\s\S]*?<\/div>[\s]*<\/div>/;
  html = html.replace(r, newAnalyticaBars);
}

// Add Model Architecture Banner right above race curtain in view-bulten
const modelArchitectureBanner = `
    <!-- MODEL ZEKA & KATSAYI ŞEFFAFLIK MİMARİSİ -->
    <div style="background: rgba(16, 20, 28, 0.9); border: 1px solid var(--gold-soft-border); border-radius: 16px; padding: 1.2rem 1.8rem; margin-bottom: 2rem; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem;">
      <div style="display:flex; align-items:center; gap:0.9rem;">
        <div style="font-size:1.8rem; color:var(--gold-pure);">🔬</div>
        <div>
          <div style="font-family:'Cinzel', serif; font-size:1.05rem; font-weight:700; color:var(--gold-champagne);">ÇOK FAKTÖRLÜ BİYOMEKANİK & EKONOMETRİK MODEL MİMARİSİ</div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Atın biyolojisinden tırnağına, pedigrisinden galop hızına 9 temel eksende hesaplanır. Jokey ağırlığı at yarışının doğasına uygun olarak <b>%7 (Maks %10)</b> ile sınırlandırılmıştır.</div>
        </div>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:0.4rem; font-size:0.72rem; font-family:'JetBrains Mono', monospace;">
        <span style="background:rgba(212,175,55,0.12); border:1px solid rgba(212,175,55,0.3); padding:0.25rem 0.55rem; border-radius:6px; color:#f3e5ab;">🏛 Handikap: %22</span>
        <span style="background:rgba(212,175,55,0.12); border:1px solid rgba(212,175,55,0.3); padding:0.25rem 0.55rem; border-radius:6px; color:#f3e5ab;">🧬 Pedigri: %16</span>
        <span style="background:rgba(212,175,55,0.12); border:1px solid rgba(212,175,55,0.3); padding:0.25rem 0.55rem; border-radius:6px; color:#f3e5ab;">⚡ Galop Hızı: %15</span>
        <span style="background:rgba(212,175,55,0.12); border:1px solid rgba(212,175,55,0.3); padding:0.25rem 0.55rem; border-radius:6px; color:#f3e5ab;">📈 Form: %14</span>
        <span style="background:rgba(212,175,55,0.12); border:1px solid rgba(212,175,55,0.3); padding:0.25rem 0.55rem; border-radius:6px; color:#f3e5ab;">🎯 Kulvar: %10</span>
        <span style="background:rgba(212,175,55,0.12); border:1px solid rgba(212,175,55,0.3); padding:0.25rem 0.55rem; border-radius:6px; color:#f3e5ab;">⏳ KGS: %8</span>
        <span style="background:rgba(212,175,55,0.12); border:1px solid rgba(212,175,55,0.3); padding:0.25rem 0.55rem; border-radius:6px; color:#f3e5ab;">⚖ Sıklet: %8</span>
        <span style="background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.4); padding:0.25rem 0.55rem; border-radius:6px; color:#34d399; font-weight:700;">🏇 Jokey: %7 (≤ %10 Kuralı)</span>
        <span style="background:rgba(212,175,55,0.12); border:1px solid rgba(212,175,55,0.3); padding:0.25rem 0.55rem; border-radius:6px; color:#f3e5ab;">🛡 Ekipman: %6</span>
      </div>
    </div>
`;

if (!html.includes('ÇOK FAKTÖRLÜ BİYOMEKANİK & EKONOMETRİK MODEL MİMARİSİ')) {
  html = html.replace('<div class="race-curtain" id="race-curtain"></div>', modelArchitectureBanner + '\n    <div class="race-curtain" id="race-curtain"></div>');
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully applied Grand Turf Quantitative AI Engine!');
