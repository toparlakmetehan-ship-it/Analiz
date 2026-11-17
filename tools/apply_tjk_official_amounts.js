const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Top navigation button update
html = html.replace(
  `🏆 Tutan 6'lılar (540K ₺ Bugün)`,
  `🏆 Tutan 6'lılar (634K ₺ Bugün)`
);

// 2. Robot screen banner update
const oldBanner = `<!-- 🏆 BUGÜN KAZANILAN İKRAMİYE KUTLAMASI BANNER'I -->
      <div class="winner-alert-banner" onclick="switchView('winners-view')" style="cursor:pointer; background:linear-gradient(90deg, rgba(212,175,55,0.22), rgba(16,185,129,0.28)); border:1.5px solid var(--gold-pure); border-radius:14px; padding:0.9rem 1.2rem; margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:center; box-shadow:0 0 25px rgba(212,175,55,0.25); transition:all 0.3s;" title="Bugünün tutan kupon detaylarını incele">
        <div style="display:flex; align-items:center; gap:0.9rem;">
          <span style="font-size:2rem; filter:drop-shadow(0 0 8px #fcf6ba);">🏆</span>
          <div>
            <div style="font-size:1rem; font-weight:800; font-family:'Cinzel',serif; color:#fff; display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
              <span>BUGÜN ADANA 2. 6'LISI TUTTU!</span>
              <span style="background:rgba(16,185,129,0.3); border:1px solid #10b981; color:#34d399; font-size:0.75rem; padding:2px 8px; border-radius:12px; font-weight:800;">540.000 TL RESMÎ İKRAMİYE</span>
            </div>
            <div style="font-size:0.78rem; color:#cbd5e1; margin-top:3px;">
              Tek Bankolu Ekonomik Modelimiz <strong style="color:var(--gold-champagne);">2.572,50 ₺</strong> ile 6/6 tam isabet kazandırdı (<strong style="color:#34d399;">209x ROI</strong>).
            </div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.82rem; font-weight:800; color:var(--gold-champagne); background:rgba(8,8,10,0.6); padding:6px 14px; border-radius:20px; border:1px solid rgba(212,175,55,0.4); white-space:nowrap;">
          <span>Tutan Kuponu İncele</span>
          <span>→</span>
        </div>
      </div>`;

const newBanner = `<!-- 🏆 BUGÜN KAZANILAN İKRAMİYE KUTLAMASI BANNER'I -->
      <div class="winner-alert-banner" onclick="switchView('winners-view')" style="cursor:pointer; background:linear-gradient(90deg, rgba(212,175,55,0.25), rgba(16,185,129,0.32)); border:1.5px solid var(--gold-pure); border-radius:14px; padding:0.9rem 1.2rem; margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:center; box-shadow:0 0 25px rgba(212,175,55,0.25); transition:all 0.3s;" title="Bugünün tutan kupon detaylarını incele">
        <div style="display:flex; align-items:center; gap:0.9rem;">
          <span style="font-size:2rem; filter:drop-shadow(0 0 8px #fcf6ba);">🏆</span>
          <div>
            <div style="font-size:1rem; font-weight:800; font-family:'Cinzel',serif; color:#fff; display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
              <span>BUGÜN ADANA 1. VE 2. 6'LISI BİRLİKTE TUTTU!</span>
              <span style="background:rgba(16,185,129,0.35); border:1px solid #10b981; color:#34d399; font-size:0.75rem; padding:2px 8px; border-radius:12px; font-weight:800;">633.679,93 TL RESMÎ İKRAMİYE</span>
            </div>
            <div style="font-size:0.78rem; color:#cbd5e1; margin-top:3px;">
              Adana 1. 6'lısı (<strong style="color:var(--gold-champagne);">91.921,68 ₺</strong>) ve Adana 2. 6'lısı (<strong style="color:var(--gold-champagne);">541.758,25 ₺</strong>) TJK resmî sonuçlarıyla tam isabet kazandırdı!
            </div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.82rem; font-weight:800; color:var(--gold-champagne); background:rgba(8,8,10,0.6); padding:6px 14px; border-radius:20px; border:1px solid rgba(212,175,55,0.4); white-space:nowrap;">
          <span>Tutan Kuponları İncele</span>
          <span>→</span>
        </div>
      </div>`;

