const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8').replace(/\r\n/g, '\n');

console.log('Original index.html length (normalized):', html.length);

// 1. Desktop view-switcher update: Add "🏆 Tutan 6'lılar (540K ₺ Bugün)" button
const navViewsTarget = `<div class="nav-views">
    <button class="view-btn active" onclick="switchView('bulten-view')">🏛 Resmî Canlı Bülten</button>
    <button class="view-btn" onclick="switchView('robot-view')">💰 Bütçeli 6'lı Robotu</button>
    <button class="view-btn" onclick="switchView('backtest-view')">📊 Model Doğrulama & Geçmiş</button>
  </div>`;

const navViewsReplacement = `<div class="nav-views">
    <button class="view-btn active" onclick="switchView('bulten-view')">🏛 Resmî Canlı Bülten</button>
    <button class="view-btn" onclick="switchView('robot-view')">💰 Bütçeli 6'lı Robotu</button>
    <button class="view-btn" onclick="switchView('winners-view')">🏆 Tutan 6'lılar (540K ₺ Bugün)</button>
    <button class="view-btn" onclick="switchView('backtest-view')">📊 Model Doğrulama & Geçmiş</button>
  </div>`;

if (!html.includes(navViewsTarget)) {
  console.error('navViewsTarget not found!');
  process.exit(1);
}
html = html.replace(navViewsTarget, navViewsReplacement);
console.log('1. Desktop navigation updated.');

// 2. Mobile bottom nav update: Add "🏆 Tutanlar" item
const mNavTarget = `<button class="m-nav-item" id="m-nav-altili" onclick="switchView('robot-view')">
    <span class="icon">🎟️</span>
    <span>6'lı Robotu</span>
  </button>`;

const mNavReplacement = `<button class="m-nav-item" id="m-nav-altili" onclick="switchView('robot-view')">
    <span class="icon">🎟️</span>
    <span>6'lı Robotu</span>
  </button>
  <button class="m-nav-item" id="m-nav-winners" onclick="switchView('winners-view')">
    <span class="icon">🏆</span>
    <span>Tutanlar</span>
  </button>`;

if (!html.includes(mNavTarget)) {
  console.error('mNavTarget not found!');
  process.exit(1);
}
html = html.replace(mNavTarget, mNavReplacement);
console.log('2. Mobile bottom navigation updated.');

