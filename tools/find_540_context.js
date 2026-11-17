const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
let p = 0;
while ((p = html.indexOf('540', p)) !== -1) {
  console.log('Pos:', p);
  console.log(html.substring(p - 60, p + 120));
  p += 3;
}
