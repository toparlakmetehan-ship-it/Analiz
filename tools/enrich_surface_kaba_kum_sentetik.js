const fs = require('fs');
const path = require('path');

// ══════════════════════════════════════════════════════════════════════════════════
// AYGIRLAR VE KISRAK BABALARININ KABA KUM VE SENTETİK YATKINLIK PROFİLLERİ
// (TJK Resmî Dereceli & Kan Hattı Aygır Havuzu - Arap & İngiliz)
// ══════════════════════════════════════════════════════════════════════════════════
const sireProfiles = {
  // ──────────────────────────────────────────────────────────────────────────
  // 1. KABA KUM DOMİNANT (Ağır Kum, Kickback Direnci, Güç ve Çamur Hatları)
  // ──────────────────────────────────────────────────────────────────────────
  // ARAP:
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
  'BOZOK': { bias: 'KUM', text: 'Kaba Kum Güç Hattı' },
  'HISARBEY': { bias: 'KUM', text: 'Kaba Kum Güç Hattı' },
  'SAADIN GUCU': { bias: 'KUM', text: 'Kaba Kum Güç Hattı' },
  'KOSANEFE': { bias: 'KUM', text: 'Kaba Kum Güç Hattı' },
  'ANADOLUKAYA': { bias: 'KUM', text: 'Kaba Kum Hattı' },

  // İNGİLİZ:
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
  'SMARTY JONES': { bias: 'KUM', text: 'Kaba Kum Şampiyonu' },
  'YONAGUSKA': { bias: 'KUM', text: 'Kaba Kum Sürat Aygırı' },
  'PLEASANTLY PERFECT': { bias: 'KUM', text: 'Kaba Kum Klasik Mesafe' },
  'PERFECT STORM': { bias: 'KUM', text: 'Kaba Kum Sürat Hattı' },
  'PRESSING': { bias: 'KUM', text: 'Kaba Kum Güç Hattı' },
  'WIN RIVER WIN': { bias: 'KUM', text: 'Kaba Kum ve Çamur Otoritesi' },

  // ──────────────────────────────────────────────────────────────────────────
  // 2. DUAL (Hem Kaba Kumda Hem Sentetikte Çift Yönlü Güçlü Hatlar)
  // ──────────────────────────────────────────────────────────────────────────
  'VICTORY GALLOP': { bias: 'DUAL', text: 'Kum & Sentetik Şampiyonu' },
  'KAIZBERT': { bias: 'DUAL', text: 'Kum ve Sentetikte Yenilmez (Arap)' },
  'PAPA CLEM': { bias: 'DUAL', text: 'Kum & Sentetik Dengeli Hat' },
  'MENDIP': { bias: 'DUAL', text: 'Kum ve Sentetikte Yüksek Form' },
  'OZHABER': { bias: 'DUAL', text: 'Kum & Sentetik Çift Yönlü' },
  'KANEKO': { bias: 'DUAL', text: 'Kum & Sentetik Güçlü Hat' },
  'TURBO': { bias: 'DUAL', text: 'Kum & Sentetikte Üst Düzey Güç' },
  'AUTHORIZED': { bias: 'DUAL', text: 'Kum & Çim Dayanıklı Hat' },
  'SMART ROBIN': { bias: 'DUAL', text: 'Kum & Sentetik Dengeli Hat' },
  'CRIMEAN TATAR': { bias: 'DUAL', text: 'Kum & Sentetik Dengeli' },
  'TAMERINOGLU': { bias: 'DUAL', text: 'Kum & Sentetik Başarılı' },
  'GURSU': { bias: 'DUAL', text: 'Kum & Sentetik Çift Yönlü' },

  // ──────────────────────────────────────────────────────────────────────────
  // 3. SENTETİK & ÇİM DOMİNANT (Polytrack / Tapeta / Çim Uzmanı Hatlar)
  // ──────────────────────────────────────────────────────────────────────────
  'NATIVE KHAN': { bias: 'SENTETIK', text: 'Sentetik & Çim Otoritesi' },
  'TOROK': { bias: 'SENTETIK', text: 'Sentetik ve Çim Uzmanı' },
  'LUXOR': { bias: 'SENTETIK', text: 'Sentetik / Açık Koşu Çim Uzmanı' },
  'FAST \'N\' FAMOUS': { bias: 'SENTETIK', text: 'Sentetik Sprint Gücü' },
  'INVINCIBLE SPIRIT': { bias: 'SENTETIK', text: 'Sentetik / All-Weather Orijini' },
  'APPROVE': { bias: 'SENTETIK', text: 'Sentetik Sprint Yatkını' },
  'SATONO ARES': { bias: 'SENTETIK', text: 'Sentetik & Çim Japon Hattı' },
  'GENERAL QUARTERS': { bias: 'SENTETIK', text: 'Sentetik ve Çim Yatkını' },
  'POWERSCOURT': { bias: 'SENTETIK', text: 'Çim & Sentetik Uzmanı' },
  'MARCAVELLY': { bias: 'SENTETIK', text: 'Sentetik Sürat Hattı' },
  'MAXIMUS DREAM': { bias: 'SENTETIK', text: 'Sentetik ve Çim Hattı' }
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

function enrichBulletinFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const bulten = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let kabaKumCount = 0;
  let sentetikCount = 0;
  let dualCount = 0;
  let mismatchCount = 0;
  let firstTimerCount = 0;
  let kickbackExemptCount = 0;

  (bulten.hipodromlar || []).forEach(hip => {
    (hip.kosular || []).forEach(k => {
      let raceTrack = (k.pist || '').trim(); // 'Kum', 'Sentetik', 'Çim'
      // İstanbul Veliefendi Hipodromunda kaba kum yoktur, tüm kum koşuları Sentetik pisttir.
      if (hip.sehir === 'İstanbul' && raceTrack !== 'Çim') {
        raceTrack = 'Sentetik';
        k.pist = 'Sentetik';
        k.pist_tipi = 'Sentetik (Polytrack)';
      }
      (k.atlar || []).forEach(a => {
        const past = a.pastRaces || [];
        const sire = a.baba || '';
        const damSire = a.kisrak_babasi || a.kisrakBabasi || '';

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
        } else if (a.pist_aptitude_analizi) {
          const p = a.pist_aptitude_analizi;
          dirtRuns = p.dirtStats?.runs || 0;
          dirtWins = p.dirtStats?.wins || 0;
          dirtTop4 = p.dirtStats?.top4 || 0;
          synRuns = p.synStats?.runs || 0;
          synWins = p.synStats?.wins || 0;
          synTop4 = p.synStats?.top4 || 0;
          turfRuns = p.turfStats?.runs || 0;
          turfWins = p.turfStats?.wins || 0;
          turfTop4 = p.turfStats?.top4 || 0;
        }

        let badge = '';
        let delta = 0;
        let color = '#d4af37';
        let desc = '';
        const isYoung = (past.length > 0 && past.length <= 3) || a.isYoungHorse;

        if (isYoung) {
          badge = '🌱 Pist Deneyimi: İlk 3 Koşusu (Taktik & Pist Nötr)';
          delta = 0;
          color = '#38bdf8';
          desc = 'Safkan kariyerinin başında (≤3 yarış). Pist adaptasyonu ve gidişatı henüz oturmadığı için puanı nötr tutulur.';
          firstTimerCount++;
        } else if (raceTrack === 'Sentetik') {
          // GÜNÜN YARIŞI: SENTETİK PİST
          if (dirtWins >= 1 && synWins >= 1) {
            badge = `⭐ DUAL-PİST USTASI (Kum: ${dirtWins}G/${dirtTop4}T · Sentetik: ${synWins}G/${synTop4}T)`;
            delta = +2;
            color = '#34d399';
            desc = `Hem Kaba Kumda hem Sentetik pistte galibiyete sahip elit safkan; pist seçmez, sentetikte de çok diridir.`;
            dualCount++;
          } else if ((dirtWins >= 1 && synTop4 >= 2) || (synWins >= 1 && dirtTop4 >= 2)) {
            badge = `⚖️ ÇİFT PİST UYUMLU (Kum & Sentetik Formu Yüksek)`;
            delta = +1;
            color = '#34d399';
            desc = `Her iki zeminde de tabela ve galibiyet tecrübesi bulunuyor, sentetik zemine sorunsuz uyum sağlar.`;
            dualCount++;
          } else if (synRuns >= 3 && synWins >= 2 && (synTop4 / synRuns) >= 0.4) {
            badge = `👑 SENTETİK PİST UZMANI (Sentetikte ${synWins}G / ${synTop4} Tabela)`;
            delta = +2;
            color = '#10b981';
            desc = `Sentetik pistte ${synRuns} koşuda ${synWins} galibiyet, ${synTop4} tabela başarısı bulunuyor. Bu zeminde aksiyonu son derece akıcıdır.`;
            sentetikCount++;
          } else if (synRuns >= 2 && (synWins >= 1 || (synTop4 / synRuns) >= 0.5)) {
            badge = `🔥 SENTETİK PİST DENEYİMLİ (${synWins}G / ${synTop4}T)`;
            delta = +1;
            color = '#10b981';
            desc = `Sentetikte ${synRuns} koşuda ${synWins}G/${synTop4}T elde etti; sentetik zemine ayak uyumu yüksektir.`;
            sentetikCount++;
          } else if (synRuns >= 3 && synTop4 === 0 && dirtTop4 >= 2) {
            badge = `⚠️ PİST RİSKİ: KABA KUM TERCİHLİ (Sentetikte 0 Tabela)`;
            delta = -2;
            color = '#ef4444';
            desc = `Kaba kumda ${dirtRuns} koşuda ${dirtTop4} tabela yapmasına rağmen, sentetikte ${synRuns} koşuda tabelaya giremedi. Sentetik zemin aksiyonunu olumsuz etkileyebilir.`;
            mismatchCount++;
          } else if (synRuns === 0 && dirtRuns >= 3) {
            const sireSentetikOk = (sireMatch && (sireMatch.bias === 'SENTETIK' || sireMatch.bias === 'DUAL')) ||
                                   (damSireMatch && (damSireMatch.bias === 'SENTETIK' || damSireMatch.bias === 'DUAL'));
            const pedNote = sireMatch ? sireMatch.text : (damSireMatch ? damSireMatch.text : '');
            if (sireSentetikOk) {
              badge = `🌱 SENTETİKTE İLK KEZ: Soyu (${pedNote}) Sentetikle Uyumlu`;
              delta = 0;
              color = '#38bdf8';
              desc = `Kariyerinde sentetik koşusu yok ancak soyu (${pedNote}) sentetik aksiyonuna yatkındır.`;
            } else {
              badge = `⚠️ SENTETİKTE İLK KEZ: Kaba Kum Formu Var`;
              delta = -1;
              color = '#f59e0b';
              desc = `Kariyerindeki ${dirtRuns} koşunun tamamını Kaba Kumda koştu; sentetik pistin yapısına ilk kez çıkıyor, hafif adaptasyon payı ayrıldı.`;
            }
            mismatchCount++;
          } else {
            badge = `🏟️ Sentetik Pist Uyumlu (${synRuns > 0 ? synRuns + ' Koşuda ' + synTop4 + ' Tabela' : 'Dengeli Hat'})`;
            delta = synTop4 >= 2 ? +1 : 0;
            color = '#f3e5ab';
            desc = 'Sentetik pist tecrübesi mevcut; koşu sınıfına göre performansını sahaya yansıtması beklenir.';
          }
        } else if (raceTrack === 'Kum') {
          // GÜNÜN YARIŞI: KABA KUM
          if (dirtWins >= 1 && synWins >= 1) {
            badge = `⭐ DUAL-PİST USTASI (Kum: ${dirtWins}G/${dirtTop4}T · Sentetik: ${synWins}G/${synTop4}T)`;
            delta = +2;
            color = '#34d399';
            desc = `Hem Kaba Kumda hem Sentetikte galibiyet yapmış çok yönlü safkan; pist şartı seçmeksizin yüksek performans sergiler.`;
            dualCount++;
          } else if ((dirtWins >= 1 && synTop4 >= 2) || (synWins >= 1 && dirtTop4 >= 2)) {
            badge = `⚖️ ÇİFT PİST UYUMLU (Kum & Sentetik Formu Yüksek)`;
            delta = +1;
            color = '#34d399';
            desc = `Her iki zeminde de tabela ve galibiyet başarısı var, ağır kumda da etkili koşması beklenir.`;
            dualCount++;
          } else if (dirtRuns >= 3 && dirtWins >= 2 && (dirtTop4 / dirtRuns) >= 0.4) {
            badge = `🔥 KABA KUM UZMANI (Kumda ${dirtWins}G / ${dirtTop4} Tabela)`;
            delta = +2;
            color = '#10b981';
            desc = `Kaba kumda ${dirtRuns} koşuda ${dirtWins} galibiyet, ${dirtTop4} tabela elde etti. Ağır kum ve kickback altında mücadele gücü çok yüksektir.`;
            kabaKumCount++;
          } else if (dirtRuns >= 2 && (dirtWins >= 1 || (dirtTop4 / dirtRuns) >= 0.5)) {
            badge = `🔥 KABA KUM DENEYİMLİ (${dirtWins}G / ${dirtTop4}T)`;
            delta = +1;
            color = '#10b981';
            desc = `Kaba kumda ${dirtRuns} koşuda ${dirtWins}G/${dirtTop4}T elde etti, zemin şartlarına aşinadır.`;
            kabaKumCount++;
          } else if (dirtRuns === 0 && synRuns >= 3) {
            // ══════════════════════════════════════════════════════════════════════════
            // SENTETİKTEN KABA KUMA İLK KEZ GEÇİŞ:
            // PEDİGREE (AYGIR / KISRAK BABASI) VE KOŞU STİLİ (KICKBACK MUAFİYETİ)
            // ══════════════════════════════════════════════════════════════════════════
            const styleStr = (a.kosu_stili || a.stil || '').toLowerCase();
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
              kickbackExemptCount++;
            } else if (hasKumPedigree && isPres) {
              badge = `🛡️ KABA KUMA İLK KEZ (Kum Orijinli & Ön Grup Pres)`;
              delta = 0;
              color = '#38bdf8';
              desc = `Kariyerindeki ${synRuns} koşuyu sentetikte koştu; soyunda (${pedNote}) kaba kum gücü mevcut. Ön grupta pres yapacağı için kickback etkisi önemsizdir.`;
              kickbackExemptCount++;
            } else if (hasKumPedigree) {
              badge = `⚠️ KABA KUMA İLK KEZ (Kum Orijinli - Geride Kickback Riski)`;
              delta = -1;
              color = '#f59e0b';
              desc = `Soyunda (${pedNote}) kaba kum genetiği mevcut ancak bekleme/sprinter stili nedeniyle ön gruptan sıçrayacak kum parçalarına (kickback) ilk kez maruz kalacaktır.`;
              mismatchCount++;
            } else if (isKacak) {
              badge = `⚠️ KABA KUMA İLK KEZ (Kaçak Stille Kickback Yok / Derin Kum Testi)`;
              delta = -1;
              color = '#f59e0b';
              desc = `Soyunda kaba kum baskınlığı sınırlı. Kaçak stiliyle kickback yemeyecek olsa da kaba kumun derin yapısına ilk kez ayak uydurmaya çalışacaktır.`;
              mismatchCount++;
            } else {
              badge = `⚠️ PİST RİSKİ: SENTETİK ATI (Kaba Kuma İlk Kez Çıkıyor)`;
              delta = -2;
              color = '#ef4444';
              desc = `Kariyerindeki ${synRuns} koşuyu sentetikte koştu; kaba kumun derin yapısına ve geriden gelirken önden sıçrayacak kum parçalarına (kickback) ilk kez maruz kalacaktır.`;
              mismatchCount++;
            }
          } else if (dirtRuns >= 3 && dirtTop4 === 0 && (synTop4 >= 2 || turfTop4 >= 2)) {
            badge = `⚠️ PİST UYARISI: Kaba Kumda 0 Tabela (Sentetik/Çim Atı)`;
            delta = -2;
            color = '#ef4444';
            desc = 'Kaba kumdaki önceki yarışlarında tabelaya giremedi; safkanın sentetik veya çim performansı kaba kuma göre belirgin şekilde üstündür.';
            mismatchCount++;
          } else {
            badge = `🏟️ Kaba Kum Deneyimli (${dirtRuns > 0 ? dirtRuns + ' Koşuda ' + dirtTop4 + ' Tabela' : 'Dengeli Hat'})`;
            delta = dirtTop4 >= 2 ? +1 : 0;
            color = '#f3e5ab';
            desc = 'Kaba kum pistte tecrübesi bulunuyor; yarış temposuna göre taktik konum alacaktır.';
          }
        } else {
          // GÜNÜN YARIŞI: ÇİM
          if (turfRuns >= 3 && turfWins >= 2 && (turfTop4 / turfRuns) >= 0.5) {
            badge = `🌿 ÇİM PİST UZMANI (Çimde ${turfWins}G / ${turfTop4} Tabela)`;
            delta = +2;
            color = '#10b981';
            desc = `Çim pistte ${turfRuns} koşuda ${turfWins} galibiyet, ${turfTop4} tabela yaptı; çim aksiyonu oturmuştur.`;
          } else if (turfRuns >= 2 && (turfWins >= 1 || (turfTop4 / turfRuns) >= 0.5)) {
            badge = `🌿 ÇİM PİST DENEYİMLİ (${turfWins}G / ${turfTop4}T)`;
            delta = +1;
            color = '#10b981';
            desc = `Çim pistte ${turfRuns} koşuda ${turfWins}G/${turfTop4}T elde etti, zemine aşinadır.`;
          } else if (turfRuns === 0 && (dirtRuns >= 3 || synRuns >= 3)) {
            badge = `⚠️ ÇİMDE İLK KEZ: Kum / Sentetik Atı`;
            delta = -1;
            color = '#f59e0b';
            desc = 'Kariyerinde hiç çim koşusu yok, kum/sentetikten çime geçiyor.';
          } else {
            badge = `🌿 Çim Pist Uyumlu (${turfRuns} Koşuda ${turfTop4} Tabela)`;
            delta = turfTop4 >= 2 ? +1 : 0;
            color = '#f3e5ab';
            desc = 'Çim pistte tecrübesi mevcut.';
          }
        }

        a.pist_aptitude_analizi = {
          badge,
          delta,
          color,
          desc,
          dirtStats: { runs: dirtRuns, wins: dirtWins, top4: dirtTop4 },
          synStats: { runs: synRuns, wins: synWins, top4: synTop4 },
          turfStats: { runs: turfRuns, wins: turfWins, top4: turfTop4 }
        };
      });
    });
  });

  fs.writeFileSync(filePath, JSON.stringify(bulten, null, 2), 'utf8');
  console.log(`📁 ${path.basename(filePath)} güncellendi:`);
  console.log(`   - Kaba Kum Uzmanı: ${kabaKumCount}`);
  console.log(`   - Sentetik Uzmanı: ${sentetikCount}`);
  console.log(`   - Dual-Pist Ustası: ${dualCount}`);
  console.log(`   - 🛡️ Kickback Muafiyeti / Kum Orijinli Geçiş: ${kickbackExemptCount}`);
  console.log(`   - ⚠️ Pist Riski / Uyuşmazlığı: ${mismatchCount}`);
  console.log(`   - 🌱 Genç Taylar (Nötr): ${firstTimerCount}`);
}

// bulten_bugun.json, bulten_yarin.json ve bulten_dun.json dosyalarını işle
const bultenBugun = path.join(__dirname, '..', 'public', 'data', 'bulten_bugun.json');
const bultenYarin = path.join(__dirname, '..', 'public', 'data', 'bulten_yarin.json');
const bultenDun = path.join(__dirname, '..', 'public', 'data', 'bulten_dun.json');

console.log('════════════════════════════════════════════════════════════════════════════');
console.log('🏇 AKILLI PİST & ORİJİN & KICKBACK KALİBRASYON MOTORU ÇALIŞTIRILIYOR');
console.log('════════════════════════════════════════════════════════════════════════════');
if (fs.existsSync(bultenBugun)) enrichBulletinFile(bultenBugun);
if (fs.existsSync(bultenYarin)) enrichBulletinFile(bultenYarin);
if (fs.existsSync(bultenDun)) enrichBulletinFile(bultenDun);
