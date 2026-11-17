const tactics = require('./verified_horse_tactics.js');
const experienced = require('./experienced_horses.json');

const mapped = Object.keys(tactics);
console.log('Total verified mapped horses in tactics dictionary:', mapped.length);
console.log('Total experienced horses in bulletin:', experienced.length);

const missing = experienced.filter(h => !tactics[h.name.toUpperCase().trim()]);
console.log('Missing count:', missing.length);
if (missing.length > 0) {
  console.log('Missing horses:', missing.map(m => m.city + ' K' + m.raceNo + ' #' + m.horseNo + ' ' + m.name));
}
