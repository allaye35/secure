# Script PowerShell pour tester la modification de missions étape par étape
# Ce script permet de tester plusieurs aspects de la modification de mission

# Configuration
$apiBaseUrl = "http://localhost:8080/api" # URL de base de l'API
$missionId = 1 # ID de la mission à modifier - à adapter selon votre cas

Write-Host "Tests de modification de mission via API - Approche par étapes" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

# Test 1: Modification des informations de base
Write-Host "`n[Test 1] Modification des informations de base" -ForegroundColor Yellow

$infoBase = @"
{
  "titre": "Mission modifiée - infos de base",
  "description": "Test de modification des informations de base via curl",
  "statutMission": "PLANIFIEE"
}
"@

$tempFile1 = "mission-modif-base-temp.json"
$infoBase | Out-File -FilePath $tempFile1 -Encoding utf8

Write-Host "Envoi de la requête..." -ForegroundColor Gray
curl -X PUT "$apiBaseUrl/missions/$missionId" `
     -H "Content-Type: application/json" `
     -d "@$tempFile1" `
     --verbose

Remove-Item -Path $tempFile1 -Force

# Test 2: Modification des dates et heures
Write-Host "`n[Test 2] Modification des dates et heures" -ForegroundColor Yellow

$dateHeures = @"
{
  "dateDebut": "2025-10-01",
  "dateFin": "2025-10-15",
  "heureDebut": "10:00:00",
  "heureFin": "22:00:00"
}
"@

$tempFile2 = "mission-modif-dates-temp.json"
$dateHeures | Out-File -FilePath $tempFile2 -Encoding utf8

Write-Host "Envoi de la requête..." -ForegroundColor Gray
curl -X PUT "$apiBaseUrl/missions/$missionId" `
     -H "Content-Type: application/json" `
     -d "@$tempFile2" `
     --verbose

Remove-Item -Path $tempFile2 -Force

# Test 3: Modification des montants et quantités
Write-Host "`n[Test 3] Modification des montants et quantités" -ForegroundColor Yellow

$montants = @"
{
  "nombreAgents": 7,
  "quantite": 20,
  "montantHT": 3500.00,
  "montantTVA": 700.00,
  "montantTTC": 4200.00
}
"@

$tempFile3 = "mission-modif-montants-temp.json"
$montants | Out-File -FilePath $tempFile3 -Encoding utf8

Write-Host "Envoi de la requête..." -ForegroundColor Gray
curl -X PUT "$apiBaseUrl/missions/$missionId" `
     -H "Content-Type: application/json" `
     -d "@$tempFile3" `
     --verbose

Remove-Item -Path $tempFile3 -Force

# Test 4: Modification des relations (IDs)
Write-Host "`n[Test 4] Modification des relations (IDs)" -ForegroundColor Yellow

$relations = @"
{
  "tarifMissionId": 3,
  "siteId": 3
}
"@

$tempFile4 = "mission-modif-relations-temp.json"
$relations | Out-File -FilePath $tempFile4 -Encoding utf8

Write-Host "Envoi de la requête..." -ForegroundColor Gray
curl -X PUT "$apiBaseUrl/missions/$missionId" `
     -H "Content-Type: application/json" `
     -d "@$tempFile4" `
     --verbose

Remove-Item -Path $tempFile4 -Force

# Test 5: Vérification finale de la mission modifiée
Write-Host "`n[Test 5] Vérification finale de la mission modifiée" -ForegroundColor Green

curl -X GET "$apiBaseUrl/missions/$missionId" `
     -H "Accept: application/json"

# Tests des endpoints spécifiques pour les relations
Write-Host "`n[Test 6] Association d'agents à la mission" -ForegroundColor Yellow
curl -X PUT "$apiBaseUrl/missions/$missionId/agents" `
     -H "Content-Type: application/json" `
     -d "[1, 2, 3]" `
     --verbose

Write-Host "`n[Test 7] Association d'un site à la mission" -ForegroundColor Yellow
curl -X PUT "$apiBaseUrl/missions/$missionId/site/2" `
     -H "Content-Type: application/json" `
     --verbose

Write-Host "`n[Test 8] Association d'un contrat à la mission" -ForegroundColor Yellow
curl -X PUT "$apiBaseUrl/missions/$missionId/contrat/2" `
     -H "Content-Type: application/json" `
     --verbose

Write-Host "`n[Test 9] Association d'une géolocalisation à la mission" -ForegroundColor Yellow
curl -X PUT "$apiBaseUrl/missions/$missionId/geoloc" `
     -H "Content-Type: application/json" `
     --verbose

Write-Host "`nTous les tests sont terminés." -ForegroundColor Cyan
