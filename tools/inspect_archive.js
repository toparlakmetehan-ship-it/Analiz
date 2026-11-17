const fs = require('fs');
['public/data/real_today.json', 'public/data/real_tomorrow.json'].forEach(p => {
  if (fs.existsSync(p)) {
    const d = JSON.parse(fs.readFileSync(p, 'utf8'));
    console.log(p, 'keys:', Object.keys(d), 'hipodroms:', (d.hipodromlar || []).map(h => h.isim || h.sehir));
  }
});
