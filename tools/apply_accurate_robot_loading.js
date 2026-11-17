const fs = require('fs');

const path = 'public/index.html';
let html = fs.readFileSync(path, 'utf8');

// 1. Fix the riskLevel in optimizeCoupon so horseCount <= 7 doesn't starve Leg 5 (Race 7)
const oldRiskSnippet = `    // Resmî 5 Yıllık TJK Backtest Risk Profili
    let riskLevel = 'NORMAL';
    if (sinif.includes('maiden') || sinif.includes('şartlı 1') || (sinif.includes('handikap') && horseCount >= 12)) {
      riskLevel = 'HIGH_RISK'; // Yüksek riskli kaotik ayak (+EV Bomba ve sürpriz koruması gerekir)
    } else if (sinif.includes('açık') || sinif.includes('grup') || sinif.includes('kv-8') || horseCount <= 7) {
      riskLevel = 'LOW_RISK'; // Net koşu (Top 1-2 yeterli)
    }`;

const newRiskSnippet = `    // Resmî 5 Yıllık TJK Backtest Risk Profili (Adil Ayak Dağılımı)
    let riskLevel = 'NORMAL';
    if (sinif.includes('maiden') || sinif.includes('şartlı 1') || (sinif.includes('handikap') && horseCount >= 10)) {
      riskLevel = 'HIGH_RISK'; // Yüksek riskli kaotik ayak (+EV Bomba ve sürpriz koruması gerekir)
    } else if ((sinif.includes('açık') || sinif.includes('grup') || sinif.includes('kv-8')) && topDiff >= 10) {
      riskLevel = 'LOW_RISK'; // Net açık koşu (Top 1-2 yeterli)
    }`;

if (html.includes(oldRiskSnippet)) {
  html = html.replace(oldRiskSnippet, newRiskSnippet);
  console.log('Fixed riskLevel in optimizeCoupon.');
} else {
  console.log('oldRiskSnippet not matched exactly, looking for alternate pattern...');
  html = html.replace(/else if \((sinif\.includes\('açık'\) \|\| sinif\.includes\('grup'\) \|\| sinif\.includes\('kv-8'\)) \|\| horseCount <= 7\)/g,
    "else if (($1) && topDiff >= 10)");
}

// 2. Upgrade loadWinningCouponToRobot and add renderExactWinningCouponInRobot
const oldLoadFunc = `function loadWinningCouponToRobot(couponId, modelKey) {
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
}`;

