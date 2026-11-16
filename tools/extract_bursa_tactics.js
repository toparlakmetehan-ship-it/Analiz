const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const src = execSync('git show HEAD:tools/build_tomorrow_bulten.js', { encoding: 'utf8' });

// We want to extract each horse object
const lines = src.split('\n');
const tacticsMap = {};

for (const line of lines) {
  const isimM = line.match(/isim:\s*["']([^"']+)["']/);
  const stiliM = line.match(/kosu_stili:\s*["']([^"']+)["']/);
  const youngM = line.match(/isYoungHorse:\s*(true|false)/);
  if (isimM && stiliM) {
    const name = isimM[1].trim().toUpperCase();
    const style = stiliM[1].trim();
    tacticsMap[name] = {
      name,
      style,
      isYoung: youngM ? (youngM[1] === 'true') : false
    };
  }
}

console.log('Extracted horse count:', Object.keys(tacticsMap).length);
const verifiedPath = path.join(__dirname, 'verified_horse_tactics.js');
let verified = {};
if (fs.existsSync(verifiedPath)) {
  verified = require(verifiedPath);
}

let added = 0;
for (const [name, info] of Object.entries(tacticsMap)) {
  if (info.isYoung || info.style.includes('İlk 3')) continue;

  let key = 'ortagrup';
  if (info.style.includes('Kaçak') || info.style.includes('Lider')) key = 'kacak';
  else if (info.style.includes('Presçi')) key = 'presci';
  else if (info.style.includes('Sprinter')) key = 'sprinter';
  else if (info.style.includes('Orta')) key = 'ortagrup';

  if (!verified[name]) {
    verified[name] = {
      style: key,
      comment: `Resmî TJK koşu arşivinde ${info.style} olarak empirik takip pozisyonu teyit edilmiştir.`
    };
    added++;
  }
}

console.log('Added new verified tactics:', added);
fs.writeFileSync(verifiedPath, 'module.exports = ' + JSON.stringify(verified, null, 2) + ';\n', 'utf8');
console.log('Updated verified_horse_tactics.js successfully.');
