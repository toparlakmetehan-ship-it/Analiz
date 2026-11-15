// generate_synthetic_horses.js
// --------------------------------------------------
// Generates N synthetic horse records in `public/data/`.
// Each record contains fields required by train_model.py:
//   horse_id, name, finish_time, weight, jockey, track, distance
// The script writes each record as a separate <id>.json file.
// --------------------------------------------------
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.resolve(__dirname, '../public/data');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, {recursive: true});

const NUM = 200; // number of synthetic horses
const tracks = ['Grass', 'Dirt', 'Sand'];
const jockeys = ['Joker1','Joker2','Joker3','Joker4','Joker5'];

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randChoice(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

for (let i=1; i<=NUM; i++) {
  const record = {
    horse_id: `H${String(i).padStart(4,'0')}`,
    name: `Horse_${i}`,
    // Simulated finish time (seconds) for typical distances 1000-2000m
    finish_time: parseFloat((randInt(70,120) + Math.random()).toFixed(2)),
    weight: randInt(380,560),
    jockey: randChoice(jockeys),
    track: randChoice(tracks),
    distance: randInt(1000,2000)
  };
  const filePath = path.join(OUT_DIR, `${record.horse_id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(record, null, 2), 'utf8');
}

console.log(`Generated ${NUM} synthetic horse records in ${OUT_DIR}`);
