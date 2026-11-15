const fs = require('fs');
const bulten = JSON.parse(fs.readFileSync('C:/Users/DELL/Desktop/.claude/public/data/bulten_bugun.json', 'utf8'));

const TJK_RATES = {
  getBirimFiyat: function(sehirName) {
    const s = (sehirName || '').toLowerCase();
    if (s.includes('şanlıurfa') || s.includes('urfa') || s.includes('diyarbakır') || s.includes('elazığ')) {
      return { birimFiyat: 1.00, bolge: 'Güneydoğu / Doğu', minKupon: 20.00 };
    }
    if (s.includes('abd') || s.includes('yurtdisi') || s.includes('fransa') || s.includes('ingiltere') || s.includes('avustralya') || s.includes('malezya') || s.includes('güney afrika')) {
      return { birimFiyat: 1.00, bolge: 'Yurt Dışı', minKupon: 20.00 };
    }
    // İstanbul, Ankara, İzmir, Adana, Bursa, Kocaeli, Antalya
    return { birimFiyat: 1.25, bolge: 'Batı / Büyük Hipodromlar', minKupon: 20.00 };
  }
};

bulten.hipodromlar.forEach(h => {
  const info = TJK_RATES.getBirimFiyat(h.sehir || h.isim);
  console.log(h.isim + ' (' + h.sehir + ') -> Birim: ' + info.birimFiyat + ' TL | Bölge: ' + info.bolge + ' | Min Kupon: ' + info.minKupon + ' TL');
});
