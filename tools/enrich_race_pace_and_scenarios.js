const fs = require('fs');
const path = require('path');
const VERIFIED_HORSE_TACTICS = require('./verified_horse_tactics.js');

const bultenPath = path.join(__dirname, '..', 'public', 'data', 'bulten_bugun.json');
const bulten = JSON.parse(fs.readFileSync(bultenPath, 'utf8'));

console.log('🏇 Bültendeki TÜM safkanların gidişatları ve KABA KUM / SENTETİK analizleri güncelleniyor...');

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

// Aygırların Kaba Kum ve Sentetik yatkınlık profilleri (Arap & İngiliz)
const sireProfiles = {
  // 1. KABA KUM DOMİNANT
  'OVA': { bias: 'KUM', text: 'Kaba Kum & Çamur Otoritesi (Şentay Hattı)' },
  'SANCAKBEYI': { bias: 'KUM', text: 'Ağır Kaba Kum Efsanesi' },
  'HABERBATUR': { bias: 'KUM', text: 'Arap Kaba Kum Güç Hattı' },
  'OZGUNHAN': { bias: 'KUM', text: 'Arap Kaba Kum Otoritesi' },
  'BILGIN': { bias: 'KUM', text: 'Arap Kaba Kum & Çamur Ustası' },
  'GOBAK BEY': { bias: 'KUM', text: 'Kaba Kum Arap Güç Hattı' },
  'GOBAKTI': { bias: 'KUM', text: 'Kaba Kum Arap Güç Hattı' },
  'ALTAHA': { bias: 'KUM', text: 'Kaba Kum Güç & Dayanıklılık' },
  'SENTAY': { bias: 'KUM', text: 'Kaba Kum Efsanesi' },
  'TUMOZ BEY': { bias: 'KUM', text: 'Kaba Kum Güç Hattı' },
  'AYABAKAN': { bias: 'KUM', text: 'Kaba Kum Güçlü Hat' },
  'KARAUZUM': { bias: 'KUM', text: 'Kaba Kum Dayanıklılık' },
  'GUNTAY': { bias: 'KUM', text: 'Kaba Kum Güçlü Hat' },
  'BERKSOY': { bias: 'KUM', text: 'Kaba Kum Sert Aygır' },
  'UCANOGLU': { bias: 'KUM', text: 'Kaba Kum Güç Hattı' },
  'SARRAF': { bias: 'KUM', text: 'Kaba Kum Erken Sürat & Güç' },
  'DEMIRKAZIK': { bias: 'KUM', text: 'Kaba Kum Otoritesi' },
  'KAFKAS SAHI': { bias: 'KUM', text: 'Kaba Kum Güç Hattı' },
  'GELIBOLU': { bias: 'KUM', text: 'Kaba Kum Güç Hattı' },
  'EMBIR HAN': { bias: 'KUM', text: 'Kaba Kum Güç Hattı' },
  'DAYIBEY': { bias: 'KUM', text: 'Kaba Kum Güç Hattı' },
  'BABA MEVLUT': { bias: 'KUM', text: 'Kaba Kum Güç Hattı' },
  'YELGECEN': { bias: 'KUM', text: 'Kaba Kum Hattı' },
  'COMERTKAN': { bias: 'KUM', text: 'Kaba Kum Güç Hattı' },
  'SONALP': { bias: 'KUM', text: 'Kaba Kum Hattı' },
  'YAKUPBEY': { bias: 'KUM', text: 'Kaba Kum Hattı' },
  'HURBATUR': { bias: 'KUM', text: 'Ağır Kum & Çamur Efsanesi' },
  'SERGEN': { bias: 'KUM', text: 'Kaba Kum Güç Hattı' },
  'KAMAN': { bias: 'KUM', text: 'Kaba Kum Güç Hattı' },
  'DILIRAN': { bias: 'KUM', text: 'Kaba Kum Güç Hattı' },
  'GUMBURGUMBUR': { bias: 'KUM', text: 'Kaba Kum Sprint & Güç' },
  'ORCUN': { bias: 'KUM', text: 'Kaba Kum & Dayanıklılık' },
  'UCANBEY': { bias: 'KUM', text: 'Kaba Kum Güç Hattı' },
  'DAREDEVIL': { bias: 'KUM', text: 'Safkan Kaba Kum Gücü' },
  'BODEMEISTER': { bias: 'KUM', text: 'Kaba Kum Güç & Dayanıklılık' },
  'TIZWAY': { bias: 'KUM', text: 'Kaba Kum Klasik Mesafe Aygırı' },
  'CUVEE': { bias: 'KUM', text: 'Kaba Kum Erken Sürat Aygırı' },
  'LION HEART': { bias: 'KUM', text: 'Kaba Kum Dayanıklı Sprint' },
  'CORINTHIAN': { bias: 'KUM', text: 'Kaba Kum Gücü Yüksek' },
  'RUN AWAY AND HIDE': { bias: 'KUM', text: 'Kaba Kum Erken Hız ve Güç' },
  'SUPER SAVER': { bias: 'KUM', text: 'Kaba Kum ve Ağır Pist Şampiyonu' },
  'BOSPORUS': { bias: 'KUM', text: 'Kaba Kum Sürat Otoritesi' },
  'SPEEDY WOLF': { bias: 'KUM', text: 'Kaba Kum Sprint Hattı' },
  'EXPANSION': { bias: 'KUM', text: 'Kaba Kum Güç Hattı' },
  'HAKEEM': { bias: 'KUM', text: 'Kaba Kum Güçlü Hat' },
  'PULPIT': { bias: 'KUM', text: 'Kaba Kum Amerikan Hattı' },
  'TAPIT': { bias: 'KUM', text: 'Kaba Kum Efsanesi' },
  'UNACCOUNTED FOR': { bias: 'KUM', text: 'Kaba Kum Dayanıklılık Efsanesi' },
  'STRIKE THE GOLD': { bias: 'KUM', text: 'Kaba Kum ve Çamur Efsanesi' },
  'WEST BY WEST': { bias: 'KUM', text: 'Kaba Kum Otoritesi' },
  'ROYAL ABJAR': { bias: 'KUM', text: 'Kaba Kum Sürat Hattı' },
  'TRIPPE DAYS': { bias: 'KUM', text: 'Kaba Kum Sürat Hattı' },
  'DUTYFREE': { bias: 'KUM', text: 'Kaba Kum Sürat Gücü' },
  'AFTER MARKET': { bias: 'KUM', text: 'Kaba Kum Güç Hattı' },
  'TALIPHAN': { bias: 'KUM', text: 'Kaba Kum ve Güç Hattı' },
  // 2. DUAL (KUM & SENTETİK)
  'VICTORY GALLOP': { bias: 'DUAL', text: 'Kum & Sentetik Şampiyonu' },
  'KAIZBERT': { bias: 'DUAL', text: 'Kum ve Sentetikte Yenilmez (Arap)' },
  'PAPA CLEM': { bias: 'DUAL', text: 'Kum & Sentetik Dengeli Hat' },
  'MENDIP': { bias: 'DUAL', text: 'Kum ve Sentetikte Yüksek Form' },
  'OZHABER': { bias: 'DUAL', text: 'Kum & Sentetik Çift Yönlü' },
  'KANEKO': { bias: 'DUAL', text: 'Kum & Sentetik Güçlü Hat' },
  'TURBO': { bias: 'DUAL', text: 'Kum & Sentetikte Üst Düzey Güç' },
  'AUTHORIZED': { bias: 'DUAL', text: 'Kum & Çim Dayanıklı Hat' },
  'SMART ROBIN': { bias: 'DUAL', text: 'Kum & Sentetik Dengeli Hat' },
  'TAMERINOGLU': { bias: 'DUAL', text: 'Kum & Sentetik Başarılı' },
  'GURSU': { bias: 'DUAL', text: 'Kum & Sentetik Çift Yönlü' },
  // 3. SENTETİK & ÇİM
  'NATIVE KHAN': { bias: 'SENTETIK', text: 'Sentetik & Çim Otoritesi' },
  'TOROK': { bias: 'SENTETIK', text: 'Sentetik ve Çim Uzmanı' },
  'LUXOR': { bias: 'SENTETIK', text: 'Sentetik / Açık Koşu Çim Uzmanı' },
  'FAST \'N\' FAMOUS': { bias: 'SENTETIK', text: 'Sentetik Sprint Gücü' },
  'INVINCIBLE SPIRIT': { bias: 'SENTETIK', text: 'Sentetik / All-Weather Orijini' },
  'APPROVE': { bias: 'SENTETIK', text: 'Sentetik Sprint Yatkını' },
  'SATONO ARES': { bias: 'SENTETIK', text: 'Sentetik & Çim Japon Hattı' }
};

