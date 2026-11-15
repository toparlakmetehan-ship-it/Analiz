const fs = require('fs');
const path = require('path');

const bultenPath = path.join(__dirname, '..', 'public', 'data', 'bulten_bugun.json');
const bulten = JSON.parse(fs.readFileSync(bultenPath, 'utf8'));

console.log('🏇 Safkanların Koşu Stilleri ve Yarış Senaryoları Zenginleştiriliyor...');

// Running style patterns based on pedigree, past comments, and sprinting profile
const styleRules = [
  // Kaçak / Lider adayları (Aygır veya karakter analizi)
  {
    regex: /^DON ÇİÇİ$|SPEED QUEEN|THUNDERSTRUCK|ASLIHANOĞLU|SANCAR|GÖK BERK|MISS DEVRAN|YALNIZ AŞIK|LUSİA|ORMANCIBEY|BOZKIR KARTALI/i,
    stil: 'Kaçak / Lider',
    ikon: '⚡',
    renk: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.4)',
    taktik: 'Startla birlikte liderliği alır, son viraja kadar yüksek tempoda kaçmayı sever.'
  },
  // Presçi adayları (Ön grup takipçisi)
  {
    regex: /ÜSTÜNSOY|SERDÜMEN|GÜMBÜRGÜMBÜR|BALKIBEY|DOSTBAŞAR|HAYRETBİŞEY|TOR GOLD|REFLECTED|EFE KAPTAN|AĞILMUS|ALKATRAZ|ALATTİN|ÇELİK ABİ|CAYMAZBEY/i,
    stil: 'Presçi',
    ikon: '🏹',
    renk: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.4)',
    taktik: 'Liderin hemen ardında 2.-3. sıraya yerleşir, virajda tempoyu artırarak pres yapar.'
  },
  // Orta Grup adayları
  {
    regex: /^RECHARGE|RECHARGE MY HEART|UZBOYLU|TAŞKARA|AYDIN DAYI|AĞILMUS ASLANI/i,
    stil: 'Orta Grup',
    ikon: '🛡️',
    renk: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.4)',
    taktik: '4.-6. sıralarda yarışın temposunu izler, viraja kadar efor sarf etmeden diri kalır.'
  },
  // Sprinter / Bekleme adayları (Son düzlük hücumcusu)
  {
    regex: /ALWAYS HARD|BEST LINE|DRAGON PRIME|MACAPA|NATIVE KHAN|TOROK|VICTORY GALLOP|INVINCIBLE|GHOST COMMANDER|VOLITIVO|CHARABANC|WHIZBANG|SPECIAL MAN|EFLAH|KAYIPSIZ|DELİ ŞİMŞEK/i,
    stil: 'Düzlük Sprinteri',
    ikon: '🚀',
    renk: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.15)',
    border: 'rgba(168, 85, 247, 0.4)',
    taktik: 'Gruptan kopmadan geride pusuya yatar, son 400-300 metrede çok sert düzlük sprinti atar.'
  }
];

let totalEnriched = 0;

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
      const textToScan = `${at.isim || ''} ${at.baba || ''} ${at.anne || ''} ${at.kisrak_babasi || ''}`.toUpperCase();

      // 1. ÖNCELİK: Safkanın Gerçek Geçmiş Koşu Çizgileri
      let pastPosAvg = null;
      if (at.pastRaces && at.pastRaces.length > 0) {
        const validLines = at.pastRaces.map(p => p.runningLine).filter(Boolean);
        if (validLines.length > 0) {
          let sumPos = 0;
          let count = 0;
          validLines.forEach(l => {
            const parts = l.split('-');
            const pos = parseInt(parts[0]);
            if (!isNaN(pos)) { sumPos += pos; count++; }
          });
          if (count > 0) pastPosAvg = sumPos / count;
        }
      }
      
      let matched = null;
      // 1. ÖNCELİK: Safkanın kendi adı ile doğrudan eşleşme
      for (const rule of styleRules) {
        if (rule.regex.test((at.isim || '').trim())) {
          matched = rule;
          break;
        }
      }

      // 2. ÖNCELİK: Safkanın geçmiş yarış pozisyon ortalaması
      if (!matched && pastPosAvg !== null) {
        if (pastPosAvg <= 1.8) matched = styleRules[0];
        else if (pastPosAvg <= 3.5) matched = styleRules[1];
        else if (pastPosAvg <= 6.0) matched = styleRules[2];
        else matched = styleRules[3];
      }

      // 3. ÖNCELİK: Soy kütüğü desteği (Kaçak harici)
      if (!matched) {
        for (let rIdx = 1; rIdx < styleRules.length; rIdx++) {
          if (styleRules[rIdx].regex.test(textToScan)) {
            matched = styleRules[rIdx];
            break;
          }
        }
      }

      // If no direct regex match, distribute organically based on kulvar and sprint speed
      if (!matched) {
        const kulvar = Number(at.kulvar || (idx + 1));
        const sprintSpeed = at.son_galop?.son400hiz || 50;

        if (kulvar <= 2 && sprintSpeed >= 53) {
          matched = styleRules[0];
        } else if (kulvar <= 5) {
          matched = styleRules[1];
        } else if (sprintSpeed >= 54) {
          matched = styleRules[3];
        } else {
          matched = styleRules[2];
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
