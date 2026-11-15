// enrich_extra_features.js
// --------------------------------------------------
// This script adds extra contextual features to each horse record.
// Intended extra features: weather, track_type, race_time, jockey_recent_performance.
// It reads JSON files from `public/data/` (or a CSV) and writes enriched versions
// back to the same folder (or to `public/data/enriched/`).
// --------------------------------------------------
const fs = require('fs');
const path = require('path');

const dataDir = path.resolve(__dirname, '../public/data');
const outDir = path.resolve(dataDir, 'enriched');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, {recursive: true});

function randomChoice(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

const weatherOptions = ['Sunny', 'Cloudy', 'Rainy', 'Windy'];
const trackOptions = ['Grass', 'Dirt', 'Sand'];

fs.readdirSync(dataDir).forEach(file => {
  if (!file.endsWith('.json')) return;
  const fullPath = path.join(dataDir, file);
  const raw = fs.readFileSync(fullPath, 'utf8');
  let record;
  try { record = JSON.parse(raw); } catch(e) { console.error('Parse error', file); return; }

  // Add placeholder extra fields (in real use these would come from an API)
  record.weather = randomChoice(weatherOptions);
  record.track_type = randomChoice(trackOptions);
  // race_time as minutes after midnight (0‑1440)
  record.race_time = Math.floor(Math.random()*1440);
  // Dummy jockey recent performance score (0‑100)
  record.jockey_recent_performance = Math.floor(Math.random()*101);

  const outPath = path.join(outDir, file);
  fs.writeFileSync(outPath, JSON.stringify(record, null, 2), 'utf8');
});

console.log('Enrichment complete. Output written to', outDir);
