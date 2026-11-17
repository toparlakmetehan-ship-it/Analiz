import re

with open('public/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update robot date buttons and archive dropdown
old_robot_btns = r'''<button id="robot-date-btn-today" onclick="switchRobotProgramDate\('bugun'\)" class="preset-btn active"[^>]+>
\s*📅 BUGÜN \(15 KASIM İSTANBUL & ADANA\)
\s*<\/button>
\s*<button id="robot-date-btn-tomorrow" onclick="switchRobotProgramDate\('yarin'\)" class="preset-btn"[^>]+>
\s*🌅 YARIN \(16 KASIM BURSA & ŞANLIURFA ✨\)
\s*<\/button>
\s*<div style="display:flex; align-items:center; gap:0.4rem;">
\s*<select id="robot-archive-date-select" onchange="onRobotArchiveDateChange\(this\.value\)"[^>]+>
\s*<option value="">🏛️ GEÇMİŞ GÜNLER ARŞİVİNDEN 6'LI KUR\.\.\.<\/option>
\s*<option value="2026-11-14">'''

new_robot_btns = '''<button id="robot-date-btn-today" onclick="switchRobotProgramDate('bugun')" class="preset-btn active" style="font-weight:700; font-size:0.8rem; padding:0.55rem 1.1rem; border-color:var(--gold-pure);" title="Bugünün 16 Kasım Bursa ve Şanlıurfa programı">
            📅 BUGÜN (16 KASIM BURSA & ŞANLIURFA)
          </button>
          <button id="robot-date-btn-tomorrow" onclick="switchRobotProgramDate('yarin')" class="preset-btn" style="font-weight:700; font-size:0.8rem; padding:0.55rem 1.1rem;" title="Yarının 17 Kasım Adana ve Kocaeli programı">
            🌅 YARIN (17 KASIM ADANA & KOCAELİ ✨)
          </button>
          <div style="display:flex; align-items:center; gap:0.4rem;">
            <select id="robot-archive-date-select" onchange="onRobotArchiveDateChange(this.value)" style="background:#08080a; border:1px solid rgba(212,175,55,0.6); color:var(--gold-champagne); padding:0.55rem 0.9rem; border-radius:10px; font-family:'Montserrat',sans-serif; font-size:0.8rem; font-weight:700; cursor:pointer; outline:none;">
              <option value="">🏛️ GEÇMİŞ GÜNLER ARŞİVİNDEN 6'LI KUR...</option>
              <option value="2026-11-15">15 Kasım Pazar (Adana 634K ₺ ve 3.240 ₺ Tutan, İstanbul)</option>
              <option value="2026-11-14">'''

if re.search(old_robot_btns, content):
    content = re.sub(old_robot_btns, new_robot_btns, content)
    print("✅ Robot buttons and archive 2026-11-15 updated successfully.")
else:
    print("⚠ Regex for robot buttons did not match, using fallback replace.")
    content = content.replace(
        '<option value="">🏛️ GEÇMİŞ GÜNLER ARŞİVİNDEN 6\'LI KUR...</option>\n              <option value="2026-11-14">',
        '<option value="">🏛️ GEÇMİŞ GÜNLER ARŞİVİNDEN 6\'LI KUR...</option>\n              <option value="2026-11-15">15 Kasım Pazar (Adana 634K ₺ ve 3.240 ₺ Tutan, İstanbul)</option>\n              <option value="2026-11-14">'
    )
    content = content.replace(
        '📅 BUGÜN (15 KASIM İSTANBUL & ADANA)',
        '📅 BUGÜN (16 KASIM BURSA & ŞANLIURFA)'
    )
    content = content.replace(
        '🌅 YARIN (16 KASIM BURSA & ŞANLIURFA ✨)',
        '🌅 YARIN (17 KASIM ADANA & KOCAELİ ✨)'
    )

# 2. Add dynamic date helper and update switchRobotProgramDate
helper_code = '''
function getBultenCities(b) {
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
    btnToday.innerHTML = `📅 BUGÜN (${bugunTarih}) <span class="badge-pill-live">${bugunSehirler}</span>`;
    btnToday.title = `${bugunTarih} ${bugunSehirler} koşularını görüntüle`;
  }
  if (btnTomorrow) {
    btnTomorrow.innerHTML = `🌅 YARININ PROGRAMI (${yarinTarih}) <span class="badge-pill-new">${yarinSehirler} ✨</span>`;
    btnTomorrow.title = `Yarının ${yarinTarih} ${yarinSehirler} programını aç`;
  }

  const rBtnToday = document.getElementById('robot-date-btn-today');
  const rBtnTomorrow = document.getElementById('robot-date-btn-tomorrow');
  if (rBtnToday) {
    rBtnToday.innerText = `📅 BUGÜN (${bugunTarih} ${bugunSehirler})`;
    rBtnToday.title = `Bugünün ${bugunTarih} ${bugunSehirler} programı`;
  }
  if (rBtnTomorrow) {
    rBtnTomorrow.innerText = `🌅 YARIN (${yarinTarih} ${yarinSehirler} ✨)`;
    rBtnTomorrow.title = `Yarının ${yarinTarih} ${yarinSehirler} programı`;
  }

  const heroTag = document.getElementById('hero-program-date-tag');
  if (heroTag) {
    const curDate = (bulten && bulten.tarih) || bugunTarih;
    const curCities = getBultenCities(bulten) || bugunSehirler;
    heroTag.innerText = `${curDate} Resmî TJK Koşu Programı (${curCities})`;
  }
}
'''

if 'function getBultenCities' not in content:
    content = content.replace('async function switchRobotProgramDate(dateKey) {', helper_code + '\nasync function switchRobotProgramDate(dateKey) {')
    print("✅ Helper functions getBultenCities and updateDynamicDateLabels inserted.")

# 3. Dynamic toasts and archive loading in switchRobotProgramDate
content = content.replace(
    "showToast('🌅 16 Kasım Yarının 6\\'lı Programı Yüklendi (Bursa & Şanlıurfa)');",
    "updateDynamicDateLabels(); showToast(`🌅 ${bulten.tarih || '17.11.2026'} Yarının 6'lı Programı Yüklendi (${getBultenCities(bulten)})`);"
)
content = content.replace(
    "showToast('📅 15 Kasım Bugünün 6\\'lı Programı Yüklendi (İstanbul & Adana)');",
    "updateDynamicDateLabels(); showToast(`📅 ${bulten.tarih || '16.11.2026'} Bugünün 6'lı Programı Yüklendi (${getBultenCities(bulten)})`);"
)

# In archive section of switchRobotProgramDate:
archive_loader_needle = '''      // Geçmiş Günler Arşivi
      if (!archiveBultenCache[dateKey]) {'''

archive_loader_replacement = '''      // Geçmiş Günler Arşivi
      if (!archiveBultenCache[dateKey]) {
        // Öncelikli olarak doğrudan bulten_YYYY_MM_DD.json dosyasını dene (tam zengin bülten)
        const dateCode = dateKey.replace(/-/g, '_');
        try {
          const directRes = await fetch(`data/bulten_${dateCode}.json?t=${timestamp}`);
          if (directRes.ok) {
            archiveBultenCache[dateKey] = await directRes.json();
            enrichBultenRunningStylesAndPace(archiveBultenCache[dateKey]);
          }
        } catch(e) {}'''

if archive_loader_needle in content and 'directRes' not in content:
    content = content.replace(archive_loader_needle, archive_loader_replacement)
    print("✅ Archive direct JSON loader added.")

# 4. loadWinningCouponToRobot - use 2026-11-15 for 15 Nov coupons
content = content.replace(
    "  // 1. Program tarihini seç\n  if (couponId.includes('2026-11-15')) {\n    switchRobotProgramDate('bugun');",
    "  // 1. Program tarihini seç\n  if (couponId.includes('2026-11-15')) {\n    switchRobotProgramDate('2026-11-15');"
)

# 5. initPlatform - fetch yarin in parallel and call updateDynamicDateLabels
init_needle = '''    bulten = await bRes.json();
    bultenBugunCache = bulten;
    enrichBultenRunningStylesAndPace(bulten);

    // Yarının programını arka planda önbelleğe al (tek tıkla anında açılsın)
    fetch('data/bulten_yarin.json?t=' + timestamp).then(r => r.json()).then(data => {
      bultenYarinCache = data;
    }).catch(e => console.warn('Yarın bülteni preload bypassed:', e.message));'''

init_replacement = '''    bulten = await bRes.json();
    bultenBugunCache = bulten;
    enrichBultenRunningStylesAndPace(bulten);

    fetch('data/bulten_yarin.json?t=' + timestamp).then(r => r.json()).then(data => {
      bultenYarinCache = data;
      updateDynamicDateLabels();
    }).catch(e => console.warn('Yarın bülteni preload bypassed:', e.message));
    updateDynamicDateLabels();'''

if init_needle in content:
    content = content.replace(init_needle, init_replacement)
    print("✅ initPlatform preload and dynamic label call inserted.")

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("🎯 public/index.html updated successfully!")
