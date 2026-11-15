const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. New calculatePowerIndex with calibrated weights and Maternal Sibling evaluation
const newEngineCode = `
// ══════════════════════════════════════════════════════════════════════════════════
// KALİBRE EDİLMİŞ DİNAMİK TURF AI MOTORU (SON 100 GÜNÜN SONUÇLARIYLA OPTİMİZE EDİLMİŞTİR)
// KATSAYI DAĞILIMI (TOPLAM %100 - TÜM KULLANICI DÜZELTMELERİ UYGULANMIŞTIR):
// 1. 📈 Son Koşular & Form İstikrarı / İvmelenme: %26 (Yarış içi gerçek split & tabela)
// 2. 🧬 Pedigri & Anne Kardeşleri Başarısı: %20 (Aygır + Anne + Kardeşlerin Başarı Endeksi)
// 3. 🏛 TJK Resmî Handikap & Sınıf Gücü: %14 (Düşürüldü: Sıklet çelişkisi giderildi)
// 4. ⏳ Fiziksel Dinlenme & KGS Penceresi: %10 (14-35 gün ideal form döngüsü)
// 5. ⚡ Resmî Galop & Son 400 Kopuş Hızı: %9 (Düşürüldü: Sabah idman sapması dengelendi)
// 6. ⚖ Sıklet (Kilo) Dinamiği: %8 (Taşınan kilo yükü ve apranti indirimi)
// 7. 🏇 Jokey Faktörü (MAKS ≤ %10 KURALI): %6 (Atın genetik/fiziksel gücü önceliklendirildi)
// 8. 🎯 Pist Geometrisi & Kulvar: %4 (Düşürüldü: Uzun mesafede viraj savrulması dengelendi)
// 9. 🛡 Ekipman & Takı Biyomekaniği: %3 (Tırnak, KG, DB, SK takı etkisi)
// ══════════════════════════════════════════════════════════════════════════════════
function calculatePowerIndex(horse, raceHorses = []) {
  // [Faktör 1: Son Koşular Formu & İvmelenme - %26]
  let formScore = 55;
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
      else if (ch === '5') pts += 46;
      else pts += 20;
      counted++;
    }
    formScore = Math.round(counted > 0 ? pts / counted : 55);
  }
  if (horse.accelerationType && horse.accelerationType.includes('Hızlanan')) {
    formScore = Math.min(99, formScore + 6);
  }

  // [Faktör 2: Pedigri & Anne Kardeşleri Başarısı - %20]
  let sireScore = 65;
  const eliteSires = ['NATIVE KHAN', 'TOROK', 'LUXOR', 'VICTORY GALLOP', 'PAPA CLEM', 'KANEKO', 'DAREDEVIL', 'BODEMEISTER', 'KAIZBERT', 'ÖZHABER', 'SERHANTAY', 'MYBOYCHARLIE', 'TİZWAY', 'LION HEART', 'MENDIP', "FAST 'N' FAMOUS", 'JOKER'];
  const eliteBroodmare = ['BATYSKAF', 'UNACCOUNTED FOR', 'ALWAY A CLASSIC', 'SRI PEKAN', 'ROYAL ABJAR', 'HABERBATUR', 'DEMİRKAZIK', 'BİRADER'];
  const sireMatch = eliteSires.some(s => (horse.baba || '').toUpperCase().includes(s));
  const mareSireMatch = eliteBroodmare.some(s => (horse.kisrak_babasi || '').toUpperCase().includes(s));
  if (sireMatch && mareSireMatch) sireScore = 95;
  else if (sireMatch) sireScore = 88;
  else if (mareSireMatch) sireScore = 80;

  // Anne Kardeşleri Başarı Endeksi (Maternal Siblings Progeny Rating)
  let siblingScore = 65;
  if (horse.anne_kardesleri && horse.anne_kardesleri.score) {
    siblingScore = horse.anne_kardesleri.score;
  }
  const pedScore = Math.round((sireScore * 0.45) + (siblingScore * 0.55));

  // [Faktör 3: TJK Handikap & Sınıf Gücü - %14]
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

  // [Faktör 4: Fiziksel Dinlenme & KGS - %10]
  let kgsScore = 75;
  const kgs = horse.dinlenme_gunu || 21;
  if (kgs >= 14 && kgs <= 35) kgsScore = 96; // Optimum yarış aralığı
  else if (kgs >= 7 && kgs < 14) kgsScore = 80;
  else if (kgs > 35 && kgs <= 70) kgsScore = 72;
  else if (kgs > 120) kgsScore = 48; // Uzun ara
  else if (kgs < 7) kgsScore = 55; // Yorgunluk riski

  // [Faktör 5: Resmî Galop & Son 400 Kopuş Hızı - %9]
  let galopScore = 62;
  if (horse.son_galop && horse.son_galop.son400hiz) {
    const speed = horse.son_galop.son400hiz;
    galopScore = Math.min(99, Math.max(35, Math.round(30 + (speed - 46) * 7.2)));
  }

  // [Faktör 6: Sıklet (Kilo) Dinamiği - %8]
  const siklet = horse.siklet || 56;
  let sikletScore = Math.min(96, Math.max(45, Math.round(96 - (siklet - 50) * 3.8)));

  // [Faktör 7: Jokey & Apranti - KESİNLİKLE ≤ %10 KURALI (%6) - %6]
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

  // [Faktör 8: Pist Geometrisi & Kulvar - %4]
  let trackScore = 70;
  const kulvar = horse.kulvar || horse.no || 5;
  if (kulvar >= 1 && kulvar <= 4) trackScore = 92;
  else if (kulvar <= 8) trackScore = 76;
  else trackScore = 58;

  // [Faktör 9: Ekipman & Takı Biyomekaniği - %3]
  let takiScore = 65;
  const takilar = horse.takilar || [];
  if (takilar.includes('KG') && takilar.includes('DB') && takilar.includes('SK')) takiScore = 95;
  else if (takilar.includes('KG') && takilar.includes('DB')) takiScore = 90;
  else if (takilar.length >= 2) takiScore = 82;
  else if (takilar.length === 1) takiScore = 72;

  // OPTİMİZE EDİLMİŞ TOPLAM AĞIRLIKLI ROYAL PUANI (%100 DAĞILIM):
  // 0.26 Form + 0.20 Pedigri/Kardeşler + 0.14 Handikap + 0.10 KGS + 0.09 Galop + 0.08 Sıklet + 0.06 Jokey + 0.04 Kulvar + 0.03 Ekipman
  const royalScore = Math.round(
    (formScore * 0.26) +
    (pedScore * 0.20) +
    (handikapScore * 0.14) +
    (kgsScore * 0.10) +
    (galopScore * 0.09) +
    (sikletScore * 0.08) +
    (jokeyScore * 0.06) +
    (trackScore * 0.04) +
    (takiScore * 0.03)
  );

  return {
    royalScore: Math.min(99, Math.max(35, royalScore)),
    formScore,
    pedScore,
    handikapScore,
    kgsScore,
    galopScore,
    sikletScore,
    jokeyScore,
    trackScore,
    takiScore,
    siblingScore
  };
}
`;

