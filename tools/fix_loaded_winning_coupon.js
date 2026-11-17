const fs = require('fs');

const path = 'public/index.html';
let html = fs.readFileSync(path, 'utf8');

// 1. Add let loadedWinningCoupon = null; before renderExactWinningCouponInRobot
if (!html.includes('let loadedWinningCoupon = null;')) {
  html = html.replace('function renderExactWinningCouponInRobot', 'let loadedWinningCoupon = null;\n\nfunction renderExactWinningCouponInRobot');
  console.log('Added loadedWinningCoupon global variable.');
}

// 2. Update switchView for robot-view
html = html.replace(
  `  // 5. Görünüme özel dinamik render fonksiyonlarını tetikle\n  if (viewId === 'robot-view') {\n    optimizeCoupon();`,
  `  // 5. Görünüme özel dinamik render fonksiyonlarını tetikle\n  if (viewId === 'robot-view') {\n    if (loadedWinningCoupon && loadedWinningCoupon.coupon) {\n      renderExactWinningCouponInRobot(loadedWinningCoupon.coupon, loadedWinningCoupon.secenek);\n    } else {\n      optimizeCoupon();\n    }`
);

// 3. Update optimizeCoupon start to respect loadedWinningCoupon
html = html.replace(
  `function optimizeCoupon() {\n  const hipIdx = parseInt(document.getElementById('robot-hipodrom-select').value) || 0;`,
  `function optimizeCoupon() {\n  if (loadedWinningCoupon && loadedWinningCoupon.coupon) {\n    renderExactWinningCouponInRobot(loadedWinningCoupon.coupon, loadedWinningCoupon.secenek);\n    return;\n  }\n  const hipIdx = parseInt(document.getElementById('robot-hipodrom-select').value) || 0;`
);

// 4. Update setBudget, setPick6Strategy, onRobotHipodromChange to clear loadedWinningCoupon
html = html.replace(
  `function setBudget(val) {\n  document.getElementById('budget-amount').value = val;`,
  `function setBudget(val) {\n  loadedWinningCoupon = null;\n  document.getElementById('budget-amount').value = val;`
);

html = html.replace(
  `function setPick6Strategy(strat) {\n  currentPick6Strategy = strat;`,
  `function setPick6Strategy(strat) {\n  loadedWinningCoupon = null;\n  currentPick6Strategy = strat;`
);

html = html.replace(
  `function onRobotHipodromChange() {\n  currentAltiliPackage = 1;`,
  `function onRobotHipodromChange() {\n  loadedWinningCoupon = null;\n  currentAltiliPackage = 1;`
);

// 5. Update loadWinningCouponToRobot to set loadedWinningCoupon first and render cleanly
const targetLoadPattern = /function loadWinningCouponToRobot\(couponId, modelKey\) \{[\s\S]*?showToast\(`🏆 \$\{coupon\?\.paket[\s\S]*?`\);\s*\}/;

const upgradedLoadFunc = `function loadWinningCouponToRobot(couponId, modelKey) {
  const coupon = (tutanAltililarCache?.tutanKuponlar || []).find(k => k.id === couponId);
  const isAdana1 = couponId.includes('adana-1');
  const isAdana2 = couponId.includes('adana-2');
  const pkgNum = isAdana1 ? 1 : 2;

  let secenek = coupon?.secenekler?.find(s => s.modelKey === modelKey) || coupon?.secenekler?.[0];
  const targetCost = secenek ? secenek.maliyet : (isAdana2 ? 3240 : 540);

  // Kurguyu kilitle
  loadedWinningCoupon = { coupon, secenek };

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

  // 4. Bütçeyi ayarla
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

  // 6. Robot ekranına geç
  switchView('robot-view');

  // 7. Render winning coupon (guaranteed render)
  if (coupon && coupon.ayaklar && coupon.ayaklar[0]?.kuponAtlar) {
    renderExactWinningCouponInRobot(coupon, secenek);
  }

  const container = document.getElementById('optimized-coupon-container');
  if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });

  showToast(\`🏆 \${coupon?.paket || 'Tutan 6\\'lı'} (\${targetCost.toLocaleString('tr-TR')} ₺) Robot ekranına yüklendi!\`);
}`;

if (targetLoadPattern.test(html)) {
  html = html.replace(targetLoadPattern, upgradedLoadFunc);
  console.log('Upgraded loadWinningCouponToRobot function.');
} else {
  console.log('targetLoadPattern failed to match.');
}

// 6. In renderExactWinningCouponInRobot, add the switch back to live calculator button
html = html.replace(
  `<div style="background:#10b981; color:#08080a; font-weight:900; font-size:0.8rem; padding:5px 14px; border-radius:8px; font-family:'Cinzel',serif; box-shadow:0 0 10px rgba(16,185,129,0.5);">\n          \${secenek?.roi || '167.2x ROI'} ✓\n        </div>`,
  `<div style="display:flex; align-items:center; gap:0.6rem;">\n          <div style="background:#10b981; color:#08080a; font-weight:900; font-size:0.8rem; padding:5px 14px; border-radius:8px; font-family:'Cinzel',serif; box-shadow:0 0 10px rgba(16,185,129,0.5);">\n            \${secenek?.roi || '167.2x ROI'} ✓\n          </div>\n          <button onclick="loadedWinningCoupon = null; optimizeCoupon();" style="background:rgba(0,0,0,0.55); color:#f3e5ab; border:1px solid rgba(212,175,55,0.4); font-size:0.72rem; padding:5px 10px; border-radius:6px; cursor:pointer; font-weight:700; transition:all 0.2s;" onmouseover="this.style.background='rgba(212,175,55,0.2)'" onmouseout="this.style.background='rgba(0,0,0,0.55)'" title="Kuponu serbest bırakıp canlı bütçe hesaplayıcısına dön">\n            🔄 Canlı Bütçe Moduna Dön\n          </button>\n        </div>`
);

fs.writeFileSync(path, html, 'utf8');
console.log('Successfully updated public/index.html with loadedWinningCoupon state management!');
