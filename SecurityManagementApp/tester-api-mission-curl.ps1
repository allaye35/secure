#!/usr/bin/env pwsh
# Script pour tester l'API des missions via curl

# Configuration
$baseUrl = "http://localhost:8080/api/missions"

Write-Host "`n===== Test complet de l'API des missions avec curl =====" -ForegroundColor Cyan

# =============== 1. CRÉATION D'UNE MISSION ===============
Write-Host "`n1. CRÉATION D'UNE MISSION" -ForegroundColor Magenta

# Construction du JSON pour la mission
$missionJson = @"
{
  "titre": "Mission de test via curl",
  "description": "Test complet de l'API des missions avec curl",
  "dateDebut": "2025-07-01",
  "dateFin": "2025-07-10",
  "heureDebut": "08:00:00",
  "heureFin": "18:00:00",
  "statutMission": "PLANIFIEE",
  "typeMission": "GARDIENNAGE",
  "nombreAgents": 2,
  "quantite": 80,
  "tarifMissionId": 1,
  "commentaires": "Mission créée pour tester l'API REST"
}
"@

# Enregistrement du JSON dans un fichier temporaire
$tempFile = [System.IO.Path]::GetTempFileName()
$missionJson | Out-File -FilePath $tempFile -Encoding utf8

Write-Host "Contenu JSON de la mission à créer:" -ForegroundColor Yellow
Write-Host $missionJson

Write-Host "`nEnvoi de la requête POST pour créer la mission..." -ForegroundColor Green

# Exécution de la commande curl pour créer la mission
$curlCreateCommand = "curl -X POST '$baseUrl' -H 'Content-Type: application/json' -d '@$tempFile'"
$createResult = Invoke-Expression -Command $curlCreateCommand

# Affichage du résultat
Write-Host "`nRésultat de la création de mission:" -ForegroundColor Green
Write-Host $createResult

# Récupération de l'ID de la mission créée pour les tests suivants
$missionId = -1
if ($createResult -match '"id"\s*:\s*(\d+)') {
    $missionId = $matches[1]
    Write-Host "`nMission créée avec succès avec l'ID: $missionId" -ForegroundColor Green
} else {
    Write-Host "`nImpossible de récupérer l'ID de la mission créée. Les tests suivants pourraient échouer." -ForegroundColor Red
}

# =============== 2. RÉCUPÉRATION DE TOUTES LES MISSIONS ===============
Write-Host "`n2. RÉCUPÉRATION DE TOUTES LES MISSIONS" -ForegroundColor Magenta

$curlGetAllCommand = "curl -X GET '$baseUrl'"
Write-Host "Exécution de la commande: $curlGetAllCommand" -ForegroundColor Yellow
$getAllResult = Invoke-Expression -Command $curlGetAllCommand

Write-Host "`nListe des missions (affichage limité):" -ForegroundColor Green
# Limiter l'affichage pour ne pas surcharger la console
if ($getAllResult.Length -gt 500) {
    Write-Host $getAllResult.Substring(0, 500) + "... (tronqué)"
} else {
    Write-Host $getAllResult
}

# =============== 3. RÉCUPÉRATION D'UNE MISSION PAR SON ID ===============
if ($missionId -ne -1) {
    Write-Host "`n3. RÉCUPÉRATION DE LA MISSION PAR SON ID ($missionId)" -ForegroundColor Magenta    $curlGetByIdCommand = "curl -X GET '$baseUrl/$missionId'"
    Write-Host "Exécution de la commande: $curlGetByIdCommand" -ForegroundColor Yellow
    $getByIdResult = Invoke-Expression -Command $curlGetByIdCommand

    Write-Host "`nDétails de la mission:" -ForegroundColor Green
    Write-Host $getByIdResult
}

# =============== 4. MISE À JOUR DE LA MISSION ===============
if ($missionId -ne -1) {
    Write-Host "`n4. MISE À JOUR DE LA MISSION" -ForegroundColor Magenta

    # Construction du JSON pour la mise à jour
    $updateJson = @"
{
  "titre": "Mission mise à jour via curl",
  "description": "Test de mise à jour avec curl",
  "dateDebut": "2025-07-01",
  "dateFin": "2025-07-15",
  "heureDebut": "09:00:00",
  "heureFin": "19:00:00",
  "statutMission": "EN_COURS",
  "typeMission": "GARDIENNAGE",
  "nombreAgents": 3,
  "quantite": 100,
  "tarifMissionId": 1,
  "commentaires": "Mission mise à jour pour tester l'API REST"
}
"@    # Enregistrement du JSON dans un fichier temporaire
    $tempUpdateFile = [System.IO.Path]::GetTempFileName()
    $updateJson | Out-File -FilePath $tempUpdateFile -Encoding utf8

    Write-Host "Contenu JSON pour la mise à jour:" -ForegroundColor Yellow
    Write-Host $updateJson    # Exécution de la commande curl pour mettre à jour la mission
    $curlUpdateCommand = "curl -X PATCH '$baseUrl/$missionId' -H 'Content-Type: application/json' -d '@$tempUpdateFile'"
    Write-Host "Exécution de la commande: $curlUpdateCommand" -ForegroundColor Yellow
    $updateResult = Invoke-Expression -Command $curlUpdateCommand

    # Suppression du fichier temporaire
    Remove-Item -Path $tempUpdateFile

    Write-Host "`nRésultat de la mise à jour:" -ForegroundColor Green
    Write-Host $updateResult
}

