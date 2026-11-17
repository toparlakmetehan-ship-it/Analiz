const fs = require('fs');
const vm = require('vm');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const jsCode = scriptMatch[1];
const bultenNov15 = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'bulten_2026_11_15.json'), 'utf8'));

const dom = {
  elements: {
    'robot-hipodrom-select': { value: '0' },
    'budget-amount': { value: '3240' }
  },
  getElementById(id) {
    if (!this.elements[id]) {
      this.elements[id] = { value: '', innerText: '', innerHTML: '', style: {}, classList: { add: ()=>{}, remove: ()=>{} }, appendChild: ()=>{} };
    }
    return this.elements[id];
  },
  querySelectorAll: () => []
};

const sandbox = {
  document: dom,
  window: { addEventListener: ()=>{}, scrollTo: ()=>{} },
  navigator: { serviceWorker: { register: ()=>Promise.resolve(), addEventListener: ()=>{} } },
  console,
  setTimeout: ()=>{}, setInterval: ()=>{}
};

vm.createContext(sandbox);
vm.runInContext(jsCode, sandbox);
vm.runInContext('bulten = ' + JSON.stringify(bultenNov15), sandbox);

const hipIdx = bultenNov15.hipodromlar.findIndex(h => h.sehir.toLowerCase().includes('adana'));
dom.elements['robot-hipodrom-select'].value = String(hipIdx);
dom.elements['budget-amount'].value = '3240';

vm.runInContext('currentAltiliPackage = 2', sandbox);
vm.runInContext('currentPick6Strategy = "CHAMPION_5YEAR"', sandbox);

const result = vm.runInContext(`
  (() => {
    const hip = bulten.hipodromlar[${hipIdx}];
    const allKosular = hip.kosular;
    const kosular = allKosular.slice(2); // 3. - 8. kosular
    enrichBultenRunningStylesAndPace(bulten);

    const ratedLegs = kosular.map((k, idx) => {
      const scored = getHorsesWithFinalTacticalScores(k);
      const topDiff = scored.length > 1 ? (scored[0].royalScore - scored[1].royalScore) : 25;
      return {
        legIndex: idx + 1,
        realRaceNum: idx + 3,
        horses: scored,
        diff: topDiff,
        sinif: k.grup_sinifi
      };
    });

    const sortedByCertainty = [...ratedLegs].sort((a, b) => b.diff - a.diff);
    const qualifiedBankoCandidates = sortedByCertainty.filter(l => {
      const topH = l.horses[0];
      const isPistMismatch = (topH?.pist_aptitude_analizi?.delta < 0);
      const isHandikap = (l.sinif || '').toLowerCase().includes('handikap');
      return l.diff >= 4 && (topH?.royalScore >= 80) && !isPistMismatch && !isHandikap;
    });

    return {
      ratedLegs: ratedLegs.map(l => ({
        leg: l.legIndex,
        race: l.realRaceNum,
        diff: l.diff,
        top1: l.horses[0].isim + ' (' + l.horses[0].royalScore + 'P)',
        top2: l.horses[1].isim + ' (' + l.horses[1].royalScore + 'P)'
      })),
      bankoCandidates: qualifiedBankoCandidates.map(c => ({ leg: c.legIndex, race: c.realRaceNum, diff: c.diff }))
    };
  })()
`, sandbox);

console.log(JSON.stringify(result, null, 2));
