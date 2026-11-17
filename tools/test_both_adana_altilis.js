const fs = require('fs');

const html = fs.readFileSync('public/index.html', 'utf8');
const scriptStart = html.indexOf('<script>');
const scriptEnd = html.lastIndexOf('</script>');
let jsCode = html.substring(scriptStart + 8, scriptEnd);

global.window = { scrollTo: () => {}, addEventListener: () => {} };
global.navigator = { serviceWorker: { register: () => Promise.resolve() } };
global.localStorage = { getItem: () => null, setItem: () => {} };

const bultenBugun = JSON.parse(fs.readFileSync('public/data/bulten_bugun.json', 'utf8'));

let lastHtml = '';
global.document = {
  addEventListener: () => {},
  getElementById: (id) => ({
    value: id === 'budget-amount' ? '3240' : (id === 'robot-hipodrom-select' ? '1' : ''),
    get innerHTML() { return lastHtml; },
    set innerHTML(v) { lastHtml = v; },
    classList: { add: () => {}, remove: () => {} },
    appendChild: () => {}
  }),
  querySelectorAll: () => [],
  createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} })
};

global.bultenData = bultenBugun;

const testRunner = `
bulten = bultenData;

const officialWinners = {
  1: { no: 4, isim: 'ALİMENDER' },
  2: { no: 5, isim: 'THUNDERSTRUCK' },
  3: { no: 8, isim: 'YARIŞ KRALİÇESİ' },
  4: { no: 2, isim: 'HYPER ROCKER' },
  5: { no: 3, isim: 'DOLCE MARE' },
  6: { no: 1, isim: 'GÖK BERK' },
  7: { no: 3, isim: 'NOBLE CREST' },
  8: { no: 4, isim: 'ANOTHER BANGER' }
};

console.log('========================================================');
console.log('TEST 1: ADANA 1. 6\\'LI GANYAN (1. - 6. KOŞULAR)');
console.log('Resmî TJK Dağıtılan İkramiye: 91.921,68 ₺');
console.log('========================================================');
currentAltiliPackage = 1;

['SINGLE_BANKO', 'CHAMPION_5YEAR', 'MAX_ACCURACY', 'MULTI_COVER'].forEach(strat => {
  currentPick6Strategy = strat;
  optimizeCoupon();
  
  // Parse horses from lastHtml
  const reLeg = /([1-6])\\. AYAK \\(([0-9]+)\\. Koşu\\)[\\s\\S]*?<span[^>]*>([0-9]+) Safkan<\\/span>[\\s\\S]*?<div class=\"picked-horses-list\">([\\s\\S]*?)<\\/div>\\s*<\\/div>/g;
  let m;
  let allLegsWon = true;
  const legDetails = [];
  
  while ((m = reLeg.exec(lastHtml)) !== null) {
    const legNum = parseInt(m[1]);
    const raceNum = parseInt(m[2]);
    const count = parseInt(m[3]);
    const inner = m[4];
    
    const reHorse = /<div class="p-horse[^"]*"[\\s\\S]*?<span class="p-no"[^>]*>([0-9]+)<\\/span>\\s*<span class="p-name"[^>]*>([\\s\\S]*?)<\\/span>/g;
    let hm;
    const picked = [];
    while ((hm = reHorse.exec(inner)) !== null) {
      const cleanName = hm[2].replace(/<[^>]+>/g, '').trim().split(/\s+/)[0];
      picked.push({ no: parseInt(hm[1]), name: cleanName });
    }
    
    const win = officialWinners[raceNum];
    const hasWon = picked.some(p => p.no === win.no);
    if (!hasWon) allLegsWon = false;
    
    legDetails.push({
      leg: legNum,
      race: raceNum,
      count: picked.length,
      winNo: win.no,
      winName: win.isim,
      hasWon: hasWon,
      pickedList: picked.map(p => p.no + ' ' + p.name).join(', ')
    });
  }
  
  const costMatch = lastHtml.match(/<div class=\"c-stat-cost\">[\\s\\S]*?<div class=\"v\">([^<]+)/);
  const costStr = costMatch ? costMatch[1].trim() : 'N/A';
  
  console.log('\\nModel: ' + strat + ' | Kupon Maliyeti: ' + costStr);
  console.log('Durum: ' + (allLegsWon ? '🏆 TUTTU (6/6 TAM İSABET)' : '❌ TUTMADI'));
  legDetails.forEach(l => {
    console.log('  Ayak ' + l.leg + ' (Koşu ' + l.race + '): ' + (l.hasWon ? '✅ VAR (' + l.winNo + ' ' + l.winName + ')' : '❌ YOK (' + l.winNo + ' ' + l.winName + ')') + ' -> Seçilenler (' + l.count + ' at): ' + l.pickedList);
  });
});

console.log('\\n========================================================');
console.log('TEST 2: ADANA 2. 6\\'LI GANYAN (3. - 8. KOŞULAR)');
console.log('Resmî TJK Dağıtılan İkramiye: 541.758,25 ₺');
console.log('========================================================');
currentAltiliPackage = 2;

['SINGLE_BANKO', 'CHAMPION_5YEAR', 'MAX_ACCURACY', 'MULTI_COVER'].forEach(strat => {
  currentPick6Strategy = strat;
  optimizeCoupon();
  
  const reLeg = /([1-6])\\. AYAK \\(([0-9]+)\\. Koşu\\)[\\s\\S]*?<span[^>]*>([0-9]+) Safkan<\\/span>[\\s\\S]*?<div class=\"picked-horses-list\">([\\s\\S]*?)<\\/div>\\s*<\\/div>/g;
  let m;
  let allLegsWon = true;
  const legDetails = [];
  
  while ((m = reLeg.exec(lastHtml)) !== null) {
    const legNum = parseInt(m[1]);
    const raceNum = parseInt(m[2]);
    const count = parseInt(m[3]);
    const inner = m[4];
    
    const reHorse = /<div class="p-horse[^"]*"[\\s\\S]*?<span class="p-no"[^>]*>([0-9]+)<\\/span>\\s*<span class="p-name"[^>]*>([\\s\\S]*?)<\\/span>/g;
    let hm;
    const picked = [];
    while ((hm = reHorse.exec(inner)) !== null) {
      const cleanName = hm[2].replace(/<[^>]+>/g, '').trim().split(/\s+/)[0];
      picked.push({ no: parseInt(hm[1]), name: cleanName });
    }
    
    const win = officialWinners[raceNum];
    const hasWon = picked.some(p => p.no === win.no);
    if (!hasWon) allLegsWon = false;
    
    legDetails.push({
      leg: legNum,
      race: raceNum,
      count: picked.length,
      winNo: win.no,
      winName: win.isim,
      hasWon: hasWon,
      pickedList: picked.map(p => p.no + ' ' + p.name).join(', ')
    });
  }
  
  const costMatch = lastHtml.match(/<div class=\"c-stat-cost\">[\\s\\S]*?<div class=\"v\">([^<]+)/);
  const costStr = costMatch ? costMatch[1].trim() : 'N/A';
  
  console.log('\\nModel: ' + strat + ' | Kupon Maliyeti: ' + costStr);
  console.log('Durum: ' + (allLegsWon ? '🏆 TUTTU (6/6 TAM İSABET)' : '❌ TUTMADI'));
  legDetails.forEach(l => {
    console.log('  Ayak ' + l.leg + ' (Koşu ' + l.race + '): ' + (l.hasWon ? '✅ VAR (' + l.winNo + ' ' + l.winName + ')' : '❌ YOK (' + l.winNo + ' ' + l.winName + ')') + ' -> Seçilenler (' + l.count + ' at): ' + l.pickedList);
  });
});
`;

eval(jsCode + '\n' + testRunner);