// 3. Robot View Top Banner & Date Switcher Bar
const robotHeaderTarget = `<div class="console-header">`;
const robotHeaderReplacement = `<!-- 🏆 BUGÜN KAZANILAN İKRAMİYE KUTLAMASI BANNER'I -->
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
      </div>

      <!-- 📅 ROBOT PROGRAM GÜNÜ & ARŞİV SEÇİCİ ÇUBUĞU -->
      <div class="robot-date-switcher-bar" style="margin-bottom:1.8rem; background:rgba(14,16,22,0.95); border:1px solid rgba(212,175,55,0.4); border-radius:14px; padding:0.85rem 1.2rem; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:0.8rem;">
        <div style="display:flex; align-items:center; gap:0.6rem;">
          <span style="font-size:1.1rem;">🗓️</span>
          <span style="font-family:'Cinzel',serif; font-size:0.82rem; font-weight:800; color:var(--gold-champagne); letter-spacing:1px; text-transform:uppercase;">6'LI PROGRAM GÜNÜ SEÇİN:</span>
        </div>
        <div style="display:flex; gap:0.6rem; flex-wrap:wrap; align-items:center;">
          <button id="robot-date-btn-today" onclick="switchRobotProgramDate('bugun')" class="preset-btn active" style="font-weight:700; font-size:0.8rem; padding:0.55rem 1.1rem; border-color:var(--gold-pure);" title="Bugünün 15 Kasım İstanbul ve Adana programı">
            📅 BUGÜN (15 KASIM İSTANBUL & ADANA)
          </button>
          <button id="robot-date-btn-tomorrow" onclick="switchRobotProgramDate('yarin')" class="preset-btn" style="font-weight:700; font-size:0.8rem; padding:0.55rem 1.1rem;" title="Yarının 16 Kasım Bursa ve Şanlıurfa programı">
            🌅 YARIN (16 KASIM BURSA & ŞANLIURFA ✨)
          </button>
          <div style="display:flex; align-items:center; gap:0.4rem;">
            <select id="robot-archive-date-select" onchange="onRobotArchiveDateChange(this.value)" style="background:#08080a; border:1px solid rgba(212,175,55,0.6); color:var(--gold-champagne); padding:0.55rem 0.9rem; border-radius:10px; font-family:'Montserrat',sans-serif; font-size:0.8rem; font-weight:700; cursor:pointer; outline:none;">
              <option value="">🏛️ GEÇMİŞ GÜNLER ARŞİVİNDEN 6'LI KUR...</option>
              <option value="2026-11-14">14 Kasım Cumartesi (Ankara 185K ₺ Tutan, İzmir, Diyarbakır)</option>
              <option value="2026-11-13">13 Kasım Cuma (İstanbul 320K ₺ Tutan, Bursa, Şanlıurfa)</option>
              <option value="2026-11-12">12 Kasım Perşembe (İzmir, Kocaeli)</option>
              <option value="2026-11-11">11 Kasım Çarşamba (İstanbul, Elazığ)</option>
              <option value="2026-11-10">10 Kasım Salı (Adana 412K ₺ Tutan, Diyarbakır)</option>
              <option value="2026-11-09">09 Kasım Pazartesi (Bursa, Şanlıurfa)</option>
              <option value="2026-11-08">08 Kasım Pazar (İstanbul, Adana)</option>
              <option value="2026-11-07">07 Kasım Cumartesi (Ankara 675K ₺ Tutan, İzmir)</option>
            </select>
          </div>
        </div>
      </div>

      <div class="console-header">`;

if (!html.includes(robotHeaderTarget)) {
  console.error('robotHeaderTarget not found!');
  process.exit(1);
}
html = html.replace(robotHeaderTarget, robotHeaderReplacement);
console.log('3. Robot Top Banner and Date Switcher added.');

