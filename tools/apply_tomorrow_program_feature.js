const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Add CSS for the program date switcher
const cssToAdd = `
/* ═══════════════════════════════════════════════════════════════
   PROGRAM TARİHİ SEÇİCİ (BUGÜN / YARININ BÜLTENİ)
═══════════════════════════════════════════════════════════════ */
.program-date-switch-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.85rem;
  margin: 1.2rem auto 1.6rem auto;
  flex-wrap: wrap;
}
.date-switch-btn {
  background: rgba(18, 24, 38, 0.85);
  border: 1px solid rgba(212, 175, 55, 0.35);
  color: #cbd5e1;
  font-family: 'Cinzel', serif;
  font-size: 0.86rem;
  font-weight: 700;
  padding: 0.65rem 1.3rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}
.date-switch-btn:hover {
  border-color: var(--gold-pure);
  color: #fcf6ba;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.25);
}
.date-switch-btn.active {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(180, 83, 9, 0.35));
  border: 1.5px solid var(--gold-pure);
  color: #fcf6ba;
  box-shadow: 0 0 25px rgba(212, 175, 55, 0.45);
}
.date-switch-btn .badge-pill-live {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 6px;
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid #10b981;
  color: #34d399;
}
.date-switch-btn .badge-pill-new {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 6px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(239, 68, 68, 0.3));
  border: 1px solid #f59e0b;
  color: #fbbf24;
  animation: pulseGlow 2s infinite;
}
`;

if (!html.includes('.program-date-switch-bar')) {
  html = html.replace('/* ═══════════════════════════════════════════════════════════════\r\n   MOBİL EKRANLAR', cssToAdd + '\r\n/* ═══════════════════════════════════════════════════════════════\r\n   MOBİL EKRANLAR');
  if (!html.includes('.program-date-switch-bar')) {
    html = html.replace('/* ═══════════════════════════════════════════════════════════════\n   MOBİL EKRANLAR', cssToAdd + '\n/* ═══════════════════════════════════════════════════════════════\n   MOBİL EKRANLAR');
  }
  console.log('✅ Date switcher CSS eklendi.');
}

// 2. Add the Date Switcher buttons in HTML inside bulten-view
const targetHeroTag = `<span class="hero-tag">15 Kasım 2026 Resmî TJK Koşu Programı</span>`;
const newHeroTagAndButtons = `<span class="hero-tag" id="hero-program-date-tag">15 Kasım 2026 Resmî TJK Koşu Programı</span>
    <h2>Asil Safkanlar, <em>Derin Soy Kütüğü</em> & Biyomekanik Analiz</h2>
    <p style="color:var(--text-muted);max-width:750px;margin:0 auto;font-size:0.95rem;line-height:1.7;">
      Tırnağından galobuna, baba/anne orijininden jokey sinerjisine kadar TJK resmi bültenindeki gerçek safkanlar.
    </p>

    <!-- ══════════════════════════════════════════════════════════
         PROGRAM GÜNÜ SEÇİCİ (BUGÜN / YARININ BÜLTENİ)
    ══════════════════════════════════════════════════════════ -->
    <div class="program-date-switch-bar">
      <button id="btn-date-today" onclick="switchProgramDate('bugun')" class="date-switch-btn active" title="Bugünün koşularını görüntüle">
        📅 BUGÜN (15 KASIM PAZAR) <span class="badge-pill-live">BİTEN PROGRAM</span>
      </button>
      <button id="btn-date-tomorrow" onclick="switchProgramDate('yarin')" class="date-switch-btn" title="Yarının programını ve 6'lı ganyan analizlerini aç">
        🌅 YARININ PROGRAMI (16 KASIM PAZARTESİ) <span class="badge-pill-new">BURSA & ŞANLIURFA ✨</span>
      </button>
    </div>`;

const oldHeadBlock = `<span class="hero-tag">15 Kasım 2026 Resmî TJK Koşu Programı</span>
      <h2>Asil Safkanlar, <em>Derin Soy Kütüğü</em> & Biyomekanik Analiz</h2>
      <p style="color:var(--text-muted);max-width:750px;margin:0 auto;font-size:0.95rem;line-height:1.7;">
        Tırnağından galobuna, baba/anne orijininden jokey sinerjisine kadar TJK resmi bültenindeki gerçek safkanlar.
      </p>`;

