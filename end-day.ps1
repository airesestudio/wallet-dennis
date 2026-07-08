Write-Host "Guardando y subiendo cambios de la jornada..." -ForegroundColor Cyan

# Commit todo pendiente
git add -A
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
    git commit -m "cierre jornada $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    Write-Host "Commit creado." -ForegroundColor Green
} else {
    Write-Host "Sin cambios nuevos para commit." -ForegroundColor Yellow
}

# Push
git push 2>&1 | Out-Null
Write-Host "Push a GitHub completado." -ForegroundColor Green

# Cerrar Vite si está corriendo
$vite = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "vite" }
if ($vite) {
    $vite | Stop-Process -Force
    Write-Host "Servidor Vite detenido." -ForegroundColor Green
}

Write-Host ""
Write-Host "Jornada cerrada. Todo en GitHub." -ForegroundColor Cyan
