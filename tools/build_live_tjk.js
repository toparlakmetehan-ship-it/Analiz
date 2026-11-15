const fs = require('fs');

function cleanText(str) {
  if (!str) return '';
  return str.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&#246;/g, 'ö').replace(/&#220;/g, 'Ü').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseLiveCity(filePath, sehirAdi, sehirId) {
  const html = fs.readFileSync(filePath, 'utf8');

  // Koşu üst bilgileri (Saat, Mesafe, Pist, İkramiye vb.)
  // Örn: <h3 class="race-title"> ... </h3> veya benzeri
  const kosuHeaders = [];
  const h3Regex = /<h3[^>]*>([\s\S]*?)<\/h3>/gi;
  let hmatch;
  while ((hmatch = h3Regex.exec(html)) !== null) {
    const txt = cleanText(hmatch[1]);
    if (txt.includes('Koşu')) {
      kosuHeaders.push(txt);
    }
  }

  // Koşu detay metinleri (örneğin: 1400 Kum, Şartlı 4, 3 Yaşlı İngilizler vb.)
  const raceDetails = [];
  const raceDescRegex = /<span[^>]*class=['"][^'"]*race-type[^'"]*['"][^>]*>([\s\S]*?)<\/span>/gi;
  let dmatch;
  while ((dmatch = raceDescRegex.exec(html)) !== null) {
    raceDetails.push(cleanText(dmatch[1]));
  }

  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let tmatch;
  let kosuIndex = 0;
  const races = [];

  while ((tmatch = tableRegex.exec(html)) !== null) {
    const tableHtml = tmatch[1];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rmatch;
    const rows = [];

    while ((rmatch = rowRegex.exec(tableHtml)) !== null) {
      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      let cmatch;
      const cells = [];
      while ((cmatch = cellRegex.exec(rmatch[1])) !== null) {
        cells.push(cleanText(cmatch[1]));
      }
      if (cells.length > 2) {
        rows.push(cells);
      }
    }

    if (rows.length > 1 && rows[0].some(c => c.includes('At İsmi') || c.includes('At Adı'))) {
      kosuIndex++;
      const kosuTitle = kosuHeaders[kosuIndex - 1] || `${kosuIndex}. Koşu`;
      const horses = [];

      rows.slice(1).forEach((cols, idx) => {
        // Kolon indeksleri:
        // 0: Forma, 1: N (No), 2: At İsmi, 3: Yaş, 4: Orijin(Baba-Anne), 5: Sıklet, 6: Jokey, 7: Sahip, 8: Antrenör, 9: St, 10: HP, 11: Son 6 Y, 12: KGS, 13: s20, 14: En İyi D, 15: Gny, 16: AGF
        const no = cols[1] || String(idx + 1);
        let rawName = cols[2] || '';
        // Takıları ayıkla: örn. KG, SK, DB
        const takiMatches = rawName.match(/\b(KG|SK|DB|K|GKR|ÖG|SKG|SGK)\b/g) || [];
        const nameClean = rawName.replace(/(KG|SK|DB|K|GKR|ÖG|SKG|SGK|Ring mahalinden|Kapalı gözlük|kulaklık|Dilinin bağlanacağını)[\s\S]*/i, '').trim();

        // Orijin ayrıştır: "NATIVE KHAN (FR)- KIZIL BULUT / BOSPORUS (IRE)"
        const orijin = cols[4] || '';
        let baba = '', anne = '', kisrakBabasi = '';
        if (orijin.includes('-')) {
          const parts = orijin.split('-');
          baba = parts[0].trim();
          const anneParts = (parts[1] || '').split('/');
          anne = anneParts[0].trim();
          kisrakBabasi = (anneParts[1] || '').trim();
        } else {
          baba = orijin;
        }

        const yas = cols[3] || '';
        const siklet = parseFloat((cols[5] || '56').replace(',', '.')) || 56;
        const jokeyRaw = cols[6] || '';
        const isApranti = jokeyRaw.includes('APApranti') || jokeyRaw.includes('Apranti');
        const jokey = jokeyRaw.replace(/APApranti|Apranti/g, '').trim();
        const sahip = cols[7] || '';
        const antrenor = cols[8] || '';
        const start = parseInt(cols[9]) || (idx + 1);
        const hp = parseInt(cols[10]) || 40;
        const son6 = cols[11] || '';
        const kgs = parseInt(cols[12]) || 15;
        const enIyiDerece = cols[14] ? cols[14].split(' ')[0] : '';
        const ganyan = cols[15] || '';
        const agf = cols[16] || '';

        // Safkanın türü
        const irk = yas.includes('a') || baba.includes('Ş') || anne.includes('KIZ') ? 'Arap' : 'İngiliz';

        horses.push({
          no: parseInt(no) || (idx + 1),
          isim: nameClean || `At ${no}`,
          yas,
          irk,
          baba,
          anne,
          kisrak_babasi: kisrakBabasi,
          siklet,
          jokey,
          isApranti,
          sahip,
          antrenor,
          kulvar: start,
          handikap_puani: hp,
          son_yarislar: son6,
          dinlenme_gunu: kgs,
          en_iyi_derece: enIyiDerece,
          ganyan,
          agf_orani: agf,
          takilar: takiMatches
        });
      });

      races.push({
        kosuNo: kosuIndex,
        baslik: kosuTitle,
        sehir: sehirAdi,
        atSayisi: horses.length,
        atlar: horses
      });
    }
  }

  return races;
}

const istanbulRaces = parseLiveCity('C:/Users/DELL/Desktop/.claude/public/data/istanbul_live.html', 'İstanbul', 3);
const adanaRaces = parseLiveCity('C:/Users/DELL/Desktop/.claude/public/data/adana_live.html', 'Adana', 1);

console.log(`✅ İstanbul: ${istanbulRaces.length} koşu, toplam at: ${istanbulRaces.reduce((a,c)=>a+c.atSayisi,0)}`);
console.log(`✅ Adana: ${adanaRaces.length} koşu, toplam at: ${adanaRaces.reduce((a,c)=>a+c.atSayisi,0)}`);

const liveData = {
  tarih: "15.11.2026",
  kaynak: "TJK Resmi Canlı Bülten (İstanbul Veliefendi & Adana Yeşiloba)",
  guncellemeZamani: new Date().toISOString(),
  hipodromlar: [
    {
      id: "istanbul",
      isim: "İstanbul Veliefendi Hipodromu",
      sehir: "İstanbul",
      tarih: "15.11.2026",
      kosular: istanbulRaces
    },
    {
      id: "adana",
      isim: "Adana Yeşiloba Hipodromu",
      sehir: "Adana",
      tarih: "15.11.2026",
      kosular: adanaRaces
    }
  ]
};

fs.writeFileSync('C:/Users/DELL/Desktop/.claude/public/data/live_today_tjk.json', JSON.stringify(liveData, null, 2), 'utf8');
console.log('✅ live_today_tjk.json başarıyla oluşturuldu!');
