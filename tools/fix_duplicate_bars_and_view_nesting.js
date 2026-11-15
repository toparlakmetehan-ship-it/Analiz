const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Fix the top banner in bulten-view (remove orphaned duplicate banner and premature </div>)
// Let's inspect the region between '<!-- MODEL ZEKA & KATSAYI ŞEFFAFLIK MİMARİSİ -->' and '<div class="race-curtain"'
const bannerStart = html.indexOf('<!-- MODEL ZEKA & KATSAYI ŞEFFAFLIK MİMARİSİ -->');
const curtainStart = html.indexOf('<div class="race-curtain" id="race-curtain"></div>');

if (bannerStart === -1 || curtainStart === -1) {
  console.error('Could not find banner or curtain in index.html');
  process.exit(1);
}

const cleanBannerHtml = `<!-- MODEL ZEKA & KATSAYI ŞEFFAFLIK MİMARİSİ -->
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
    </div>\n\n    `;

html = html.substring(0, bannerStart) + cleanBannerHtml + html.substring(curtainStart);

// 2. Ensure race-curtain and horses-grid are strictly inside bulten-view
// bulten-view should contain:
// <div class="view-pane active" id="bulten-view"> ... <div class="race-curtain">...</div><div class="horses-grid">...</div></div>
// and then <div class="view-pane" id="robot-view"> follows.
const bultenStart = html.indexOf('<div class="view-pane active" id="bulten-view">');
const robotStart = html.indexOf('<div class="view-pane" id="robot-view">');

const bultenContent = html.substring(bultenStart, robotStart);
console.log('Verifying bultenContent contains race-curtain:', bultenContent.includes('id="race-curtain"'));
console.log('Verifying bultenContent contains horses-grid:', bultenContent.includes('id="horses-grid"'));

// 3. Remove duplicate factor bars in horse monument card template
// Target the duplicate block starting after </div> around line 1028
const dupStart = html.indexOf('<div class="analytica-bars" style="grid-template-columns: repeat(3, 1fr);');
const specsTable = html.indexOf('<table class="monument-specs">');

if (dupStart === -1 || specsTable === -1) {
  console.error('Could not find analytica-bars or monument-specs in template');
  process.exit(1);
}

// Exactly ONE set of 9 factor bars:
const cleanAnalyticaBars = `<div class="analytica-bars" style="grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-top: 1.1rem; padding-top: 0.9rem; border-top: 1px solid rgba(212,175,55,0.15);">
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
      </div>\n\n      `;

html = html.substring(0, dupStart) + cleanAnalyticaBars + html.substring(specsTable);

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully eliminated duplicate bars and fixed view nesting!');
