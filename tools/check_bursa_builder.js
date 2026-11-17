const fs = require('fs');
const content = fs.readFileSync('tools/build_tomorrow_bulten.js', 'utf8');
console.log('has DRAGON FURIOUS in build_tomorrow_bulten.js:', content.includes('DRAGON FURIOUS'));
