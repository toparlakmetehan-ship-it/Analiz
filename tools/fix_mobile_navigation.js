const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. New resilient switchView function
const newSwitchViewCode = `// ── TAB VE EKRAN GEÇİŞLERİ (MOBİL VE MASAÜSTÜ SENKRON) ──
function switchView(viewId) {
  // Gelen değer numara veya anahtar ise resmi view-pane id'sine çevir
  if (viewId === 0 || viewId === 'bulten' || viewId === 'bulten-view') viewId = 'bulten-view';
  else if (viewId === 1 || viewId === 'altili' || viewId === 'robot' || viewId === 'robot-view') viewId = 'robot-view';
  else if (viewId === 2 || viewId === 'dogrulama' || viewId === 'backtest' || viewId === 'backtest-view') viewId = 'backtest-view';

  // 1. Tüm view pane'leri ve butonları pasife çek
  document.querySelectorAll('.view-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));

  // 2. Hedef pane'i aktif et
  const targetPane = document.getElementById(viewId);
  if (!targetPane) {
    console.error('viewId DOM üzerinde bulunamadı:', viewId);
    return;
  }
  targetPane.classList.add('active');

  // 3. Masaüstü üst menü butonunu aktif et
  const desktopBtns = document.querySelectorAll('.view-btn');
  desktopBtns.forEach(b => {
    const onc = b.getAttribute('onclick') || '';
    if (onc.includes(viewId)) {
      b.classList.add('active');
    }
  });

  // 4. Sabit mobil alt bar butonunu aktif et
  const mobileNavItems = document.querySelectorAll('.m-nav-item');
  mobileNavItems.forEach(item => item.classList.remove('active'));

  if (viewId === 'bulten-view') {
    document.getElementById('m-nav-bulten')?.classList.add('active');
  } else if (viewId === 'robot-view') {
    document.getElementById('m-nav-altili')?.classList.add('active');
  } else if (viewId === 'backtest-view') {
    document.getElementById('m-nav-dogrulama')?.classList.add('active');
  }

  // 5. Görünüme özel dinamik render fonksiyonlarını tetikle
  if (viewId === 'robot-view') {
    optimizeCoupon();
  } else if (viewId === 'backtest-view') {
    renderBacktest();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}`;

// Replace switchView
html = html.replace(/function switchView\(viewId\) \{[\s\S]*?\n\}/, newSwitchViewCode);
console.log('✅ switchView fonksiyonu güncellendi');

// 2. Update switchMobileTab to simply call switchView
const newSwitchMobileTab = `function switchMobileTab(viewId) {
  switchView(viewId);
}`;
html = html.replace(/function switchMobileTab\([^)]*\) \{[\s\S]*?\n\}/, newSwitchMobileTab);
console.log('✅ switchMobileTab fonksiyonu güncellendi');

// 3. Update bottom nav bar HTML
const newBottomNavHtml = `<nav class="mobile-bottom-nav" id="mobile-bottom-nav">
  <button class="m-nav-item active" id="m-nav-bulten" onclick="switchView('bulten-view')">
    <span class="icon">🏇</span>
    <span>Bülten</span>
  </button>
  <button class="m-nav-item" id="m-nav-altili" onclick="switchView('robot-view')">
    <span class="icon">🎟️</span>
    <span>6'lı Robotu</span>
  </button>
  <button class="m-nav-item" id="m-nav-tekat" onclick="openTekAtRadarModal()">
    <span class="icon">🎯</span>
    <span>Tek At</span>
  </button>
  <button class="m-nav-item" id="m-nav-dogrulama" onclick="switchView('backtest-view')">
    <span class="icon">📊</span>
    <span>Doğrulama</span>
  </button>
  <button class="m-nav-item" id="m-nav-app" onclick="openPwaInstallModal()">
    <span class="icon">📲</span>
    <span>APK / Yükle</span>
  </button>
</nav>`;

html = html.replace(/<nav class="mobile-bottom-nav" id="mobile-bottom-nav">[\s\S]*?<\/nav>/, newBottomNavHtml);
console.log('✅ mobile-bottom-nav HTML butonları güncellendi');

// 4. Update CSS: Make top nav-views visible & swipeable on mobile, style budget-console and backtest for mobile
const oldMobileNavCss = `  /* Üst view butonlarını mobilde gizle, alt nav bara devret */
  .nav-views { display: none !important; }
  .mobile-bottom-nav { display: flex !important; }`;

const newMobileNavCss = `  /* Üst view butonlarını mobilde yatay kaydırılabilir şık sekmeler yap */
  .navbar {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0.6rem !important;
    padding: 0.75rem 1rem !important;
  }
  .nav-views {
    display: flex !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    gap: 0.45rem !important;
    width: 100% !important;
    padding-bottom: 2px !important;
    scrollbar-width: none !important;
  }
  .view-btn {
    white-space: nowrap !important;
    padding: 0.5rem 0.85rem !important;
    font-size: 0.75rem !important;
    flex-shrink: 0 !important;
  }
  .mobile-bottom-nav { display: flex !important; }

  /* Hipodrom Butonları Mobilde Pürüzsüz Yatay Kaydırma */
  .hipodrom-selector {
    display: flex !important;
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
    gap: 0.5rem !important;
    justify-content: flex-start !important;
    padding-bottom: 0.5rem !important;
    scrollbar-width: none !important;
  }
  .hipodrom-btn {
    white-space: nowrap !important;
    padding: 0.6rem 1rem !important;
    font-size: 0.8rem !important;
    flex-shrink: 0 !important;
  }

  /* 6'lı Robotu ve Doğrulama Ekranları Mobil Uyum */
  .budget-console, .backtest-monument {
    padding: 1.2rem 0.85rem !important;
    border-radius: 16px !important;
    margin-bottom: 2rem !important;
  }
  .console-header { margin-bottom: 1.5rem !important; }
  .console-header h3 { font-size: 1.3rem !important; }
  .console-header p { font-size: 0.78rem !important; }
  .preset-pills {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 0.4rem !important;
  }
  .preset-btn {
    padding: 0.45rem 0.75rem !important;
    font-size: 0.75rem !important;
    flex: 1 1 auto !important;
  }
  .budget-input-wrapper { max-width: 100% !important; }
  .budget-input { font-size: 1.3rem !important; padding: 0.65rem !important; }
  .generate-btn { font-size: 0.95rem !important; padding: 0.85rem !important; width: 100% !important; }

  /* Tek At Radarı Modalı Mobil Uyum */
  #tek-at-modal > div {
    padding: 1.2rem 1rem !important;
    max-height: 94vh !important;
    border-radius: 16px !important;
  }`;

if (html.includes(oldMobileNavCss)) {
  html = html.replace(oldMobileNavCss, newMobileNavCss);
  console.log('✅ Mobil CSS kuralları başarıyla güncellendi (LF)');
} else {
  const oldCRLF = oldMobileNavCss.replace(/\n/g, '\r\n');
  const newCRLF = newMobileNavCss.replace(/\n/g, '\r\n');
  if (html.includes(oldCRLF)) {
    html = html.replace(oldCRLF, newCRLF);
    console.log('✅ Mobil CSS kuralları başarıyla güncellendi (CRLF)');
  } else {
    console.warn('⚠️ oldMobileNavCss bulunamadı, regex ile denenecek...');
    html = html.replace(/\/\* Üst view butonlarını mobilde gizle, alt nav bara devret \*\/[\s\S]*?\.mobile-bottom-nav \{ display: flex !important; \}/, newMobileNavCss);
    console.log('✅ Mobil CSS regex ile güncellendi');
  }
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('📁 public/index.html kaydedildi!');
