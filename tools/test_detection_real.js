const fs = require('fs');
const bulten = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));

// Simulating getHipodromAltiliPackages from index.html
function getHipodromAltiliPackages(hip) {
  if (!hip || !hip.kosular || hip.kosular.length < 6) return [];
  const kosular = hip.kosular;
  const total = kosular.length;

  if (total === 6) {
    return [{
      id: `${hip.id}-1`,
      label: `6'lı Ganyan (1. - 6. Koşular)`,
      shortLabel: `6'lı Ganyan`,
      startRace: 1,
      endRace: 6,
      legs: kosular.slice(0, 6)
    }];
  }

  const explicitStarts = [];
  kosular.forEach(k => {
    if (k.altiliAyagi === 1) {
      explicitStarts.push(k.kosu_no);
    }
  });

  const validExplicit = explicitStarts.filter(startNo => (startNo + 5) <= total);

  if (validExplicit.length > 0) {
    return validExplicit.map((startNo, idx) => {
      const endNo = startNo + 5;
      const legs = kosular.filter(k => k.kosu_no >= startNo && k.kosu_no <= endNo);
      const isMulti = validExplicit.length > 1;
      const numLabel = isMulti ? `${idx + 1}. ` : '';
      return {
        id: `${hip.id}-${idx + 1}`,
        label: `${numLabel}6'lı Ganyan (${startNo}. - ${endNo}. Koşular)`,
        shortLabel: `${numLabel}6'lı Ganyan`,
        startRace: startNo,
        endRace: endNo,
        legs: legs
      };
    });
  }

  const packages = [];
  if (total >= 6) {
    const startNo = total - 5;
    packages.push({
      id: `${hip.id}-1`,
      label: `6'lı Ganyan (${startNo}. - ${total}. Koşular)`,
      shortLabel: `6'lı Ganyan`,
      startRace: startNo,
      endRace: total,
      legs: kosular.slice(startNo - 1, total)
    });
  }
  return packages;
}

bulten.hipodromlar.forEach(hip => {
  const pkgs = getHipodromAltiliPackages(hip);
  console.log(`\n=== Hipodrom: ${hip.isim} (${hip.kosular.length} Koşu) ===`);
  pkgs.forEach(p => {
    console.log(`  Package: ${p.label}`);
    console.log(`  Legs count: ${p.legs.length}`);
    p.legs.forEach((leg, idx) => {
      console.log(`    Ayak ${idx + 1} -> Koşu ${leg.kosu_no} (${leg.saat}, ${leg.mesafe}m ${leg.pist}) - ${leg.atlar.length} At`);
    });
  });
});
