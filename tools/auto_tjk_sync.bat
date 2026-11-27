@echo off
cd /d "C:\Users\DELL\Documents\CODE\.claude"
echo [%date% %time%] TJK Canli Senkronizasyon Basliyor... >> data\auto_sync.log
python -m tjk_scraper.main --target both --export-json >> data\auto_sync.log 2>&1
python tools\enrich_class_drop.py >> data\auto_sync.log 2>&1
node tools\enrich_race_pace_and_scenarios.js >> data\auto_sync.log 2>&1
node tools\enrich_surface_kaba_kum_sentetik.js >> data\auto_sync.log 2>&1
node tools\calibrate_tempo_deltas.js >> data\auto_sync.log 2>&1
node tools\daily_model_scorecard.js >> data\auto_sync.log 2>&1
node tools\verify_bulten_contract.js >> data\auto_sync.log 2>&1
if %errorlevel% neq 0 (
  echo [%date% %time%] HATA: verify_bulten_contract basarisiz! >> data\auto_sync.log
  exit /b 1
)
git add public\data\bulten_bugun.json public\data\bulten_yarin.json public\data\bulten_dun.json public\data\model_scorecard.json >> data\auto_sync.log 2>&1
git diff --cached --quiet
if %errorlevel% neq 0 (
  git commit -m "chore(tjk): Otomatik yerel TJK canli senkronizasyonu" >> data\auto_sync.log 2>&1
  git pull --rebase -X theirs origin main >> data\auto_sync.log 2>&1
  git push origin main >> data\auto_sync.log 2>&1
  echo [%date% %time%] Basariyla GitHub ve canli siteye gonderildi. >> data\auto_sync.log
) else (
  echo [%date% %time%] Yeni veri degisikligi yok. >> data\auto_sync.log
)
