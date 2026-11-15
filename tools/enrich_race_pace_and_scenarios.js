const fs = require('fs');
const path = require('path');

const bultenPath = path.join(__dirname, '..', 'public', 'data', 'bulten_bugun.json');
const bulten = JSON.parse(fs.readFileSync(bultenPath, 'utf8'));

console.log('🏇 Safkanların Koşu Stilleri ve Yarış Senaryoları Zenginleştiriliyor...');

// ── KOŞU STİLİ ŞABLONLARI (ASLA AT İSMİ VEYA SOY KÜTÜĞÜ KULLANILMAZ) ──
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

let totalEnriched = 0;

// GENEL VE DEĞİŞMEZ KURAL: Kariyerinde <= 3 koşu koşan hiçbir safkana kalıplaşmış gidişat atanmaz
function isYoungInexperiencedHorse(at) {
  if (!at) return false;
  if (at.isFirstTimeStarter) return true;
  if (at.yas === 2) return true; // 2 yaşındaki İngiliz tayları yarış hayatının başındadır
  if (at.careerSummary && typeof at.careerSummary.toplamKosu === 'number') {
    return at.careerSummary.toplamKosu <= 3;
  }
  if (typeof at.realRacesCount === 'number' && at.realRacesCount > 0) {
    return at.realRacesCount <= 3;
  }
  if (Array.isArray(at.pastRaces)) {
    if (at.pastRaces.length === 0) return true;
    if (at.pastRaces.length <= 3) return true;
  }
  const cleanYarislar = (at.son_yarislar || '').replace(/[^0-9]/g, '');
  if (cleanYarislar.length > 0) {
    return cleanYarislar.length <= 3;
  }
  return true;
}

bulten.hipodromlar.forEach(hip => {
  hip.kosular.forEach(kosu => {
    const atlar = kosu.atlar || [];
    
    atlar.forEach((at, idx) => {
      totalEnriched++;

      // KURAL: Yarış hayatının ilk 3 yarışında olan atlara kalıplaşmış gidişat atanmaz
      if (isYoungInexperiencedHorse(at)) {
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
      let matched = null;

      // 1. ÖNCELİK: Safkanın kendi geçmiş yarış takip pozisyonu ortalaması (runningLine / early split)
      if (at.pastRaces && at.pastRaces.length > 0) {
        let earlyPositions = [];
        at.pastRaces.forEach(p => {
          if (p.runningLine) {
            const parts = p.runningLine.split('-');
            const pos = parseInt(parts[0], 10);
            if (!isNaN(pos)) earlyPositions.push(pos);
          }
        });

        if (earlyPositions.length > 0) {
          // Son 2 yarışa 2 kat ağırlık vererek en sık takip ettiği taktiği bul
          let weightedSum = 0;
          let weightTotal = 0;
          earlyPositions.forEach((pos, pIdx) => {
            const w = pIdx < 2 ? 2.0 : 1.0;
            weightedSum += pos * w;
            weightTotal += w;
          });
          const avgPos = weightedSum / weightTotal;

          if (avgPos <= 1.8) {
            matched = styleDefinitions.kacak;
          } else if (avgPos <= 3.2) {
            matched = styleDefinitions.presci;
          } else if (avgPos <= 5.8) {
            matched = styleDefinitions.ortagrup;
          } else {
            matched = styleDefinitions.sprinter;
          }
        }
      }

      // 2. ÖNCELİK: Geçmiş yarış çizgisi bulunamayan tecrübeli safkanlar için son galop sprint ivmesi & kulvar dağılımı
      if (!matched) {
        const kulvar = Number(at.kulvar || (idx + 1));
        const sprintSpeed = at.son_galop?.son400hiz || 50;

        if (kulvar <= 2 && sprintSpeed >= 53) {
          matched = styleDefinitions.kacak;
        } else if (kulvar <= 5) {
          matched = styleDefinitions.presci;
        } else if (sprintSpeed >= 54) {
          matched = styleDefinitions.sprinter;
        } else {
          matched = styleDefinitions.ortagrup;
        }
      }

      // Assign to horse
      at.kosu_stili = matched.stil;
      at.stil_ikon = matched.ikon;
      at.stil_renk = matched.renk;
      at.stil_bg = matched.bg;
      at.stil_border = matched.border;
      at.taktik_yorum = matched.taktik;
    });
  });
});

fs.writeFileSync(bultenPath, JSON.stringify(bulten, null, 2), 'utf8');

console.log(`✅ ${totalEnriched} safkanın koşu stili ve taktik karakteri başarıyla zenginleştirildi!`);