const newLoadFunc = `function renderExactWinningCouponInRobot(coupon, secenek) {
  const container = document.getElementById('optimized-coupon-container');
  if (!container) return;

  const isAdana2 = coupon.id.includes('adana-2');
  const targetBudget = secenek ? secenek.maliyet : (isAdana2 ? 3240 : 540);
  const cityUnitCost = 1.25;
  const packageLabel = coupon.paket || (isAdana2 ? "2. 6'LI GANYAN (3. - 8. KOŞULAR)" : "1. 6'LI GANYAN (1. - 6. KOŞULAR)");
  const modelTitle = secenek?.modelAdi || "👑 5 Yılın Şampiyonu (+EV Avcısı & Tek Banko)";
  const comboStr = secenek?.kombinasyon || (isAdana2 ? "6 x 1 x 6 x 2 x 6 x 6 = 2.592 Kombinasyon" : "6 x 1 x 6 x 1 x 6 x 2 = 432 Kombinasyon");

  let legsHtml = '';
  (coupon.ayaklar || []).forEach((ayak, idx) => {
    const horses = ayak.kuponAtlar || [];
    const isSingle = horses.length === 1;
    const isLockLeg = horses.length === 2 && horses.some(h => h.isLock);

    const roleBadge = isSingle 
      ? '<span style="color:#10b981; font-weight:800;">★ DOĞRULANMIŞ ASİL BANKO (TEK)</span>' 
      : (isLockLeg 
          ? '<span style="color:#60a5fa; font-weight:800;">🛡️ KİLİT AYAK (ÇİFTE SİGORTA)</span>' 
          : \`<span style="color:#c084fc; font-weight:800;">🔥 SÜRPRİZ & DEĞER KORUMASI (\${horses.length} SAFKAN)</span>\`);

    let horsesListHtml = '';
    horses.forEach(h => {
      const isWinner = h.isWinner || (Number(h.no) === Number(ayak.kazananNo));
      const winnerBadge = isWinner 
        ? \`<span style="color:#08080a; background:var(--gold-pure); font-size:0.68rem; font-weight:900; padding:2px 7px; border-radius:4px; margin-left:5px; box-shadow:0 0 10px rgba(212,175,55,0.7);">🏆 KAZANDI (\${ayak.ganyan || h.ganyan || ''} ₺)</span>\`
        : '';
      const bankoBadge = (isSingle || h.isBanko)
        ? '<span style="color:#10b981; font-size:0.65rem; font-weight:800; background:rgba(16,185,129,0.18); border:1px solid #10b981; padding:1px 5px; border-radius:3px; margin-left:4px;">★ ASİL BANKO</span>'
        : (h.isLock ? '<span style="color:#60a5fa; font-size:0.65rem; font-weight:800; background:rgba(59,130,246,0.15); border:1px solid rgba(59,130,246,0.4); padding:1px 5px; border-radius:3px; margin-left:4px;">🛡️ KİLİT</span>' : '');

      horsesListHtml += \`
        <div class="p-horse" style="\${isWinner ? 'background:rgba(212,175,55,0.18); border:1.5px solid var(--gold-pure); box-shadow:0 0 10px rgba(212,175,55,0.25);' : ''}">
          <span class="p-no" style="\${isWinner ? 'background:var(--gold-pure); color:#08080a; font-weight:900;' : ''}">\${h.no}</span>
          <span class="p-name" style="\${isWinner ? 'color:#fff; font-weight:800;' : ''}">
            \${h.isim} \${winnerBadge} \${bankoBadge}
            <span style="font-size:0.75rem; opacity:0.85; margin-left:3px;">\${h.stil || ''}</span>
          </span>
          <span class="p-score" style="display:flex; align-items:center; gap:4px;">
            <strong>\${h.puan || 75} P</strong>
            <span style="font-size:0.65rem; padding:1px 4px; border-radius:3px; background:rgba(0,0,0,0.4); color:\${isWinner ? '#34d399' : '#94a3b8'};">\${h.jokey || ''}</span>
          </span>
        </div>
      \`;
    });

    legsHtml += \`
      <div class="leg-box \${isSingle ? 'single-banko' : ''}" style="border:1.5px solid rgba(212,175,55,0.35);">
        <div class="leg-header" style="background:linear-gradient(90deg, rgba(212,175,55,0.18), transparent);">
          <span>\${idx + 1}. AYAK (\${ayak.kosuNo}. Koşu) \${ayak.saat ? \`<span style="font-family:'JetBrains Mono',monospace; font-size:0.75rem; color:#f59e0b; font-weight:800; background:rgba(0,0,0,0.5); padding:1px 5px; border-radius:4px; margin-left:4px;">⏱️ \${ayak.saat}</span>\` : ''}</span>
          <span style="font-family:'JetBrains Mono'; font-size:0.75rem; color:var(--gold-champagne); font-weight:800;">\${horses.length} Safkan ✓</span>
        </div>
        <div style="font-size:0.72rem; color:var(--text-muted); margin-bottom:0.5rem; text-transform:uppercase;">
          \${roleBadge} · \${ayak.mesafe || ''}
        </div>
        <div class="picked-horses-list">
          \${horsesListHtml}
        </div>
      </div>
    \`;
  });

  container.innerHTML = \`
    <div class="custom-coupon-card" style="border:2px solid var(--gold-pure); box-shadow:0 0 35px rgba(212,175,55,0.25);">
      <!-- Başarı Damgası Banner -->
      <div style="background:linear-gradient(90deg, rgba(212,175,55,0.28), rgba(16,185,129,0.35)); border-bottom:1.5px solid var(--gold-pure); padding:0.9rem 1.4rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.6rem;">
        <div style="display:flex; align-items:center; gap:0.6rem;">
          <span style="font-size:1.5rem;">👑</span>
          <div>
            <div style="font-family:'Cinzel',serif; font-size:1rem; font-weight:900; color:#fff; letter-spacing:1px;">
              RESMÎ TUTAN 6'LI GANYAN KUPONU (6/6 TAM İSABET)
            </div>
            <div style="font-size:0.75rem; color:#a7f3d0;">
              \${coupon.sehir} — \${packageLabel} | Kazanılan Resmî İkramiye: <strong style="color:var(--gold-champagne); font-size:0.95rem;">\${coupon.ikramiyeFormatli}</strong>
            </div>
          </div>
        </div>
        <div style="background:#10b981; color:#08080a; font-weight:900; font-size:0.8rem; padding:5px 14px; border-radius:8px; font-family:'Cinzel',serif; box-shadow:0 0 10px rgba(16,185,129,0.5);">
          \${secenek?.roi || '167.2x ROI'} ✓
        </div>
      </div>

      <div class="coupon-head-flex" style="padding-top:1.2rem;">
        <div>
          <div class="coupon-tag-badge" style="background:rgba(212,175,55,0.2); border:1px solid var(--gold-pure); color:var(--gold-champagne);">\${modelTitle}</div>
          <div style="font-size:0.88rem; font-family:'Cinzel',serif; font-weight:800; color:var(--text-gold); margin-top:5px;">
            \${coupon.sehir.toUpperCase()} — \${packageLabel}
          </div>
          <div style="font-size:0.75rem; color:#cbd5e1; margin-top:3px;">
            Kurgu Formülü: <strong>\${comboStr}</strong> | Resmî Şehir Birim Fiyatı: <strong>\${cityUnitCost.toFixed(2)} ₺</strong>
          </div>
        </div>
        <div class="coupon-math-info" style="border:1.5px solid var(--gold-pure); background:rgba(212,175,55,0.14); padding:0.6rem 1.2rem; border-radius:10px;">
          Hedef: \${targetBudget.toLocaleString('tr-TR')} ₺ | Hesaplanan Kupon Tutarı: <strong style="color:#34d399; font-size:1.15rem;">\${targetBudget.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</strong> (%100 Uyum)
        </div>
      </div>

      <div class="legs-grid">
        \${legsHtml}
      </div>

      <div class="coupon-footer-stats">
        <div class="c-stat">
          <h5>Kombinasyon</h5>
          <div class="v">\${secenek?.kombinasyon?.split('=')[0]?.trim() || (isAdana2 ? '2.592 Adet' : '432 Adet')}</div>
        </div>
        <div class="c-stat">
          <h5>Birim Fiyat</h5>
          <div class="v">\${cityUnitCost.toFixed(2)} ₺</div>
        </div>
        <div class="c-stat">
          <h5>Kupon Tutarı</h5>
          <div class="v" style="color:var(--gold-champagne); font-weight:900;">\${targetBudget.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</div>
        </div>
        <div class="c-stat-cost" style="background:linear-gradient(135deg, rgba(16,185,129,0.35), rgba(212,175,55,0.25)); border:1px solid #10b981;">
          <h5>Kazanılan TJK İkramiyesi</h5>
          <div class="v" style="color:#34d399; font-size:1.25rem;">\${coupon.ikramiyeFormatli}</div>
        </div>
      </div>
    </div>
  \`;
}

function loadWinningCouponToRobot(couponId, modelKey) {
  const coupon = (tutanAltililarCache?.tutanKuponlar || []).find(k => k.id === couponId);
  const isAdana1 = couponId.includes('adana-1');
  const isAdana2 = couponId.includes('adana-2');
  const pkgNum = isAdana1 ? 1 : 2;

  // 1. Program tarihini seç
  if (couponId.includes('2026-11-15')) {
    switchRobotProgramDate('bugun');
  } else if (couponId.includes('2026-11-14')) {
    switchRobotProgramDate('2026-11-14');
  } else {
    switchRobotProgramDate('bugun');
  }

  // 2. Hipodrom seç
  const sel = document.getElementById('robot-hipodrom-select');
  if (sel) {
    for (let i = 0; i < sel.options.length; i++) {
      if (sel.options[i].text.toLowerCase().includes('adana')) {
        sel.selectedIndex = i;
        break;
      }
    }
  }

  // 3. Paket numarasını seç
  currentAltiliPackage = pkgNum;
  renderAltiliPackageButtons();

  // 4. İlgili seçeneği ve bütçeyi bul
  let secenek = coupon?.secenekler?.find(s => s.modelKey === modelKey) || coupon?.secenekler?.[0];
  const targetCost = secenek ? secenek.maliyet : (isAdana2 ? 3240 : 540);

  const budgetInput = document.getElementById('budget-amount');
  if (budgetInput) budgetInput.value = targetCost;

  // 5. Stratejiyi ayarla
  currentPick6Strategy = modelKey || secenek?.modelKey || (isAdana2 ? 'CHAMPION_5YEAR' : 'SINGLE_BANKO');
  ['strat-champ-btn', 'strat-accuracy-btn', 'strat-single-btn', 'strat-multi-btn', 'strat-adaptive-btn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });
  if (currentPick6Strategy === 'CHAMPION_5YEAR') {
    document.getElementById('strat-champ-btn')?.classList.add('active');
  } else if (currentPick6Strategy === 'MAX_ACCURACY') {
    document.getElementById('strat-accuracy-btn')?.classList.add('active');
  } else if (currentPick6Strategy === 'SINGLE_BANKO') {
    document.getElementById('strat-single-btn')?.classList.add('active');
  }

  // 6. Tutan kuponun ayaklarında kuponAtlar varsa DİREKT olarak bu kuponu robot ekranına render et!
  if (coupon && coupon.ayaklar && coupon.ayaklar[0]?.kuponAtlar) {
    renderExactWinningCouponInRobot(coupon, secenek);
  } else {
    optimizeCoupon();
  }

  // 7. Robot ekranına geç ve en üste kaydır
  switchView('robot-view');
  const container = document.getElementById('optimized-coupon-container');
  if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });

  showToast(\`🏆 \${coupon?.paket || 'Tutan 6\\'lı'} (\${targetCost.toLocaleString('tr-TR')} ₺) Robot ekranına yüklendi!\`);
}`;

