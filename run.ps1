# World Cup 2026 Squad Selector - Scripts PowerShell
# ==================================================
#
# Uso: .\run.ps1 [comando]
#
# Comandos:
#   serve        - Servidor local (npx serve, puerto 3000)
#   serve-python - Servidor local (Python, puerto 8000)
#   open         - Abrir en navegador
#   status       - Estado del proyecto
#   help         - Mostrar ayuda

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

function Show-Help {
    Write-Host ""
    Write-Host "  World Cup 2026 Squad Selector" -ForegroundColor Cyan
    Write-Host "  ==============================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Comandos disponibles:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "    .\run.ps1 serve         - Servidor local (npx serve)"
    Write-Host "    .\run.ps1 serve-python  - Servidor local (Python)"
    Write-Host "    .\run.ps1 open          - Abrir en navegador"
    Write-Host "    .\run.ps1 status        - Estado del proyecto"
    Write-Host "    .\run.ps1 help          - Esta ayuda"
    Write-Host ""
}

function Start-Server {
    Write-Host "Arrancando servidor en http://localhost:3000" -ForegroundColor Green
    npx serve . -p 3000
}

function Start-ServerPython {
    Write-Host "Arrancando servidor en http://localhost:8000" -ForegroundColor Green
    python -m http.server 8000
}

function Open-App {
    Write-Host "Abriendo index.html..." -ForegroundColor Green
    Start-Process "index.html"
}

function Show-Status {
    Write-Host ""
    Write-Host "  Estado del Proyecto" -ForegroundColor Cyan
    Write-Host "  ===================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Archivos principales:" -ForegroundColor Yellow
    Get-ChildItem -Name *.html, *.css, *.js, *.md | ForEach-Object { Write-Host "    $_" }
    Write-Host ""
    Write-Host "  Datos disponibles:" -ForegroundColor Yellow
    Get-ChildItem -Path data -Name *.json | ForEach-Object { Write-Host "    data\$_" }
    Write-Host ""
}

switch ($Command.ToLower()) {
    "serve"        { Start-Server }
    "serve-python" { Start-ServerPython }
    "open"         { Open-App }
    "status"       { Show-Status }
    "help"         { Show-Help }
    default        { Show-Help }
}
