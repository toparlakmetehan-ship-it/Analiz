const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const sIdx = html.indexOf('<script>');
const eIdx = html.lastIndexOf('</script>');

if (sIdx === -1 || eIdx === -1) {
  console.error('Script tags not found!');
  process.exit(1);
}

const scriptContent = html.substring(sIdx + 8, eIdx);
console.log('Script length:', scriptContent.length);

try {
  // Test syntax by parsing with Function constructor or vm
  const vm = require('vm');
  const script = new vm.Script(scriptContent);
  console.log('VM Script successfully compiled! Zero syntax errors.');
} catch(e) {
  console.error('Syntax error in index.html script:', e);
  process.exit(1);
}
