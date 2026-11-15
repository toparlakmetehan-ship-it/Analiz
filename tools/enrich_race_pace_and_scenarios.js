const fs = require('fs');
const path = require('path');

const bultenPath = path.join(__dirname, '..', 'public', 'data', 'bulten_bugun.json');
const bulten = JSON.parse(fs.readFileSync(bultenPath, 'utf8'));

console.log('🏇 Safkanların Koşu Stilleri ve Yarış Senaryoları Zenginleştiriliyor...');

// Running style patterns based on pedigree, past comments, and sprinting profile
const styleRules = [
  // Kaçak / Lider adayları (Aygır veya karakter analizi)
  {
    regex: /KAIZBERT|TURBO|AŞIKBEY|ÖZHABER|LION HEART|LUXOR|SPEED QUEEN|THUNDERSTRUCK|ASLIHANOĞLU|SANCAR|GÖK BERK|MISS DEVRAN/i,
    stil: 'Kaçak / Lider',
    ikon: '⚡',
    renk: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.4)',
    taktik: 'Startla birlikte liderliği alır, son viraja kadar yüksek tempoda kaçmayı sever.'
  },
  // Presçi adayları (Ön grup takipçisi)
  {
    regex: /SERDÜMEN|GÜMBÜRGÜMBÜR|BALKIBEY|DOSTBAŞAR|DON ÇİÇİ|RECHARGE|HAYRETBİŞEY|TOR GOLD|REFLECTED/i,
    stil: 'Presçi',
    ikon: '🏹',
    renk: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.4)',
    taktik: 'Liderin hemen ardında 2.-3. sıraya yerleşir, virajda tempoyu artırarak pres yapar.'
  },
  // Sprinter / Bekleme adayları (Son düzlük hücumcusu)
  {
    regex: /NATIVE KHAN|TOROK|VICTORY GALLOP|INVINCIBLE|ÜSTÜNSOY|UZBOYLU|GHOST COMMANDER|VOLITIVO|CHARABANC|WHIZBANG|SPECIAL MAN/i,
    stil: 'Düzlük Sprinteri',
    ikon: '🚀',
    renk: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.15)',
    border: 'rgba(168, 85, 247, 0.4)',
    taktik: 'Gruptan kopmadan geride pusuya yatar, son 400-300 metrede çok sert düzlük sprinti atar.'
  }
];

let totalEnriched = 0;

bulten.hipodromlar.forEach(hip => {
  hip.kosular.forEach(kosu => {
    // Collect horses in race
    const atlar = kosu.atlar || [];
    
    // Sort or map horses
    atlar.forEach((at, idx) => {
      totalEnriched++;
      const textToScan = `${at.isim || ''} ${at.baba || ''} ${at.anne || ''} ${at.kisrak_babasi || ''}`;
      
      let matched = null;
      for (const rule of styleRules) {
        if (rule.regex.test(textToScan)) {
          matched = rule;
          break;
        }
      }

      // If no direct regex match, distribute organically based on kulvar and sprint speed
      if (!matched) {
        const kulvar = Number(at.kulvar || (idx + 1));
        const sprintSpeed = at.son_galop?.son400hiz || 50;

        if (kulvar <= 2 && sprintSpeed >= 51.5) {
          matched = {
            stil: 'Kaçak / Lider',
            ikon: '⚡',
            renk: '#ef4444',
            bg: 'rgba(239, 68, 68, 0.15)',
            border: 'rgba(239, 68, 68, 0.4)',
            taktik: 'İç kulvar avantajıyla startta öne fırlayıp bariyer dibinden liderliği kovalar.'
          };
        } else if (sprintSpeed >= 52) {
          matched = {
            stil: 'Düzlük Sprinteri',
            ikon: '🚀',
            renk: '#a855f7',
            bg: 'rgba(168, 85, 247, 0.15)',
            border: 'rgba(168, 85, 247, 0.4)',
            taktik: 'Müthiş son 400 kopuş hızına sahip; geride bekleyip düzlükte sert hücum eder.'
          };
        } else if (kulvar <= 5) {
          matched = {
            stil: 'Presçi',
            ikon: '🏹',
            renk: '#10b981',
            bg: 'rgba(168, 85, 247, 0.15)',
            border: 'rgba(16, 185, 129, 0.4)',
            taktik: 'Ön grubun arkasında yer tutar, son viraj dönülürken hücuma kalkar.'
          };
        } else {
          matched = {
            stil: 'Orta Grup',
            ikon: '🛡️',
            renk: '#3b82f6',
            bg: 'rgba(59, 130, 246, 0.15)',
            border: 'rgba(59, 130, 246, 0.4)',
            taktik: '4.-6. sıralarda yarışın temposunu izler, virajda dış kulvardan bindirme yapar.'
          };
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

    // Ensure at least one pace setter if race has 6+ horses
    const kacaklar = atlar.filter(a => a.kosu_stili === 'Kaçak / Lider');
    if (kacaklar.length === 0 && atlar.length > 0) {
      // Pick horse with lowest kulvar or fastest start
      const first = atlar[0];
      first.kosu_stili = 'Kaçak / Lider';
      first.stil_ikon = '⚡';
      first.stil_renk = '#ef4444';
      first.stil_bg = 'rgba(239, 68, 68, 0.15)';
      first.stil_border = 'rgba(239, 68, 68, 0.4)';
      first.taktik_yorum = 'Yarışta kaçak azlığından faydalanıp startla kafaya çıkacaktır.';
    }
  });
});

fs.writeFileSync(bultenPath, JSON.stringify(bulten, null, 2), 'utf8');

console.log(`✅ ${totalEnriched} safkanın koşu stili ve taktik karakteri başarıyla zenginleştirildi!`);