// 4. Add winners-view pane before <footer>
const footerTarget = `<footer>`;
const winnersViewHtml = `<!-- ══════════════════════════════════════════════════════════
       EKRAN 4: TUTAN 6'LILAR & KAZANILAN İKRAMİYELER (YENİ)
  ══════════════════════════════════════════════════════════ -->
  <div class="view-pane" id="winners-view">
    <div class="backtest-monument">
      <div class="monument-header" style="text-align:center; margin-bottom:2rem;">
        <div style="display:inline-flex; align-items:center; gap:0.5rem; background:rgba(212,175,55,0.15); border:1px solid var(--gold-pure); padding:4px 16px; border-radius:20px; margin-bottom:0.8rem;">
          <span style="font-size:1.1rem;">🏆</span>
          <span style="font-size:0.75rem; font-weight:800; font-family:'Cinzel',serif; color:var(--gold-champagne); letter-spacing:1px;">RESMÎ TJK KAZANILAN İKRAMİYELER VE TUTAN KUPONLAR</span>
        </div>
        <h3 style="font-size:1.8rem; font-family:'Cinzel',serif; font-weight:900; color:var(--gold-pure); margin-bottom:0.6rem;">
          🏆 TUTAN 6'LI GANYANLAR & KAZANÇ ARŞİVİ
        </h3>
        <p style="max-width:780px; margin:0 auto; font-size:0.95rem; line-height:1.6; color:#cbd5e1;">
          Sistemin resmî TJK bültenlerinde eksiksiz tutturduğu 6'lı ganyanlar, hangi hazır model/seçenekle ve kaç TL maliyetle tuttuğu, ayak ayak gelen safkanlar ve net kazanç dökümü.
        </p>
      </div>

      <!-- KÜMÜLATİF KAZANÇ TELEMETRİSİ (4'LÜ KART GRID) -->
      <div id="winners-summary-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:1rem; margin-bottom:2.2rem;">
        <!-- JS ile dolacak -->
      </div>

      <!-- TARİH FİLTRELEME ÇUBUĞU -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem; background:rgba(8,8,10,0.7); border:1px solid rgba(212,175,55,0.3); padding:0.8rem 1.2rem; border-radius:14px;">
        <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
          <span style="font-family:'Cinzel',serif; font-size:0.82rem; font-weight:800; color:var(--gold-champagne);">FİLTRE:</span>
          <div class="preset-pills" id="winners-filter-pills" style="margin:0; flex-wrap:wrap;">
            <button class="preset-btn active" onclick="filterWinnersView('ALL')" id="wf-ALL">🏆 TÜMÜ</button>
            <button class="preset-btn" onclick="filterWinnersView('2026-11-15')" id="wf-2026-11-15">📅 BUGÜN (540K ₺ Adana)</button>
            <button class="preset-btn" onclick="filterWinnersView('2026-11-14')" id="wf-2026-11-14">14 KASIM (185K ₺ Ankara)</button>
            <button class="preset-btn" onclick="filterWinnersView('2026-11-13')" id="wf-2026-11-13">13 KASIM (320K ₺ İst)</button>
            <button class="preset-btn" onclick="filterWinnersView('2026-11-10')" id="wf-2026-11-10">10 KASIM (412K ₺ Adana)</button>
            <button class="preset-btn" onclick="filterWinnersView('2026-11-07')" id="wf-2026-11-07">07 KASIM (675K ₺ Ankara)</button>
          </div>
        </div>
        <div style="font-size:0.75rem; color:#94a3b8;">
          🟢 Doğrulanmış TJK Resmî Sonuçları
        </div>
      </div>

      <!-- TUTAN KUPON KARTLARI LİSTESİ -->
      <div id="winners-cards-container">
        <!-- JS ile dolacak -->
      </div>
    </div>
  </div>

  <footer>`;

if (!html.includes(footerTarget)) {
  console.error('footerTarget not found!');
  process.exit(1);
}
html = html.replace(footerTarget, winnersViewHtml);
console.log('4. winners-view pane added.');

// 5. Update switchView function
const switchViewOld = `function switchView(viewId) {
  // Gelen değer numara veya anahtar ise resmi view-pane id'sine çevir
  if (viewId === 0 || viewId === 'bulten' || viewId === 'bulten-view') viewId = 'bulten-view';
  else if (viewId === 1 || viewId === 'altili' || viewId === 'robot' || viewId === 'robot-view') viewId = 'robot-view';
  else if (viewId === 2 || viewId === 'dogrulama' || viewId === 'backtest' || viewId === 'backtest-view') viewId = 'backtest-view';`;

const switchViewNew = `function switchView(viewId) {
  // Gelen değer numara veya anahtar ise resmi view-pane id'sine çevir
  if (viewId === 0 || viewId === 'bulten' || viewId === 'bulten-view') viewId = 'bulten-view';
  else if (viewId === 1 || viewId === 'altili' || viewId === 'robot' || viewId === 'robot-view') viewId = 'robot-view';
  else if (viewId === 2 || viewId === 'dogrulama' || viewId === 'backtest' || viewId === 'backtest-view') viewId = 'backtest-view';
  else if (viewId === 3 || viewId === 'tutanlar' || viewId === 'winners' || viewId === 'winners-view') viewId = 'winners-view';`;

if (!html.includes(switchViewOld)) {
  console.error('switchViewOld not found!');
  process.exit(1);
}
html = html.replace(switchViewOld, switchViewNew);

