const fs = require('fs');
const html = fs.readFileSync('C:/Users/DELL/Desktop/.claude/public/data/today_live_program.html', 'utf8');

const match = html.match(/<ul[^>]*class=['"][^'"]*gunluk-tabs[^'"]*['"][^>]*>([\s\S]*?)<\/ul>/i);
if (match) {
  console.log('--- gunluk-tabs içeriği: ---');
  console.log(match[1]);
}

const formMatch = html.match(/<form[^>]*class=['"][^'"]*query[^'"]*['"][^>]*>([\s\S]*?)<\/form>/i);
if (formMatch) {
  console.log('--- form.query içeriği (ilk 800 karakter): ---');
  console.log(formMatch[1].slice(0, 800));
}

// Şehir bağlantılarını ara (a href="/TR/YarisSever/...")
const links = html.match(/<a[^>]*href=['"]([^'"]*)['"][^>]*>([\s\S]*?)<\/a>/gi) || [];
console.log('Toplam link sayısı:', links.length);
const hipodromLinks = links.filter(l => l.includes('SehirId') || l.includes('GunlukYarisProgrami') || l.includes('Tarih'));
console.log('Hipodrom / Günlük Yarış Programı linkleri:');
hipodromLinks.forEach(l => console.log(l));
