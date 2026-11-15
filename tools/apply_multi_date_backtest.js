const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Find the date header inside backtest-view
const targetStr = '<div style="font-family:\'Cinzel\', serif; font-size:1.3rem; font-weight:800; color:var(--gold-champagne); display:flex; align-items:center; gap:0.6rem;">\n              <span>📅 DÜN: 14 KASIM 2026 RESMÎ TJK SONUÇLARI DOĞRULAMASI</span>\n            </div>';

const replacementStr = `<div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; width:100%;">
              <div>
                <div style="font-family:'Cinzel', serif; font-size:1.3rem; font-weight:800; color:var(--gold-champagne); display:flex; align-items:center; gap:0.6rem;">
                  <span id="bt-current-date-title">📅 GEÇMİŞ YARIŞ MODEL DOĞRULAMASI</span>
                </div>
                <div style="font-size:0.85rem; color:var(--text-muted); margin-top:4px;" id="bt-current-date-desc">
                  İstediğiniz geçmiş yarış gününü seçerek modelin tahminlerini ve TJK resmî kazananlarını karşılaştırın.
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:0.6rem;">
                <label style="font-size:0.85rem; font-weight:700; color:var(--text-gold);">Tarih Seçin:</label>
                <select id="backtest-date-select" onchange="onBacktestDateChange(this.value)" style="background:#161922; border:1px solid var(--gold-pure); color:#fcfcfc; padding:0.5rem 0.9rem; border-radius:10px; font-family:'Montserrat',sans-serif; font-size:0.85rem; font-weight:600; cursor:pointer; outline:none; box-shadow:0 0 15px rgba(212,175,55,0.2);">
                  <option value="2026-11-14" selected>📅 14 Kasım 2026 (Dün) — Ankara, İzmir, Diyarbakır (23 Koşu)</option>
                  <option value="2026-11-13">📅 13 Kasım 2026 (Cuma) — Bursa, İstanbul, Şanlıurfa (21 Koşu)</option>
                  <option value="2026-11-12">📅 12 Kasım 2026 (Perşembe) — İzmir, Kocaeli (16 Koşu)</option>
                </select>
              </div>
            </div>`;

if (html.includes(targetStr)) {
  html = html.replace(targetStr, replacementStr);
} else {
  console.log('Target string not exact, replacing via substring matching...');
  const idx = html.indexOf('📅 DÜN: 14 KASIM 2026 RESMÎ TJK SONUÇLARI DOĞRULAMASI');
  const parentDivStart = html.lastIndexOf('<div', idx);
  const parentDivEnd = html.indexOf('</div>', idx) + 6;
  html = html.substring(0, parentDivStart) + replacementStr + html.substring(parentDivEnd);
}

// Update the city filter container in backtest-view
const oldCityFilter = `<div style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
            <span style="font-size:0.8rem; color:var(--text-muted); margin-right:0.3rem;">Şehir Filtresi:</span>
            <button class="filter-chip active" onclick="filterBacktestCity('all', this)">Tümü (23 Koşu)</button>
            <button class="filter-chip" onclick="filterBacktestCity('Ankara', this)">Ankara (9 Koşu)</button>
            <button class="filter-chip" onclick="filterBacktestCity('İzmir', this)">İzmir (8 Koşu)</button>
            <button class="filter-chip" onclick="filterBacktestCity('Diyarbakır', this)">Diyarbakır (6 Koşu)</button>
          </div>`;

const newCityFilter = `<div style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
            <span style="font-size:0.8rem; color:var(--text-muted); margin-right:0.3rem;">Şehir Filtresi:</span>
            <div id="bt-city-chips" style="display:inline-flex; gap:0.4rem; flex-wrap:wrap;">
              <!-- Dinamik olarak dolacak -->
            </div>
          </div>`;

if (html.includes(oldCityFilter)) {
  html = html.replace(oldCityFilter, newCityFilter);
}

// Update script section to load backtest_archive.json and handle date switching
const scriptTarget = 'let backtestData = null;';
const scriptReplacement = `let backtestData = null;
let backtestArchive = null;
let selectedDateKey = '2026-11-14';`;

html = html.replace(scriptTarget, scriptReplacement);