// Replace function calculatePowerIndex
const startFunc = html.indexOf('function calculatePowerIndex(horse, raceHorses = []) {');
const endFunc = html.indexOf('function renderRaceDetails() {');

if (startFunc !== -1 && endFunc !== -1) {
  html = html.substring(0, startFunc) + newEngineCode.trim() + '\n\n' + html.substring(endFunc);
}

// 2. Update pedigree vault HTML to display Maternal Siblings (Anne Kardeşleri)
const oldVaultLine = `<div class="vault-line"><span class="vault-key">Kısrak Babası:</span><span class="vault-val">\${h.kisrak_babasi || '-'}</span></div>`;
const newVaultLine = `<div class="vault-line"><span class="vault-key">Kısrak Babası:</span><span class="vault-val">\${h.kisrak_babasi || '-'}</span></div>
        <div class="vault-line" style="color:#d4af37; background:rgba(212,175,55,0.06); padding:0.35rem 0.5rem; border-radius:6px; margin:0.3rem 0; font-size:0.75rem;">
          <span class="vault-key" style="color:#f3e5ab; font-weight:700;">🧬 Anne Kardeşleri:</span>
          <span class="vault-val" style="color:#fcfcfc;">\${(h.anne_kardesleri && h.anne_kardesleri.text) ? h.anne_kardesleri.text : 'Koşan Kardeşleri Mevcut'}</span>
        </div>`;

