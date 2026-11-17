const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Update <head> meta tags
const oldMeta = '<meta name="viewport" content="width=device-width,initial-scale=1.0"/>';
const newMeta = `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover"/>
<meta name="theme-color" content="#0a0c10"/>
<meta name="apple-mobile-web-app-capable" content="yes"/>
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
<meta name="apple-mobile-web-app-title" content="Royal Turf"/>
<meta name="mobile-web-app-capable" content="yes"/>
<meta name="format-detection" content="telephone=no"/>
<link rel="manifest" href="manifest.json"/>
<link rel="icon" type="image/png" href="icons/favicon.png"/>
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png"/>`;

html = html.replace(oldMeta, newMeta);

// 2. Add Mobile & PWA CSS before </style>
const mobileCss = `
/* ═══════════════════════════════════════════════════════════════
   MOBİL VE PWA UYGULAMA STİLLERİ (TOUCH-FIRST ERGONOMİ)
═══════════════════════════════════════════════════════════════ */
.pwa-install-btn {
  background: linear-gradient(135deg, #d4af37 0%, #aa771c 100%);
  color: #08080a !important;
  font-weight: 800;
  border: 1px solid #fcf6ba;
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.4);
  padding: 0.5rem 1.1rem;
  border-radius: 999px;
  font-family: 'Cinzel', serif;
  font-size: 0.8rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  animation: pulseGlow 2.5s infinite;
  transition: all 0.25s;
}
.pwa-install-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 25px rgba(212, 175, 55, 0.7);
}

/* Sabit Alt Mobil Navigasyon Çubuğu (Native App Bar) */
.mobile-bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgba(10, 12, 16, 0.96);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(212, 175, 55, 0.3);
  z-index: 9999;
  justify-content: space-around;
  align-items: center;
  padding: 0 0.5rem;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  box-shadow: 0 -5px 25px rgba(0, 0, 0, 0.7);
}
.m-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: #8c909e;
  text-decoration: none;
  font-size: 0.65rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
  background: none;
  border: none;
  transition: all 0.2s;
  flex: 1;
}
.m-nav-item span.icon { font-size: 1.25rem; }
.m-nav-item.active {
  color: var(--gold-champagne);
  font-weight: 700;
}
.m-nav-item.active span.icon {
  filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.8));
}

/* PWA Bilgi ve Kurulum Modalı */
.pwa-modal-overlay {
  display: none;
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  z-index: 10000;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}
.pwa-modal-box {
  background: #10141c;
  border: 1px solid var(--gold-pure);
  border-radius: 20px;
  padding: 1.8rem;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 0 40px rgba(212, 175, 55, 0.35);
  text-align: center;
}

/* ═══════════════════════════════════════════════════════════════
   MOBİL EKRANLAR (@media max-width: 768px)
═══════════════════════════════════════════════════════════════ */
@media (max-width: 768px) {
  body {
    padding-bottom: 74px !important; /* Alt bar için boşluk */
  }

  .navbar {
    padding: 0.8rem 1rem !important;
    flex-wrap: wrap;
    gap: 0.6rem;
  }
  .brand-crest { font-size: 1.6rem; }
  .brand-text h1 { font-size: 1.15rem; letter-spacing: 1.5px; }
  .brand-text span { font-size: 0.55rem; letter-spacing: 1.5px; }
  
  /* Üst view butonlarını mobilde gizle, alt nav bara devret */
  .nav-views { display: none !important; }
  .mobile-bottom-nav { display: flex !important; }

  .container {
    padding: 1rem 0.8rem 3rem !important;
  }

  .hero-head { margin-bottom: 1.5rem !important; }
  .hero-head h2 { font-size: 1.4rem !important; letter-spacing: 1px !important; }

  /* Koşu Çubuğu: Parmakla pürüzsüz yatay kaydırma */
  .kosu-bar {
    display: flex !important;
    overflow-x: auto !important;
    flex-wrap: nowrap !important;
    -webkit-overflow-scrolling: touch !important;
    padding-bottom: 0.6rem !important;
    gap: 0.5rem !important;
    scrollbar-width: none !important;
  }
  .kosu-bar::-webkit-scrollbar { display: none; }
  .kosu-tab {
    flex: 0 0 auto !important;
    padding: 0.6rem 1rem !important;
    font-size: 0.78rem !important;
  }

  /* Safkan Kartları Izgarası: Tek Sütun */
  .horses-grid {
    grid-template-columns: 1fr !important;
    gap: 1.2rem !important;
  }
  .monument-card {
    padding: 1.1rem !important;
    border-radius: 14px !important;
  }

  /* Analitik Çubuklar: 2 Sütun */
  .analytica-bars {
    grid-template-columns: repeat(2, 1fr) !important;
    gap: 0.5rem !important;
  }
  .bar-entry {
    padding: 0.35rem 0.5rem !important;
  }
  .bar-name {
    font-size: 0.68rem !important;
  }

  /* Gidişat ve Perde Kartları */
  .race-curtain {
    grid-template-columns: 1fr !important;
  }
  .curtain-card {
    padding: 1rem !important;
  }

  /* Tabloların Taşmasını Önle */
  .table-wrapper, .monument-specs {
    font-size: 0.78rem !important;
  }

  /* Model Şeffaflık Kutusu */
  #model-transparency-box {
    padding: 1rem !important;
  }

  /* Backtest İstatistik Trio */
  .backtest-stats-trio {
    grid-template-columns: 1fr !important;
    gap: 0.8rem !important;
  }
}

/* Küçük Ekranlar (@media max-width: 480px) */
@media (max-width: 480px) {
  .brand-text h1 { font-size: 1.05rem; }
  .pwa-install-btn { font-size: 0.7rem; padding: 0.4rem 0.8rem; }
  .analytica-bars { grid-template-columns: repeat(2, 1fr) !important; }
}
`;

