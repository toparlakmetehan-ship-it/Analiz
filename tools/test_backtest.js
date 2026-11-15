const fs = require('fs');
const dun = JSON.parse(fs.readFileSync('C:/Users/DELL/Desktop/.claude/public/data/backtest_dun.json', 'utf8'));

console.log('--- Model Doğrulama ve Geçmiş Performans (14.11.2026) ---');
console.log('Toplam Koşu:', dun.toplamKosu);
console.log('Modelin 1. Sıradaki Atının Kazanması:', dun.ilk1Isabet + '/' + dun.toplamKosu + ' (%' + dun.ilk1IsabetOrani + ')');
console.log('İlk 3 İçinden Kazanma:', dun.ilk3Isabet + '/' + dun.toplamKosu + ' (%' + dun.ilk3IsabetOrani + ')');
console.log('İlk 4 Kapsamı (6\'lı Kupon Koruması):', dun.ilk4Isabet + '/' + dun.toplamKosu + ' (%' + dun.ilk4IsabetOrani + ')');
console.log('İlk 5 Kapsamı:', dun.ilk5Isabet + '/' + dun.toplamKosu + ' (%' + dun.ilk5IsabetOrani + ')');
console.log('Onaylı Güçlü Ayaklar İlk 4 İçi:', dun.onayliAyakIlk4Isabet + '/' + dun.onayliAyakSayisi + ' (%' + dun.onayliAyakIlk4IsabetOrani + ')');
console.log('Model Brier Skoru (Düşük = Yüksek Doğruluk):', dun.brier, 'Piyasa Brier:', dun.marketBrier);

// Şehirlere göre döküm
const sehirler = {};
dun.karsilastirmalar.forEach(k => {
  if (!sehirler[k.sehir]) sehirler[k.sehir] = [];
  sehirler[k.sehir].push(k);
});

console.log('--- Hipodrom Dağılımı ---');
for (const s of Object.keys(sehirler)) {
  console.log(s + ': ' + sehirler[s].length + ' Koşu');
}
