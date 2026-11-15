const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// Replace the static vip-badge with interactive sync button
const targetVipBadge = `<div class="vip-badge">
    <span class="vip-dot"></span>
    TJK Resmî Canlı Senkron
  </div>`;

const newVipBadge = `<div style="display:flex; align-items:center; gap:0.6rem;">
    <button class="vip-badge" id="sync-btn" onclick="syncTjkLiveNow()" style="cursor:pointer; border:1px solid var(--gold-pure); background:rgba(212,175,55,0.12); color:#fcf6ba; transition:all 0.3s; font-family:'Montserrat',sans-serif; text-transform:none; font-size:0.75rem;" title="TJK Resmî Verilerini Şimdi Senkronize Et">
      <span class="vip-dot" id="sync-dot" style="background:#10b981; box-shadow:0 0 10px #10b981; width:8px; height:8px; border-radius:50%; display:inline-block;"></span>
      <span id="sync-text">🟢 TJK Otomatik Senkronize (Aktif)</span>
    </button>
  </div>`;

if (html.includes(targetVipBadge)) {
  html = html.replace(targetVipBadge, newVipBadge);
}

// Add syncTjkLiveNow JS function
const oldInitTarget = 'window.onload = initPlatform;';
const syncJsFunction = `
let lastSyncTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

async function syncTjkLiveNow() {
  const btn = document.getElementById('sync-btn');
  const dot = document.getElementById('sync-dot');
  const txt = document.getElementById('sync-text');

  if (txt) txt.innerText = "⏳ TJK Canlı Verileri Çekiliyor...";
  if (dot) dot.style.background = "#eab308";

  try {
    const res = await fetch('/data/bulten_bugun.json?t=' + Date.now());
    if (res.ok) {
      bulten = await res.json();
      lastSyncTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      renderHipodroms();
      if (typeof optimizeCoupon === 'function') optimizeCoupon();

      if (txt) txt.innerText = \`🟢 TJK Resmî Canlı Senkron (\${lastSyncTime})\`;
      if (dot) dot.style.background = "#10b981";
      showToast(\`✓ TJK Canlı Verileri Senkronize Edildi (\${lastSyncTime})\`);
    }
  } catch (err) {
    if (txt) txt.innerText = "⚠️ Yenileme Hatası";
    if (dot) dot.style.background = "#ef4444";
  }
}

// Otomatik Periyodik Senkronizasyon (Her 60 saniyede bir sessiz arka plan kontrolü)
setInterval(() => {
  syncTjkLiveNow();
}, 60000);

function showToast(msg) {
  let toast = document.getElementById('royal-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'royal-toast';
    toast.style.cssText = "position:fixed;bottom:25px;right:25px;background:rgba(16,20,28,0.95);border:1px solid #d4af37;color:#f3e5ab;padding:0.9rem 1.4rem;border-radius:12px;font-size:0.85rem;font-weight:600;z-index:99999;box-shadow:0 10px 30px rgba(0,0,0,0.8);backdrop-filter:blur(10px);transition:all 0.4s ease;";
    document.body.appendChild(toast);
  }
  toast.innerText = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(15px)';
  }, 3500);
}

window.onload = () => {
  initPlatform();
  const txt = document.getElementById('sync-text');
  if (txt) txt.innerText = \`🟢 TJK Resmî Canlı Senkron (\${lastSyncTime})\`;
};
`;

html = html.replace(oldInitTarget, syncJsFunction.trim());

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully added live auto-sync and interactive button to index.html!');
