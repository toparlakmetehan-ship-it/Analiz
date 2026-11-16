@echo off
setlocal
cd /d "C:\Users\DELL\Desktop\.claude"
if not exist "logs" mkdir "logs"
"C:\Users\DELL\AppData\Local\Programs\Python\Python312\python.exe" -X utf8 run_tjk_scraper.py --target both --export-json >> "logs\daily_tjk.log" 2>&1
echo [%date% %time%] exit=%ERRORLEVEL% >> "logs\daily_tjk.log"
endlocal
