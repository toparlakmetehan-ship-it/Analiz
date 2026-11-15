const fs = require('fs');

function parseTjkHtml(filePath, sehirAdi) {
  const html = fs.readFileSync(filePath, 'utf8');
  console.log(`Analyzing ${sehirAdi}, html size: ${html.length}`);

  // Kosu başlıklarını ve at tablolarını regex ile parse edelim
  // TJK formatında tablolar class="table" veya id bazlı olur
  // Koşu bilgisi: saat, mesafe, pist vb.
  const races = [];

  // Kosu kartlarını veya bloklarını ara
  // TJK'da genellikle <div class="panes"> veya her koşu için ayrı tablo/div bulunur
  const kosuRegex = /<h3[^>]*>([\s\S]*?)<\/h3>/gi;
  let kmatch;
  const titles = [];
  while ((kmatch = kosuRegex.exec(html)) !== null) {
    const t = kmatch[1].replace(/<[^>]+>/g, '').trim();
    if (t.includes('Koşu') || t.includes('Saat') || t.includes('Ganyan')) {
      titles.push(t);
    }
  }
  console.log(`${sehirAdi} Koşu Başlıkları (${titles.length}):`, titles.slice(0, 5));

  // Tabloları bul
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  let tmatch;
  let tableIdx = 0;
  while ((tmatch = tableRegex.exec(html)) !== null) {
    tableIdx++;
    const tableHtml = tmatch[1];
    
    // Satırları çek
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rmatch;
    const rows = [];
    while ((rmatch = rowRegex.exec(tableHtml)) !== null) {
      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      let cmatch;
      const cells = [];
      while ((cmatch = cellRegex.exec(rmatch[1])) !== null) {
        cells.push(cmatch[1].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim());
      }
      if (cells.length > 2) {
        rows.push(cells);
      }
    }

    if (rows.length > 2) {
      // Başlık satırı genelde 'At İsmi', 'Yaş', 'Kilo', 'Jokey' içerir
      const isRaceTable = rows[0].some(c => c.includes('At İsmi') || c.includes('At Adı') || c.includes('Jokey') || c.includes('Derece'));
      if (isRaceTable) {
        console.log(`Table ${tableIdx} is a RACE TABLE! Header:`, rows[0].join(' | '));
        console.log(`First horse:`, rows[1].join(' | '));
        races.push({
          header: rows[0],
          horses: rows.slice(1)
        });
      }
    }
  }

  console.log(`${sehirAdi} bulunan koşu tablosu sayısı: ${races.length}`);
  return races;
}

parseTjkHtml('C:/Users/DELL/Desktop/.claude/public/data/istanbul_live.html', 'İstanbul');
parseTjkHtml('C:/Users/DELL/Desktop/.claude/public/data/adana_live.html', 'Adana');
