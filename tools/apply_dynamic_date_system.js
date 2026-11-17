const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Top bar winning view button title
html = html.replace(
  '🏆 Tutan 6\'lılar (634K ₺ Bugün)',
  '🏆 Tutan 6\'lılar (634K ₺ & Arşiv)'
);

// 2. Hero tag
html = html.replace(
  '<span class="hero-tag" id="hero-program-date-tag">15 Kasım 2026 Resmî TJK Koşu Programı</span>',
  '<span class="hero-tag" id="hero-program-date-tag">16 Kasım 2026 Resmî TJK Koşu Programı (Bursa Osmangazi & Şanlıurfa)</span>'
);

// 3. Program date switch bar
const oldSwitchBar = `<div class="program-date-switch-bar">
      <button id="btn-date-today" onclick="switchProgramDate('bugun')" class="date-switch-btn active" title="Bugünün koşularını görüntüle">
        📅 BUGÜN (15 KASIM PAZAR) <span class="badge-pill-live">BİTEN PROGRAM</span>
      </button>
      <button id="btn-date-tomorrow" onclick="switchProgramDate('yarin')" class="date-switch-btn" title="Yarının programını ve 6'lı ganyan analizlerini aç">
        🌅 YARININ PROGRAMI (16 KASIM PAZARTESİ) <span class="badge-pill-new">BURSA & ŞANLIURFA ✨</span>
      </button>
    </div>`;

const newSwitchBar = `<div class="program-date-switch-bar">
      <button id="btn-date-today" onclick="switchProgramDate('bugun')" class="date-switch-btn active" title="Bugünün koşularını görüntüle">
        📅 BUGÜN (16 KASIM PAZARTESİ) <span class="badge-pill-live">BURSA & ŞANLIURFA</span>
      </button>
      <button id="btn-date-tomorrow" onclick="switchProgramDate('yarin')" class="date-switch-btn" title="Yarının programını ve 6'lı ganyan analizlerini aç">
        🌅 YARININ PROGRAMI (17 KASIM SALI) <span class="badge-pill-new">ADANA & KOCAELİ ✨</span>
      </button>
    </div>`;

if (html.includes(oldSwitchBar)) {
  html = html.replace(oldSwitchBar, newSwitchBar);
} else {
  console.log('Switch bar pattern mismatch, replacing with regex');
  html = html.replace(/<div class="program-date-switch-bar">[\s\S]*?<\/div>\s*<\/div>/, newSwitchBar + '\n    </div>');
}

// 4. Winner alert banner in robot view
html = html.replace(
  'BUGÜN ADANA 1. VE 2. 6\'LISI BİRLİKTE TUTTU!',
  '15 KASIM ADANA 1. VE 2. 6\'LISI BİRLİKTE TUTTU!'
);
html = html.replace(
  '633.679,93 TL RESMÎ İKRAMİYE',
  '634.354 TL RESMÎ İKRAMİYE'
);

// 5. Robot date switch buttons and archive dropdown
const oldRobotDateBtns = `<button id="robot-date-btn-today" onclick="switchRobotProgramDate('bugun')" class="preset-btn active" style="font-weight:700; font-size:0.8rem; padding:0.55rem 1.1rem; border-color:var(--gold-pure);" title="Bugünün 15 Kasım İstanbul ve Adana programı">
            📅 BUGÜN (15 KASIM İSTANBUL & ADANA)
          </button>
          <button id="robot-date-btn-tomorrow" onclick="switchRobotProgramDate('yarin')" class="preset-btn" style="font-weight:700; font-size:0.8rem; padding:0.55rem 1.1rem;" title="Yarının 16 Kasım Bursa ve Şanlıurfa programı">
            🌅 YARIN (16 KASIM BURSA & ŞANLIURFA ✨)
          </button>
          <div style="display:flex; align-items:center; gap:0.4rem;">
            <select id="robot-archive-date-select" onchange="onRobotArchiveDateChange(this.value)" style="background:#08080a; border:1px solid rgba(212,175,55,0.6); color:var(--gold-champagne); padding:0.55rem 0.9rem; border-radius:10px; font-family:'Montserrat',sans-serif; font-size:0.8rem; font-weight:700; cursor:pointer; outline:none;">
              <option value="">🏛️ GEÇMİŞ GÜNLER ARŞİVİNDEN 6'LI KUR...</option>
              <option value="2026-11-14">14 Kasım Cumartesi (Ankara 185K ₺ Tutan, İzmir, Diyarbakır)</option>`;

