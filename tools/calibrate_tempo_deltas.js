const fs = require('fs');
const path = require('path');

const STYLE_CODES = {
  'Kaçak / Lider': 'KACAK',
  'Presçi': 'PRESCI',
  'Orta Grup': 'ORTA_GRUP',
  'Düzlük Sprinteri': 'SPRINTER',
  'Taktik Serbest (İlk 3 Koşusu)': 'SERBEST',
};

const BASE_DELTA = {
  COK_HIZLI: { KACAK: -2, PRESCI: 1, ORTA_GRUP: 1, SPRINTER: 2, SERBEST: 0 },
  SURATLI: { KACAK: -1, PRESCI: 1, ORTA_GRUP: 1, SPRINTER: 1, SERBEST: 0 },
  DENGELI: { KACAK: 1, PRESCI: 1, ORTA_GRUP: 0, SPRINTER: 0, SERBEST: 0 },
  YAVAS: { KACAK: 0, PRESCI: 2, ORTA_GRUP: 1, SPRINTER: -2, SERBEST: 0 },
};

['public/data/bulten_bugun.json', 'public/data/bulten_yarin.json', 'public/data/bulten_dun.json'].forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) return;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  (data.hipodromlar || []).forEach(hip => {
    (hip.kosular || []).forEach(race => {
      let tempoCode = race.tempo_senaryosu?.tempo_kodu;
      if (!BASE_DELTA[tempoCode]) {
        tempoCode = 'DENGELI';
        if (race.tempo_senaryosu) {
          race.tempo_senaryosu.tempo_kodu = 'DENGELI';
          race.tempo_senaryosu.tempo_sinifi = 'Dengeli / Normal';
        }
      }

      (race.atlar || []).forEach(horse => {
        if (horse.isYoungHorse) {
          horse.taktik_durumu = 'ILK_3_KOSU_SERBEST';
          horse.kosu_stili = 'Taktik Serbest (İlk 3 Koşusu)';
          horse.tempo_delta = 0;
        } else {
          if (horse.taktik_durumu === 'YETERSIZ_VERI' || !horse.taktik_durumu || horse.taktik_durumu === 'ILK_3_KOSU_SERBEST') {
            horse.taktik_durumu = 'DEGISKEN';
          }
          if (!horse.kosu_stili || horse.kosu_stili === 'Taktik Serbest (İlk 3 Koşusu)' || horse.kosu_stili === 'Yetersiz Veri') {
            horse.kosu_stili = 'Orta Grup';
            horse.stil_ikon = '🛡️';
            horse.stil_renk = '#3b82f6';
            horse.stil_bg = 'rgba(59, 130, 246, 0.12)';
            horse.stil_border = 'rgba(59, 130, 246, 0.35)';
            horse.taktik_yorum = 'Orta grupta yıpranmadan dengeli seyreder, viraj üzeri hücum pozisyonu alır.';
          }

          const styleCode = STYLE_CODES[horse.kosu_stili] || 'ORTA_GRUP';
          let expected = BASE_DELTA[tempoCode][styleCode] ?? 0;
          if (['DEGISKEN', 'KISMI', 'TEK_OLCUM'].includes(horse.taktik_durumu)) {
            expected = Math.max(-1, Math.min(1, expected));
          }
          horse.tempo_delta = expected;
        }
      });
    });
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Calibrated ${file}`);
});
