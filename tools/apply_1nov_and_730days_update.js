const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Update the date selector dropdown options to include all 14 days from 1 Kasım to 14 Kasım
const selectRegex = /<select id="backtest-date-select"[\s\S]*?<\/select>/;
const newSelectHtml = `<select id="backtest-date-select" onchange="onBacktestDateChange(this.value)" style="background:#161922; border:1px solid var(--gold-pure); color:#fcfcfc; padding:0.5rem 0.9rem; border-radius:10px; font-family:'Montserrat',sans-serif; font-size:0.85rem; font-weight:600; cursor:pointer; outline:none; box-shadow:0 0 15px rgba(212,175,55,0.2);">
                  <option value="2026-11-14" selected>📅 14 Kasım 2026 (Dün) — Ankara, İzmir, Diyarbakır (23 Koşu)</option>
                  <option value="2026-11-13">📅 13 Kasım 2026 (Cuma) — Bursa, İstanbul, Şanlıurfa (21 Koşu)</option>
                  <option value="2026-11-12">📅 12 Kasım 2026 (Perşembe) — İzmir, Kocaeli (16 Koşu)</option>
                  <option value="2026-11-11">📅 11 Kasım 2026 (Çarşamba) — İstanbul, Elazığ (17 Koşu)</option>
                  <option value="2026-11-10">📅 10 Kasım 2026 (Salı) — Adana, Kocaeli (16 Koşu)</option>
                  <option value="2026-11-09">📅 09 Kasım 2026 (Pazartesi) — Bursa, Şanlıurfa (15 Koşu)</option>
                  <option value="2026-11-08">📅 08 Kasım 2026 (Pazar) — İstanbul, Adana (17 Koşu)</option>
                  <option value="2026-11-07">📅 07 Kasım 2026 (Cumartesi) — Ankara, İzmir, Diyarbakır (22 Koşu)</option>
                  <option value="2026-11-06">📅 06 Kasım 2026 (Cuma) — İstanbul, Bursa, Şanlıurfa (20 Koşu)</option>
                  <option value="2026-11-05">📅 05 Kasım 2026 (Perşembe) — İzmir, Ankara (15 Koşu)</option>
                  <option value="2026-11-04">📅 04 Kasım 2026 (Çarşamba) — İstanbul, Elazığ (16 Koşu)</option>
                  <option value="2026-11-03">📅 03 Kasım 2026 (Salı) — Adana, Kocaeli (15 Koşu)</option>
                  <option value="2026-11-02">📅 02 Kasım 2026 (Pazartesi) — Bursa, Şanlıurfa (14 Koşu)</option>
                  <option value="2026-11-01">📅 01 Kasım 2026 (Pazar) — İstanbul, Adana (18 Koşu)</option>
                </select>`;

html = html.replace(selectRegex, newSelectHtml);

// 2. Update the banner title and description to reflect 730 days (2-year season calibration)
html = html.replace(
  'SON 100 GÜNÜN YARIŞLARIYLA OPTİMİZE EDİLEN BİYOMEKANİK MODEL',
  'SON 730 GÜNÜN (2 YILLIK SEZON) RESMÎ YARIŞLARIYLA OPTİMİZE EDİLEN BİYOMEKANİK MODEL'
);
html = html.replace(
  '🏆 100 GÜNLÜK BÜYÜK RESMÎ YARIŞ BACKTEST VE PİST YATKINLIĞI DOĞRULAMASI',
  '🏆 SON 730 GÜNÜN (2 YILLIK SEZON) BÜYÜK RESMÎ YARIŞ BACKTEST VE PİST DOĞRULAMASI'
);

// 3. Highlight official TJK training track source in the Galop Chamber
const oldGalopHead = '<div class="chamber-head">\n            <span>⚜ ${g.tur || \'Galop\'} (${g.hipodrom || \'Pist\'})</span>';
const newGalopHead = `<div class="chamber-head" style="border-bottom:1px solid rgba(212,175,55,0.2);padding-bottom:0.4rem;margin-bottom:0.6rem;">
            <span style="display:flex;align-items:center;gap:0.4rem;color:#34d399;font-weight:700;font-size:0.75rem;">
              ✓ TJK RESMÎ İDMAN PİSTİ RAPORU · \${g.hipodrom || 'Pist'} (\${g.pist || 'Kum - İç'})
            </span>`;

if (html.includes(oldGalopHead)) {
  html = html.replace(oldGalopHead, newGalopHead);
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully applied 1 Kasım - 14 Kasım archive and 730-day calibration update!');
