const fs = require('fs');

function getHipodromAltiliPackages(hip) {
  if (!hip || !hip.kosular || hip.kosular.length < 6) return [];
  const kosular = hip.kosular;
  const total = kosular.length;

  let firstLegIdx = -1;
  for (let i = 0; i < total; i++) {
    const a = kosular[i].altiliAyagi;
    if (a === 1 || a === '1' || a === '1. Ayak' || (typeof a === 'string' && a.trim().startsWith('1'))) {
      firstLegIdx = i;
      break;
    }
  }

  if (firstLegIdx === -1) {
    if (kosular[0].altiliAyagi == null && total === 7) {
      firstLegIdx = 1;
    } else {
      firstLegIdx = 0;
    }
  }

  const packages = [];
  const pkg1EndIdx = firstLegIdx + 5;
  if (pkg1EndIdx < total) {
    const pkg1Races = kosular.slice(firstLegIdx, firstLegIdx + 6);
    const startNum = kosular[firstLegIdx].kosuNo || (firstLegIdx + 1);
    const endNum = kosular[pkg1EndIdx].kosuNo || (pkg1EndIdx + 1);

    const hasPkg2 = (total >= 8 && firstLegIdx <= (total - 7));

    packages.push({
      pkgNum: 1,
      startIndex: firstLegIdx,
      endIndex: pkg1EndIdx,
      startRaceNum: startNum,
      endRaceNum: endNum,
      kosular: pkg1Races,
      label: hasPkg2 ? `1. 6'lı Ganyan (${startNum}. - ${endNum}. Koşular)` : `6'lı Ganyan (${startNum}. - ${endNum}. Koşular)`,
      shortLabel: hasPkg2 ? `1. 6'lı (${startNum}-${endNum})` : `6'lı Ganyan (${startNum}-${endNum})`
    });

    if (hasPkg2) {
      const pkg2StartIdx = total - 6;
      const pkg2EndIdx = total - 1;
      const pkg2StartNum = kosular[pkg2StartIdx].kosuNo || (pkg2StartIdx + 1);
      const pkg2EndNum = kosular[pkg2EndIdx].kosuNo || total;
      const pkg2Races = kosular.slice(pkg2StartIdx, total);

      packages.push({
        pkgNum: 2,
        startIndex: pkg2StartIdx,
        endIndex: pkg2EndIdx,
        startRaceNum: pkg2StartNum,
        endRaceNum: pkg2EndNum,
        kosular: pkg2Races,
        label: `2. 6'lı Ganyan (${pkg2StartNum}. - ${pkg2EndNum}. Koşular)`,
        shortLabel: `2. 6'lı (${pkg2StartNum}-${pkg2EndNum})`
      });
    }
  } else {
    const startIdx = total - 6;
    const pkgRaces = kosular.slice(startIdx, total);
    const startNum = kosular[startIdx].kosuNo || (startIdx + 1);
    const endNum = kosular[total - 1].kosuNo || total;
    packages.push({
      pkgNum: 1,
      startIndex: startIdx,
      endIndex: total - 1,
      startRaceNum: startNum,
      endRaceNum: endNum,
      kosular: pkgRaces,
      label: `6'lı Ganyan (${startNum}. - ${endNum}. Koşular)`,
      shortLabel: `6'lı Ganyan (${startNum}-${endNum})`
    });
  }

  return packages;
}

['bulten_bugun.json', 'bulten_yarin.json', 'bulten_2026_11_15.json'].forEach(f => {
  console.log(`\n================== ${f} ==================`);
  const b = JSON.parse(fs.readFileSync(`public/data/${f}`, 'utf8'));
  b.hipodromlar.forEach(h => {
    const pkgs = getHipodromAltiliPackages(h);
    console.log(`Hipodrom: ${h.sehir || h.isim} (${h.kosular.length} Koşu) -> ${pkgs.length} adet 6'lı Ganyan`);
    pkgs.forEach(p => {
      console.log(`   Paket ${p.pkgNum}: ${p.label}`);
      console.log(`   Koşu indexleri: [${p.startIndex} .. ${p.endIndex}]`);
      console.log(`   Koşu saatleri: ${p.kosular.map(k => k.saat).join(', ')}`);
      console.log(`   Ayaklar: ${p.kosular.map((k, i) => `${i+1}. Ayak (Koşu ${k.kosuNo || (p.startRaceNum + i)})`).join(' | ')}`);
    });
  });
});