# =============== 5. RECHERCHE DE MISSIONS PAR CRITÈRES ===============
Write-Host "`n5. RECHERCHE DE MISSIONS PAR CRITÈRES" -ForegroundColor Magenta

# 5.1 - Recherche des missions commençant après une date
$searchDate = "2025-06-01"
Write-Host "5.1 - Recherche des missions commençant après le $searchDate" -ForegroundColor Yellow

$curlSearchCommand = "curl -X GET '$baseUrl/apres?date=$searchDate'"
Write-Host "Exécution de la commande: $curlSearchCommand" -ForegroundColor Yellow
$searchResult = Invoke-Expression -Command $curlSearchCommand

Write-Host "`nRésultat de la recherche:" -ForegroundColor Green
# Limiter l'affichage pour ne pas surcharger la console
if ($searchResult.Length -gt 500) {
    Write-Host $searchResult.Substring(0, 500) + "... (tronqué)"
} else {
    Write-Host $searchResult
}

# =============== 6. SIMULER UN CALCUL DE MISSION SANS CRÉATION ===============
Write-Host "`n6. SIMULER UN CALCUL DE MISSION SANS CRÉATION" -ForegroundColor Magenta

# Construction du JSON pour la simulation
$simulateJson = @"
{
  "titre": "Mission de simulation",
  "typeMission": "GARDIENNAGE",
  "dateDebut": "2025-08-01",
  "dateFin": "2025-08-10",
  "heureDebut": "08:00:00",
  "heureFin": "18:00:00",
  "nombreAgents": 2,
  "quantite": 80,
  "tarifMissionId": 1
}
"@

# Enregistrement du JSON dans un fichier temporaire
$tempSimulateFile = [System.IO.Path]::GetTempFileName()
$simulateJson | Out-File -FilePath $tempSimulateFile -Encoding utf8

Write-Host "Contenu JSON pour la simulation:" -ForegroundColor Yellow
Write-Host $simulateJson

# Exécution de la commande curl pour simuler le calcul
$curlSimulateCommand = "curl -X POST '$baseUrl/simuler-calcul' -H 'Content-Type: application/json' -d '@$tempSimulateFile'"
Write-Host "Exécution de la commande: $curlSimulateCommand" -ForegroundColor Yellow
$simulateResult = Invoke-Expression -Command $curlSimulateCommand

# Suppression du fichier temporaire
Remove-Item -Path $tempSimulateFile

Write-Host "`nRésultat de la simulation:" -ForegroundColor Green
Write-Host $simulateResult

# =============== 7. SUPPRESSION DE LA MISSION CRÉÉE ===============
if ($missionId -ne -1) {
    Write-Host "`n7. SUPPRESSION DE LA MISSION" -ForegroundColor Magenta    $curlDeleteCommand = "curl -X DELETE '$baseUrl/$missionId' -v"
    Write-Host "Exécution de la commande: $curlDeleteCommand" -ForegroundColor Yellow
    $deleteResult = Invoke-Expression -Command $curlDeleteCommand

    Write-Host "`nRésultat de la suppression:" -ForegroundColor Green
    Write-Host $deleteResult

    # Vérification que la mission a bien été supprimée
    Write-Host "`nVérification de la suppression en essayant de récupérer la mission..." -ForegroundColor Yellow    $curlCheckDeleteCommand = "curl -X GET '$baseUrl/$missionId'"
    $checkDeleteResult = Invoke-Expression -Command $curlCheckDeleteCommand

    Write-Host "`nRésultat de la vérification:" -ForegroundColor Green
    Write-Host $checkDeleteResult
}

# Suppression du fichier temporaire initial
Remove-Item -Path $tempFile

Write-Host "`n===== Test complet de l'API des missions terminé =====" -ForegroundColor Cyan
