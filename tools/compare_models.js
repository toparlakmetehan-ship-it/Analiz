const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf-8');
const fullRaces = JSON.parse(fs.readFileSync('tools/full_race_horses.json', 'utf-8'));

// Test script to compare original vs calibrated pace and weight models
console.log('Total full races available for testing:', fullRaces.length);
fullRaces.forEach((r, idx) => {
  console.log(`Race ${idx+1}: ${r.city} R${r.raceNo} (${r.track} ${r.distance}m) - ${r.horses.length} horses`);
});
