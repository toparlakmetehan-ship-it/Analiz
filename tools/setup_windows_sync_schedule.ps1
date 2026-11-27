# Royal Turf - Windows Otomatik TJK Senkronizasyon Zamanlayicisi
$scriptPath = "C:\Users\DELL\Documents\CODE\.claude\tools\auto_tjk_sync.bat"
$times = @("09:00", "12:30", "14:00", "17:30", "22:00")

foreach ($t in $times) {
    $label = $t.Replace(":", "")
    $taskName = "RoyalTurf_TJK_Sync_$label"
    schtasks /Delete /TN $taskName /F 2>$null | Out-Null
    schtasks /Create /TN $taskName /TR "`"$scriptPath`"" /SC DAILY /ST $t /F | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK: $taskName ($t)"
    } else {
        Write-Host "HATA: $taskName ($t)"
    }
}
