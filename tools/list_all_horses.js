const fs = require('fs');
const bulten = require('../public/data/bulten_bugun.json');
console.log('Hipodromlar count:', (bulten.hipodromlar || []).length);
bulten.hipodromlar.forEach(hip => {
  console.log(hip.sehir, 'Kosular:', hip.kosular.length);
  hip.kosular.forEach(k => {
    k.atlar.forEach(a => {
      console.log(`[${hip.sehir} K${k.kosu_no} #${a.no} ${a.isim}]`);
    });
  });
});
