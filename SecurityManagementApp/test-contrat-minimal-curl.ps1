# Script pour tester la création d'un contrat minimal avec curl
# test-contrat-minimal-curl.ps1

Write-Host "Test de création d'un contrat minimal (référence + date uniquement) avec curl" -ForegroundColor Cyan

# Lectures des données JSON pour le corps de la requête
$jsonContent = Get-Content -Raw -Path "test-contrat-minimal.json"
Write-Host "Données à envoyer:" -ForegroundColor Yellow
Write-Host $jsonContent

# Afficher la commande curl
Write-Host "`nCommande curl exécutée:" -ForegroundColor Yellow
Write-Host "curl -X POST -H 'Content-Type: application/json' -d '$jsonContent' http://localhost:8080/api/contrats"

Write-Host "`nRésultat:" -ForegroundColor Green
# Exécution de la commande curl
curl -X POST -H "Content-Type: application/json" -d $jsonContent http://localhost:8080/api/contrats
