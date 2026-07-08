param([int]$Minutes = 15)

$log = Join-Path (Split-Path $PSCommandPath -Parent) "auto-save.log"

while ($true) {
    try {
        git add -A
        git diff --cached --quiet
        if ($LASTEXITCODE -ne 0) {
            git commit -m "auto-save $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
            git push 2>&1 | Out-Null
            Add-Content $log "[$(Get-Date -Format 'HH:mm:ss')] Commit + push OK"
        } else {
            Add-Content $log "[$(Get-Date -Format 'HH:mm:ss')] Sin cambios"
        }
    } catch {
        Add-Content $log "[$(Get-Date -Format 'HH:mm:ss')] ERROR: $_"
    }
    Start-Sleep -Seconds ($Minutes * 60)
}