html = html.replace('</style>', mobileCss + '\n</style>');

// 3. Add Install App Button to Navbar and Mobile Bottom Nav
const targetNavBrand = `<div class="brand">`;
const replacementNav = `<div class="brand">`;

// Let's find where vip-badge is in navbar
const targetVipBadge = `<div class="vip-badge">`;
const replacementVipBadge = `<button id="pwa-install-btn" class="pwa-install-btn" onclick="openPwaInstallModal()">
      <span>📲</span> <span>Telefona Yükle</span>
    </button>
    <div class="vip-badge">`;

html = html.replace(targetVipBadge, replacementVipBadge);

// 4. Add Mobile Bottom Navigation Bar & PWA Modal right before </body>
const bottomNavHtml = `
<!-- SABİT ALT MOBİL NAVİGASYON ÇUBUĞU (NATIVE APP BAR) -->
<nav class="mobile-bottom-nav" id="mobile-bottom-nav">
  <button class="m-nav-item active" id="m-nav-bulten" onclick="switchMobileTab('bulten', 0)">
    <span class="icon">🏇</span>
    <span>Bülten</span>
  </button>
  <button class="m-nav-item" id="m-nav-altili" onclick="switchMobileTab('altili', 1)">
    <span class="icon">🎟️</span>
    <span>6'lı Robotu</span>
  </button>
  <button class="m-nav-item" id="m-nav-tekat" onclick="openTekAtModalFromMobile()">
    <span class="icon">🎯</span>
    <span>Tek At</span>
  </button>
  <button class="m-nav-item" id="m-nav-dogrulama" onclick="switchMobileTab('dogrulama', 2)">
    <span class="icon">📊</span>
    <span>Doğrulama</span>
  </button>
  <button class="m-nav-item" id="m-nav-app" onclick="openPwaInstallModal()">
    <span class="icon">📲</span>
    <span>APK / Yükle</span>
  </button>
</nav>

<!-- PWA TELEFONA YÜKLEME REHBERİ MODALI -->
<div class="pwa-modal-overlay" id="pwa-install-modal" onclick="closePwaModal(event)">
  <div class="pwa-modal-box" onclick="event.stopPropagation()">
    <div style="font-size:2.8rem; margin-bottom:0.8rem; filter:drop-shadow(0 0 15px rgba(212,175,55,0.8));">♞</div>
    <div style="font-family:'Cinzel', serif; font-size:1.3rem; font-weight:800; color:var(--gold-champagne); margin-bottom:0.4rem;">ROYAL TURF MOBİL UYGULAMASI</div>
    <div style="font-size:0.82rem; color:var(--text-muted); margin-bottom:1.5rem;">Telefonunuzda ana ekrana ekleyerek tıpkı bir APK gibi tam ekran, reklamsız ve hızlıca kullanabilirsiniz.</div>

    <div id="pwa-native-install-prompt" style="display:none; margin-bottom:1.2rem;">
      <button onclick="triggerPwaNativeInstall()" class="pwa-install-btn" style="width:100%; justify-content:center; padding:0.9rem; font-size:0.95rem;">
        ⚡ ŞİMDİ TELEFONA YÜKLE
      </button>
    </div>

    <div style="background:rgba(212,175,55,0.08); border:1px solid rgba(212,175,55,0.25); border-radius:12px; padding:1rem; text-align:left; font-size:0.8rem; margin-bottom:1.2rem;">
      <div style="font-weight:700; color:var(--gold-champagne); margin-bottom:0.5rem; display:flex; align-items:center; gap:0.4rem;">
        <span>📱</span> Android İçin (Chrome):
      </div>
      <div style="color:var(--text-muted); line-height:1.4;">
        1. Sağ üstteki <b>üç nokta (⋮)</b> menüsüne dokunun.<br/>
        2. <b>"Uygulamayı Yükle"</b> veya <b>"Ana Ekrana Ekle"</b> seçeneğine basın.
      </div>

      <div style="font-weight:700; color:var(--gold-champagne); margin-top:0.8rem; margin-bottom:0.5rem; display:flex; align-items:center; gap:0.4rem;">
        <span>🍎</span> iPhone / iPad İçin (Safari):
      </div>
      <div style="color:var(--text-muted); line-height:1.4;">
        1. Alttaki <b>Paylaş (Share)</b> simgesine [<span style="color:#60a5fa;">↑</span>] dokunun.<br/>
        2. Aşağı kaydırıp <b>"Ana Ekrana Ekle" (Add to Home Screen)</b> seçeneğini seçin.
      </div>
    </div>

    <button onclick="document.getElementById('pwa-install-modal').style.display='none'" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.2); color:#ccc; padding:0.6rem 1.4rem; border-radius:10px; cursor:pointer; font-weight:600; font-size:0.85rem;">
      Kapat
    </button>
  </div>
</div>
`;

