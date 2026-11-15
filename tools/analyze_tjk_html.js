const fs = require('fs');
const html = fs.readFileSync('C:/Users/DELL/Desktop/.claude/public/data/today_live_program.html', 'utf8');

const regexTable = /<table[^>]*>([\s\S]*?)<\/table>/gi;
let match;
let count = 0;
while ((match = regexTable.exec(html)) !== null) {
  count++;
  console.log('Tablo', count, 'uzunluk:', match[1].length);
}

const sehirler = ['İstanbul', 'Ankara', 'İzmir', 'Adana', 'Bursa', 'Antalya', 'Şanlıurfa', 'Diyarbakır', 'Elazığ', 'Kocaeli'];
sehirler.forEach(s => {
  if (html.includes(s)) console.log('Bulunan şehir:', s);
});

const urls = html.match(/\/TR\/YarisSever\/[^\s\"\'<>]+/g);
if (urls) {
  console.log('Bulunan endpointler:', [...new Set(urls)].slice(0, 15));
}
