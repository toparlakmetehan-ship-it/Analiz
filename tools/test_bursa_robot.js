const fs = require('fs');
const vm = require('vm');
const path = require('path');

const bultenBugun = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));

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
    const startNum = kosular[firstLegIdx].id || kosular[firstLegIdx].kosuNo || (firstLegIdx + 1);
    const endNum = kosular[pkg1EndIdx].id || kosular[pkg1EndIdx].kosuNo || (pkg1EndIdx + 1);

    const hasPkg2 = (total >= 8 && firstLegIdx <= (total - 7));

    packages.push({
      pkgNum: 1,
      startIndex: firstLegIdx,
      endIndex: pkg1EndIdx,
      startRaceNum: startNum,
      endRaceNum: endNum,
      kosular: pkg1Races,
      label: hasPkg2 ? `1. 6'LI GANYAN (${startNum}. - ${endNum}. KOŞULAR)` : `6'LI GANYAN (${startNum}. - ${endNum}. KOŞULAR)`,
      buttonLabel: hasPkg2 ? `1. 6'lı Ganyan (${startNum}. - ${endNum}. Koşular)` : `6'lı Ganyan (${startNum}. - ${endNum}. Koşular)`
    });

    if (hasPkg2) {
      const pkg2StartIdx = total - 6;
      const pkg2EndIdx = total - 1;
      const pkg2StartNum = kosular[pkg2StartIdx].id || kosular[pkg2StartIdx].kosuNo || (pkg2StartIdx + 1);
      const pkg2EndNum = kosular[pkg2EndIdx].id || kosular[pkg2EndIdx].kosuNo || total;
      const pkg2Races = kosular.slice(pkg2StartIdx, total);

      packages.push({
        pkgNum: 2,
        startIndex: pkg2StartIdx,
        endIndex: pkg2EndIdx,
        startRaceNum: pkg2StartNum,
        endRaceNum: pkg2EndNum,
        kosular: pkg2Races,
        label: `2. 6'LI GANYAN (${pkg2StartNum}. - ${pkg2EndNum}. KOŞULAR)`,
        buttonLabel: `2. 6'lı Ganyan (${pkg2StartNum}. - ${pkg2EndNum}. Koşular)`
      });
    }
  } else {
    const startIdx = Math.max(0, total - 6);
    const pkgRaces = kosular.slice(startIdx, total);
    const startNum = kosular[startIdx].id || kosular[startIdx].kosuNo || (startIdx + 1);
    const endNum = kosular[total - 1].id || kosular[total - 1].kosuNo || total;
    packages.push({
      pkgNum: 1,
      startIndex: startIdx,
      endIndex: total - 1,
      startRaceNum: startNum,
      endRaceNum: endNum,
      kosular: pkgRaces,
      label: `6'LI GANYAN (${startNum}. - ${endNum}. KOŞULAR)`,
      buttonLabel: `6'lı Ganyan (${startNum}. - ${endNum}. Koşular)`
    });
  }

  return packages;
}

const bursa = bultenBugun.hipodromlar.find(h => (h.sehir || h.isim || '').toLowerCase().includes('bursa'));
const pkgs = getHipodromAltiliPackages(bursa);
console.log('Bursa Packages:', pkgs);
console.log('Package 1 races:', pkgs[0].kosular.map((k, i) => `${i+1}. Ayak: Koşu ${pkgs[0].startRaceNum + i} (Saat: ${k.saat}, ${k.atlar.length} at)`));