const newRobotDateBtns = `<button id="robot-date-btn-today" onclick="switchRobotProgramDate('bugun')" class="preset-btn active" style="font-weight:700; font-size:0.8rem; padding:0.55rem 1.1rem; border-color:var(--gold-pure);" title="Bugünün 16 Kasım Bursa ve Şanlıurfa programı">
            📅 BUGÜN (16 KASIM BURSA & ŞANLIURFA)
          </button>
          <button id="robot-date-btn-tomorrow" onclick="switchRobotProgramDate('yarin')" class="preset-btn" style="font-weight:700; font-size:0.8rem; padding:0.55rem 1.1rem;" title="Yarının 17 Kasım Adana ve Kocaeli programı">
            🌅 YARIN (17 KASIM ADANA & KOCAELİ ✨)
          </button>
          <div style="display:flex; align-items:center; gap:0.4rem;">
            <select id="robot-archive-date-select" onchange="onRobotArchiveDateChange(this.value)" style="background:#08080a; border:1px solid rgba(212,175,55,0.6); color:var(--gold-champagne); padding:0.55rem 0.9rem; border-radius:10px; font-family:'Montserrat',sans-serif; font-size:0.8rem; font-weight:700; cursor:pointer; outline:none;">
              <option value="">🏛️ GEÇMİŞ GÜNLER ARŞİVİNDEN 6'LI KUR...</option>
              <option value="2026-11-15">15 Kasım Pazar (Adana 634K ₺ ve 3.240 ₺ Tutan, İstanbul)</option>
              <option value="2026-11-14">14 Kasım Cumartesi (Ankara 185K ₺ Tutan, İzmir, Diyarbakır)</option>`;

if (html.includes(oldRobotDateBtns)) {
  html = html.replace(oldRobotDateBtns, newRobotDateBtns);
} else {
  console.log('Robot buttons old string mismatch, checking pattern');
}

// 6. switchRobotProgramDate function replacement
const oldSwitchRobotFn = `async function switchRobotProgramDate(dateKey) {
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
}`;

const newSwitchRobotFn = `function getBultenCities(b) {
  if (!b || !b.hipodromlar || !b.hipodromlar.length) return '';
  return b.hipodromlar.map(h => h.sehir || (h.isim ? h.isim.replace(' Hipodromu', '') : '')).filter(Boolean).join(' & ');
}

function updateDynamicDateLabels() {
  const bugunTarih = (bultenBugunCache && bultenBugunCache.tarih) || (bulten && bulten.tarih) || '16.11.2026';
  const bugunSehirler = getBultenCities(bultenBugunCache || bulten) || 'Bursa & Şanlıurfa';
  const yarinTarih = (bultenYarinCache && bultenYarinCache.tarih) || '17.11.2026';
  const yarinSehirler = getBultenCities(bultenYarinCache) || 'Adana & Kocaeli';

  const btnToday = document.getElementById('btn-date-today');
  const btnTomorrow = document.getElementById('btn-date-tomorrow');
  if (btnToday) {
    btnToday.innerHTML = \`📅 BUGÜN (\${bugunTarih}) <span class="badge-pill-live">\${bugunSehirler}</span>\`;
    btnToday.title = \`\${bugunTarih} \${bugunSehirler} koşularını görüntüle\`;
  }
  if (btnTomorrow) {
    btnTomorrow.innerHTML = \`🌅 YARININ PROGRAMI (\${yarinTarih}) <span class="badge-pill-new">\${yarinSehirler} ✨</span>\`;
    btnTomorrow.title = \`Yarının \${yarinTarih} \${yarinSehirler} programını aç\`;
  }

  const rBtnToday = document.getElementById('robot-date-btn-today');
  const rBtnTomorrow = document.getElementById('robot-date-btn-tomorrow');
  if (rBtnToday) {
    rBtnToday.innerText = \`📅 BUGÜN (\${bugunTarih} \${bugunSehirler})\`;
    rBtnToday.title = \`Bugünün \${bugunTarih} \${bugunSehirler} programı\`;
  }
  if (rBtnTomorrow) {
    rBtnTomorrow.innerText = \`🌅 YARIN (\${yarinTarih} \${yarinSehirler} ✨)\`;
    rBtnTomorrow.title = \`Yarının \${yarinTarih} \${yarinSehirler} programı\`;
  }

  const heroTag = document.getElementById('hero-program-date-tag');
  if (heroTag) {
    const curDate = (bulten && bulten.tarih) || bugunTarih;
    const curCities = getBultenCities(bulten) || bugunSehirler;
    heroTag.innerText = \`\${curDate} Resmî TJK Koşu Programı (\${curCities})\`;
  }
}

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
      updateDynamicDateLabels();
      showToast(\`🌅 \${bulten.tarih || '17.11.2026'} Yarının 6'lı Programı Yüklendi (\${getBultenCities(bulten)})\`);
    } else if (dateKey === 'bugun') {
      if (!bultenBugunCache) {
        const res = await fetch('data/bulten_bugun.json?t=' + timestamp);
        bultenBugunCache = await res.json();
      }
      bulten = bultenBugunCache;
      enrichBultenRunningStylesAndPace(bulten);
      updateDynamicDateLabels();
      showToast(\`📅 \${bulten.tarih || '16.11.2026'} Bugünün 6'lı Programı Yüklendi (\${getBultenCities(bulten)})\`);
    } else {
      // Geçmiş Günler Arşivi
      if (!archiveBultenCache[dateKey]) {
        // Öncelikli olarak bulten_YYYY_MM_DD.json dosyasını dene (tam zengin bülten)
        const dateCode = dateKey.replace(/-/g, '_');
        try {
          const directRes = await fetch(\`data/bulten_\${dateCode}.json?t=\${timestamp}\`);
          if (directRes.ok) {
            archiveBultenCache[dateKey] = await directRes.json();
            enrichBultenRunningStylesAndPace(archiveBultenCache[dateKey]);
          }
        } catch(e) {}

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
      }
      if (archiveBultenCache[dateKey]) {
        bulten = archiveBultenCache[dateKey];
        updateDynamicDateLabels();
        showToast(\`🏛️ \${bulten.tarih || dateKey} Arşiv 6'lı Programı Yüklendi (\${getBultenCities(bulten)})\`);
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
}`;

