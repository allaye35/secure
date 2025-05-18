# Script pour tester la création d'un contrat avec curl
# test-contrat-curl.ps1

$jsonBody = Get-Content -Path "test-contrat-complet.json" -Raw
$jsonEscaped = $jsonBody -replace '"', '\"'

Write-Host "Test de création d'un contrat avec curl" -ForegroundColor Cyan
Write-Host "Commande curl exécutée:" -ForegroundColor Yellow

# Écriture de la commande curl dans un fichier .bat temporaire
@"
@echo off
curl -X POST -H "Content-Type: application/json" -d "$jsonEscaped" http://localhost:8080/api/contrats
"@ | Out-File -FilePath "test-curl-contrat.bat" -Encoding ascii

# Exécution du fichier batch
Write-Host "Exécution de la commande curl..." -ForegroundColor Yellow
cmd /c test-curl-contrat.bat
