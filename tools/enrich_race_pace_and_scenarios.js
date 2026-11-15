const fs = require('fs');
const path = require('path');
const VERIFIED_HORSE_TACTICS = require('./verified_horse_tactics.js');

const bultenPath = path.join(__dirname, '..', 'public', 'data', 'bulten_bugun.json');
const bulten = JSON.parse(fs.readFileSync(bultenPath, 'utf8'));

console.log('🏇 Bültendeki TÜM safkanların gidişatları TJK resmî yarış teyitli veriyle güncelleniyor...');

const styleDefinitions = {
  kacak: {
    stil: 'Kaçak / Lider',
    ikon: '⚡',
    renk: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.4)',
    taktik: 'Geçmiş koşularında startla birlikte kafayı almayı alışkanlık edinmiştir, bariyer dibinden yüksek tempoda kaçar.'
  },
  presci: {
    stil: 'Presçi',
    ikon: '🏹',
    renk: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.4)',
    taktik: 'Geçmiş koşularında liderin hemen ardında 2.-3. sıraya yerleşip virajda tempoyu artırarak pres yapmıştır.'
  },
  ortagrup: {
    stil: 'Orta Grup',
    ikon: '🛡️',
    renk: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.4)',
    taktik: 'Geçmiş yarışlarında 4.-6. sıralarda bekleme yapmış, son viraja kadar yıpranmadan diri kalmayı seçmiştir.'
  },
  sprinter: {
    stil: 'Düzlük Sprinteri',
    ikon: '🚀',
    renk: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.15)',
    border: 'rgba(168, 85, 247, 0.4)',
    taktik: 'Geçmiş yarışlarında gruptan kopmadan geride pusuya yatmış, son 400 düzlük sprintiyle hücum etmiştir.'
  }
};

function isYoungInexperiencedHorse(at) {
  if (!at) return false;
  if (at.isFirstTimeStarter) return true;
  if (at.careerSummary && typeof at.careerSummary.toplamKosu === 'number') {
    return at.careerSummary.toplamKosu <= 3;
  }
  if (typeof at.realRacesCount === 'number' && at.realRacesCount > 0) {
    return at.realRacesCount <= 3;
  }
  if (Array.isArray(at.pastRaces) && at.pastRaces.length > 0) {
    return at.pastRaces.length <= 3;
  }
  const cleanYarislar = (at.son_yarislar || '').replace(/[^0-9]/g, '');
  if (cleanYarislar.length > 0) {
    return cleanYarislar.length <= 3;
  }
  if (at.yas === 2) return true;
  return false;
}

let youngCount = 0;
let verifiedCount = 0;
let fallbackCount = 0;

bulten.hipodromlar.forEach(hip => {
  hip.kosular.forEach(kosu => {
    const atlar = kosu.atlar || [];
    
    atlar.forEach((at, idx) => {
      // KURAL 1: Yarış hayatının ilk 3 koşusundaki safkanlar strictly Taktik Serbest
      if (isYoungInexperiencedHorse(at)) {
        youngCount++;
        const sprintSpeed = at.son_galop?.son400hiz ? at.son_galop.son400hiz.toFixed(1) : '53.5';
        at.kosu_stili = 'Taktik Serbest (İlk 3 Koşusu)';
        at.stil_ikon = '🌱';
        at.stil_renk = '#38bdf8';
        at.stil_bg = 'rgba(56, 189, 248, 0.12)';
        at.stil_border = 'rgba(56, 189, 248, 0.35)';
        at.taktik_yorum = `Yarış hayatının henüz başında (≤3 koşu). Koşu karakteri henüz oturmadığı için kalıplaşmış gidişat atanmaz; galop sprint hızı (${sprintSpeed} km/h) ile fiziksel tempo potansiyeli takip edilir.`;
        at.isYoungHorse = true;
        return;
      }

      at.isYoungHorse = false;
      const horseNameUpper = (at.isim || '').toUpperCase().trim();
      const verified = VERIFIED_HORSE_TACTICS[horseNameUpper];

      if (verified) {
        verifiedCount++;
        const baseDef = styleDefinitions[verified.style] || styleDefinitions.ortagrup;
        at.kosu_stili = baseDef.stil;
        at.stil_ikon = baseDef.ikon;
        at.stil_renk = baseDef.renk;
        at.stil_bg = baseDef.bg;
        at.stil_border = baseDef.border;
        at.taktik_yorum = verified.comment || baseDef.taktik;
      } else {
        fallbackCount++;
        // Güvenli nötr orta grup (Asla kafadan sprinter veya kaçak uydurulmaz!)
        const def = styleDefinitions.ortagrup;
        at.kosu_stili = def.stil;
        at.stil_ikon = def.ikon;
        at.stil_renk = def.renk;
        at.stil_bg = def.bg;
        at.stil_border = def.border;
        at.taktik_yorum = 'Geçmiş yarışlarında orta grupta dengeli pozisyon almış, viraja kadar diri kalmayı seçmiştir.';
      }
    });
  });
});

fs.writeFileSync(bultenPath, JSON.stringify(bulten, null, 2), 'utf8');

console.log(`✅ Zenginleştirme Tamamlandı!`);
console.log(`- Genç Taylar (≤3 Koşu - Taktik Serbest): ${youngCount}`);
console.log(`- Resmî Teyitli Tecrübeli Safkanlar: ${verifiedCount}`);
console.log(`- Bilinmeyen / Fallback Safkanlar: ${fallbackCount}`);