html = html.replace('</body>', bottomNavHtml + '\n</body>');

// 5. Add Service Worker registration and PWA logic to <script>
const pwaJs = `
// ── PWA & MOBİL ERGONOMİ ENTEGRASYONU ──
let deferredPwaPrompt = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      console.log('Royal Turf PWA Service Worker Aktif:', reg.scope);
    }).catch(err => {
      console.log('SW hatası:', err);
    });
  });
}

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPwaPrompt = e;
  const promptBox = document.getElementById('pwa-native-install-prompt');
  if (promptBox) promptBox.style.display = 'block';
});

function openPwaInstallModal() {
  const modal = document.getElementById('pwa-install-modal');
  if (modal) modal.style.display = 'flex';
}

function closePwaModal(e) {
  const modal = document.getElementById('pwa-install-modal');
  if (modal) modal.style.display = 'none';
}

function triggerPwaNativeInstall() {
  if (deferredPwaPrompt) {
    deferredPwaPrompt.prompt();
    deferredPwaPrompt.userChoice.then(choiceResult => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Kullanıcı uygulamayı yüklemeyi kabul etti');
      }
      deferredPwaPrompt = null;
      document.getElementById('pwa-install-modal').style.display = 'none';
    });
  } else {
    alert('Tarayıcınızın menüsünden (üç nokta veya paylaş) "Ana Ekrana Ekle" seçeneğini kullanabilirsiniz.');
  }
}

function switchMobileTab(tabKey, viewIdx) {
  // Update desktop view switcher
  switchView(viewIdx);

  // Update mobile bottom nav active classes
  const navItems = document.querySelectorAll('.m-nav-item');
  navItems.forEach(item => item.classList.remove('active'));

  const activeBtn = document.getElementById('m-nav-' + tabKey);
  if (activeBtn) activeBtn.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openTekAtModalFromMobile() {
  openTekAtRadarModal();
}
`;

html = html.replace('</script>', pwaJs + '\n</script>');

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully upgraded public/index.html to Mobile-First PWA Responsive App!');