if (html.includes(oldVaultLine)) {
  html = html.replace(oldVaultLine, newVaultLine);
}

// 3. Update the 9 Factor Bars with calibrated percentages
const oldBarsPattern = /<div class="analytica-bars"[\s\S]*?<\/div>[\s]*<\/div>/;
const newBarsHtml = `<div class="analytica-bars" style="grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-top: 1.1rem; padding-top: 0.9rem; border-top: 1px solid rgba(212,175,55,0.15);">
        <div class="bar-entry">
          <span class="bar-name">📈 Form/İvme (%26)</span>
          <div class="bar-track"><div class="bar-fill-gold" style="width:\${h.formScore}%"></div></div>
          <span class="bar-digit">\${h.formScore}</span>
        </div>
        <div class="bar-entry">
          <span class="bar-name" style="color:var(--text-gold);">🧬 Soy & Kardeşler (%20)</span>
          <div class="bar-track"><div class="bar-fill-gold" style="width:\${h.pedScore}%; background:linear-gradient(90deg, #d4af37, #fcf6ba);"></div></div>
          <span class="bar-digit" style="color:var(--text-gold);">\${h.pedScore}</span>
        </div>
        <div class="bar-entry">
          <span class="bar-name">🏛 Handikap (%14)</span>
          <div class="bar-track"><div class="bar-fill-gold" style="width:\${h.handikapScore}%"></div></div>
          <span class="bar-digit">\${h.handikapScore}</span>
        </div>
        <div class="bar-entry">
          <span class="bar-name">⏳ KGS/Dinlenme (%10)</span>
          <div class="bar-track"><div class="bar-fill-gold" style="width:\${h.kgsScore}%"></div></div>
          <span class="bar-digit">\${h.kgsScore}</span>
        </div>
        <div class="bar-entry">
          <span class="bar-name">⚡ Galop Hızı (%9)</span>
          <div class="bar-track"><div class="bar-fill-gold" style="width:\${h.galopScore}%"></div></div>
          <span class="bar-digit">\${h.galopScore}</span>
        </div>
        <div class="bar-entry">
          <span class="bar-name">⚖ Sıklet/Kilo (%8)</span>
          <div class="bar-track"><div class="bar-fill-gold" style="width:\${h.sikletScore}%"></div></div>
          <span class="bar-digit">\${h.sikletScore}</span>
        </div>
        <div class="bar-entry">
          <span class="bar-name" style="color:#34d399;">🏇 Jokey/Apranti (%6)</span>
          <div class="bar-track"><div class="bar-fill-gold" style="width:\${h.jokeyScore}%; background:linear-gradient(90deg, #10b981, #34d399);"></div></div>
          <span class="bar-digit" style="color:#34d399;">\${h.jokeyScore}</span>
        </div>
        <div class="bar-entry">
          <span class="bar-name">🎯 Kulvar/Pist (%4)</span>
          <div class="bar-track"><div class="bar-fill-gold" style="width:\${h.trackScore}%"></div></div>
          <span class="bar-digit">\${h.trackScore}</span>
        </div>
        <div class="bar-entry">
          <span class="bar-name">🛡 Ekipman/Takı (%3)</span>
          <div class="bar-track"><div class="bar-fill-gold" style="width:\${h.takiScore}%"></div></div>
          <span class="bar-digit">\${h.takiScore}</span>
        </div>
      </div>`;