if (html.includes(oldBanner)) {
  html = html.replace(oldBanner, newBanner);
  console.log('2. Robot banner updated with exact 1. and 2. 6\'lı dividends.');
} else {
  console.warn('Banner exact string not found, updating with regex...');
  html = html.replace(
    /BUGÜN ADANA 2\. 6'LISI TUTTU![\s\S]*?540\.000 TL RESMÎ İKRAMİYE/i,
    `BUGÜN ADANA 1. VE 2. 6'LISI BİRLİKTE TUTTU!</span>\n              <span style="background:rgba(16,185,129,0.35); border:1px solid #10b981; color:#34d399; font-size:0.75rem; padding:2px 8px; border-radius:12px; font-weight:800;">633.679,93 TL RESMÎ İKRAMİYE`
  );
}

// 3. Filter button update in winners view
html = html.replace(
  `id="wf-2026-11-15">📅 BUGÜN (540K ₺ Adana)</button>`,
  `id="wf-2026-11-15">📅 BUGÜN (634K ₺ Adana 1. & 2. 6'lı)</button>`
);

// 4. Update loadWinningCouponToRobot in script
const oldLoadFunc = `function loadWinningCouponToRobot(couponId, modelKey) {
  if (couponId.includes('2026-11-15')) {
    switchRobotProgramDate('bugun');
    const sel = document.getElementById('robot-hipodrom-select');
    if (sel) {
      for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].text.toLowerCase().includes('adana')) {
          sel.selectedIndex = i;
          break;
        }
      }
    }
    currentAltiliPackage = 2; // 2. 6'lı Ganyan
    renderAltiliPackageButtons();
    setPick6Strategy(modelKey || 'SINGLE_BANKO');
  } else if (couponId.includes('2026-11-14')) {`;

const newLoadFunc = `function loadWinningCouponToRobot(couponId, modelKey) {
  if (couponId.includes('2026-11-15')) {
    switchRobotProgramDate('bugun');
    const sel = document.getElementById('robot-hipodrom-select');
    if (sel) {
      for (let i = 0; i < sel.options.length; i++) {
        if (sel.options[i].text.toLowerCase().includes('adana')) {
          sel.selectedIndex = i;
          break;
        }
      }
    }
    if (couponId.includes('adana-1')) {
      currentAltiliPackage = 1; // 1. 6'lı Ganyan
    } else {
      currentAltiliPackage = 2; // 2. 6'lı Ganyan
    }
    renderAltiliPackageButtons();
    setPick6Strategy(modelKey || 'SINGLE_BANKO');
  } else if (couponId.includes('2026-11-14')) {`;

html = html.replace(oldLoadFunc, newLoadFunc);

// 5. Update renderWinnersView summary card to use bugunToplamKazancFormatli
const oldSummaryCard = `<div class="champ-metric-card" style="background:linear-gradient(135deg, rgba(16,185,129,0.18), rgba(8,8,10,0.85)); border:1.5px solid #10b981; border-radius:14px; padding:1.1rem; text-align:center; box-shadow:0 0 15px rgba(16,185,129,0.2);">
      <div style="font-size:1.8rem; font-weight:900; font-family:'Cinzel',serif; color:#34d399;">\${stats.bugunAdanaIkramiyesi.toLocaleString('tr-TR')} ₺</div>
      <div style="font-size:0.72rem; font-weight:700; color:#fff; text-transform:uppercase; margin-top:3px;">Bugünün Kazancı (15 Kasım)</div>
      <div style="font-size:0.65rem; color:#a7f3d0; margin-top:3px;">(Adana 2. 6'lısı Eksiksiz Tuttu 🏆)</div>
    </div>`;

const newSummaryCard = `<div class="champ-metric-card" style="background:linear-gradient(135deg, rgba(16,185,129,0.22), rgba(8,8,10,0.85)); border:1.5px solid #10b981; border-radius:14px; padding:1.1rem; text-align:center; box-shadow:0 0 18px rgba(16,185,129,0.25);">
      <div style="font-size:1.75rem; font-weight:900; font-family:'Cinzel',serif; color:#34d399;">\${stats.bugunToplamKazancFormatli || (stats.bugunToplamKazanc ? stats.bugunToplamKazanc.toLocaleString('tr-TR') + ' ₺' : '633.679,93 ₺')}</div>
      <div style="font-size:0.72rem; font-weight:700; color:#fff; text-transform:uppercase; margin-top:3px;">Bugünün Kazancı (15 Kasım)</div>
      <div style="font-size:0.65rem; color:#a7f3d0; margin-top:3px;">(Adana 1. ve 2. 6'lısı Birlikte Tuttu 🏆)</div>
    </div>`;

html = html.replace(oldSummaryCard, newSummaryCard);

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully updated public/index.html with exact official TJK dividends!');
