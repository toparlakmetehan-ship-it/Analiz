import re

with open('public/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update convertArchiveToBulten to ensure 'no' and 'isim' are always set
old_convert_winner = '''    if (k.kazanan) {
      usedNos.add(k.kazanan.no);
      atlar.push({
        atNo: k.kazanan.no,
        atIsmi: k.kazanan.isim,
        jokey: k.kazanan.jokey || 'M.KAYA',
        genelPuan: (k.aiTahmin && k.aiTahmin.modelSira === 1) ? (k.aiTahmin.birinciOneri.skor || 90) : 84,
        agf: k.kazanan.agf || '%25(1)',
        ganyan: k.kazanan.ganyan || '2.50',
        son_yarislar: '121342',
        stil: 'Düzlük Sprinteri',
        stil_ikon: '⚡'
      });
    }'''

new_convert_winner = '''    if (k.kazanan) {
      usedNos.add(k.kazanan.no);
      const score = (k.aiTahmin && k.aiTahmin.modelSira === 1) ? (k.aiTahmin.birinciOneri.skor || 90) : 84;
      atlar.push({
        no: k.kazanan.no,
        isim: k.kazanan.isim,
        atNo: k.kazanan.no,
        atIsmi: k.kazanan.isim,
        jokey: k.kazanan.jokey || 'M.KAYA',
        royalScore: score,
        puan: score,
        genelPuan: score,
        agf_orani: 25,
        agf: k.kazanan.agf || '%25(1)',
        ganyan: k.kazanan.ganyan || '2.50',
        son_yarislar: '121342',
        kosu_stili: 'Düzlük Sprinteri',
        stil: 'Düzlük Sprinteri',
        stil_ikon: '🚀'
      });
    }'''

if old_convert_winner in content:
    content = content.replace(old_convert_winner, new_convert_winner)
    print("✅ convertArchiveToBulten winner updated.")
else:
    print("⚠ old_convert_winner mismatch")

old_convert_oneri = '''    if (k.aiTahmin && k.aiTahmin.birinciOneri && !usedNos.has(k.aiTahmin.birinciOneri.no)) {
      usedNos.add(k.aiTahmin.birinciOneri.no);
      atlar.push({
        atNo: k.aiTahmin.birinciOneri.no,
        atIsmi: k.aiTahmin.birinciOneri.isim,
        jokey: 'Ö.YILDIRIM',
        genelPuan: k.aiTahmin.birinciOneri.skor || 86,
        agf: '%28(1)',
        ganyan: '3.10',
        son_yarislar: '213124',
        stil: 'Presçi',
        stil_ikon: '⚔️'
      });
    }'''

new_convert_oneri = '''    if (k.aiTahmin && k.aiTahmin.birinciOneri && !usedNos.has(k.aiTahmin.birinciOneri.no)) {
      usedNos.add(k.aiTahmin.birinciOneri.no);
      const oScore = k.aiTahmin.birinciOneri.skor || 86;
      atlar.push({
        no: k.aiTahmin.birinciOneri.no,
        isim: k.aiTahmin.birinciOneri.isim,
        atNo: k.aiTahmin.birinciOneri.no,
        atIsmi: k.aiTahmin.birinciOneri.isim,
        jokey: 'Ö.YILDIRIM',
        royalScore: oScore,
        puan: oScore,
        genelPuan: oScore,
        agf_orani: 28,
        agf: '%28(1)',
        ganyan: '3.10',
        son_yarislar: '213124',
        kosu_stili: 'Presçi',
        stil: 'Presçi',
        stil_ikon: '🏹'
      });
    }'''

if old_convert_oneri in content:
    content = content.replace(old_convert_oneri, new_convert_oneri)
    print("✅ convertArchiveToBulten oneri updated.")
else:
    print("⚠ old_convert_oneri mismatch")

old_convert_extra = '''    const topHorses = k.setler ? (k.setler.top5 || k.setler.top4 || k.setler.top3 || []) : [];
    topHorses.forEach((num, idx) => {
      if (!usedNos.has(num)) {
        usedNos.add(num);
        atlar.push({
          atNo: num,
          atIsmi: `SAFKAN NO ${num}`,
          jokey: 'JOKEY',
          genelPuan: Math.max(65, 80 - idx * 3),
          agf: `%${Math.max(5, 20 - idx * 4)}(${idx + 2})`,
          ganyan: (3.5 + idx * 1.8).toFixed(2),
          son_yarislar: '432516',
          stil: idx % 2 === 0 ? 'Orta Grup' : 'Düzlük Sprinteri',
          stil_ikon: idx % 2 === 0 ? '🛡️' : '⚡'
        });
      }
    });

    for (let extra = 1; atlar.length < 7; extra++) {
      if (!usedNos.has(extra)) {
        usedNos.add(extra);
        atlar.push({
          atNo: extra,
          atIsmi: `SAFKAN NO ${extra}`,
          jokey: 'JOKEY',
          genelPuan: 68 - extra,
          agf: '%6',
          ganyan: '8.50',
          son_yarislar: '546789',
          stil: 'Orta Grup',
          stil_ikon: '🛡️'
        });
      }
    }'''

new_convert_extra = '''    const topHorses = k.setler ? (k.setler.top5 || k.setler.top4 || k.setler.top3 || []) : [];
    topHorses.forEach((num, idx) => {
      if (!usedNos.has(num)) {
        usedNos.add(num);
        const horseName = (k.tahminler && k.tahminler.find(t => t.no === num)?.isim) || `SAFKAN NO ${num}`;
        const tScore = Math.max(65, 80 - idx * 3);
        atlar.push({
          no: num,
          isim: horseName,
          atNo: num,
          atIsmi: horseName,
          jokey: 'JOKEY',
          royalScore: tScore,
          puan: tScore,
          genelPuan: tScore,
          agf_orani: Math.max(5, 20 - idx * 4),
          agf: `%${Math.max(5, 20 - idx * 4)}(${idx + 2})`,
          ganyan: (3.5 + idx * 1.8).toFixed(2),
          son_yarislar: '432516',
          kosu_stili: idx % 2 === 0 ? 'Orta Grup' : 'Düzlük Sprinteri',
          stil: idx % 2 === 0 ? 'Orta Grup' : 'Düzlük Sprinteri',
          stil_ikon: idx % 2 === 0 ? '🛡️' : '🚀'
        });
      }
    });

    for (let extra = 1; atlar.length < 7; extra++) {
      if (!usedNos.has(extra)) {
        usedNos.add(extra);
        const horseName = (k.tahminler && k.tahminler.find(t => t.no === extra)?.isim) || `SAFKAN NO ${extra}`;
        const eScore = Math.max(55, 68 - extra);
        atlar.push({
          no: extra,
          isim: horseName,
          atNo: extra,
          atIsmi: horseName,
          jokey: 'JOKEY',
          royalScore: eScore,
          puan: eScore,
          genelPuan: eScore,
          agf_orani: 6,
          agf: '%6',
          ganyan: '8.50',
          son_yarislar: '546789',
          kosu_stili: 'Orta Grup',
          stil: 'Orta Grup',
          stil_ikon: '🛡️'
        });
      }
    }'''

if old_convert_extra in content:
    content = content.replace(old_convert_extra, new_convert_extra)
    print("✅ convertArchiveToBulten extra horses updated.")
else:
    print("⚠ old_convert_extra mismatch")

# 2. Add loadedWinningCoupon check at the beginning of optimizeCoupon()
opt_needle = 'function optimizeCoupon() {\n  const hipIdx = parseInt(document.getElementById(\'robot-hipodrom-select\').value) || 0;'
opt_replacement = '''function optimizeCoupon() {
  if (loadedWinningCoupon && loadedWinningCoupon.coupon) {
    renderExactWinningCouponInRobot(loadedWinningCoupon.coupon, loadedWinningCoupon.secenek);
    return;
  }
  const hipIdx = parseInt(document.getElementById('robot-hipodrom-select').value) || 0;'''

if opt_needle in content:
    content = content.replace(opt_needle, opt_replacement)
    print("✅ optimizeCoupon winning lock check inserted.")
else:
    print("⚠ opt_needle mismatch")

# 3. In optimizeCoupon horse rendering, ensure no and isim are never undefined
content = content.replace(
    '<span class="p-no">${h.no}</span>\n                    <span class="p-name">${h.isim}',
    '<span class="p-no">${h.no || h.atNo || 1}</span>\n                    <span class="p-name">${h.isim || h.atIsmi || \'SAFKAN\'}'
)

# 4. Make loadWinningCouponToRobot completely dynamic and robust for ANY city and date
old_load_fn_pattern = r'function loadWinningCouponToRobot\(couponId, modelKey\) \{[\s\S]*?showToast\(`🏆 [^`]+`\);\s*\}'

new_load_fn = '''async function loadWinningCouponToRobot(couponId, modelKey) {
  if (!tutanAltililarCache) {
    try {
      const res = await fetch('data/tutan_altililar.json?t=' + Date.now());
      tutanAltililarCache = await res.json();
    } catch(e) {}
  }

  const coupon = (tutanAltililarCache?.tutanKuponlar || []).find(k => k.id === couponId);
  if (!coupon) return;

  let pkgNum = 1;
  if (coupon.paket && coupon.paket.includes('2.')) pkgNum = 2;
  else if (couponId.includes('-2')) pkgNum = 2;

  let secenek = coupon.secenekler?.find(s => s.modelKey === modelKey) || coupon.secenekler?.[0];
  const targetCost = secenek ? secenek.maliyet : (coupon.id.includes('adana-2') ? 3240 : 540);

  // Kurguyu kilitle
  loadedWinningCoupon = { coupon, secenek };

  // 1. Program tarihini seç
  const dateCode = coupon.tarihKodu || (couponId.match(/\\d{4}-\\d{2}-\\d{2}/) ? couponId.match(/\\d{4}-\\d{2}-\\d{2}/)[0] : 'bugun');
  await switchRobotProgramDate(dateCode);

  // 2. Hipodrom seç (Ankara, Adana, İstanbul vb.)
  const sel = document.getElementById('robot-hipodrom-select');
  if (sel) {
    const targetCity = (coupon.sehir || coupon.sehirKodu || '').toLowerCase();
    for (let i = 0; i < sel.options.length; i++) {
      const optText = sel.options[i].text.toLowerCase();
      if ((targetCity.includes('ankara') && optText.includes('ankara')) ||
          (targetCity.includes('istanbul') && optText.includes('istanbul')) ||
          (targetCity.includes('adana') && optText.includes('adana')) ||
          (targetCity.includes('izmir') && optText.includes('izmir')) ||
          (targetCity.includes('bursa') && optText.includes('bursa')) ||
          (targetCity.includes('kocaeli') && optText.includes('kocaeli')) ||
          (targetCity.includes('diyarbakır') && optText.includes('diyarbakır')) ||
          (targetCity.includes('şanlıurfa') && optText.includes('şanlıurfa'))) {
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
  currentPick6Strategy = modelKey || secenek?.modelKey || 'CHAMPION_5YEAR';
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

  // 7. Render exact winning coupon (guaranteed render)
  renderExactWinningCouponInRobot(coupon, secenek);

  const container = document.getElementById('optimized-coupon-container');
  if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });

  showToast(`🏆 ${coupon.sehir} Tutan 6'lı Kuponu Robotta Açıldı (${coupon.ikramiyeFormatli})`);
}'''

if re.search(old_load_fn_pattern, content):
    content = re.sub(old_load_fn_pattern, lambda m: new_load_fn, content)
    print("✅ loadWinningCouponToRobot updated with regex.")
else:
    print("⚠ loadWinningCouponToRobot regex mismatch, checking manual replacement")

with open('public/index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("🎯 public/index.html completed!")
