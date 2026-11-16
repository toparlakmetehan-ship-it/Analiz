const fs = require('fs');

const FILES = [
  'public/data/bulten_bugun.json',
  'public/data/bulten_yarin.json',
];

const STYLE_CODES = {
  'Kaçak / Lider': 'KACAK',
  'Presçi': 'PRESCI',
  'Orta Grup': 'ORTA_GRUP',
  'Düzlük Sprinteri': 'SPRINTER',
  'Taktik Serbest (İlk 3 Koşusu)': 'SERBEST',
};

const BASE_DELTA = {
  COK_HIZLI: { KACAK: -2, PRESCI: -1, ORTA_GRUP: 1, SPRINTER: 2, SERBEST: 0 },
  SURATLI: { KACAK: -1, PRESCI: 0, ORTA_GRUP: 0, SPRINTER: 1, SERBEST: 0 },
  DENGELI: { KACAK: 1, PRESCI: 1, ORTA_GRUP: 0, SPRINTER: 0, SERBEST: 0 },
  YAVAS: { KACAK: 0, PRESCI: 2, ORTA_GRUP: 1, SPRINTER: -2, SERBEST: 0 },
};

const errors = [];
const warnings = [];

function digits(value) {
  return String(value || '').replace(/[^0-9]/g, '');
}

for (const file of FILES) {
  if (!fs.existsSync(file)) {
    errors.push(`${file}: dosya yok`);
    continue;
  }
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    errors.push(`${file}: JSON okunamadı (${error.message})`);
    continue;
  }

  const races = [];
  const horses = [];
  for (const hip of data.hipodromlar || []) {
    for (const race of hip.kosular || []) {
      races.push({ hip, race });
      for (const horse of race.atlar || []) horses.push({ hip, race, horse });
    }
  }

  if (!data.tarih) errors.push(`${file}: tarih yok`);
  if (horses.length === 0) errors.push(`${file}: at listesi boş`);

  for (const { hip, race, horse } of horses) {
    const where = `${file} ${hip.sehir || hip.isim} K${race.kosu_no} #${horse.no} ${horse.isim}`;
    const required = ['taktik_durumu', 'kosu_stili', 'tempo_delta', 'isYoungHorse', 'handikap_puani', 'pist_aptitude_analizi', 'son_yarislar'];
    for (const key of required) {
      if (horse[key] === undefined || horse[key] === null) errors.push(`${where}: ${key} eksik`);
    }
    if (!Number.isFinite(horse.tempo_delta)) errors.push(`${where}: tempo_delta sonsuz/NaN`);
    if (horse.taktik_durumu === 'YETERSIZ_VERI') errors.push(`${where}: YETERSIZ_VERI olmamalı`);

    const styleCode = STYLE_CODES[horse.kosu_stili];
    const tempoCode = race.tempo_senaryosu?.tempo_kodu;
    if (!styleCode) errors.push(`${where}: bilinmeyen stil "${horse.kosu_stili}"`);
    if (!BASE_DELTA[tempoCode]) errors.push(`${where}: bilinmeyen tempo kodu "${tempoCode}"`);

    if (horse.isYoungHorse === true) {
      if (digits(horse.son_yarislar).length > 3) {
        errors.push(`${where}: isYoungHorse=true ama geçmişte ${digits(horse.son_yarislar).length} koşu var`);
      }
      if (horse.taktik_durumu !== 'ILK_3_KOSU_SERBEST') {
        errors.push(`${where}: genç at durumu ${horse.taktik_durumu}`);
      }
      if (horse.tempo_delta !== 0) errors.push(`${where}: genç at tempo deltası ${horse.tempo_delta}`);
    }
    if (horse.isYoungHorse === false && horse.kosu_stili === 'Taktik Serbest (İlk 3 Koşusu)') {
      errors.push(`${where}: tecrübeli at Taktik Serbest olamaz`);
    }
    if (horse.taktik_durumu === 'ILK_3_KOSU_SERBEST' && horse.isYoungHorse !== true) {
      errors.push(`${where}: ILK_3 durumu ama isYoungHorse=true değil`);
    }

    if (['DEGISKEN', 'KISMI', 'TEK_OLCUM'].includes(horse.taktik_durumu) && Math.abs(horse.tempo_delta) > 1) {
      errors.push(`${where}: ${horse.taktik_durumu} için delta ${horse.tempo_delta} (±1 sınırı)`);
    }
    if (horse.taktik_durumu === 'GUNCEL' && Math.abs(horse.tempo_delta) > 2) {
      errors.push(`${where}: GUNCEL için delta ${horse.tempo_delta} (±2 sınırı)`);
    }

    if (styleCode && BASE_DELTA[tempoCode]) {
      let expected = BASE_DELTA[tempoCode][styleCode];
      if (['DEGISKEN', 'KISMI', 'TEK_OLCUM'].includes(horse.taktik_durumu)) {
        expected = Math.max(-1, Math.min(1, expected));
      }
      if (horse.taktik_durumu === 'ILK_3_KOSU_SERBEST') expected = 0;
      if (horse.tempo_delta !== expected) {
        errors.push(`${where}: delta ${horse.tempo_delta}, beklenen ${expected} (${tempoCode}/${styleCode})`);
      }
    }

    const aptitude = horse.pist_aptitude_analizi;
    if (aptitude) {
      for (const key of ['dirtStats', 'synStats', 'turfStats']) {
        if (!aptitude[key] || !Number.isFinite(Number(aptitude[key].runs))) {
          errors.push(`${where}: pist_aptitude_analizi.${key}.runs eksik`);
        }
      }
      if (horse.isYoungHorse === false) {
        const runs = ['dirtStats', 'synStats', 'turfStats']
          .reduce((sum, key) => sum + Number(aptitude[key]?.runs || 0), 0);
        if (runs === 0) warnings.push(`${where}: tecrübeli atın pist istatistiği 0`);
      }
    }
  }

  console.log(`${file}: ${horses.length} at, ${races.length} koşu`);
}

console.log(`\nVeri sözleşmesi: ${errors.length} hata, ${warnings.length} uyarı`);
if (warnings.length) console.log('Uyarılar (ilk 10):', warnings.slice(0, 10));
if (errors.length) {
  console.error('Hatalar (ilk 30):', errors.slice(0, 30));
  process.exit(1);
}
console.log('Bülten veri sözleşmesi OK.');
