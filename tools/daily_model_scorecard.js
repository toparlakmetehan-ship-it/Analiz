/**
 * Gunluk Model Karnesi (v50)
 * public/index.html icindeki canli puanlama motorunu kullanarak arsivdeki gercek sonuclara karsi
 * Top-1 / Top-3 / Top-5 / Top-6 isabet oranlarini hesaplar ve public/data/model_scorecard.json yazar.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const rootDir = path.resolve(__dirname, '..');
const indexPath = path.join(rootDir, 'public', 'index.html');
const archivePath = path.join(rootDir, 'public', 'data', 'backtest_archive.json');
const outPath = path.join(rootDir, 'public', 'data', 'model_scorecard.json');

const html = fs.readFileSync(indexPath, 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
const mainScript = scripts.find(s => s.includes('getHorsesWithFinalTacticalScores'));

if (!mainScript) {
  console.error('getHorsesWithFinalTacticalScores bulunamadi!');
  process.exit(1);
}

const sandbox = {
  window: {},
  document: {
    getElementById: () => ({ value: '', innerHTML: '', style: {}, classList: { add: () => {}, remove: () => {}, toggle: () => {} }, addEventListener: () => {} }),
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => ({ style: {}, classList: { add: () => {} }, appendChild: () => {} }),
    addEventListener: () => {}
  },
  localStorage: { getItem: () => null, setItem: () => {} },
  navigator: { serviceWorker: { addEventListener: () => {} } },
  fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
  console,
  addEventListener: () => {},
  Math, JSON, Date, Array, Object, String, Number, Boolean, RegExp, Error, Promise,
  setTimeout: () => {}, clearTimeout: () => {}, setInterval: () => {}, clearInterval: () => {}
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(mainScript, sandbox);

const archive = fs.existsSync(archivePath) ? JSON.parse(fs.readFileSync(archivePath, 'utf8')) : {};
const dataDir = path.join(rootDir, 'public', 'data');
const bultenFiles = fs.readdirSync(dataDir).filter(f => /^bulten_\d{4}_\d{2}_\d{2}\.json$/.test(f)).sort();

let totalRaces = 0;
let top1Hits = 0;
let top3Hits = 0;
let top5Hits = 0;
let top6Hits = 0;
const daysSummary = [];

for (const file of bultenFiles) {
  const m = file.match(/^bulten_(\d{4})_(\d{2})_(\d{2})\.json$/);
  if (!m) continue;
  const iso = `${m[1]}-${m[2]}-${m[3]}`;
  const dayArchive = archive[iso];
  if (!dayArchive || !Array.isArray(dayArchive.karsilastirmalar)) continue;

  const bulten = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
  let dayRaces = 0, dayTop1 = 0, dayTop3 = 0, dayTop5 = 0, dayTop6 = 0;

  for (const kars of dayArchive.karsilastirmalar) {
    const winNo = Number(kars.kazanan && kars.kazanan.no);
    if (!winNo) continue;
    const hip = (bulten.hipodromlar || []).find(h => (h.sehir || h.isim || '').toLowerCase().includes((kars.sehir || '').toLowerCase()));
    if (!hip) continue;
    const kosu = (hip.kosular || []).find(k => Number(k.kosu_no || k.kosuNo || k.no) === Number(kars.kosuNo));
    if (!kosu || !Array.isArray(kosu.atlar) || kosu.atlar.length === 0) continue;

    const scored = sandbox.getHorsesWithFinalTacticalScores(kosu);
    const rankIdx = scored.findIndex(h => Number(h.no) === winNo);
    if (rankIdx === -1) continue;

    dayRaces++;
    totalRaces++;
    if (rankIdx === 0) { dayTop1++; top1Hits++; }
    if (rankIdx < 3) { dayTop3++; top3Hits++; }
    if (rankIdx < 5) { dayTop5++; top5Hits++; }
    if (rankIdx < 6) { dayTop6++; top6Hits++; }
  }

  if (dayRaces > 0) {
    daysSummary.push({
      tarih: iso,
      kosuSayisi: dayRaces,
      top1Oran: Number(((dayTop1 / dayRaces) * 100).toFixed(1)),
      top3Oran: Number(((dayTop3 / dayRaces) * 100).toFixed(1)),
      top5Oran: Number(((dayTop5 / dayRaces) * 100).toFixed(1)),
      top6Oran: Number(((dayTop6 / dayRaces) * 100).toFixed(1))
    });
  }
}

const scorecard = {
  modelVersiyon: 'v50',
  guncellemeZamani: new Date().toISOString(),
  toplamTestKosusu: totalRaces,
  genelOranlar: totalRaces > 0 ? {
    top1Oran: Number(((top1Hits / totalRaces) * 100).toFixed(1)),
    top3Oran: Number(((top3Hits / totalRaces) * 100).toFixed(1)),
    top5Oran: Number(((top5Hits / totalRaces) * 100).toFixed(1)),
    top6Oran: Number(((top6Hits / totalRaces) * 100).toFixed(1))
  } : null,
  gunler: daysSummary
};

fs.writeFileSync(outPath, JSON.stringify(scorecard, null, 2), 'utf8');
console.log(`Model Scorecard (v50): ${totalRaces} kosu test edildi.`);
if (scorecard.genelOranlar) {
  console.log(`Top-1: %${scorecard.genelOranlar.top1Oran} | Top-3: %${scorecard.genelOranlar.top3Oran} | Top-5: %${scorecard.genelOranlar.top5Oran} | Top-6: %${scorecard.genelOranlar.top6Oran}`);
}