if (html.includes(oldSwitchRobotFn)) {
  html = html.replace(oldSwitchRobotFn, newSwitchRobotFn);
} else {
  console.log('oldSwitchRobotFn mismatch');
}

// 7. loadWinningCouponToRobot - date selection fix
html = html.replace(
  `  // 1. Program tarihini seç
  if (couponId.includes('2026-11-15')) {
    switchRobotProgramDate('bugun');
  } else if (couponId.includes('2026-11-14')) {
    switchRobotProgramDate('2026-11-14');
  } else {
    switchRobotProgramDate('bugun');
  }`,
  `  // 1. Program tarihini seç (Geçmiş gün ise arşivden aç)
  if (couponId.includes('2026-11-15')) {
    switchRobotProgramDate('2026-11-15');
  } else if (couponId.includes('2026-11-14')) {
    switchRobotProgramDate('2026-11-14');
  } else if (couponId.includes('2026-11-16')) {
    switchRobotProgramDate('bugun');
  } else {
    switchRobotProgramDate('bugun');
  }`
);

// 8. switchProgramDate dynamic updates
const oldSwitchProg = `  const heroTag = document.getElementById('hero-program-date-tag');
  if (heroTag) {
    heroTag.innerText = (dateKey === 'yarin')
      ? '16 Kasım 2026 Resmî TJK Koşu Programı (Bursa Osmangazi & Şanlıurfa)'
      : '15 Kasım 2026 Resmî TJK Koşu Programı (İstanbul Veliefendi & Adana Yeşiloba)';
  }`;

const newSwitchProg = `  // Dinamik Hero Tag ve Başlık`;

if (html.includes(oldSwitchProg)) {
  html = html.replace(oldSwitchProg, newSwitchProg);
}

const oldSwitchProgToast = `    showToast(dateKey === 'yarin'
      ? '🌅 16 Kasım 2026 Yarının Programı Açıldı (Bursa & Şanlıurfa)'
      : '📅 15 Kasım 2026 Bugünün Programı Açıldı (İstanbul & Adana)');`;

const newSwitchProgToast = `    updateDynamicDateLabels();
    const activeCities = getBultenCities(bulten);
    const activeTarih = bulten.tarih || '';
    showToast(dateKey === 'yarin'
      ? \`🌅 \${activeTarih} Yarının Programı Açıldı (\${activeCities})\`
      : \`📅 \${activeTarih} Bugünün Programı Açıldı (\${activeCities})\`);`;

if (html.includes(oldSwitchProgToast)) {
  html = html.replace(oldSwitchProgToast, newSwitchProgToast);
}

// 9. initPlatform parallel preload and dynamic update
const oldInit = `    const timestamp = Date.now();
    const [bRes, btRes, arcRes] = await Promise.all([
      fetch('data/bulten_bugun.json?t=' + timestamp),
      fetch('data/backtest_dun.json?t=' + timestamp),
      fetch('data/backtest_archive.json?t=' + timestamp)
    ]);
    bulten = await bRes.json();
    bultenBugunCache = bulten;
    enrichBultenRunningStylesAndPace(bulten);

    // Yarının programını arka planda önbelleğe al (tek tıkla anında açılsın)
    fetch('data/bulten_yarin.json?t=' + timestamp).then(r => r.json()).then(data => {
      bultenYarinCache = data;
    }).catch(e => console.warn('Yarın bülteni preload bypassed:', e.message));`;

const newInit = `    const timestamp = Date.now();
    const [bRes, yRes, btRes, arcRes] = await Promise.all([
      fetch('data/bulten_bugun.json?t=' + timestamp),
      fetch('data/bulten_yarin.json?t=' + timestamp).catch(() => null),
      fetch('data/backtest_dun.json?t=' + timestamp),
      fetch('data/backtest_archive.json?t=' + timestamp)
    ]);
    bulten = await bRes.json();
    bultenBugunCache = bulten;
    enrichBultenRunningStylesAndPace(bulten);

    if (yRes && yRes.ok) {
      try {
        bultenYarinCache = await yRes.json();
      } catch(e) {}
    }
    updateDynamicDateLabels();`;

if (html.includes(oldInit)) {
  html = html.replace(oldInit, newInit);
} else {
  console.log('oldInit mismatch');
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('✅ public/index.html dinamik tarih sistemi uygulandı!');