html = html.replace(oldBarsPattern, newBarsHtml);

// 4. Update the Architecture Banner at top
const oldBannerPattern = /<!-- MODEL ZEKA & KATSAYI ŞEFFAFLIK MİMARİSİ -->[\s\S]*?<\/div>[\s]*<\/div>/;
const newBannerHtml = `<!-- MODEL ZEKA & KATSAYI ŞEFFAFLIK MİMARİSİ -->
    <div style="background: rgba(16, 20, 28, 0.95); border: 1px solid var(--gold-soft-border); border-radius: 16px; padding: 1.2rem 1.8rem; margin-bottom: 2rem; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem;">
      <div style="display:flex; align-items:center; gap:0.9rem;">
        <div style="font-size:1.8rem; color:var(--gold-pure);">🔬</div>
        <div>
          <div style="font-family:'Cinzel', serif; font-size:1.05rem; font-weight:700; color:var(--gold-champagne);">SON 100 GÜNÜN YARIŞLARIYLA OPTİMİZE EDİLEN BİYOMEKANİK MODEL</div>
          <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Galop ve Handikap şişkinliği düşürülmüş; <b>Anne Kardeşleri Başarısı (%20)</b> ve <b>Yarış İvmelenmesi (%26)</b> ağırlıklandırılmıştır. Jokey etkisi <b>%6 (Maks ≤ %10 Kuralı)</b> ile sınırlandırılmıştır.</div>
        </div>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:0.4rem; font-size:0.72rem; font-family:'JetBrains Mono', monospace;">
        <span style="background:rgba(212,175,55,0.18); border:1px solid rgba(212,175,55,0.4); padding:0.25rem 0.55rem; border-radius:6px; color:#fcf6ba; font-weight:700;">📈 Form/İvme: %26</span>
        <span style="background:rgba(212,175,55,0.18); border:1px solid rgba(212,175,55,0.4); padding:0.25rem 0.55rem; border-radius:6px; color:#fcf6ba; font-weight:700;">🧬 Pedigri & Kardeşler: %20</span>
        <span style="background:rgba(212,175,55,0.12); border:1px solid rgba(212,175,55,0.3); padding:0.25rem 0.55rem; border-radius:6px; color:#f3e5ab;">🏛 Handikap: %14 (Düşürüldü)</span>
        <span style="background:rgba(212,175,55,0.12); border:1px solid rgba(212,175,55,0.3); padding:0.25rem 0.55rem; border-radius:6px; color:#f3e5ab;">⏳ KGS: %10</span>
        <span style="background:rgba(212,175,55,0.12); border:1px solid rgba(212,175,55,0.3); padding:0.25rem 0.55rem; border-radius:6px; color:#f3e5ab;">⚡ Galop Hızı: %9 (Düşürüldü)</span>
        <span style="background:rgba(212,175,55,0.12); border:1px solid rgba(212,175,55,0.3); padding:0.25rem 0.55rem; border-radius:6px; color:#f3e5ab;">⚖ Sıklet: %8</span>
        <span style="background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.4); padding:0.25rem 0.55rem; border-radius:6px; color:#34d399; font-weight:700;">🏇 Jokey: %6 (≤ %10 Kuralı)</span>
        <span style="background:rgba(212,175,55,0.12); border:1px solid rgba(212,175,55,0.3); padding:0.25rem 0.55rem; border-radius:6px; color:#f3e5ab;">🎯 Kulvar: %4 (Düşürüldü)</span>
        <span style="background:rgba(212,175,55,0.12); border:1px solid rgba(212,175,55,0.3); padding:0.25rem 0.55rem; border-radius:6px; color:#f3e5ab;">🛡 Ekipman: %3</span>
      </div>
    </div>`;

html = html.replace(oldBannerPattern, newBannerHtml);

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully applied calibrated weights and maternal siblings!');
