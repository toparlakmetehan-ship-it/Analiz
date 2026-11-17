const fs = require('fs');

const tutanData = JSON.parse(fs.readFileSync('public/data/tutan_altililar.json', 'utf8'));
console.log('Tutan verisi doğrulandı:', tutanData.ozetIstatistikler);
console.log('Tutan kupon sayısı:', tutanData.tutanKuponlar.length);