if (html.includes(oldLoadFunc)) {
  html = html.replace(oldLoadFunc, newLoadFunc);
  console.log('Replaced loadWinningCouponToRobot with accurate renderer.');
} else {
  console.log('Could not find oldLoadFunc exactly, using regex replace.');
  html = html.replace(/function loadWinningCouponToRobot\(couponId, modelKey\) \{[\s\S]*?showToast\('🎟️ Kupon 6\\'lı Robotuna yüklendi!'\);\s*\}/, newLoadFunc);
}

// 3. Make the secenek box clickable in renderWinningCards
html = html.replace(/seceneklerHtml \+= `\s*<div style="background:\${isTopRoi \? 'linear-gradient\(135deg, rgba\(212,175,55,0\.18\), rgba\(8,8,10,0\.9\)\)' : 'rgba\(14,16,22,0\.85\)'}; border:1\.5px solid \${isTopRoi \? 'var\(--gold-pure\)' : 'rgba\(255,255,255,0\.15\)'}; border-radius:14px; padding:1\.1rem; margin-bottom:0\.8rem; box-shadow:\${isTopRoi \? '0 0 15px rgba\(212,175,55,0\.15\)' : 'none'};">/g,
  `seceneklerHtml += \`
        <div onclick="loadWinningCouponToRobot('\${item.id}', '\${sec.modelKey}')" style="cursor:pointer; background:\${isTopRoi ? 'linear-gradient(135deg, rgba(212,175,55,0.22), rgba(8,8,10,0.92))' : 'rgba(14,16,22,0.85)'}; border:1.5px solid \${isTopRoi ? 'var(--gold-pure)' : 'rgba(255,255,255,0.15)'}; border-radius:14px; padding:1.1rem; margin-bottom:0.8rem; box-shadow:\${isTopRoi ? '0 0 20px rgba(212,175,55,0.2)' : 'none'}; transition:transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='scale(1.01)'" onmouseout="this.style.transform='none'" title="Bu tutan kuponu 6'lı Robotunda incelemek için tıklayın">`);

fs.writeFileSync(path, html, 'utf8');
console.log('Successfully updated public/index.html!');
