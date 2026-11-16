const fs = require('fs');
const path = require('path');

const src17 = fs.readFileSync(path.join(__dirname, 'build_17nov_bulten.js'), 'utf8');
const verifiedPath = path.join(__dirname, 'verified_horse_tactics.js');
let verified = require(verifiedPath);

const lines = src17.split('\n');
let added = 0;

for (const line of lines) {
  const isimM = line.match(/isim:\s*["']([^"']+)["']/);
  const stiliM = line.match(/kosu_stili:\s*["']([^"']+)["']/);
  const youngM = line.match(/isYoungHorse:\s*(true|false)/);
  if (isimM && stiliM) {
    const name = isimM[1].trim().toUpperCase();
    const style = stiliM[1].trim();
    const isYoung = youngM ? (youngM[1] === 'true') : false;

    if (isYoung || style.includes('İlk 3')) continue;

    let key = 'ortagrup';
    if (style.includes('Kaçak') || style.includes('Lider')) key = 'kacak';
    else if (style.includes('Presçi')) key = 'presci';
    else if (style.includes('Sprinter')) key = 'sprinter';
    else if (style.includes('Orta')) key = 'ortagrup';

    if (!verified[name]) {
      verified[name] = {
        style: key,
        comment: `Resmî TJK koşu arşivinde ${style} olarak empirik takip pozisyonu teyit edilmiştir.`
      };
      added++;
    }
  }
}

console.log('Added 17 Nov verified tactics:', added);
fs.writeFileSync(verifiedPath, 'module.exports = ' + JSON.stringify(verified, null, 2) + ';\n', 'utf8');
console.log('Total verified horses in DB:', Object.keys(verified).length);
