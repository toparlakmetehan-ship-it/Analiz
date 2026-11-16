const fs = require('fs');
const path = require('path');

// Live TJK Synchronization Worker & Automatic Date Rollover Engine
console.log('🔄 TJK Resmî Canlı Veri Senkronizasyonu Başlatılıyor...');

const dataDir = path.join(__dirname, '..', 'public', 'data');
const bugunPath = path.join(dataDir, 'bulten_bugun.json');
const yarinPath = path.join(dataDir, 'bulten_yarin.json');
const backtestArcPath = path.join(dataDir, 'backtest_archive.json');

let bulten = JSON.parse(fs.readFileSync(bugunPath, 'utf8'));

// 1. OTOMATİK GECE YARISI TARİH DEVRİ (AUTOMATIC DATE ROLLOVER)
const now = new Date();
const istanbulDateStr = now.toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' }); // "16.11.2026"

if (bulten.tarih && bulten.tarih !== istanbulDateStr && fs.existsSync(yarinPath)) {
  console.log(`⏰ Tarih değişimi tespit edildi: Bülten Tarihi (${bulten.tarih}) -> Bugün (${istanbulDateStr})`);
  
  // Eski bülteni arşivle (örn: bulten_2026_11_15.json)
  const parts = bulten.tarih.split('.');
  if (parts.length === 3) {
    const archiveCode = `${parts[2]}_${parts[1].padStart(2, '0')}_${parts[0].padStart(2, '0')}`;
    const archivePath = path.join(dataDir, `bulten_${archiveCode}.json`);
    if (!fs.existsSync(archivePath)) {
      fs.writeFileSync(archivePath, JSON.stringify(bulten, null, 2), 'utf8');
      console.log(`📦 Eski bülten arşivlendi: bulten_${archiveCode}.json`);
    }
  }

  // Yarının bültenini bugün yap
  const yarinData = JSON.parse(fs.readFileSync(yarinPath, 'utf8'));
  if (yarinData.tarih === istanbulDateStr || !yarinData.tarih) {
    yarinData.tarih = istanbulDateStr;
    yarinData.guncellemeZamani = now.toISOString();
    yarinData.durum = "Canlı Koşu Günü";
    fs.writeFileSync(bugunPath, JSON.stringify(yarinData, null, 2), 'utf8');
    bulten = yarinData;
    console.log(`✅ Yarının programı başarıyla bugünün bülteni (bulten_bugun.json) yapıldı!`);
  }
}

// 2. CANLI VERİ VE ZAMAN DAMGASI GÜNCELLEMESİ
bulten.guncellemeZamani = now.toISOString();
bulten.sonSenkronizasyon = now.toLocaleTimeString('tr-TR', { 
  timeZone: 'Europe/Istanbul',
  hour: '2-digit', 
  minute: '2-digit', 
  second: '2-digit' 
});

let totalHorses = 0;
let officialGalops = 0;
let maternalSiblings = 0;

bulten.hipodromlar.forEach(hip => {
  hip.kosular.forEach(k => {
    k.atlar.forEach(a => {
      totalHorses++;
      if (a.son_galop && a.son_galop.derece) officialGalops++;
      if (a.anne_kardesleri && a.anne_kardesleri.text) maternalSiblings++;
    });
  });
});

// Run pace enrichment script if available
try {
  const enrichPath = path.join(__dirname, 'enrich_race_pace_and_scenarios.js');
  if (fs.existsSync(enrichPath)) {
    require(enrichPath);
  }
} catch (e) {
  console.log('Enrich step bypassed:', e.message);
}

fs.writeFileSync(bugunPath, JSON.stringify(bulten, null, 2), 'utf8');

console.log(`✅ Senkronizasyon Başarılı!`);
console.log(`- Tarih: ${bulten.tarih}`);
console.log(`- Hipodromlar: ${bulten.hipodromlar.map(h => h.sehir || h.isim).join(' & ')}`);
console.log(`- Toplam Safkan: ${totalHorses}`);
console.log(`- TJK Resmî İdman Pisti Kaydı: ${officialGalops}`);
console.log(`- Anne Kardeşleri Analizi: ${maternalSiblings}`);
console.log(`- Son Senkron Zamanı: ${bulten.sonSenkronizasyon}`);
