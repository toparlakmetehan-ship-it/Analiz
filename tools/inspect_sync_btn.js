const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const p = html.indexOf('function syncTjkLiveNow');
console.log(html.substring(p, p + 800));
