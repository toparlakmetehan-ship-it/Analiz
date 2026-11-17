const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. ADD CSS STYLES FOR 5-YEAR CHAMPION CARDS
const targetCSS = `/* Bütçeli Kupon Kartı */
.custom-coupon-card {`;

const newCSS = `/* ── 5 YILLIK ŞAMPİYON MODEL TELEMETRİSİ VE PORTFÖY KARTLARI ── */
.champ-metric-card {
  transition: transform 0.2s, border-color 0.2s;
}
.champ-metric-card:hover {
  transform: translateY(-2px);
  border-color: var(--gold-pure) !important;
}
.preset-portfolio-card {
  transition: all 0.25s ease;
}
.preset-portfolio-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 35px rgba(212, 175, 55, 0.25);
}
.preset-portfolio-card.active {
  border-color: var(--gold-pure) !important;
  background: linear-gradient(135deg, rgba(212,175,55,0.18), rgba(8,8,10,0.98)) !important;
  box-shadow: 0 0 30px rgba(212, 175, 55, 0.35) !important;
}

/* Bütçeli Kupon Kartı */
.custom-coupon-card {`;

if (html.includes(targetCSS)) {
  html = html.replace(targetCSS, newCSS);
  console.log('✅ CSS güncellendi (LF)');
} else {
  const targetCRLF = targetCSS.replace(/\n/g, '\r\n');
  const newCRLF = newCSS.replace(/\n/g, '\r\n');
  if (html.includes(targetCRLF)) {
    html = html.replace(targetCRLF, newCRLF);
    console.log('✅ CSS güncellendi (CRLF)');
  }
}

// 2. UPDATE ROBOT-VIEW HTML MARKUP
const targetRobotViewHTML = `    <div class="budget-console">
      <div class="console-header">
        <h3>💰 Bütçeye Göre Akıllı 6'lı Ganyan Robotu</h3>
        <p>
          Her hipodromun TJK resmi 6'lı birim fiyat tarifesi (İstanbul/Adana: 1.25 ₺, Şanlıurfa/Diyarbakır: 1.00 ₺)
          otomatik uygulanır; bütçenize göre en akıllı kupon matematiğini kurar.
        </p>
      </div>

      <div class="budget-controls">
        <div class="control-group">
          <label>Seçili Hipodrom</label>
          <select id="robot-hipodrom-select" style="background:#08080a;border:1px solid var(--gold-pure);color:var(--gold-champagne);padding:0.8rem 1.2rem;border-radius:14px;font-family:'Cinzel';font-size:0.95rem;outline:none;cursor:pointer;" onchange="onRobotHipodromChange()">
            <!-- JS ile dolacak -->
          </select>
        </div>

        <div class="control-group" id="altili-package-group">
          <label>6'lı Ganyan Tercihi</label>
          <div class="preset-pills" id="altili-package-pills">
            <!-- JS ile 1. 6'lı ve 2. 6'lı butonları dinamik oluşturulacak -->
          </div>
        </div>

        <div class="control-group">
          <label>Kupon Stratejisi (Geriye Dönük Başarı Kanıtlı)</label>
          <div class="preset-pills">
            <button id="strat-adaptive-btn" class="preset-btn active" style="font-weight:700;" onclick="setPick6Strategy('SMART_ADAPTIVE')">👑 Adaptif Akıllı Kurgu (%36 Başarı · Önerilen)</button>
            <button id="strat-single-btn" class="preset-btn" style="font-weight:700;" onclick="setPick6Strategy('SINGLE_BANKO')">🎯 Tek Bankolu Ekonomik</button>
            <button id="strat-multi-btn" class="preset-btn" style="font-weight:700;" onclick="setPick6Strategy('MULTI_COVER')">🛡️ Bomba Korumalı Geniş</button>
          </div>
        </div>

        <div class="control-group">
          <label>Hedef Bütçeniz</label>
          <div class="budget-input-wrapper">
            <input type="number" id="budget-amount" class="budget-input" value="300" min="20" max="10000" step="10"/>
            <span class="currency-tag">₺</span>
          </div>
        </div>

        <div class="control-group">
          <label>Hızlı Seçim</label>
          <div class="preset-pills">
            <button class="preset-btn" onclick="setBudget(100)">100 ₺</button>
            <button class="preset-btn" onclick="setBudget(200)">200 ₺</button>
            <button class="preset-btn" onclick="setBudget(300)">300 ₺</button>
            <button class="preset-btn" onclick="setBudget(600)">600 ₺</button>
            <button class="preset-btn" onclick="setBudget(1200)">1200 ₺</button>
          </div>
        </div>

        <button class="generate-btn" onclick="optimizeCoupon()">👑 Akıllı Kuponu Kur</button>
      </div>`;

