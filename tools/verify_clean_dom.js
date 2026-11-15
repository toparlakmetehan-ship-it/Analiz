const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');

const analyticaMatches = html.split('class="analytica-bars"').length - 1;
console.log('analytica-bars count in index.html (MUST BE 1):', analyticaMatches);

const bannerMatches = html.split('SON 100 GÜNÜN YARIŞLARIYLA OPTİMİZE EDİLEN BİYOMEKANİK MODEL').length - 1;
console.log('Banner count in index.html (MUST BE 2: 1 in bulten, 1 in backtest):', bannerMatches);

console.log('Old 22% banner exists (MUST BE FALSE):', html.includes('Handikap: %22'));
console.log('Old 15% galop exists (MUST BE FALSE):', html.includes('Galop Hızı: %15'));

const bultenView = html.substring(html.indexOf('<div class="view-pane active" id="bulten-view">'), html.indexOf('<div class="view-pane" id="robot-view">'));
console.log('race-curtain inside bulten-view (MUST BE TRUE):', bultenView.includes('id="race-curtain"'));
console.log('horses-grid inside bulten-view (MUST BE TRUE):', bultenView.includes('id="horses-grid"'));