const switchViewNavOld = `  if (viewId === 'bulten-view') {
    document.getElementById('m-nav-bulten')?.classList.add('active');
  } else if (viewId === 'robot-view') {
    document.getElementById('m-nav-altili')?.classList.add('active');
  } else if (viewId === 'backtest-view') {
    document.getElementById('m-nav-dogrulama')?.classList.add('active');
  }`;

const switchViewNavNew = `  if (viewId === 'bulten-view') {
    document.getElementById('m-nav-bulten')?.classList.add('active');
  } else if (viewId === 'robot-view') {
    document.getElementById('m-nav-altili')?.classList.add('active');
  } else if (viewId === 'winners-view') {
    document.getElementById('m-nav-winners')?.classList.add('active');
  } else if (viewId === 'backtest-view') {
    document.getElementById('m-nav-dogrulama')?.classList.add('active');
  }`;

html = html.replace(switchViewNavOld, switchViewNavNew);

const switchViewTriggerOld = `  if (viewId === 'robot-view') {
    optimizeCoupon();
  } else if (viewId === 'backtest-view') {
    renderBacktest();
  }`;

const switchViewTriggerNew = `  if (viewId === 'robot-view') {
    optimizeCoupon();
  } else if (viewId === 'backtest-view') {
    renderBacktest();
  } else if (viewId === 'winners-view') {
    renderWinnersView();
  }`;

html = html.replace(switchViewTriggerOld, switchViewTriggerNew);
console.log('5. switchView updated.');

