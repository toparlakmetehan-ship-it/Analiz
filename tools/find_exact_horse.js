const fs = require('fs');
const bulten = require('../public/data/bulten_bugun.json');

const html = fs.readFileSync('./public/index.html', 'utf8');
const scriptContent = html.substring(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));

const vm = require('vm');
const context = {
  bultenData: bulten,
  console: console,
  document: { getElementById: () => ({ style: {} }) },
  window: {},
  setInterval: () => {},
  clearInterval: () => {},
  setTimeout: () => {},
  clearTimeout: () => {}
};
vm.createContext(context);
vm.runInContext(scriptContent, context);

bulten.hipodromlar.forEach(hip => {
  hip.kosular.forEach(k => {
    context.enrichRaceRunningStylesAndPace(k);
    const horses = context.getHorsesWithFinalTacticalScores(k);
    horses.forEach(h => {
      if (h.rawScore === 86 && h.finalScore === 84) {
        console.log(`FOUND EXACT MATCH: [${hip.sehir} Koşu ${k.kosu_no}] #${h.no} ${h.isim}`);
      }
      if (h.rawScore === 86 || h.finalScore === 84) {
        console.log(`Candidate: [${hip.sehir} Koşu ${k.kosu_no}] #${h.no} ${h.isim} (Raw: ${h.rawScore}, Final: ${h.finalScore}, Stili: ${h.kosu_stili})`);
      }
    });
  });
});
