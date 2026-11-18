const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf-8');
const bugun = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));
const yarin = JSON.parse(fs.readFileSync('public/data/bulten_yarin.json', 'utf8'));

// Extract runtime functions from public/index.html
const pDrawMatch = html.match(/function calculate10YearDrawBiasScore[\s\S]*?\n\}/);
const pIndexMatch = html.match(/function calculatePowerIndex[\s\S]*?\n\}/);
const pAdjMatch = html.match(/function calculatePaceAdjustment[\s\S]*?\n\}/);
const pEstMatch = html.match(/function estimateRacePace[\s\S]*?\n\}/);
const pYoungMatch = html.match(/function isYoungInexperiencedHorse[\s\S]*?\n\}/);
const pHpMatch = html.match(/function getEffectiveHandicap[\s\S]*?\n\}/);

const fn = new Function('bulten', 'label', 
  pYoungMatch[0] + '\n' + 
  pHpMatch[0] + '\n' + 
  (pDrawMatch ? pDrawMatch[0] : '') + '\n' + 
  pEstMatch[0] + '\n' + 
  pIndexMatch[0] + '\n' + 
  pAdjMatch[0] + '\n' + `
  let violations = [];
  let kacakCount = 0, prescikCount = 0, ortaCount = 0, sprintCount = 0, youngCount = 0;
  
  bulten.hipodromlar.forEach(hip => {
    hip.kosular.forEach(k => {
      const pace = estimateRacePace(k);
      k.atlar.forEach(a => {
        const isYoung = isYoungInexperiencedHorse(a) || a.isYoungHorse;
        const power = calculatePowerIndex(a, k.atlar, k);
        const adj = calculatePaceAdjustment(a, k);

        if (isNaN(power.royalScore) || isNaN(adj.delta)) {
          violations.push(\`[NaN Error] \${hip.sehir} K\${k.kosu_no} No \${a.no} \${a.isim}: Royal=\${power.royalScore}, Adj=\${adj.delta}\`);
        }
        if (isNaN(power.trackScore) || power.trackScore < 40 || power.trackScore > 99) {
          violations.push(\`[Kulvar Error] \${hip.sehir} K\${k.kosu_no} No \${a.no} \${a.isim}: TrackScore=\${power.trackScore}\`);
        }
        if (a.handikap_puani === 0 && power.handikapScore > 60) {
          violations.push(\`[Handikap 0 Error] \${hip.sehir} K\${k.kosu_no} No \${a.no} \${a.isim}: hp=0 but handikapScore=\${power.handikapScore}\`);
        }

        if (isYoung) {
          youngCount++;
          if (adj.delta !== 0) {
            violations.push(\`[Young Delta Error] \${hip.sehir} K\${k.kosu_no} No \${a.no} \${a.isim}: Inexperienced but delta=\${adj.delta}\`);
          }
        } else {
          if (a.kosu_stili.includes('Kaçak')) kacakCount++;
          else if (a.kosu_stili.includes('Pres')) prescikCount++;
          else if (a.kosu_stili.includes('Orta')) ortaCount++;
          else if (a.kosu_stili.includes('Sprinter')) sprintCount++;
        }
      });
    });
  });

  console.log(\`=== \${label} RUNTIME VERIFICATION ===\`);
  console.log(\`Genç Safkanlar (Taktik Serbest - Delta 0): \${youngCount}\`);
  console.log(\`Tecrübeli Dağılım: Kaçak: \${kacakCount}, Presçi: \${prescikCount}, Orta Grup: \${ortaCount}, Sprinter: \${sprintCount}\`);
  console.log(\`Hatalar / İhlaller (\${violations.length}):\`, violations);
  return violations.length === 0;
`);

const bugunOk = fn(bugun, `BUGÜN (${bugun.tarih})`);
const yarinOk = fn(yarin, `YARIN (${yarin.tarih})`);

console.log('\nAudit Result: Bugun OK?', bugunOk, '| Yarin OK?', yarinOk);