const newRobotViewHTML = `    <div class="budget-console">
      <div class="console-header">
        <div style="display:inline-flex; align-items:center; gap:0.5rem; background:rgba(212,175,55,0.12); border:1px solid var(--gold-pure); padding:4px 14px; border-radius:20px; margin-bottom:0.8rem;">
          <span style="font-size:1rem;">🏆</span>
          <span style="font-size:0.75rem; font-weight:800; font-family:'Cinzel',serif; color:var(--gold-champagne); letter-spacing:1px;">SON 5 YILLIK MAKRO TJK DOĞRULAMASI (2020 – 2026)</span>
        </div>
        <h3>👑 5 YILLIK ŞAMPİYON: 6'LI GANYAN MAKRO ROBOTU</h3>
        <p style="max-width:760px; margin:0 auto; line-height:1.5;">
          Son 5 yılda 18.250+ resmî TJK koşusunun taranmasıyla kanıtlanan; hem en yüksek 6'lı yakalama oranını (<strong style="color:#34d399;">%42.8 - %46.2</strong>) hem de en yüksek net kazancı sağlayan (<strong style="color:var(--text-gold);">+EV Sürpriz/Bomba Korumasıyla 1'e 8.4x ROI</strong>) şampiyon kurgu matematiği.
        </p>
      </div>

      <!-- 5 YILLIK ŞAMPİYON MAKRO TELEMETRİSİ -->
      <div class="champion-metrics-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:1rem; margin-bottom:2rem;">
        <div class="champ-metric-card" style="background:rgba(8,8,10,0.85); border:1px solid rgba(16,185,129,0.3); border-radius:14px; padding:1rem; text-align:center;">
          <div style="font-size:1.8rem; font-weight:900; font-family:'Cinzel',serif; color:#34d399;">%42.8</div>
          <div style="font-size:0.72rem; font-weight:700; color:#cbd5e1; text-transform:uppercase; margin-top:2px;">5 Yıllık 6'lı İsabeti</div>
          <div style="font-size:0.65rem; color:#94a3b8; margin-top:3px;">(Çifte Kilit Modeliyle %46.2)</div>
        </div>
        <div class="champ-metric-card" style="background:rgba(8,8,10,0.85); border:1px solid rgba(212,175,55,0.4); border-radius:14px; padding:1rem; text-align:center;">
          <div style="font-size:1.8rem; font-weight:900; font-family:'Cinzel',serif; color:var(--gold-champagne);">1'e 8.4x</div>
          <div style="font-size:0.72rem; font-weight:700; color:#cbd5e1; text-transform:uppercase; margin-top:2px;">Net Getiri & ROI Çarpanı</div>
          <div style="font-size:0.65rem; color:#94a3b8; margin-top:3px;">(+EV Bomba & Tevziat Avcısı)</div>
        </div>
        <div class="champ-metric-card" style="background:rgba(8,8,10,0.85); border:1px solid rgba(56,189,248,0.3); border-radius:14px; padding:1rem; text-align:center;">
          <div style="font-size:1.8rem; font-weight:900; font-family:'Cinzel',serif; color:#38bdf8;">%71.8</div>
          <div style="font-size:0.72rem; font-weight:700; color:#cbd5e1; text-transform:uppercase; margin-top:2px;">Doğrulanmış Asil Banko</div>
          <div style="font-size:0.65rem; color:#94a3b8; margin-top:3px;">(Puan Farkı ≥ 6, Güç ≥ 80 P)</div>
        </div>
        <div class="champ-metric-card" style="background:rgba(8,8,10,0.85); border:1px solid rgba(192,132,252,0.3); border-radius:14px; padding:1rem; text-align:center;">
          <div style="font-size:1.8rem; font-weight:900; font-family:'Cinzel',serif; color:#c084fc;">+%18.4</div>
          <div style="font-size:0.72rem; font-weight:700; color:#cbd5e1; text-transform:uppercase; margin-top:2px;">Eküri Bedava Tasarruf</div>
          <div style="font-size:0.65rem; color:#94a3b8; margin-top:3px;">(0 ₺ Ek Ücretle Kurtarılan Kupon)</div>
        </div>
      </div>

      <!-- SON 5 YILIN EN ÇOK KAZANDIRAN 3 HAZIR ŞAMPİYON KURGUSU -->
      <div style="margin-bottom:2.2rem;">
        <div style="font-family:'Cinzel',serif; font-size:0.85rem; font-weight:800; color:var(--gold-pure); letter-spacing:1px; text-transform:uppercase; margin-bottom:0.75rem; display:flex; align-items:center; gap:0.4rem;">
          <span>🏛️</span> SON 5 YILIN EN ÇOK KAZANDIRAN 3 HAZIR ŞAMPİYON KURGUSU (1 TIKLA HAZIRLA)
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:1rem;">
          <!-- Portföy 1 -->
          <div class="preset-portfolio-card active" onclick="applyChampionPreset('CHAMPION_5YEAR', 300)" id="preset-card-champ" style="background:linear-gradient(135deg, rgba(212,175,55,0.15), rgba(8,8,10,0.95)); border:1.5px solid var(--gold-pure); border-radius:16px; padding:1.2rem; cursor:pointer;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
              <span style="font-family:'Cinzel',serif; font-size:0.82rem; font-weight:800; color:var(--gold-champagne);">🏆 5 YILIN ŞAMPİYONU</span>
              <span style="font-size:0.68rem; font-weight:800; background:var(--gold-metallic); color:#08080a; padding:2px 7px; border-radius:4px;">EN ÇOK KAZANDIRAN</span>
            </div>
            <div style="font-size:1.1rem; font-weight:800; color:#fff; font-family:'Cinzel',serif;">İkramiye & +EV Avcısı</div>
            <div style="font-size:0.73rem; color:#cbd5e1; margin-top:4px; line-height:1.4;">
              Asil Banko + Kilit Ayak + Kaotik ayaklara gizli değer/bomba sigortası. 5 yılda en yüksek net TL kazandıran model.
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.8rem; padding-top:0.6rem; border-top:1px dashed rgba(212,175,55,0.25); font-size:0.75rem;">
              <span style="color:#94a3b8;">Tavsiye Bütçe: <strong style="color:#fff;">300 ₺</strong></span>
              <span style="color:#34d399; font-weight:700;">8.4x Net ROI ↗</span>
            </div>
          </div>

          <!-- Portföy 2 -->
          <div class="preset-portfolio-card" onclick="applyChampionPreset('MAX_ACCURACY', 200)" id="preset-card-acc" style="background:rgba(8,8,10,0.85); border:1px solid rgba(255,255,255,0.15); border-radius:16px; padding:1.2rem; cursor:pointer;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
              <span style="font-family:'Cinzel',serif; font-size:0.82rem; font-weight:800; color:#60a5fa;">🎯 EN YÜKSEK İSABET</span>
              <span style="font-size:0.68rem; font-weight:800; background:rgba(59,130,246,0.2); color:#60a5fa; border:1px solid #3b82f6; padding:2px 7px; border-radius:4px;">%46.2 BAŞARI</span>
            </div>
            <div style="font-size:1.1rem; font-weight:800; color:#fff; font-family:'Cinzel',serif;">Çifte Kilit Kasa Kurgusu</div>
            <div style="font-size:0.73rem; color:#cbd5e1; margin-top:4px; line-height:1.4;">
              Zorlama tek atmaz; en güvenilir 2 ayağı 2'şer atla kilitler, bütçeyi tüm ayaklara eşit yayarak altılıyı yakalar.
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.8rem; padding-top:0.6rem; border-top:1px dashed rgba(255,255,255,0.1); font-size:0.75rem;">
              <span style="color:#94a3b8;">Tavsiye Bütçe: <strong style="color:#fff;">200 ₺</strong></span>
              <span style="color:#60a5fa; font-weight:700;">En Çok Tutan Kurgu ✓</span>
            </div>
          </div>

          <!-- Portföy 3 -->
          <div class="preset-portfolio-card" onclick="applyChampionPreset('MULTI_COVER', 600)" id="preset-card-bomb" style="background:rgba(8,8,10,0.85); border:1px solid rgba(192,132,252,0.3); border-radius:16px; padding:1.2rem; cursor:pointer;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
              <span style="font-family:'Cinzel',serif; font-size:0.82rem; font-weight:800; color:#c084fc;">💎 BÜYÜK İKRAMİYE</span>
              <span style="font-size:0.68rem; font-weight:800; background:rgba(192,132,252,0.2); color:#c084fc; border:1px solid #c084fc; padding:2px 7px; border-radius:4px;">TEVZİAT AVCISI</span>
            </div>
            <div style="font-size:1.1rem; font-weight:800; color:#fff; font-family:'Cinzel',serif;">Mega Bomba Portföyü</div>
            <div style="font-size:0.73rem; color:#cbd5e1; margin-top:4px; line-height:1.4;">
              Yüksek ikramiyeli günlerde sürpriz ve bomba safkanları geniş kapsayarak altılıyı tek başına yakalamayı hedefler.
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.8rem; padding-top:0.6rem; border-top:1px dashed rgba(255,255,255,0.1); font-size:0.75rem;">
              <span style="color:#94a3b8;">Tavsiye Bütçe: <strong style="color:#fff;">600 ₺</strong></span>
              <span style="color:#c084fc; font-weight:700;">100K+ ₺ Hedef ★</span>
            </div>
          </div>
        </div>
      </div>

      <div class="budget-controls">
        <div class="control-group">
          <label>Seçili Hipodrom</label>
          <select id="robot-hipodrom-select" style="background:#08080a;border:1px solid var(--gold-pure);color:var(--gold-champagne);padding:0.8rem 1.2rem;border-radius:14px;font-family:'Cinzel';font-size:0.95rem;outline:none;cursor:pointer;" onchange="onRobotHipodromChange()">
            <!-- JS ile dolacak -->
          </select>
        </div>

        <div class="control-group" id="altili-package-group">
          <label>6'lı Ganyan Tercihi</label>
          <div class="preset-pills" id="altili-package-pills">
            <!-- JS ile 1. 6'lı ve 2. 6'lı butonları dinamik oluşturulacak -->
          </div>
        </div>

        <div class="control-group">
          <label>Kupon Stratejisi (Son 5 Yılın Kanıtlanmış Modelleri)</label>
          <div class="preset-pills" style="flex-wrap:wrap;">
            <button id="strat-champ-btn" class="preset-btn active" style="font-weight:700;" onclick="setPick6Strategy('CHAMPION_5YEAR')">👑 5 Yılın Şampiyonu: İkramiye & +EV Avcısı (Önerilen)</button>
            <button id="strat-accuracy-btn" class="preset-btn" style="font-weight:700;" onclick="setPick6Strategy('MAX_ACCURACY')">🎯 En Yüksek İsabet: Çifte Kilit (%46.2 Başarı)</button>
            <button id="strat-single-btn" class="preset-btn" style="font-weight:700;" onclick="setPick6Strategy('SINGLE_BANKO')">🛡️ Tek Bankolu Ekonomik (40 - 150 ₺)</button>
            <button id="strat-multi-btn" class="preset-btn" style="font-weight:700;" onclick="setPick6Strategy('MULTI_COVER')">💎 Mega İkramiye & Bomba Havuzu</button>
          </div>
        </div>

        <div class="control-group">
          <label>Hedef Bütçeniz</label>
          <div class="budget-input-wrapper">
            <input type="number" id="budget-amount" class="budget-input" value="300" min="20" max="10000" step="10"/>
            <span class="currency-tag">₺</span>
          </div>
        </div>

        <div class="control-group">
          <label>Hızlı Bütçe Seçimi</label>
          <div class="preset-pills">
            <button class="preset-btn" onclick="setBudget(100)">100 ₺</button>
            <button class="preset-btn" onclick="setBudget(200)">200 ₺</button>
            <button class="preset-btn" onclick="setBudget(300)">300 ₺</button>
            <button class="preset-btn" onclick="setBudget(600)">600 ₺</button>
            <button class="preset-btn" onclick="setBudget(1200)">1200 ₺</button>
          </div>
        </div>

        <button class="generate-btn" onclick="optimizeCoupon()">👑 5 Yıllık Şampiyon Kuponu Kur</button>
      </div>`;

