const fs = require('fs');
const path = require('path');

// 1. Audit bulten_bugun.json
const bugun = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));
console.log('=== AUDITING BULTEN_BUGUN.JSON ===');
let bugunTotal = 0, bugunYoung = 0, bugunExp = 0, bugunErrors = [];

bugun.hipodromlar.forEach(hip => {
  hip.kosular.forEach(k => {
    k.atlar.forEach(a => {
      bugunTotal++;
      const pastClean = (a.son_yarislar || '').replace(/[^0-9]/g, '');
      const careerCount = a.careerSummary?.toplamKosu;
      const isYoung = a.isYoungHorse || a.isFirstTimeStarter || (typeof careerCount === 'number' && careerCount <= 3) || pastClean.length <= 3;
      
      if (isYoung) {
        bugunYoung++;
        if (a.kosu_stili !== 'Taktik Serbest (İlk 3 Koşusu)') {
          bugunErrors.push(`[BUGUN ERROR - YOUNG] ${hip.sehir} K${k.kosu_no} No ${a.no} ${a.isim}: Career ${careerCount || pastClean.length} races but style is '${a.kosu_stili}'`);
        }
      } else {
        bugunExp++;
        if (a.kosu_stili === 'Taktik Serbest (İlk 3 Koşusu)') {
          bugunErrors.push(`[BUGUN ERROR - EXP] ${hip.sehir} K${k.kosu_no} No ${a.no} ${a.isim}: Career ${careerCount || pastClean.length} races (>3) but style is 'Taktik Serbest'`);
        }
      }
    });
  });
});

console.log(`Bugün Total: ${bugunTotal}, Genç (<=3): ${bugunYoung}, Tecrübeli (>3): ${bugunExp}`);
console.log(`Bugün Hataları (${bugunErrors.length}):`, bugunErrors);

// 2. Audit bulten_yarin.json
const yarin = JSON.parse(fs.readFileSync('public/data/bulten_yarin.json', 'utf8'));
console.log('\n=== AUDITING BULTEN_YARIN.JSON ===');
let yarinTotal = 0, yarinYoung = 0, yarinExp = 0, yarinErrors = [];

yarin.hipodromlar.forEach(hip => {
  hip.kosular.forEach(k => {
    k.atlar.forEach(a => {
      yarinTotal++;
      const pastClean = (a.son_yarislar || '').replace(/[^0-9]/g, '');
      const careerCount = a.careerSummary?.toplamKosu;
      const isYoung = a.isYoungHorse || a.isFirstTimeStarter || (typeof careerCount === 'number' && careerCount <= 3) || pastClean.length <= 3;
      
      if (isYoung) {
        yarinYoung++;
        if (a.kosu_stili !== 'Taktik Serbest (İlk 3 Koşusu)') {
          yarinErrors.push(`[YARIN ERROR - YOUNG] ${hip.sehir} K${k.kosu_no} No ${a.no} ${a.isim}: Career ${careerCount || pastClean.length} races but style is '${a.kosu_stili}'`);
        }
      } else {
        yarinExp++;
        if (a.kosu_stili === 'Taktik Serbest (İlk 3 Koşusu)') {
          yarinErrors.push(`[YARIN ERROR - EXP] ${hip.sehir} K${k.kosu_no} No ${a.no} ${a.isim}: Career ${careerCount || pastClean.length} races (>3) but style is 'Taktik Serbest'`);
        }
      }
    });
  });
});

console.log(`Yarın Total: ${yarinTotal}, Genç (<=3): ${yarinYoung}, Tecrübeli (>3): ${yarinExp}`);
console.log(`Yarın Hataları (${yarinErrors.length}):`, yarinErrors);
