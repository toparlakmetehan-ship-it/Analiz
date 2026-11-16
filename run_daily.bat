@echo off
setlocal
cd /d "C:\Users\DELL\Desktop\.claude"
if not exist "logs" mkdir "logs"
set "LOG=logs\daily_tjk.log"
set "GIT=C:\Program Files\Git\cmd\git.exe"
"C:\Users\DELL\AppData\Local\Programs\Python\Python312\python.exe" -X utf8 run_tjk_scraper.py --target both --export-json >> "%LOG%" 2>&1
set PYEXIT=%ERRORLEVEL%
echo [%date% %time%] pipeline_exit=%PYEXIT% >> "%LOG%"
if not "%PYEXIT%"=="0" goto :pipeline_fail

"%GIT%" add public/data/bulten_bugun.json public/data/bulten_yarin.json >> "%LOG%" 2>&1
"%GIT%" diff --cached --quiet
if errorlevel 1 (
  "%GIT%" commit -m "chore(tjk): gunluk otomatik taktik/tempo guncellemesi" >> "%LOG%" 2>&1
) else (
  echo [%date% %time%] yeni veri yok >> "%LOG%"
)

for /L %%i in (1,1,3) do (
  "%GIT%" pull --rebase -X theirs origin main >> "%LOG%" 2>&1
  if errorlevel 1 "%GIT%" rebase --abort >> "%LOG%" 2>&1
  "%GIT%" push origin main >> "%LOG%" 2>&1
  if not errorlevel 1 goto :pushed
  timeout /t 15 /nobreak >nul
)
echo [%date% %time%] push BASARISIZ >> "%LOG%"
endlocal & exit /b 1

:pushed
echo [%date% %time%] push tamamlandi >> "%LOG%"
endlocal & exit /b 0

:pipeline_fail
echo [%date% %time%] pipeline BASARISIZ >> "%LOG%"
endlocal & exit /b %PYEXIT%