if (html.includes(oldHeadBlock)) {
  html = html.replace(oldHeadBlock, newHeroTagAndButtons);
  console.log('✅ Date switcher butonları HTML içerisine yerleştirildi (LF)');
} else {
  const oldHeadBlockCRLF = oldHeadBlock.replace(/\n/g, '\r\n');
  const newHeroTagAndButtonsCRLF = newHeroTagAndButtons.replace(/\n/g, '\r\n');
  if (html.includes(oldHeadBlockCRLF)) {
    html = html.replace(oldHeadBlockCRLF, newHeroTagAndButtonsCRLF);
    console.log('✅ Date switcher butonları HTML içerisine yerleştirildi (CRLF)');
  } else {
    console.warn('⚠️ oldHeadBlock bulunamadı!');
  }
}

// 3. Add switchProgramDate and cache logic in JS
const dateSwitchJsCode = `
// ═══════════════════════════════════════════════════════════════
// PROGRAM GÜNÜ DEĞİŞTİRME MOTORU (BUGÜN & YARIN KESİNTİSİZ GEÇİŞ)
// ═══════════════════════════════════════════════════════════════
let currentProgramDate = 'bugun';
let bultenBugunCache = null;
let bultenYarinCache = null;

async function switchProgramDate(dateKey) {
  if (currentProgramDate === dateKey && bulten) return;
  currentProgramDate = dateKey;

  const btnToday = document.getElementById('btn-date-today');
  const btnTomorrow = document.getElementById('btn-date-tomorrow');
  if (btnToday) btnToday.classList.toggle('active', dateKey === 'bugun');
  if (btnTomorrow) btnTomorrow.classList.toggle('active', dateKey === 'yarin');

  const heroTag = document.getElementById('hero-program-date-tag');
  if (heroTag) {
    heroTag.innerText = (dateKey === 'yarin')
      ? '16 Kasım 2026 Resmî TJK Koşu Programı (Bursa Osmangazi & Şanlıurfa)'
      : '15 Kasım 2026 Resmî TJK Koşu Programı (İstanbul Veliefendi & Adana Yeşiloba)';
  }

  try {
    const timestamp = Date.now();
    if (dateKey === 'yarin') {
      if (!bultenYarinCache) {
        const res = await fetch('data/bulten_yarin.json?t=' + timestamp);
        bultenYarinCache = await res.json();
      }
      bulten = bultenYarinCache;
    } else {
      if (!bultenBugunCache) {
        const res = await fetch('data/bulten_bugun.json?t=' + timestamp);
        bultenBugunCache = await res.json();
      }
      bulten = bultenBugunCache;
    }

    enrichBultenRunningStylesAndPace(bulten);

    currentHipIdx = 0;
    currentKosuIdx = 0;

    renderHipodroms();
    renderWeatherAndTrackBar();
    initRobotSelector();
    renderRaceDetails();

    showToast(dateKey === 'yarin' 
      ? '🌅 16 Kasım 2026 Yarının Programı Açıldı (Bursa & Şanlıurfa)' 
      : '📅 15 Kasım 2026 Bugünün Programı Açıldı (İstanbul & Adana)');
  } catch(e) {
    console.error('Tarih değiştirme hatası:', e);
    showToast('⚠️ Bülten verisi yüklenirken hata oluştu: ' + e.message);
  }
}
`;

// Insert switchProgramDate right above initPlatform
if (html.includes('async function initPlatform() {')) {
  html = html.replace('async function initPlatform() {', dateSwitchJsCode + '\r\nasync function initPlatform() {');
  console.log('✅ switchProgramDate fonksiyonu JS içerisine yerleştirildi.');
}

// 4. Update initPlatform to cache bultenBugun and preload bultenYarin
const oldInitCode = `    bulten = await bRes.json();
    enrichBultenRunningStylesAndPace(bulten);`;

const newInitCode = `    bulten = await bRes.json();
    bultenBugunCache = bulten;
    enrichBultenRunningStylesAndPace(bulten);

    // Yarının programını arka planda önbelleğe al (tek tıkla anında açılsın)
    fetch('data/bulten_yarin.json?t=' + timestamp).then(r => r.json()).then(data => {
      bultenYarinCache = data;
    }).catch(e => console.warn('Yarın bülteni preload bypassed:', e.message));`;

if (html.includes(oldInitCode)) {
  html = html.replace(oldInitCode, newInitCode);
  console.log('✅ initPlatform önbellek mekanizması güncellendi (LF)');
} else {
  const oldInitCodeCRLF = oldInitCode.replace(/\n/g, '\r\n');
  const newInitCodeCRLF = newInitCode.replace(/\n/g, '\r\n');
  if (html.includes(oldInitCodeCRLF)) {
    html = html.replace(oldInitCodeCRLF, newInitCodeCRLF);
    console.log('✅ initPlatform önbellek mekanizması güncellendi (CRLF)');
  }
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('📁 public/index.html başarıyla güncellendi!');