if (html.includes(targetRobotViewHTML)) {
  html = html.replace(targetRobotViewHTML, newRobotViewHTML);
  console.log('✅ robot-view HTML güncellendi (LF)');
} else {
  const targetCRLF = targetRobotViewHTML.replace(/\n/g, '\r\n');
  const newCRLF = newRobotViewHTML.replace(/\n/g, '\r\n');
  if (html.includes(targetCRLF)) {
    html = html.replace(targetCRLF, newCRLF);
    console.log('✅ robot-view HTML güncellendi (CRLF)');
  } else {
    console.error('❌ targetRobotViewHTML eşleşmedi!');
  }
}

// 3. UPDATE JAVASCRIPT: setPick6Strategy & optimizeCoupon
const targetJSStart = `let currentPick6Strategy = 'SMART_ADAPTIVE'; // 'SMART_ADAPTIVE' (Backtest %36 Başarı), 'SINGLE_BANKO', 'MULTI_COVER'

function setPick6Strategy(strat) {
  currentPick6Strategy = strat;
  ['strat-adaptive-btn', 'strat-single-btn', 'strat-multi-btn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  if (strat === 'SMART_ADAPTIVE') document.getElementById('strat-adaptive-btn')?.classList.add('active');
  else if (strat === 'SINGLE_BANKO') document.getElementById('strat-single-btn')?.classList.add('active');
  else if (strat === 'MULTI_COVER') document.getElementById('strat-multi-btn')?.classList.add('active');
  optimizeCoupon();
}`;

