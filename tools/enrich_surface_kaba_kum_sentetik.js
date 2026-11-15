const fs = require('fs');
const path = require('path');

const bultenPath = path.join(__dirname, '..', 'public', 'data', 'bulten_bugun.json');
const bulten = JSON.parse(fs.readFileSync(bultenPath, 'utf8'));

// ══════════════════════════════════════════════════════════════════════════════════
// AYGIRLARIN KABA KUM VE SENTETİK YATKINLIK PROFİLLERİ (TJK DERECELİ AYGIR HAVUZU)
// ══════════════════════════════════════════════════════════════════════════════════
const sireProfiles = {
  // Sentetik Dominant (Polytrack / Tapeta / All-Weather uzmanı hatlar)
  'NATIVE KHAN': { bias: 'SENTETIK', text: 'Sentetik & Çim Otoritesi' },
  'TOROK': { bias: 'SENTETIK', text: 'Sentetik ve Çim Uzmanı' },
  'LUXOR': { bias: 'SENTETIK', text: 'Sentetik / Açık Koşu Çim Uzmanı' },
  'FAST \'N\' FAMOUS': { bias: 'SENTETIK', text: 'Sentetik Sprint Gücü' },
  'INVINCIBLE SPIRIT': { bias: 'SENTETIK', text: 'Sentetik / All-Weather Orijini' },
  'APPROVE': { bias: 'SENTETIK', text: 'Sentetik Sprint Yatkını' },
  // Kaba Kum Dominant (Ağır Kum, Kickback, Güç ve Çamur hattı)
  'DAREDEVIL': { bias: 'KUM', text: 'Safkan Kaba Kum Gücü' },
  'BODEMEISTER': { bias: 'KUM', text: 'Kaba Kum Güç & Dayanıklılık' },
  'TİZWAY': { bias: 'KUM', text: 'Kaba Kum Klasik Mesafe Aygırı' },
  'CUVEE': { bias: 'KUM', text: 'Kaba Kum Erken Sürat Aygırı' },
  'LION HEART': { bias: 'KUM', text: 'Kaba Kum Dayanıklı Sprint' },
  'CORINTHIAN': { bias: 'KUM', text: 'Kaba Kum Gücü Yüksek' },
  'BILGIN': { bias: 'KUM', text: 'Arap Kaba Kum Çamur Otoritesi' },
  'HABERBATUR': { bias: 'KUM', text: 'Arap Kaba Kum Güç Hattı' },
  'ÖZGÜNHAN': { bias: 'KUM', text: 'Arap Kaba Kum Otoritesi' },
  'GOBAK BEY': { bias: 'KUM', text: 'Kaba Kum Arap Güç Hattı' },
  // Dual (Hem Kaba Kumda Hem Sentetikte Yüksek Performans Verenler)
  'VICTORY GALLOP': { bias: 'DUAL', text: 'Kum & Sentetik Şampiyonu' },
  'KAIZBERT': { bias: 'DUAL', text: 'Kum ve Sentetikte Yenilmez (Arap)' },
  'PAPA CLEM': { bias: 'DUAL', text: 'Kum & Sentetik Dengeli Hat' },
  'MENDIP': { bias: 'DUAL', text: 'Kum ve Sentetikte Yüksek Form' },
  'ÖZHABER': { bias: 'DUAL', text: 'Kum & Sentetik Çift Yönlü' },
  'KANEKO': { bias: 'DUAL', text: 'Kum & Sentetik Güçlü Hat' }
};

let kabaKumCount = 0;
let sentetikCount = 0;
let dualCount = 0;
let mismatchCount = 0;
let firstTimerCount = 0;

bulten.hipodromlar.forEach(hip => {
  hip.kosular.forEach(k => {
    const raceTrack = (k.pist || '').trim(); // 'Kum', 'Sentetik', 'Çim'
    k.atlar.forEach(a => {
      const past = a.pastRaces || [];
      const sire = (a.baba || '').toUpperCase().trim();
      let sireMatch = null;
      for (const [key, val] of Object.entries(sireProfiles)) {
        if (sire.includes(key)) { sireMatch = val; break; }
      }

      let dirtRuns = 0, dirtWins = 0, dirtTop4 = 0;
      let synRuns = 0, synWins = 0, synTop4 = 0;
      let turfRuns = 0, turfWins = 0, turfTop4 = 0;

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

      let badge = '';
      let delta = 0;
      let color = '#d4af37';
      let desc = '';
      const isYoung = (past.length <= 3) || a.isYoungHorse;

      if (isYoung) {
        badge = '🌱 Pist Deneyimi: İlk 3 Koşusu (Taktik & Pist Nötr)';
        delta = 0;
        color = '#38bdf8';
        desc = 'Safkan kariyerinin başında (≤3 yarış). Pist adaptasyonu ve gidişatı henüz oturmadığı için puanı nötr tutulur.';
        firstTimerCount++;
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
            desc = `Kariyerindeki ${dirtRuns} koşunun tamamını Kaba Kumda koştu; sentetik pistin sentetik yapısına ilk kez çıkıyor, zemin değişikliği risk taşır.`;
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
          badge = `⚠️ PİST RİSKİ: SENTETİK ATI (Kaba Kuma İlk Kez Çıkıyor)`;
          delta = -5;
          color = '#ef4444';
          desc = `Kariyerindeki ${synRuns} koşuyu sentetikte koştu; kaba kumun derin kum yapısına ve önden gelen kickback'e ilk kez maruz kalacak, ciddi handikap.`;
          mismatchCount++;
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
        if (turfRuns >= 2 && (turfWins >= 1 || (turfTop4 / turfRuns) >= 0.6)) {
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

console.log('✅ KABA KUM VE SENTETİK ANALİZİ TAMAMLANDI:');
console.log('🔥 Kaba Kum Uzmanı Safkanlar:', kabaKumCount);
console.log('👑 Sentetik Uzmanı Safkanlar:', sentetikCount);
console.log('⭐ Dual-Pist Ustaları (Kum & Sentetik Çift Yönlü):', dualCount);
console.log('⚠️ Pist Uyuşmazlığı / Riski Tespit Edilenler:', mismatchCount);
console.log('🌱 Genç Taylar (≤3 Koşu Nötr Kalanlar):', firstTimerCount);

fs.writeFileSync(bultenPath, JSON.stringify(bulten, null, 2), 'utf8');
console.log('📁 bulten_bugun.json dosyası yeni Kaba Kum / Sentetik ayrımıyla kaydedildi!');
