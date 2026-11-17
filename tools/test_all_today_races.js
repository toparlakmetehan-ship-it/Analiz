const fs = require('fs');
const b = require('../public/data/bulten_bugun.json');

// Run calibration test across all races
b.hipodromlar.forEach(hip => {
  console.log('=== ' + hip.sehir.toUpperCase() + ' ===');
  hip.kosular.forEach(k => {
    const atlar = (k.atlar || []).filter(h => !h.isKosmaz);
    if (atlar.length === 0) return;
    const pace = k.tempo_senaryosu || {};
    console.log(`K${k.kosu_no} (${k.mesafe}m ${k.pist_tipi}): ${atlar.length} at, Tempo: ${pace.tahmini_tempo || 'Bilinmiyor'}`);
  });
});
