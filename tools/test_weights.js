const fs = require('fs');

// Let's load analyzed_real.json or full_race_horses.json or backtest_dun.json
const fullRaces = JSON.parse(fs.readFileSync('tools/full_race_horses.json', 'utf-8'));
console.log('Testing with full races:', fullRaces.length);
fullRaces.forEach(r => {
  console.log(r.city, 'K' + r.raceNo, r.track, r.distance, 'Horses:', r.horses.length);
});