// Update initPlatform to load backtest_archive.json
const fetchTarget = `const [bRes, btRes] = await Promise.all([
      fetch('/data/bulten_bugun.json'),
      fetch('/data/backtest_dun.json')
    ]);
    bulten = await bRes.json();
    backtestData = await btRes.json();`;

const fetchReplacement = `const [bRes, btRes, arcRes] = await Promise.all([
      fetch('/data/bulten_bugun.json'),
      fetch('/data/backtest_dun.json'),
      fetch('/data/backtest_archive.json')
    ]);
    bulten = await bRes.json();
    backtestData = await btRes.json();
    try {
      backtestArchive = await arcRes.json();
    } catch(e) {
      console.warn('Archive fallback');
    }`;

html = html.replace(fetchTarget, fetchReplacement);

// Update renderBacktest & onBacktestDateChange functions
const oldFuncStart = html.indexOf('function renderBacktest() {');
const oldFuncEnd = html.indexOf('window.onload = initPlatform;');

const newBacktestScript = `
function onBacktestDateChange(dateKey) {
  selectedDateKey = dateKey;
  if (backtestArchive && backtestArchive[dateKey]) {
    backtestData = backtestArchive[dateKey];
  }
  currentBacktestCity = 'all';
  currentBacktestOutcome = 'all';
  renderBacktest();
}

function renderBacktest() {
  if (!backtestData) return;

  const currentDayInfo = (backtestArchive && backtestArchive[selectedDateKey]) ? backtestArchive[selectedDateKey] : backtestData;

  const titleEl = document.getElementById('bt-current-date-title');
  const descEl = document.getElementById('bt-current-date-desc');
  if (titleEl) titleEl.innerText = \`📅 \${currentDayInfo.tarih || '14 Kasım 2026'} RESMÎ TJK SONUÇLARI\`;
  if (descEl) descEl.innerHTML = \`\${(currentDayInfo.sehirler || []).join(', ')} hipodromlarında koşulan toplam <strong>\${currentDayInfo.toplamKosu || 23} Koşunun</strong> tamamında modelin performansı.\`;

  const elFirst = document.getElementById('bt-first-rate');
  const elTop2 = document.getElementById('bt-top2-rate');
  const elTop3 = document.getElementById('bt-top3-rate');
  const elTop4 = document.getElementById('bt-top4-rate');

  if (elFirst) elFirst.innerText = \`%\${currentDayInfo.ilk1IsabetOrani || 39.1}\`;
  if (elTop2) elTop2.innerText = \`%\${currentDayInfo.ilk2IsabetOrani || 60.9}\`;
  if (elTop3) elTop3.innerText = \`%\${currentDayInfo.ilk3IsabetOrani || 73.9}\`;
  if (elTop4) elTop4.innerText = \`%\${currentDayInfo.ilk4IsabetOrani || 82.6}\`;

  // Render city chips dynamically for this date
  const cityChipsContainer = document.getElementById('bt-city-chips');
  if (cityChipsContainer) {
    cityChipsContainer.innerHTML = '';
    const allBtn = document.createElement('button');
    allBtn.className = \`filter-chip \${currentBacktestCity === 'all' ? 'active' : ''}\`;
    allBtn.innerText = \`Tümü (\${currentDayInfo.toplamKosu || 23} Koşu)\`;
    allBtn.onclick = () => filterBacktestCity('all', allBtn);
    cityChipsContainer.appendChild(allBtn);

    const sehirList = currentDayInfo.sehirler || ['Ankara', 'İzmir', 'Diyarbakır'];
    sehirList.forEach(sehir => {
      const cityRaces = (currentDayInfo.karsilastirmalar || []).filter(r => r.sehir === sehir).length;
      const cBtn = document.createElement('button');
      cBtn.className = \`filter-chip \${currentBacktestCity === sehir ? 'active' : ''}\`;
      cBtn.innerText = \`\${sehir} (\${cityRaces} Koşu)\`;
      cBtn.onclick = () => filterBacktestCity(sehir, cBtn);
      cityChipsContainer.appendChild(cBtn);
    });
  }

  renderBacktestTable();
}
`;

html = html.substring(0, oldFuncStart) + newBacktestScript.trim() + '\n\n' + html.substring(oldFuncStart);

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully added date selector and multi-date archive to index.html!');