function normalizeStr(str) {
  if (!str) return '';
  return str.toUpperCase()
    .replace(/İ/g, 'I')
    .replace(/I/g, 'I')
    .replace(/Ş/g, 'S')
    .replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U')
    .replace(/Ö/g, 'O')
    .replace(/Ç/g, 'C')
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findPedigreeMatch(name) {
  const norm = normalizeStr(name);
  if (!norm) return null;
  for (const [key, val] of Object.entries(sireProfiles)) {
    const normKey = normalizeStr(key);
    if (norm === normKey || norm.includes(normKey)) {
      return val;
    }
  }
  return null;
}

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
let kabaKumCount = 0;
let sentetikCount = 0;
let dualCount = 0;
let mismatchCount = 0;

bulten.hipodromlar.forEach(hip => {
  hip.kosular.forEach(kosu => {
    const atlar = kosu.atlar || [];
    const raceTrack = (kosu.pist || '').trim(); // 'Kum', 'Sentetik', 'Çim'
    
    atlar.forEach((at, idx) => {
      // Python export'undan gelen gerçek pist istatistikleri varsa koru.
      const existingPist = at.pist_aptitude_analizi;
      const existingPistRuns = existingPist
        ? ['dirtStats', 'synStats', 'turfStats'].reduce(
            (sum, key) => sum + Number(existingPist[key]?.runs || 0), 0
          )
        : 0;

      // ══════════════════════════════════════════════════════════════════════════
      // BÖLÜM 1: GİDİŞAT VE TAKTİK KALİBRASYONU (KURAL 1 & KURAL 2)
      // ══════════════════════════════════════════════════════════════════════════
      const hasPersistedTacticalAnalysis =
        typeof at.isYoungHorse === 'boolean' &&
        (at.isYoungHorse || ['GUNCEL', 'KISMI', 'TEK_OLCUM', 'DEGISKEN', 'YETERSIZ_VERI'].includes(at.taktik_durumu)) &&
        typeof at.kosu_stili === 'string' && at.kosu_stili.trim() !== '' &&
        typeof at.stil_ikon === 'string' &&
        typeof at.taktik_yorum === 'string' && at.taktik_yorum.trim() !== '' &&
        Number.isFinite(at.tempo_delta);

      if (hasPersistedTacticalAnalysis) {
        // Accurace ara-pozisyon ölçümünden gelen kayıtlı taktiği ezme.
        if (at.isYoungHorse) youngCount++;
      } else if (isYoungInexperiencedHorse(at)) {
        youngCount++;
        const sprintSpeed = at.son_galop?.son400hiz ? at.son_galop.son400hiz.toFixed(1) : '53.5';
        at.kosu_stili = 'Taktik Serbest (İlk 3 Koşusu)';
        at.stil_ikon = '🌱';
        at.stil_renk = '#38bdf8';
        at.stil_bg = 'rgba(56, 189, 248, 0.12)';
        at.stil_border = 'rgba(56, 189, 248, 0.35)';
        at.taktik_yorum = `Yarış hayatının henüz başında (≤3 koşu). Koşu karakteri henüz oturmadığı için kalıplaşmış gidişat atanmaz; galop sprint hızı (${sprintSpeed} km/h) ile fiziksel tempo potansiyeli takip edilir.`;
        at.isYoungHorse = true;
      } else {
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
          const def = styleDefinitions.ortagrup;
          at.kosu_stili = def.stil;
          at.stil_ikon = def.ikon;
          at.stil_renk = def.renk;
          at.stil_bg = def.bg;
          at.stil_border = def.border;
          at.taktik_yorum = 'Geçmiş yarışlarında orta grupta dengeli pozisyon almış, viraja kadar diri kalmayı seçmiştir.';
        }
      }

      // ══════════════════════════════════════════════════════════════════════════
      // BÖLÜM 2: KABA KUM VE SENTETİK AYRIMI & PİST YATKINLIĞI ANALİZİ
      // ══════════════════════════════════════════════════════════════════════════
      const past = at.pastRaces || [];
      const sire = at.baba || '';
      const damSire = at.kisrak_babasi || at.kisrakBabasi || '';
      const sireMatch = findPedigreeMatch(sire);
      const damSireMatch = findPedigreeMatch(damSire);

      let dirtRuns = 0, dirtWins = 0, dirtTop4 = 0;
      let synRuns = 0, synWins = 0, synTop4 = 0;
      let turfRuns = 0, turfWins = 0, turfTop4 = 0;

      if (past && past.length > 0) {
        past.forEach(p => {
          const trk = (p.pist || '').trim();
          const rank = parseInt(p.finishRank) || 99;
          if (trk === 'Kum') {
            dirtRuns++;
            if (rank === 1) dirtWins++;
            if (rank <= 4) dirtTop4++;
          } else if (trk === 'Sentetik') {
            synRuns++;
            if (rank === 1) synWins++;
            if (rank <= 4) synTop4++;
          } else if (trk === 'Çim') {
            turfRuns++;
            if (rank === 1) turfWins++;
            if (rank <= 4) turfTop4++;
          }
        });
      } else if (existingPist) {
        dirtRuns = existingPist.dirtStats?.runs || 0;
        dirtWins = existingPist.dirtStats?.wins || 0;
        dirtTop4 = existingPist.dirtStats?.top4 || 0;
        synRuns = existingPist.synStats?.runs || 0;
        synWins = existingPist.synStats?.wins || 0;
        synTop4 = existingPist.synStats?.top4 || 0;
        turfRuns = existingPist.turfStats?.runs || 0;
        turfWins = existingPist.turfStats?.wins || 0;
        turfTop4 = existingPist.turfStats?.top4 || 0;
      }

      let badge = '';
      let delta = 0;
      let color = '#d4af37';
      let desc = '';

      if (at.isYoungHorse) {
        badge = '🌱 Pist Deneyimi: İlk 3 Koşusu (Pist & Taktik Nötr)';
        delta = 0;
        color = '#38bdf8';
        desc = 'Safkan kariyerinin başında (≤3 yarış). Pist adaptasyonu ve gidişatı henüz oturmadığı için puanı nötr tutulur.';
      } else if (raceTrack === 'Sentetik') {
        // GÜNÜN YARIŞI: SENTETİK PİST
        if ((dirtWins >= 1 && synWins >= 1) || (dirtTop4 >= 2 && synTop4 >= 2)) {
          badge = `⭐ DUAL-PİST USTASI (Kum: ${dirtWins}G/${dirtTop4}T · Sentetik: ${synWins}G/${synTop4}T)`;
          delta = +4;
          color = '#34d399';
          desc = `Hem Kaba Kumda hem Sentetik pistte yüksek tabela ve galibiyete sahip çift yönlü safkan; pist şartı seçmez, sentetikte de çok diridir.`;
          dualCount++;
        } else if (synRuns >= 2 && (synWins >= 1 || (synTop4 / synRuns) >= 0.5)) {
          badge = `👑 SENTETİK PİST UZMANI (Sentetikte ${synWins}G / ${synTop4} Tabela)`;
          delta = synWins >= 2 ? +5 : +4;
          color = '#10b981';
          desc = `Sentetik pistte ${synRuns} koşuda ${synWins} galibiyet, ${synTop4} tabela başarısı bulunuyor. Bu zeminde aksiyonu son derece akıcı, ayak uyumu tamdır.`;
          sentetikCount++;
        } else if (synRuns >= 2 && synTop4 === 0 && dirtTop4 >= 2) {
          badge = `⚠️ PİST RİSKİ: KABA KUM ATI (Sentetikte 0 Tabela)`;
          delta = -5;
          color = '#ef4444';
          desc = `Kaba kumda ${dirtRuns} koşuda ${dirtTop4} tabela yapmasına rağmen, sentetikte ${synRuns} koşuda tabelaya giremedi. Sentetik zemin aksiyonunu olumsuz etkiliyor.`;
          mismatchCount++;
        } else if (synRuns === 0 && dirtRuns >= 3) {
          const sireSentetikOk = sireMatch && (sireMatch.bias === 'SENTETIK' || sireMatch.bias === 'DUAL');
          if (sireSentetikOk) {
            badge = `🌱 SENTETİKTE İLK KEZ: Soyu (${sireMatch.text}) Sentetikle Uyumlu`;
            delta = 0;
            color = '#38bdf8';
            desc = `Kariyerinde sentetik koşusu yok ancak aygırı ${sireMatch.text} olduğundan sentetik aksiyonuna yatkındır.`;
          } else {
            badge = `⚠️ SENTETİKTE İLK KEZ: Kaba Kum Formu Var`;
            delta = -3;
            color = '#f59e0b';
            desc = `Kariyerindeki ${dirtRuns} koşunun tamamını Kaba Kumda koştu; sentetik pistin elastik yapısına ilk kez çıkıyor, zemin değişikliği risk taşır.`;
          }
          mismatchCount++;
        } else {
          badge = `🏟️ Sentetik Pist Uyumlu (${synRuns > 0 ? synRuns + ' Koşuda ' + synTop4 + ' Tabela' : 'Dengeli Hat'})`;
          delta = synTop4 > 0 ? +2 : 0;
          color = '#f3e5ab';
          desc = 'Sentetik pist tecrübesi mevcut; koşu sınıfına göre performansını sahaya yansıtması beklenir.';
        }
      } else if (raceTrack === 'Kum') {
        // GÜNÜN YARIŞI: KABA KUM
        if ((dirtWins >= 1 && synWins >= 1) || (dirtTop4 >= 2 && synTop4 >= 2)) {
          badge = `⭐ DUAL-PİST USTASI (Kum: ${dirtWins}G/${dirtTop4}T · Sentetik: ${synWins}G/${synTop4}T)`;
          delta = +4;
          color = '#34d399';
          desc = `Hem Kaba Kumda hem Sentetikte tabela ve galibiyet yapmış çok yönlü safkan; pist şartı seçmeksizin yüksek performans sergiler.`;
          dualCount++;
        } else if (dirtRuns >= 2 && (dirtWins >= 1 || (dirtTop4 / dirtRuns) >= 0.5)) {
          badge = `🔥 KABA KUM UZMANI (Kumda ${dirtWins}G / ${dirtTop4} Tabela)`;
          delta = dirtWins >= 2 ? +5 : +4;
          color = '#10b981';
          desc = `Kaba kumda ${dirtRuns} koşuda ${dirtWins} galibiyet, ${dirtTop4} tabela elde etti. Ağır kum ve kickback altında mücadele gücü çok yüksektir.`;
          kabaKumCount++;
        } else if (dirtRuns === 0 && synRuns >= 3) {
          const styleStr = (at.kosu_stili || '').toLowerCase();
          const isKacak = styleStr.includes('kaçak') || styleStr.includes('kacak') || styleStr.includes('lider');
          const isPres = styleStr.includes('pres');

          const hasKumPedigree = (sireMatch && (sireMatch.bias === 'KUM' || sireMatch.bias === 'DUAL')) ||
                                 (damSireMatch && (damSireMatch.bias === 'KUM' || damSireMatch.bias === 'DUAL'));
          const pedNote = (sireMatch && (sireMatch.bias === 'KUM' || sireMatch.bias === 'DUAL'))
            ? sireMatch.text
            : (damSireMatch ? damSireMatch.text : 'Kaba Kum Hattı');

          if (hasKumPedigree && isKacak) {
            badge = `🛡️ KABA KUMA İLK KEZ (Kum Orijinli & Kaçak - Kickback Muafiyeti)`;
            delta = 0;
            color = '#38bdf8';
            desc = `Kariyerindeki ${synRuns} koşuyu sentetikte koştu; soyunda (${pedNote}) kaba kum genetiği tamdır. Kaçak/Lider stili sayesinde öndeki atlardan gelecek kum sıçramasına (kickback) maruz kalmayacaktır.`;
          } else if (hasKumPedigree && isPres) {
            badge = `🛡️ KABA KUMA İLK KEZ (Kum Orijinli & Ön Grup Pres)`;
            delta = -1;
            color = '#f59e0b';
            desc = `Kariyerindeki ${synRuns} koşuyu sentetikte koştu; soyunda (${pedNote}) kaba kum gücü mevcut. Ön grupta pres yapacağı için kickback etkisi hafif kalacaktır.`;
            mismatchCount++;
          } else if (hasKumPedigree) {
            badge = `⚠️ KABA KUMA İLK KEZ (Kum Orijinli - Geride Kickback Riski)`;
            delta = -2;
            color = '#f59e0b';
            desc = `Soyunda (${pedNote}) kaba kum genetiği mevcut ancak bekleme/sprinter stili nedeniyle ön gruptan sıçrayacak kum parçalarına (kickback) ilk kez maruz kalacaktır.`;
            mismatchCount++;
          } else if (isKacak) {
            badge = `⚠️ KABA KUMA İLK KEZ (Kaçak Stille Kickback Yok / Derin Kum Testi)`;
            delta = -3;
            color = '#f59e0b';
            desc = `Soyunda kaba kum baskınlığı sınırlı. Kaçak stiliyle kickback yemeyecek olsa da kaba kumun derin yapısına ilk kez ayak uydurmaya çalışacaktır.`;
            mismatchCount++;
          } else {
            badge = `⚠️ PİST RİSKİ: SENTETİK ATI (Kaba Kuma İlk Kez Çıkıyor)`;
            delta = -5;
            color = '#ef4444';
            desc = `Kariyerindeki ${synRuns} koşuyu sentetikte koştu; soyu kaba kum destekli değil ve geriden gelen stiliyle önden sıçrayacak yoğun kum parçalarına (kickback) ilk kez maruz kalacaktır.`;
            mismatchCount++;
          }
        } else if (dirtRuns >= 2 && dirtTop4 === 0 && (synTop4 >= 2 || turfTop4 >= 2)) {
          badge = `⚠️ PİST UYARISI: Kaba Kumda 0 Tabela (Sentetik/Çim Atı)`;
          delta = -4;
          color = '#ef4444';
          desc = 'Kaba kumdaki önceki yarışlarında tabelaya giremedi; safkanın sentetik veya çim performansı kaba kuma göre belirgin şekilde üstündür.';
          mismatchCount++;
        } else {
          badge = `🏟️ Kaba Kum Deneyimli (${dirtRuns > 0 ? dirtRuns + ' Koşuda ' + dirtTop4 + ' Tabela' : 'Dengeli Hat'})`;
          delta = dirtTop4 > 0 ? +2 : 0;
          color = '#f3e5ab';
          desc = 'Kaba kum pistte tecrübesi bulunuyor; yarış temposuna göre taktik konum alacaktır.';
        }
      } else {
        // GÜNÜN YARIŞI: ÇİM
        if (turfRuns >= 2 && (turfWins >= 1 || (turfTop4 / turfRuns) >= 0.5)) {
          badge = `🌿 ÇİM PİST UZMANI (Çimde ${turfWins}G / ${turfTop4} Tabela)`;
          delta = turfWins >= 2 ? +5 : +4;
          color = '#10b981';
          desc = `Çim pistte ${turfRuns} koşuda ${turfWins} galibiyet, ${turfTop4} tabela yaptı; çim aksiyonu oturmuştur.`;
        } else if (turfRuns === 0 && (dirtRuns >= 3 || synRuns >= 3)) {
          badge = `⚠️ ÇİMDE İLK KEZ: Kum / Sentetik Atı`;
          delta = -3;
          color = '#f59e0b';
          desc = 'Kariyerinde hiç çim koşusu yok, kum/sentetikten çime geçiyor.';
        } else {
          badge = `🌿 Çim Pist Uyumlu (${turfRuns} Koşuda ${turfTop4} Tabela)`;
          delta = turfTop4 > 0 ? +2 : 0;
          color = '#f3e5ab';
          desc = 'Çim pistte tecrübesi mevcut.';
        }
      }

      if (!existingPistRuns) {
        at.pist_aptitude_analizi = {
          badge,
          delta,
          color,
          desc,
          dirtStats: { runs: dirtRuns, wins: dirtWins, top4: dirtTop4 },
          synStats: { runs: synRuns, wins: synWins, top4: synTop4 },
          turfStats: { runs: turfRuns, wins: turfWins, top4: turfTop4 }
        };
      }
    });
  });
});

fs.writeFileSync(bultenPath, JSON.stringify(bulten, null, 2), 'utf8');

console.log(`✅ Zenginleştirme ve Pist Ayrımı Tamamlandı!`);
console.log(`- Genç Taylar (≤3 Koşu - Taktik Serbest): ${youngCount}`);
console.log(`- Resmî Teyitli Tecrübeli Safkanlar: ${verifiedCount}`);
console.log(`- Bilinmeyen / Fallback Safkanlar: ${fallbackCount}`);
console.log(`- 🔥 Kaba Kum Uzmanı: ${kabaKumCount}`);
console.log(`- 👑 Sentetik Uzmanı: ${sentetikCount}`);
console.log(`- ⭐ Dual-Pist Ustası (Kum & Sentetik): ${dualCount}`);
console.log(`- ⚠️ Pist Riski / Uyuşmazlığı: ${mismatchCount}`);