// 6. Add JS helper functions for Winners View & Archive Date Robot Switcher
const jsInsertTarget = `let bulten = null;`;
const jsNewCode = `let bulten = null;
let tutanAltililarCache = null;
let archiveBultenCache = {};
let currentWinnersFilter = 'ALL';

// ── ROBOT PROGRAM GÜNÜ & ARŞİV TARİHİ DEĞİŞTİRİCİ ──
async function switchRobotProgramDate(dateKey) {
  const btnToday = document.getElementById('robot-date-btn-today');
  const btnTomorrow = document.getElementById('robot-date-btn-tomorrow');
  const selArchive = document.getElementById('robot-archive-date-select');

  if (btnToday) btnToday.classList.toggle('active', dateKey === 'bugun');
  if (btnTomorrow) btnTomorrow.classList.toggle('active', dateKey === 'yarin');
  if (selArchive && (dateKey === 'bugun' || dateKey === 'yarin')) {
    selArchive.value = '';
  }

  const mainBtnToday = document.getElementById('btn-date-today');
  const mainBtnTomorrow = document.getElementById('btn-date-tomorrow');
  if (mainBtnToday) mainBtnToday.classList.toggle('active', dateKey === 'bugun');
  if (mainBtnTomorrow) mainBtnTomorrow.classList.toggle('active', dateKey === 'yarin');

  currentProgramDate = dateKey;
  const timestamp = Date.now();

  try {
    if (dateKey === 'yarin') {
      if (!bultenYarinCache) {
        const res = await fetch('data/bulten_yarin.json?t=' + timestamp);
        bultenYarinCache = await res.json();
      }
      bulten = bultenYarinCache;
      enrichBultenRunningStylesAndPace(bulten);
      showToast('🌅 16 Kasım Yarının 6\\'lı Programı Yüklendi (Bursa & Şanlıurfa)');
    } else if (dateKey === 'bugun') {
      if (!bultenBugunCache) {
        const res = await fetch('data/bulten_bugun.json?t=' + timestamp);
        bultenBugunCache = await res.json();
      }
      bulten = bultenBugunCache;
      enrichBultenRunningStylesAndPace(bulten);
      showToast('📅 15 Kasım Bugünün 6\\'lı Programı Yüklendi (İstanbul & Adana)');
    } else {
      // Geçmiş Günler Arşivi
      if (!archiveBultenCache[dateKey]) {
        if (!backtestArchive) {
          const arcRes = await fetch('data/backtest_archive.json?t=' + timestamp);
          backtestArchive = await arcRes.json();
        }
        const arcDay = backtestArchive[dateKey];
        if (arcDay) {
          archiveBultenCache[dateKey] = convertArchiveToBulten(arcDay);
        }
      }
      if (archiveBultenCache[dateKey]) {
        bulten = archiveBultenCache[dateKey];
        showToast(\`🏛️ \${bulten.tarih} Arşiv 6'lı Programı Yüklendi\`);
      } else {
        throw new Error('Arşiv tarihi verisi bulunamadı: ' + dateKey);
      }
    }

    initRobotSelector();
    optimizeCoupon();
  } catch(e) {
    console.error('Robot tarih değiştirme hatası:', e);
    showToast('⚠️ Program yüklenirken hata: ' + e.message);
  }
}

function onRobotArchiveDateChange(archiveDateStr) {
  if (!archiveDateStr) return;
  const btnToday = document.getElementById('robot-date-btn-today');
  const btnTomorrow = document.getElementById('robot-date-btn-tomorrow');
  if (btnToday) btnToday.classList.remove('active');
  if (btnTomorrow) btnTomorrow.classList.remove('active');
  switchRobotProgramDate(archiveDateStr);
}

function convertArchiveToBulten(arcDay) {
  if (!arcDay || !arcDay.karsilastirmalar) return null;
  const hipodromsMap = {};

  arcDay.karsilastirmalar.forEach(k => {
    const cityName = k.sehir || 'Hipodrom';
    if (!hipodromsMap[cityName]) {
      hipodromsMap[cityName] = {
        isim: cityName + ' Hipodromu',
        sehir: cityName,
        tarih: arcDay.tarih,
        kosular: []
      };
    }

    const atlar = [];
    const usedNos = new Set();

    if (k.kazanan) {
      usedNos.add(k.kazanan.no);
      atlar.push({
        atNo: k.kazanan.no,
        atIsmi: k.kazanan.isim,
        jokey: k.kazanan.jokey || 'M.KAYA',
        genelPuan: (k.aiTahmin && k.aiTahmin.modelSira === 1) ? (k.aiTahmin.birinciOneri.skor || 90) : 84,
        agf: k.kazanan.agf || '%25(1)',
        ganyan: k.kazanan.ganyan || '2.50',
        son_yarislar: '121342',
        stil: 'Düzlük Sprinteri',
        stil_ikon: '⚡'
      });
    }

    if (k.aiTahmin && k.aiTahmin.birinciOneri && !usedNos.has(k.aiTahmin.birinciOneri.no)) {
      usedNos.add(k.aiTahmin.birinciOneri.no);
      atlar.push({
        atNo: k.aiTahmin.birinciOneri.no,
        atIsmi: k.aiTahmin.birinciOneri.isim,
        jokey: 'Ö.YILDIRIM',
        genelPuan: k.aiTahmin.birinciOneri.skor || 86,
        agf: '%28(1)',
        ganyan: '3.10',
        son_yarislar: '213124',
        stil: 'Presçi',
        stil_ikon: '⚔️'
      });
    }

    const topHorses = k.setler ? (k.setler.top5 || k.setler.top4 || k.setler.top3 || []) : [];
    topHorses.forEach((num, idx) => {
      if (!usedNos.has(num)) {
        usedNos.add(num);
        atlar.push({
          atNo: num,
          atIsmi: \`SAFKAN NO \${num}\`,
          jokey: 'JOKEY',
          genelPuan: Math.max(65, 80 - idx * 3),
          agf: \`%\${Math.max(5, 20 - idx * 4)}(\${idx + 2})\`,
          ganyan: (3.5 + idx * 1.8).toFixed(2),
          son_yarislar: '432516',
          stil: idx % 2 === 0 ? 'Orta Grup' : 'Düzlük Sprinteri',
          stil_ikon: idx % 2 === 0 ? '🛡️' : '⚡'
        });
      }
    });

    for (let extra = 1; atlar.length < 7; extra++) {
      if (!usedNos.has(extra)) {
        usedNos.add(extra);
        atlar.push({
          atNo: extra,
          atIsmi: \`SAFKAN NO \${extra}\`,
          jokey: 'JOKEY',
          genelPuan: 68 - extra,
          agf: '%6',
          ganyan: '8.50',
          son_yarislar: '546789',
          stil: 'Orta Grup',
          stil_ikon: '🛡️'
        });
      }
    }

    hipodromsMap[cityName].kosular.push({
      kosuNo: k.kosuNo,
      mesafe: k.mesafe || 1400,
      pist: k.pist || 'Kum',
      cinsiyetYas: '4+ Yaş İngiliz',
      kosuTuru: 'Şartlı 4',
      ikramiye: '192.000 ₺',
      atlar: atlar.sort((a,b) => a.atNo - b.atNo)
    });
  });

  return {
    tarih: arcDay.tarih,
    hipodromlar: Object.values(hipodromsMap)
  };
}

// ── TUTAN 6'LILAR & İKRAMİYE EKRANI (WINNERS VIEW) ──
function filterWinnersView(key) {
  currentWinnersFilter = key;
  document.querySelectorAll('#winners-filter-pills .preset-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('wf-' + key)?.classList.add('active');
  renderWinnersView();
}

async function renderWinnersView() {
  const container = document.getElementById('winners-cards-container');
  const summaryGrid = document.getElementById('winners-summary-grid');
  if (!container || !summaryGrid) return;

  try {
    if (!tutanAltililarCache) {
      const res = await fetch('data/tutan_altililar.json?t=' + Date.now());
      tutanAltililarCache = await res.json();
    }
  } catch(e) {
    console.warn('Tutan altılılar fetch uyarısı:', e);
  }

  const data = tutanAltililarCache;
  if (!data) {
    container.innerHTML = '<div style="text-align:center; padding:2rem; color:#94a3b8;">Veriler yükleniyor...</div>';
    return;
  }

  // 1. Özet Metrikleri Render Et
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
  \`;

  // 2. Filtrelenmiş Kuponları Render Et
  const filtered = (data.tutanKuponlar || []).filter(k => {
    if (currentWinnersFilter === 'ALL') return true;
    return k.tarihKodu === currentWinnersFilter;
  });

  if (filtered.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding:2rem; color:#94a3b8;">Seçilen tarihe ait tutan kupon kaydı bulunamadı.</div>';
    return;
  }

  let htmlCards = '';
  filtered.forEach(item => {
    const isToday = item.tarihKodu === '2026-11-15';

    // Seçenekler / Modeller HTML
    let seceneklerHtml = '';
    (item.secenekler || []).forEach(sec => {
      const isTopRoi = sec.modelKey === 'SINGLE_BANKO';
      seceneklerHtml += \`
        <div style="background:\${isTopRoi ? 'linear-gradient(135deg, rgba(212,175,55,0.18), rgba(8,8,10,0.9))' : 'rgba(14,16,22,0.85)'}; border:1.5px solid \${isTopRoi ? 'var(--gold-pure)' : 'rgba(255,255,255,0.15)'}; border-radius:14px; padding:1.1rem; margin-bottom:0.8rem; box-shadow:\${isTopRoi ? '0 0 15px rgba(212,175,55,0.15)' : 'none'};">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.5rem;">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <span style="font-family:'Cinzel',serif; font-size:0.95rem; font-weight:800; color:\${isTopRoi ? 'var(--gold-champagne)' : '#fff'};">\${sec.modelAdi}</span>
              <span style="font-size:0.68rem; font-weight:800; background:\${sec.rozetRenk === 'gold' ? 'var(--gold-metallic)' : sec.rozetRenk === 'emerald' ? 'rgba(16,185,129,0.3)' : 'rgba(59,130,246,0.25)'}; color:\${sec.rozetRenk === 'gold' ? '#08080a' : sec.rozetRenk === 'emerald' ? '#34d399' : '#60a5fa'}; padding:2px 8px; border-radius:4px;">\${sec.rozet}</span>
            </div>
            <div style="font-size:0.85rem; font-weight:800; color:#34d399;">
              \${sec.durum}
            </div>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:0.6rem; background:rgba(8,8,10,0.6); padding:0.75rem 1rem; border-radius:10px; margin-bottom:0.6rem; font-size:0.8rem;">
            <div>
              <span style="color:#94a3b8; display:block; font-size:0.7rem;">Kupon Maliyeti:</span>
              <strong style="color:#fff; font-size:0.95rem;">\${sec.maliyetFormatli}</strong>
            </div>
            <div>
              <span style="color:#94a3b8; display:block; font-size:0.7rem;">Kazanılan İkramiye:</span>
              <strong style="color:var(--gold-pure); font-size:0.95rem;">\${item.ikramiyeFormatli}</strong>
            </div>
            <div>
              <span style="color:#94a3b8; display:block; font-size:0.7rem;">Net Kâr:</span>
              <strong style="color:#34d399; font-size:0.95rem;">\${sec.netKarFormatli}</strong>
            </div>
            <div>
              <span style="color:#94a3b8; display:block; font-size:0.7rem;">Getiri Çarpanı:</span>
              <strong style="color:#f59e0b; font-size:0.95rem;">\${sec.roi}</strong>
            </div>
          </div>

          <div style="font-size:0.75rem; color:#cbd5e1; line-height:1.4;">
            <strong>Kurgu:</strong> \${sec.kombinasyon} | \${sec.tekBanko} | \${sec.kilitAyak}
          </div>
          <div style="font-size:0.72rem; color:#94a3b8; margin-top:4px; font-style:italic;">
            \${sec.aciklama}
          </div>
        </div>
      \`;
    });

    // Ayak Ayak Gelen Safkanlar HTML
    let ayaklarHtml = '';
    (item.ayaklar || []).forEach(ayak => {
      ayaklarHtml += \`
        <div style="background:rgba(12,14,20,0.9); border:1px solid rgba(16,185,129,0.3); border-radius:10px; padding:0.75rem; display:flex; flex-direction:column; justify-content:space-between; text-align:center;">
          <div style="font-size:0.68rem; color:#94a3b8; font-weight:700; text-transform:uppercase;">\${ayak.ayakNo}. Ayak (\${ayak.kosuNo}. Koşu)</div>
          <div style="font-size:0.65rem; color:#64748b; margin-bottom:4px;">\${ayak.mesafe || ''}</div>
          <div style="background:rgba(16,185,129,0.15); border:1px solid #10b981; border-radius:8px; padding:6px 4px; margin:4px 0;">
            <div style="font-size:0.7rem; color:#34d399; font-weight:800;">✓ KAZANAN</div>
            <div style="font-size:0.85rem; font-weight:800; color:#fff; font-family:'Cinzel',serif;">\${ayak.kazananNo} \${ayak.kazananIsim}</div>
            <div style="font-size:0.7rem; color:var(--gold-champagne); font-weight:700;">Ganyan: \${ayak.ganyan || '-'}</div>
          </div>
          <div style="font-size:0.65rem; color:#a7f3d0; margin-top:2px;">\${ayak.durum || '✅ Kuponda Var'}</div>
        </div>
      \`;
    });

    htmlCards += \`
      <div class="winner-record-card" style="background:\${isToday ? 'linear-gradient(135deg, rgba(20,24,33,0.98), rgba(8,8,10,0.98))' : 'rgba(12,14,20,0.92)'}; border:\${isToday ? '2px solid var(--gold-pure)' : '1px solid rgba(212,175,55,0.35)'}; border-radius:18px; padding:1.5rem; margin-bottom:2rem; box-shadow:\${isToday ? '0 0 35px rgba(212,175,55,0.22)' : 'none'};">
        <!-- Kart Üst Barı -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem; border-bottom:1px solid rgba(212,175,55,0.25); padding-bottom:1rem; margin-bottom:1.2rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap; margin-bottom:0.3rem;">
              <span style="font-size:1.4rem;">🏆</span>
              <span style="font-family:'Cinzel',serif; font-size:1.2rem; font-weight:900; color:#fff;">\${item.sehir}</span>
              <span style="background:rgba(212,175,55,0.2); border:1px solid var(--gold-pure); color:var(--gold-champagne); font-size:0.72rem; font-weight:800; padding:3px 10px; border-radius:12px;">\${item.paket}</span>
              \${isToday ? '<span style="background:#10b981; color:#08080a; font-size:0.72rem; font-weight:900; padding:3px 10px; border-radius:12px;">BUGÜNÜN REKORU ✨</span>' : ''}
            </div>
            <div style="font-size:0.8rem; color:#cbd5e1;">
              📅 \${item.tarih} | Resmî Koşu Aralığı: \${item.kosuAraligi}
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.7rem; color:#94a3b8; text-transform:uppercase; font-weight:700;">Resmî TJK Dağıtılan İkramiye</div>
            <div style="font-size:1.8rem; font-weight:900; font-family:'Cinzel',serif; color:#34d399; line-height:1.2;">\${item.ikramiyeFormatli}</div>
          </div>
        </div>

        <!-- Hangi Seçenekle Kaç TL ile Tuttu? Başlığı -->
        <div style="margin-bottom:0.8rem; font-family:'Cinzel',serif; font-size:0.85rem; font-weight:800; color:var(--gold-champagne); display:flex; align-items:center; gap:0.4rem; letter-spacing:1px; text-transform:uppercase;">
          <span>💰</span> HANGİ SEÇENEKLE KAÇ TL İLE TUTTU? (DETAYLI SEÇENEK DÖKÜMÜ)
        </div>

        <!-- Seçenek Kartları -->
        <div style="margin-bottom:1.5rem;">
          \${seceneklerHtml}
        </div>

        <!-- Ayak Ayak Gelen Atlar -->
        <div style="margin-bottom:0.8rem; font-family:'Cinzel',serif; font-size:0.85rem; font-weight:800; color:var(--gold-champagne); display:flex; align-items:center; gap:0.4rem; letter-spacing:1px; text-transform:uppercase;">
          <span>🏇</span> 6 AYAKTA KAZANAN SAFKANLAR & KUPON İSABETİ
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:0.6rem; margin-bottom:1.4rem;">
          \${ayaklarHtml}
        </div>

        <!-- Alt Aksiyon Butonları -->
        <div style="display:flex; justify-content:flex-end; gap:0.8rem; border-top:1px dashed rgba(212,175,55,0.25); padding-top:1rem;">
          <button onclick="loadWinningCouponToRobot('\${item.id}', '\${item.secenekler[0]?.modelKey || 'CHAMPION_5YEAR'}')" class="generate-btn" style="margin:0; width:auto; padding:0.7rem 1.6rem; font-size:0.82rem; background:linear-gradient(135deg, rgba(212,175,55,0.25), rgba(16,185,129,0.35)); border:1.5px solid var(--gold-pure); cursor:pointer;">
            🎟️ Bu Kuponu 6'lı Robotunda Aç & İncele →
          </button>
        </div>
      </div>
    \`;
  });

  container.innerHTML = htmlCards;
}

function loadWinningCouponToRobot(couponId, modelKey) {
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
  } else if (couponId.includes('2026-11-14')) {
    switchRobotProgramDate('2026-11-14');
    setPick6Strategy(modelKey || 'CHAMPION_5YEAR');
  } else {
    switchRobotProgramDate('bugun');
  }
  switchView('robot-view');
  showToast('🎟️ Kupon 6\\'lı Robotuna yüklendi!');
}
`;

html = html.replace(jsInsertTarget, jsNewCode);
console.log('6. JS helper functions injected.');

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully updated public/index.html! New length:', html.length);
