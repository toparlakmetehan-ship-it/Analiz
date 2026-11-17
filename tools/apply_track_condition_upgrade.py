import re
import os

index_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'index.html')
with open(index_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's inspect where calculateMudTrackDelta and renderWeatherAndTrackBar are located
target_start = content.find("function calculateMudTrackDelta(horse, kosu, condition = currentTrackCondition) {")
target_end = content.find("// ══════════════════════════════════════════════════════════════════════════════════\n// KALİBRE EDİLMİŞ DİNAMİK TURF AI MOTORU")

if target_start == -1 or target_end == -1:
    print("Could not find boundary markers!")
    exit(1)

old_code = content[target_start:target_end]

new_code = '''function getLiveHipodromTrackInfo(hip) {
  if (!hip) return {
    hasCim: false,
    hasKum: true,
    hasSentetik: false,
    cimVal: '3.3 (Normal)',
    kumStatus: 'Normal',
    summaryHtml: '🏜️ <b>TJK Resmî:</b> Kum (Normal)',
    buttonLabel: '🏜️ TJK Canlı (Kum Normal)',
    badgeLive: '🏜️ TJK RESMÎ (KUM NORMAL)'
  };

  const kosular = hip.kosular || [];
  const pistTypes = kosular.map(k => (k.pist || '').toLowerCase());
  const hasCim = pistTypes.some(p => p.includes('çim'));
  const hasKum = pistTypes.some(p => p.includes('kum') && !p.includes('sentetik'));
  const hasSentetik = pistTypes.some(p => p.includes('sentetik'));

  // Open-Meteo canlı telemetrisi ve TJK penetrometre hesaplaması
  let cimVal = '3.3 (Normal)';
  let cimStatus = 'Normal';
  if (weatherData.precip >= 3.0) {
    cimVal = '4.3 (Ağır / Çamur)';
    cimStatus = 'Ağır / Çamur';
  } else if (weatherData.precip >= 1.0) {
    cimVal = '3.9 (Çok Yumuşak)';
    cimStatus = 'Çok Yumuşak';
  } else if (weatherData.precip >= 0.2) {
    cimVal = '3.6 (Yumuşak)';
    cimStatus = 'Yumuşak';
  } else if (weatherData.humidity >= 85) {
    cimVal = '3.5 (Yumuşak)';
    cimStatus = 'Yumuşak';
  } else if (weatherData.humidity >= 70) {
    cimVal = '3.4 (Normal / İyi)';
    cimStatus = 'Normal / İyi';
  } else if (weatherData.humidity < 45) {
    cimVal = '3.2 (Sert / Hızlı)';
    cimStatus = 'Sert';
  }

  // Kum zemini nem ve su durumu
  let kumStatus = 'Normal';
  if (weatherData.precip >= 2.0) {
    kumStatus = 'Çamurlu / Ağır';
  } else if (weatherData.precip >= 0.5) {
    kumStatus = 'Islak / Sulu';
  } else if (weatherData.humidity >= 80) {
    kumStatus = `Nemli (%${weatherData.humidity})`;
  } else if (weatherData.humidity >= 60) {
    kumStatus = `Normal / Hafif Nemli (%${weatherData.humidity})`;
  } else {
    kumStatus = `Kuru / Normal (%${weatherData.humidity})`;
  }

  let sentetikStatus = weatherData.precip >= 0.5 ? 'Islak' : 'Standart (Normal)';

  // Bültendeki kayıtlı resmî ölçüm varsa önceliklendir
  let cimDisplay = hasCim ? (hip.cimOlcum && !hip.cimOlcum.includes('Yarış Yok') ? hip.cimOlcum : `Çim ${cimVal}`) : 'Yarış Yok';
  let kumDisplay = hasKum ? (hip.kumOlcum || `Kum (${kumStatus})`) : 'Yarış Yok';
  let sentetikDisplay = hasSentetik ? `Sentetik (${sentetikStatus})` : 'Yarış Yok';

  let summaryHtml = '';
  let buttonLabel = '';
  let badgeLive = '';

  if (hasCim && hasKum) {
    summaryHtml = `🌱 <b>TJK Çim:</b> ${cimDisplay} &nbsp;·&nbsp; 🏜️ <b>TJK Kum:</b> ${kumDisplay}`;
    buttonLabel = `🌱 TJK Canlı (${cimVal})`;
    badgeLive = `🌱 TJK RESMÎ (${cimVal.toUpperCase()})`;
  } else if (hasCim && hasSentetik) {
    summaryHtml = `🌱 <b>TJK Çim:</b> ${cimDisplay} &nbsp;·&nbsp; 🏟️ <b>Sentetik:</b> ${sentetikDisplay}`;
    buttonLabel = `🌱 TJK Canlı (${cimVal})`;
    badgeLive = `🌱 TJK RESMÎ (${cimVal.toUpperCase()})`;
  } else if (hasSentetik && !hasCim && !hasKum) {
    summaryHtml = `🏟️ <b>TJK Resmî Sentetik:</b> ${sentetikDisplay} <span style="color:#94a3b8; font-size:0.7rem; margin-left:4px;">(Sentetik Pist)</span>`;
    buttonLabel = `🏟️ TJK Canlı (Sentetik Normal)`;
    badgeLive = `🏟️ TJK RESMÎ (SENTETİK NORMAL)`;
  } else if (hasKum && !hasCim) {
    summaryHtml = `🏜️ <b>TJK Resmî Kum Ölçümü:</b> ${kumDisplay} <span style="color:#94a3b8; font-size:0.7rem; margin-left:4px;">(Çim Pisti Yoktur · Tüm Koşular Kum)</span>`;
    buttonLabel = `🏜️ TJK Canlı (Kum ${kumStatus})`;
    badgeLive = `🏜️ TJK RESMÎ (KUM ${kumStatus.toUpperCase()})`;
  } else {
    summaryHtml = `🌱 <b>TJK Ölçümü:</b> ${cimDisplay} · ${kumDisplay}`;
    buttonLabel = `🌱 TJK Canlı (3.3 Normal)`;
    badgeLive = `🌱 TJK RESMÎ (3.3 NORMAL)`;
  }

  return {
    hasCim,
    hasKum,
    hasSentetik,
    cimVal,
    cimStatus,
    kumStatus,
    sentetikStatus,
    cimDisplay,
    kumDisplay,
    sentetikDisplay,
    summaryHtml,
    buttonLabel,
    badgeLive
  };
}

function calculateMudTrackDelta(horse, kosu, condition = currentTrackCondition) {
  const sire = (horse.baba || '').toUpperCase();
  const mareSire = (horse.kisrak_babasi || '').toUpperCase();
  const dam = (horse.anne || '').toUpperCase();
  const name = (horse.isim || '').toUpperCase();
  const text = `${name} ${sire} ${mareSire} ${dam}`;

  // Çamur canavarı ve ıslak pist ustası aygırlar / soy hatları
  const mudEliteSires = [
    'DAREDEVIL', 'MENDIP', 'BODEMEISTER', 'KANEKO', 'LUXOR', 'TOROK', 
    'VICTORY GALLOP', 'SMART STRIKE', 'LION HEART', 'PULPIT', 'CORINTHIAN', 
    'KAIZBERT', 'ÖZHABER', 'SERHANTAY', 'HABERBATUR', 'TURBO', 'TÜMÖZ BEY', 'AYABAKAN', 'BİRADER'
  ];

  // Kuru zemin uzmanı, çamurda batan / adımı kısalan orijinler
  const dryOnlySires = [
    'NATIVE KHAN', "FAST 'N' FAMOUS", 'DEHA', 'DR FONG', 'THREE VALLEYS', 'APPROVE', 'INVINCIBLE'
  ];

  const isMudSire = mudEliteSires.some(s => text.includes(s));
  const isDrySire = dryOnlySires.some(s => text.includes(s));
  const hasMudRecord = horse.wetTrack && horse.wetTrack.isMudMonster;
  const hasDryRecord = horse.wetTrack && horse.wetTrack.isMudHater;

  if (condition === 'AGIR_CAMUR_CIM') {
    if (isMudSire || hasMudRecord) {
      return {
        delta: +4,
        badge: '🐗 ÇAMUR CANAVARI (+4)',
        desc: 'Ağır çim ve çamurda soy kütüğü üstün; adımları uzar.',
        color: '#34d399',
        type: 'MUD_PRO'
      };
    } else if (isDrySire || hasDryRecord) {
      return {
        delta: -5,
        badge: '☀️ ÇAMURDA ADIMI KISALIR (-5)',
        desc: 'Sert/kuru çim uzmanı; ağır çamur zeminde batar ve sprinti körelir.',
        color: '#f87171',
        type: 'MUD_CON'
      };
    }
    return {
      delta: 0,
      badge: '🌱 Çamurda Nötr (0)',
      desc: 'Zemin değişimi performansını belirgin etkilemez.',
      color: '#94a3b8',
      type: 'NEUTRAL'
    };
  }

  if (condition === 'ISLAK_SULU_KUM') {
    const wetDirtSires = ['DAREDEVIL', 'MENDIP', 'BODEMEISTER', 'LION HEART', 'CORINTHIAN', 'KAIZBERT', 'TÜMÖZ BEY', 'ÖZHABER'];
    if (wetDirtSires.some(s => text.includes(s)) || hasMudRecord) {
      return {
        delta: +4,
        badge: '🌊 ISLAK KUM UZMANI (+4)',
        desc: 'Sulu ve ıslak kumda sıçrayan çamurdan etkilenmez, bariyer dibinden kopar.',
        color: '#38bdf8',
        type: 'WET_DIRT_PRO'
      };
    } else if (isDrySire) {
      return {
        delta: -4,
        badge: '⚠️ SULU KUMDA AĞIRLAŞIR (-4)',
        desc: 'Islak ve sulu kumda adımları ağırlaşır.',
        color: '#f87171',
        type: 'WET_DIRT_CON'
      };
    }
    return {
      delta: 0,
      badge: '🏜️ Kumda Nötr (0)',
      desc: 'Standart kum performansı.',
      color: '#94a3b8',
      type: 'NEUTRAL'
    };
  }

  if (condition === 'CIMDEN_KUMA_ALINDI') {
    const dirtLovers = ['BODEMEISTER', 'DAREDEVIL', 'MENDIP', 'LION HEART', 'CORINTHIAN', 'KAIZBERT', 'TÜMÖZ BEY', 'ÖZHABER'];
    const turfLovers = ['NATIVE KHAN', 'LUXOR', 'TOROK'];
    if (dirtLovers.some(s => text.includes(s))) {
      return {
        delta: +6,
        badge: '🔄 KUMA ALINMA AVANTAJI (+6)',
        desc: 'Koşu çimden kuma alınınca tam aradığı sert kum pisti buldu.',
        color: '#34d399',
        type: 'DIRT_UPGRADE'
      };
    } else if (turfLovers.some(s => text.includes(s))) {
      return {
        delta: -6,
        badge: '⚠️ KUMA UYUMSUZ (-6)',
        desc: 'Saf çim orijinli; kuma alınması büyük dezavantaj yaratır.',
        color: '#ef4444',
        type: 'DIRT_DOWNGRADE'
      };
    }
    return {
      delta: -1,
      badge: '🔄 Pist Değişimi (-1)',
      desc: 'Pist değişikliğine temkinli yaklaşılır.',
      color: '#f59e0b',
      type: 'DIRT_NEUTRAL'
    };
  }

  // CANLI (Pist tipine ve telemetriye göre dinamik rozet)
  const pistType = (kosu?.pist || '').toLowerCase();
  if (pistType.includes('kum') && !pistType.includes('sentetik')) {
    const kStatus = weatherData.humidity >= 80 ? 'NEMLİ' : 'NORMAL';
    return {
      delta: 0,
      badge: `🏜️ TJK RESMÎ (KUM ${kStatus})`,
      desc: 'TJK canlı kum zemin ölçümü; zemin düzeltmesi uygulanmadı.',
      color: '#94a3b8',
      type: 'LIVE'
    };
  }
  if (pistType.includes('sentetik')) {
    return {
      delta: 0,
      badge: '🏟️ TJK RESMÎ (SENTETİK NORMAL)',
      desc: 'TJK canlı sentetik zemin ölçümü standart; zemin düzeltmesi uygulanmadı.',
      color: '#94a3b8',
      type: 'LIVE'
    };
  }

  // Çim koşusu
  const hip = bulten && bulten.hipodromlar ? bulten.hipodromlar[currentHipIdx] : null;
  const tInfo = getLiveHipodromTrackInfo(hip);
  return {
    delta: 0,
    badge: tInfo.badgeLive,
    desc: 'TJK canlı çim pist penetrometre ölçümü; zemin düzeltmesi uygulanmadı.',
    color: '#94a3b8',
    type: 'LIVE'
  };
}

// ── 5 DAKİKADA BİR TJK CANLI PİST & HAVA SENKRONİZASYONU ──
async function fetchLiveTrackAndWeather(isManual = false) {
  if (!bulten || !bulten.hipodromlar || !bulten.hipodromlar[currentHipIdx]) return;
  const hip = bulten.hipodromlar[currentHipIdx];
  const sehir = (hip.sehir || hip.isim || 'İstanbul').toLowerCase();

  let lat = 40.985, lon = 28.895; // İstanbul Veliefendi
  if (sehir.includes('adana')) { lat = 36.985; lon = 35.305; }
  else if (sehir.includes('ankara')) { lat = 39.933; lon = 32.860; }
  else if (sehir.includes('izmir')) { lat = 38.419; lon = 27.129; }
  else if (sehir.includes('bursa')) { lat = 40.188; lon = 29.061; }
  else if (sehir.includes('kocaeli')) { lat = 40.765; lon = 29.941; }
  else if (sehir.includes('urfa') || sehir.includes('şanlıurfa')) { lat = 37.159; lon = 38.797; }
  else if (sehir.includes('diyarbakır')) { lat = 37.914; lon = 40.231; }

  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code&timezone=Europe%2FIstanbul`);
    if (res.ok) {
      const data = await res.json();
      if (data.current) {
        weatherData.temp = Math.round(data.current.temperature_2m);
        weatherData.humidity = data.current.relative_humidity_2m;
        weatherData.wind = Math.round(data.current.wind_speed_10m);
        weatherData.precip = data.current.precipitation || 0;
        weatherData.weatherCode = data.current.weather_code;
        weatherData.lastSync = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

        if (weatherData.precip > 0.5) weatherData.conditionText = '🌧️ Yağmurlu / Çamur Riski';
        else if (weatherData.weatherCode >= 51 && weatherData.weatherCode <= 67) weatherData.conditionText = '🌧️ Yağışlı / Ağır Zemin';
        else if (weatherData.weatherCode >= 1 && weatherData.weatherCode <= 3) weatherData.conditionText = '⛅ Parçalı Bulutlu';
        else weatherData.conditionText = '☀️ Açık / Normal';
      }
    }
  } catch (err) {
    console.warn('Hava API erişim uyarısı:', err);
    weatherData.lastSync = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  }

  autoSyncSecondsLeft = 300;
  renderWeatherAndTrackBar();

  if (isManual) {
    const tInfo = getLiveHipodromTrackInfo(hip);
    showToast(`✓ TJK Resmî Pist ve Hava Ölçümü Güncellendi (${weatherData.lastSync}): ${weatherData.temp}°C, ${weatherData.conditionText}, Nem %${weatherData.humidity} · ${tInfo.buttonLabel}`);
  }
}

function startWeatherSyncTimer() {
  if (weatherSyncIntervalStarted) return;
  weatherSyncIntervalStarted = true;
  setInterval(() => {
    if (autoSyncSecondsLeft > 0) {
      autoSyncSecondsLeft--;
      const el = document.getElementById('weather-countdown-timer');
      if (el) {
        const m = Math.floor(autoSyncSecondsLeft / 60);
        const s = autoSyncSecondsLeft % 60;
        el.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
      }
    } else {
      fetchLiveTrackAndWeather(false);
    }
  }, 1000);
}

function setTrackCondition(condition) {
  currentTrackCondition = condition;
  renderWeatherAndTrackBar();
  renderRaceDetails();

  if (condition === 'AGIR_CAMUR_CIM') {
    showToast('🌧️ Ağır / Çamur Çim Devrede: Çamur canavarlarına +4 puan, kuru çimcilere -5 puan uygulandı.');
  } else if (condition === 'ISLAK_SULU_KUM') {
    showToast('🌊 Islak / Çamurlu Kum Devrede: Islak kum ustalarına +4 puan, kuru kumculara -4 puan uygulandı.');
  } else if (condition === 'CIMDEN_KUMA_ALINDI') {
    showToast('🔄 Çimden Kuma Alındı: Kum orijinlerine +6 puan, saf çimcilere -6 puan uygulandı.');
  } else {
    const hip = bulten && bulten.hipodromlar ? bulten.hipodromlar[currentHipIdx] : null;
    const tInfo = getLiveHipodromTrackInfo(hip);
    showToast(`✓ TJK Canlı Resmî Pist Zeminine Dönüldü (${tInfo.buttonLabel})`);
  }
}

function renderWeatherAndTrackBar() {
  const container = document.getElementById('live-weather-track-container');
  if (!container || !bulten || !bulten.hipodromlar || !bulten.hipodromlar[currentHipIdx]) return;
  const hip = bulten.hipodromlar[currentHipIdx];
  const tInfo = getLiveHipodromTrackInfo(hip);

  let activeSimBadge = '';
  if (currentTrackCondition === 'AGIR_CAMUR_CIM') {
    activeSimBadge = '<span style="background:rgba(239,68,68,0.2); border:1px solid #ef4444; color:#f87171; font-size:0.75rem; font-weight:700; padding:2px 8px; border-radius:6px; margin-left:8px;">⚠️ AĞIR / ÇAMUR ÇİM SİMÜLASYONU AKTİF (+4 / -5 Puan)</span>';
  } else if (currentTrackCondition === 'ISLAK_SULU_KUM') {
    activeSimBadge = '<span style="background:rgba(56,189,248,0.2); border:1px solid #38bdf8; color:#38bdf8; font-size:0.75rem; font-weight:700; padding:2px 8px; border-radius:6px; margin-left:8px;">⚠️ ISLAK KUM SİMÜLASYONU AKTİF (+4 / -4 Puan)</span>';
  } else if (currentTrackCondition === 'CIMDEN_KUMA_ALINDI') {
    activeSimBadge = '<span style="background:rgba(245,158,11,0.2); border:1px solid #f59e0b; color:#fbbf24; font-size:0.75rem; font-weight:700; padding:2px 8px; border-radius:6px; margin-left:8px;">⚠️ ÇİMDEN KUMA ALINDI SİMÜLASYONU (+6 / -6 Puan)</span>';
  }

  container.innerHTML = `
    <div style="background:linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(10,15,30,0.98) 100%); border:1px solid rgba(212,175,55,0.25); border-radius:16px; padding:1.1rem 1.4rem; margin-bottom:1.5rem; box-shadow:0 8px 30px rgba(0,0,0,0.5);">
      
      <!-- Üst Şerit: Başlık, Canlı Işık ve Geri Sayım -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.8rem; margin-bottom:1rem; border-bottom:1px solid rgba(212,175,55,0.15); padding-bottom:0.75rem;">
        <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;">
          <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#10b981; animation:pulseGlow 2s infinite;"></span>
          <h3 style="font-family:'Cinzel',serif; font-size:1.02rem; color:var(--text-gold); margin:0;">
            CANLI TJK HAVA VE PİST KOŞULLARI TELEMETRİSİ
          </h3>
          <span style="font-size:0.75rem; color:#94a3b8; font-family:'JetBrains Mono',monospace;">(5 Dakikada Bir Canlı Otomatik Tarama)</span>
          ${activeSimBadge}
        </div>

        <div style="display:flex; align-items:center; gap:0.75rem;">
          <div style="font-size:0.75rem; color:#cbd5e1; background:rgba(0,0,0,0.5); padding:4px 10px; border-radius:6px; border:1px solid rgba(255,255,255,0.1); font-family:'JetBrains Mono',monospace;">
            ⏱️ Sonraki Canlı TJK Taraması: <b id="weather-countdown-timer" style="color:#fbbf24;">04:59</b>
          </div>
          <button onclick="fetchLiveTrackAndWeather(true)" style="background:rgba(212,175,55,0.15); border:1px solid var(--gold-pure); color:#fcf6ba; padding:5px 12px; border-radius:8px; font-size:0.75rem; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:0.35rem; transition:all 0.2s;" onmouseover="this.style.background='rgba(212,175,55,0.3)'" onmouseout="this.style.background='rgba(212,175,55,0.15)'">
            🔄 Şimdi TJK'yı Tara
          </button>
        </div>
      </div>

      <!-- Alt Grid: Hava Durumu + TJK Pist Ölçümü + İnteraktif Zemin Simülatörü -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:1rem; align-items:stretch;">
        
        <!-- Kutu 1: Canlı Hipodrom Hava & Pist Ölçümü -->
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:0.85rem 1rem; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
              <span style="font-size:0.72rem; color:var(--text-gold); font-weight:700; text-transform:uppercase;">🌤️ HİPODROM HAVA TELEMETRİSİ</span>
              <span style="font-size:0.68rem; color:#94a3b8; font-family:'JetBrains Mono';">Son Veri: ${weatherData.lastSync}</span>
            </div>
            <div style="display:flex; align-items:center; gap:0.8rem; flex-wrap:wrap; margin-bottom:0.4rem;">
              <span style="font-size:1.35rem; font-family:'Cinzel',serif; color:#f8fafc; font-weight:800;">${weatherData.temp}°C</span>
              <span style="font-size:0.85rem; color:#e2e8f0; font-weight:600;">${weatherData.conditionText}</span>
              <span style="font-size:0.72rem; color:#94a3b8;">· Nem: %${weatherData.humidity}</span>
              <span style="font-size:0.72rem; color:#94a3b8;">· Rüzgar: ${weatherData.wind} km/h</span>
            </div>
          </div>
          <div style="font-size:0.75rem; color:#38bdf8; background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.25); padding:0.4rem 0.6rem; border-radius:6px; margin-top:0.4rem;">
            ${tInfo.summaryHtml}
          </div>
        </div>

        <!-- Kutu 2: İnteraktif Zemin & Çamur Simülatörü -->
        <div style="background:rgba(0,0,0,0.35); border:1px solid rgba(212,175,55,0.18); border-radius:12px; padding:0.85rem 1rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <span style="font-size:0.72rem; color:#f3e5ab; font-weight:700; text-transform:uppercase;">🧪 ZEMİN & ÇAMUR SİMÜLATÖRÜ</span>
            <span style="font-size:0.68rem; color:#34d399; font-weight:600;">(Puan & Sıralamayı Anında Değiştirir)</span>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:0.45rem;">
            <button onclick="setTrackCondition('CANLI')" class="track-sim-btn ${currentTrackCondition === 'CANLI' ? 'active' : ''}">
              ${tInfo.buttonLabel}
            </button>
            ${tInfo.hasCim ? `
              <button onclick="setTrackCondition('AGIR_CAMUR_CIM')" class="track-sim-btn ${currentTrackCondition === 'AGIR_CAMUR_CIM' ? 'active' : ''}">
                🌧️ Ağır / Çamur Çim (4.5+)
              </button>
              <button onclick="setTrackCondition('CIMDEN_KUMA_ALINDI')" class="track-sim-btn ${currentTrackCondition === 'CIMDEN_KUMA_ALINDI' ? 'active' : ''}">
                🔄 Çimden Kuma Alındı
              </button>
            ` : ''}
            ${tInfo.hasKum ? `
              <button onclick="setTrackCondition('ISLAK_SULU_KUM')" class="track-sim-btn ${currentTrackCondition === 'ISLAK_SULU_KUM' ? 'active' : ''}">
                🌊 Islak / Sulu Kum
              </button>
            ` : ''}
          </div>
          <div style="font-size:0.68rem; color:#94a3b8; margin-top:0.5rem; line-height:1.35;">
            * Butonlara tıklandığında koşudaki tüm safkanların pedigrisi (baba, kısrak babası, kardeşlerin ıslak pist derecesi) taranır; <b>Çamur Canavarlarına +4 / +6 Puan</b>, çamurda batan kuru zemin safkanlarına <b>-5 / -6 Puan</b> yansıtılarak kupon yeniden oluşturulur.
          </div>
        </div>

      </div>
    </div>
  `;
}
'''

new_content = content[:target_start] + new_code + content[target_end:]

with open(index_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Track condition upgrade applied successfully! Old size:", len(content), "New size:", len(new_content))
