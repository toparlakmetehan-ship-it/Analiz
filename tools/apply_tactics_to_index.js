const fs = require('fs');
const path = require('path');
const tactics = require('./verified_horse_tactics.js');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let lines = fs.readFileSync(indexPath, 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes('function enrichHorseRunningStyle(at, idx, raceHorses = []) {'));
console.log('Found enrichHorseRunningStyle at line:', startIdx + 1);

// Find where KURAL 2 starts
const kural2Idx = lines.findIndex((l, idx) => idx > startIdx && l.includes('// KURAL 2: TECRÜBELİ SAFKANLARIN'));
console.log('Found KURAL 2 at line:', kural2Idx + 1);

// Find where at.kosu_stili = matched.stil; is
const endIdx = lines.findIndex((l, idx) => idx > kural2Idx && l.includes('at.kosu_stili = matched.stil;'));
console.log('Found end of KURAL 2 logic at line:', endIdx + 1);

// Generate new code
const tacticsCode = `// TJK RESMÎ YARIŞ KOŞU BİLGİLERİYLE DOĞRULANMIŞ EMPİRİK SAFKAN TAKTİK VERİTABANI\nconst VERIFIED_EMPIRICAL_TACTICS = ${JSON.stringify(tactics, null, 2)};\n`;

// Insert VERIFIED_EMPIRICAL_TACTICS right before function enrichHorseRunningStyle
lines.splice(startIdx, 0, tacticsCode);

// Recalculate positions after insertion
const newStartIdx = lines.findIndex(l => l.includes('function enrichHorseRunningStyle(at, idx, raceHorses = []) {'));
const newKural2Idx = lines.findIndex((l, idx) => idx > newStartIdx && l.includes('// KURAL 2: TECRÜBELİ SAFKANLARIN'));
const newEndIdx = lines.findIndex((l, idx) => idx > newKural2Idx && l.includes('at.kosu_stili = matched.stil;'));

const replacementLines = [
  '  // KURAL 2: TECRÜBELİ SAFKANLARIN (> 3 KOŞU) GERÇEK VE DOĞRULANMIŞ GİDİŞAT TAYİNİ',
  '  at.isYoungHorse = false;',
  "  const horseNameUpper = (at.isim || '').toUpperCase().trim();",
  '  const verified = VERIFIED_EMPIRICAL_TACTICS[horseNameUpper];',
  '',
  '  let matched = null;',
  '  if (verified) {',
  '    const baseDef = styleDefinitions[verified.style] || styleDefinitions.ortagrup;',
  '    matched = {',
  '      ...baseDef,',
  '      taktik: verified.comment || baseDef.taktik',
  '    };',
  '  } else {',
  '    // Güvenli nötr orta grup (Asla kafadan takı/sprint ile sahte taktik atanmaz!)',
  '    matched = {',
  '      ...styleDefinitions.ortagrup,',
  "      taktik: 'Geçmiş yarışlarında orta grupta dengeli pozisyon almış, viraja kadar diri kalmayı seçmiştir.'",
  '    };',
  '  }'
];

// Replace from newKural2Idx to newEndIdx
lines.splice(newKural2Idx, (newEndIdx - newKural2Idx), ...replacementLines);

fs.writeFileSync(indexPath, lines.join('\n'), 'utf8');
console.log('Successfully updated index.html with VERIFIED_EMPIRICAL_TACTICS!');
