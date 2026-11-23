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
  COK_HIZLI: { KACAK: -2, PRESCI: 1, ORTA_GRUP: 1, SPRINTER: 2, SERBEST: 0 },
  SURATLI: { KACAK: -1, PRESCI: 1, ORTA_GRUP: 1, SPRINTER: 1, SERBEST: 0 },
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

  // 6'lı Ganyan paket sözleşmesi: tek/çift paket, başlangıç-bitiş ve ayak numaraları.
  for (const hip of data.hipodromlar || []) {
    const hipName = hip.sehir || hip.isim || 'Hipodrom';
    const raceNos = (hip.kosular || []).map((r, idx) => Number(r.kosu_no ?? (idx + 1))).filter(Number.isFinite);
    const raceNoSet = new Set(raceNos);
    const packages = Array.isArray(hip.altiliPaketleri) ? hip.altiliPaketleri : [];
    const seenPkg = new Set();

    if (packages.length > 2) {
      errors.push(`${file} ${hipName}: 2'den fazla 6'lı paketi (${packages.length})`);
    }
    for (const pkg of packages) {
      const pkgNo = Number(pkg.paketNo);
      const start = Number(pkg.baslangicKosu);
      const end = Number(pkg.bitisKosu);
      if (!Number.isInteger(pkgNo) || pkgNo < 1) errors.push(`${file} ${hipName}: geçersiz paketNo ${pkg.paketNo}`);
      if (seenPkg.has(pkgNo)) errors.push(`${file} ${hipName}: tekrarlanan paketNo ${pkgNo}`);
      seenPkg.add(pkgNo);
      if (!Number.isInteger(start) || !Number.isInteger(end) || end !== start + 5) {
        errors.push(`${file} ${hipName} ${pkgNo}. paket: aralık ${pkg.baslangicKosu}-${pkg.bitisKosu} (6 koşu olmalı)`);
      }
      if (!raceNoSet.has(start) || !raceNoSet.has(end)) {
        errors.push(`${file} ${hipName} ${pkgNo}. paket: ${start}-${end} programda yok`);
      }
    }

    if (packages.length === 0) {
      // Resmî paket işareti olmayan (örn. 7 koşulu Bursa) geri dönüş:
      // koşu bazındaki tek paket 1..6 sırasıyla devam etmeli.
      const fallback = (hip.kosular || []).map(race => ({
        race,
        actual: Array.isArray(race.altiliPaketleri) ? race.altiliPaketleri : []
      }));
      const starts = fallback.filter(x => Number(x.actual[0]?.ayakNo) === 1);
      if (starts.length > 1) errors.push(`${file} ${hipName}: birden fazla geri dönüş 6'lı başlangıcı`);
      for (const { race, actual } of fallback) {
        const raceNo = Number(race.kosu_no);
        if (actual.length === 0) {
          if (race.altiliAyagi !== null && race.altiliAyagi !== undefined) {
            errors.push(`${file} ${hipName} K${raceNo}: altiliPaketleri boş ama altiliAyagi=${race.altiliAyagi}`);
          }
          continue;
        }
        if (actual.length !== 1 || Number(actual[0].paketNo) !== 1) {
          errors.push(`${file} ${hipName} K${raceNo}: geri dönüş paketi tek ve 1. paket olmalı`);
        }
        if (Number(race.altiliAyagi) !== Number(actual[0].ayakNo)) {
          errors.push(`${file} ${hipName} K${raceNo}: altiliAyagi ${race.altiliAyagi}, paket ayağı ${actual[0].ayakNo}`);
        }
      }
      if (starts.length === 1) {
        const startNo = Number(starts[0].race.kosu_no);
        for (let offset = 0; offset < 6; offset++) {
          const race = (hip.kosular || []).find(r => Number(r.kosu_no) === startNo + offset);
          const ayak = Number(race?.altiliPaketleri?.[0]?.ayakNo);
          if (ayak !== offset + 1) errors.push(`${file} ${hipName} K${startNo + offset}: geri dönüş 6'lı ${offset + 1}. ayak değil (${ayak || 'yok'})`);
        }
      }
      continue;
    }

    for (const race of hip.kosular || []) {
      const raceNo = Number(race.kosu_no);
      const expected = packages
        .filter(p => Number(p.baslangicKosu) <= raceNo && raceNo <= Number(p.bitisKosu))
        .map(p => ({ paketNo: Number(p.paketNo), ayakNo: raceNo - Number(p.baslangicKosu) + 1 }))
        .sort((a, b) => a.paketNo - b.paketNo);
      const actual = Array.isArray(race.altiliPaketleri) ? race.altiliPaketleri : [];
      if (JSON.stringify(expected) !== JSON.stringify(actual.map(p => ({ paketNo: Number(p.paketNo), ayakNo: Number(p.ayakNo) })))) {
        errors.push(`${file} ${hipName} K${raceNo}: altiliPaketleri beklenen ${JSON.stringify(expected)}, bulunan ${JSON.stringify(actual)}`);
      }
      if (expected.length > 0) {
        const primary = expected.find(p => p.paketNo === 1) || expected[0];
        if (Number(race.altiliAyagi) !== primary.ayakNo) {
          errors.push(`${file} ${hipName} K${raceNo}: altiliAyagi ${race.altiliAyagi}, beklenen ${primary.ayakNo}`);
        }
      } else if (race.altiliAyagi !== null && race.altiliAyagi !== undefined) {
        errors.push(`${file} ${hipName} K${raceNo}: altili dışı ama altiliAyagi=${race.altiliAyagi}`);
      }
    }
  }

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
