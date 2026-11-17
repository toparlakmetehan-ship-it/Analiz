const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const targetStr = `  const btnToday = document.getElementById('btn-date-today');
  const btnTomorrow = document.getElementById('btn-date-tomorrow');
  if (btnToday) btnToday.classList.toggle('active', dateKey === 'bugun');
  if (btnTomorrow) btnTomorrow.classList.toggle('active', dateKey === 'yarin');`;

const replaceStr = `  const btnToday = document.getElementById('btn-date-today');
  const btnTomorrow = document.getElementById('btn-date-tomorrow');
  if (btnToday) btnToday.classList.toggle('active', dateKey === 'bugun');
  if (btnTomorrow) btnTomorrow.classList.toggle('active', dateKey === 'yarin');

  const rBtnToday = document.getElementById('robot-date-btn-today');
  const rBtnTomorrow = document.getElementById('robot-date-btn-tomorrow');
  const rSelArchive = document.getElementById('robot-archive-date-select');
  if (rBtnToday) rBtnToday.classList.toggle('active', dateKey === 'bugun');
  if (rBtnTomorrow) rBtnTomorrow.classList.toggle('active', dateKey === 'yarin');
  if (rSelArchive) rSelArchive.value = '';`;

if (!html.includes(targetStr)) {
  console.error('targetStr not found!');
  process.exit(1);
}
html = html.replace(targetStr, replaceStr);
fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully synced date switchers in switchProgramDate!');
