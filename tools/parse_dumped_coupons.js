const fs = require('fs');

function parseCoupon(filePath, pkgName) {
  const html = fs.readFileSync(filePath, 'utf8');
  console.log(`\n======================================================`);
  console.log(`PARSING: ${pkgName}`);
  console.log(`======================================================`);

  const legBlocks = html.split('<div class="robot-leg-card');
  legBlocks.slice(1).forEach((block, idx) => {
    const legTitleMatch = block.match(/<div class="leg-title"[^>]*>([\s\S]*?)<\/div>/);
    const legCountMatch = block.match(/<span class="leg-count[^"]*"[^>]*>([\s\S]*?)<\/span>/);
    const title = legTitleMatch ? legTitleMatch[1].replace(/<[^>]+>/g, '').trim() : `Ayak ${idx+1}`;
    const count = legCountMatch ? legCountMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    
    const horseMatches = [...block.matchAll(/class="p-no">([0-9]+)<\/span>[\s\S]*?class="p-name">([^<]+)<\/span>/g)];
    const horses = horseMatches.map(m => ({ no: parseInt(m[1]), name: m[2].trim() }));
    console.log(`  ${title} [${count}]:`);
    console.log(`    Atlar: ${horses.map(h => `${h.no} ${h.name}`).join(', ')}`);
  });

  const costMatch = html.match(/<div class="c-stat-cost">[\s\S]*?<div class="v">([^<]+)/);
  if (costMatch) console.log(`  => KUPON TUTARI: ${costMatch[1].trim()}`);
}

parseCoupon('tools/coupon_output_pkg1.html', 'ADANA 1. 6\'LI GANYAN (1. - 6. Koşular)');
parseCoupon('tools/coupon_output_pkg2.html', 'ADANA 2. 6\'LI GANYAN (3. - 8. Koşular)');
