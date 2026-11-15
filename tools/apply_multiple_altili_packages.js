const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Update HTML controls in robot-view to add 1. 6'lı and 2. 6'lı package selector
const oldControlsStart = '<div class="budget-controls">';
const targetHipodromGroup = `<div class="control-group">
          <label>Seçili Hipodrom</label>
          <select id="robot-hipodrom-select" style="background:#08080a;border:1px solid var(--gold-pure);color:var(--gold-champagne);padding:0.8rem 1.2rem;border-radius:14px;font-family:'Cinzel';font-size:0.95rem;outline:none;" onchange="onRobotHipodromChange()">
            <!-- JS ile dolacak -->
          </select>
        </div>`;

const newHipodromAndPackageGroup = `<div class="control-group">
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
        </div>`;

if (html.includes(targetHipodromGroup)) {
  html = html.replace(targetHipodromGroup, newHipodromAndPackageGroup);
}

// 2. Update robot script logic to support 1. 6'lı and 2. 6'lı
const oldRobotScriptStart = 'function initRobotSelector() {';
const oldRobotScriptEnd = 'function renderBacktest() {';

const newRobotScript = `
let currentAltiliPackage = 1; // 1: 1. 6'lı Ganyan, 2: 2. 6'lı Ganyan

function initRobotSelector() {
  const sel = document.getElementById('robot-hipodrom-select');
  if (!sel) return;
  sel.innerHTML = '';
  bulten.hipodromlar.forEach((hip, idx) => {
    const rateInfo = getTjkCityRate(hip.sehir || hip.isim);
    const opt = document.createElement('option');
    opt.value = idx;
    opt.innerText = \`\${hip.isim || hip.sehir} (\${hip.kosular.length} Koşu - Birim: \${rateInfo.birimFiyat.toFixed(2)} ₺)\`;
    sel.appendChild(opt);
  });

  renderAltiliPackageButtons();
}

function renderAltiliPackageButtons() {
  const hipIdx = parseInt(document.getElementById('robot-hipodrom-select').value) || 0;
  const hip = bulten.hipodromlar[hipIdx];
  const totalRaces = (hip.kosular || []).length;
  const container = document.getElementById('altili-package-pills');
  if (!container) return;
  container.innerHTML = '';

  // 1. 6'lı Ganyan (Her zaman 1. - 6. koşular)
  const btn1 = document.createElement('button');
  btn1.className = \`preset-btn \${currentAltiliPackage === 1 ? 'active' : ''}\`;
  btn1.style.fontWeight = '700';
  btn1.innerText = "1. 6'lı Ganyan (1. - 6. Koşular)";
  btn1.onclick = () => selectAltiliPackage(1);
  container.appendChild(btn1);

  // Eğer hipodromda 8 veya daha fazla koşu varsa 2. 6'lı Ganyan mevcuttur
  if (totalRaces >= 8) {
    const start2 = totalRaces - 5; // Örn 9 koşu için 4. koşu, 8 koşu için 3. koşu
    const end2 = totalRaces;
    const btn2 = document.createElement('button');
    btn2.className = \`preset-btn \${currentAltiliPackage === 2 ? 'active' : ''}\`;
    btn2.style.fontWeight = '700';
    btn2.innerText = \`2. 6'lı Ganyan (\${start2}. - \${end2}. Koşular)\`;
    btn2.onclick = () => selectAltiliPackage(2);
    container.appendChild(btn2);
  } else {
    // 8'den azsa otomatik 1. 6'lıya dön
    currentAltiliPackage = 1;
  }
}

function selectAltiliPackage(pkgNum) {
  currentAltiliPackage = pkgNum;
  renderAltiliPackageButtons();
  optimizeCoupon();
}

function onRobotHipodromChange() {
  currentAltiliPackage = 1;
  renderAltiliPackageButtons();
  optimizeCoupon();
}

function setBudget(val) {
  document.getElementById('budget-amount').value = val;
  optimizeCoupon();
}

function optimizeCoupon() {
  const hipIdx = parseInt(document.getElementById('robot-hipodrom-select').value) || 0;
  const targetBudget = parseFloat(document.getElementById('budget-amount').value) || 300;
  const hip = bulten.hipodromlar[hipIdx];
  const allKosular = hip.kosular || [];
  if (allKosular.length < 6) return;

  // 1. 6'lı mı yoksa 2. 6'lı mı seçili?
  let kosular = [];
  let packageLabel = "1. 6'LI GANYAN (1. - 6. KOŞULAR)";
  let startRaceOffset = 1;

  if (currentAltiliPackage === 2 && allKosular.length >= 8) {
    const startIdx = allKosular.length - 6;
    kosular = allKosular.slice(startIdx);
    startRaceOffset = startIdx + 1;
    packageLabel = \`2. 6'LI GANYAN (\${startRaceOffset}. - \${allKosular.length}. KOŞULAR)\`;
  } else {
    kosular = allKosular.slice(0, 6);
    startRaceOffset = 1;
    packageLabel = "1. 6'LI GANYAN (1. - 6. KOŞULAR)";
  }

  // Hipodromun TJK resmi birim fiyatını al
  const rateInfo = getTjkCityRate(hip.sehir || hip.isim);
  const cityUnitCost = rateInfo.birimFiyat;

  // Ayaklardaki atları puanla ve netlik farkını bul
  const ratedLegs = kosular.map((k, idx) => {
    const realRaceNum = startRaceOffset + idx;
    const scored = (k.atlar || []).map(h => ({
      ...h,
      ...calculatePowerIndex(h, k.atlar)
    })).sort((a, b) => b.royalScore - a.royalScore);

    const topDiff = scored.length > 1 ? (scored[0].royalScore - scored[1].royalScore) : 25;
    return {
      kosu: k,
      realRaceNum: realRaceNum,
      legIndex: idx + 1,
      horses: scored,
      diff: topDiff
    };
  });

  // En belirgin fark olan ayağı (en yüksek puan farkı) ASİL BANKO (Tek) yapıyoruz
  const sortedByCertainty = [...ratedLegs].sort((a, b) => b.diff - a.diff);
  const bankoLeg = sortedByCertainty[0];

  // Başlangıç kuponu: Banko ayağına 1 at, diğerlerine ilk 2 at
  const picks = ratedLegs.map(l => {
    if (l === bankoLeg) {
      return [l.horses[0]];
    }
    return [l.horses[0], l.horses[1]];
  });

  function calcCost() {
    const comb = picks.reduce((acc, p) => acc * p.length, 1);
    return comb * cityUnitCost;
  }

  // Bütçeye göre kalan tutarı en zorlu ayaklara 3., 4., 5., 6. atlar olarak dağıt
  let added = true;
  while (added && calcCost() <= targetBudget) {
    added = false;
    const difficultLegs = [...ratedLegs]
      .filter((l, i) => l !== bankoLeg && picks[i].length < Math.min(6, l.horses.length))
      .sort((a, b) => a.diff - b.diff);

    for (const leg of difficultLegs) {
      const legIdx = ratedLegs.indexOf(leg);
      const nextHorse = leg.horses[picks[legIdx].length];
      if (nextHorse) {
        picks[legIdx].push(nextHorse);
        if (calcCost() > targetBudget) {
          picks[legIdx].pop();
        } else {
          added = true;
          break;
        }
      }
    }
  }

  let finalCost = calcCost();
  let misliCount = 1;
  if (finalCost < rateInfo.minKupon) {
    misliCount = Math.ceil(rateInfo.minKupon / finalCost);
    finalCost = finalCost * misliCount;
  }

  const totalComb = picks.reduce((acc, p) => acc * p.length, 1);
  const budgetCompliance = Math.min(100, Math.round((finalCost / targetBudget) * 100));

  // Kartı oluştur
  const container = document.getElementById('optimized-coupon-container');
  container.innerHTML = \`
    <div class="custom-coupon-card">
      <div class="coupon-head-flex">
        <div>
          <div class="coupon-tag-badge">👑 \${(hip.isim || hip.sehir).toUpperCase()} — \${packageLabel}</div>
          <div style="font-size:0.75rem; color:var(--text-gold); margin-top:4px;">
            Resmî Şehir Birim Fiyatı: <strong>\${cityUnitCost.toFixed(2)} ₺</strong> | Asgari Kupon: \${rateInfo.minKupon.toFixed(2)} ₺
          </div>
        </div>
        <div class="coupon-math-info">
          Hedef: \${targetBudget} ₺ | Hesaplanan Kupon: \${finalCost.toFixed(2)} ₺ (\` + (misliCount > 1 ? misliCount + ' Misli' : '%100 Uyum') + \`)
        </div>
      </div>

      <div class="legs-grid">
        \${picks.map((pickList, idx) => {
          const leg = ratedLegs[idx];
          const isSingle = pickList.length === 1;
          return \`
            <div class="leg-box \${isSingle ? 'single-banko' : ''}">
              <div class="leg-header">
                <span>\${idx + 1}. AYAK (\${leg.realRaceNum}. Koşu)</span>
                <span style="font-family:'JetBrains Mono'; font-size:0.7rem; color:var(--gold-champagne);">\${pickList.length} Safkan</span>
              </div>
              <div style="font-size:0.72rem; color:var(--text-muted); margin-bottom:0.5rem; text-transform:uppercase;">
                \${isSingle ? '★ ASİL BANKO (TEK)' : 'KORUMALI AYAK'} · \${leg.kosu.pist || ''} \${leg.kosu.mesafe || ''}m
              </div>
              <div class="picked-horses-list">
                \${pickList.map(h => \`
                  <div class="p-horse">
                    <span class="p-no">\${h.no}</span>
                    <span class="p-name">\${h.isim}</span>
                    <span class="p-score">\${h.royalScore} P</span>
                  </div>
                \`).join('')}
              </div>
            </div>
          \`;
        }).join('')}
      </div>

      <div class="coupon-footer-stats">
        <div class="c-stat">
          <h5>Kombinasyon</h5>
          <div class="v">\${totalComb} Adet</div>
        </div>
        <div class="c-stat">
          <h5>Şehir Birim Fiyatı</h5>
          <div class="v">\${cityUnitCost.toFixed(2)} ₺</div>
        </div>
        <div class="c-stat">
          <h5>Bütçe Uyumu</h5>
          <div class="v">%\${budgetCompliance}</div>
        </div>
        <div class="c-stat-cost">
          <h5>Kupon Tutarı</h5>
          <div class="v">\${finalCost.toFixed(2)} ₺ \${misliCount > 1 ? '<span style=\"font-size:0.8rem;color:var(--text-gold);\">(' + misliCount + ' Misli)</span>' : ''}</div>
        </div>
      </div>
    </div>
  \`;
}
`;

const jsStart = html.indexOf(oldRobotScriptStart);
const jsEnd = html.indexOf(oldRobotScriptEnd);

if (jsStart !== -1 && jsEnd !== -1) {
  html = html.substring(0, jsStart) + newRobotScript.trim() + '\n\n' + html.substring(jsEnd);
} else {
  console.error('Could not locate old robot script section');
  process.exit(1);
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully added 1. 6\'lı and 2. 6\'lı package selection to robot!');