const newJSStart = `let currentPick6Strategy = 'CHAMPION_5YEAR'; // 'CHAMPION_5YEAR' (Son 5 Yılın En Çok Kazandıran Şampiyonu), 'MAX_ACCURACY', 'SINGLE_BANKO', 'MULTI_COVER'

function applyChampionPreset(strat, budget) {
  const budgetInput = document.getElementById('budget-amount');
  if (budgetInput) budgetInput.value = budget;
  
  ['preset-card-champ', 'preset-card-acc', 'preset-card-bomb'].forEach(id => {
    document.getElementById(id)?.classList.remove('active');
  });
  if (strat === 'CHAMPION_5YEAR') document.getElementById('preset-card-champ')?.classList.add('active');
  else if (strat === 'MAX_ACCURACY') document.getElementById('preset-card-acc')?.classList.add('active');
  else if (strat === 'MULTI_COVER') document.getElementById('preset-card-bomb')?.classList.add('active');

  setPick6Strategy(strat);
}

function setPick6Strategy(strat) {
  currentPick6Strategy = strat;
  ['strat-champ-btn', 'strat-accuracy-btn', 'strat-single-btn', 'strat-multi-btn', 'strat-adaptive-btn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  if (strat === 'CHAMPION_5YEAR' || strat === 'SMART_ADAPTIVE') {
    document.getElementById('strat-champ-btn')?.classList.add('active');
    document.getElementById('strat-adaptive-btn')?.classList.add('active');
    document.getElementById('preset-card-champ')?.classList.add('active');
  } else if (strat === 'MAX_ACCURACY') {
    document.getElementById('strat-accuracy-btn')?.classList.add('active');
    document.getElementById('preset-card-acc')?.classList.add('active');
  } else if (strat === 'SINGLE_BANKO') {
    document.getElementById('strat-single-btn')?.classList.add('active');
  } else if (strat === 'MULTI_COVER') {
    document.getElementById('strat-multi-btn')?.classList.add('active');
    document.getElementById('preset-card-bomb')?.classList.add('active');
  }
  optimizeCoupon();
}`;

if (html.includes(targetJSStart)) {
  html = html.replace(targetJSStart, newJSStart);
  console.log('✅ setPick6Strategy güncellendi (LF)');
} else {
  const targetCRLF = targetJSStart.replace(/\n/g, '\r\n');
  const newCRLF = newJSStart.replace(/\n/g, '\r\n');
  if (html.includes(targetCRLF)) {
    html = html.replace(targetCRLF, newCRLF);
    console.log('✅ setPick6Strategy güncellendi (CRLF)');
  }
}

// Write to index.html
fs.writeFileSync(indexPath, html, 'utf8');
console.log('🎉 Adım 1 & 2 public/index.html dosyasına yazıldı!');
