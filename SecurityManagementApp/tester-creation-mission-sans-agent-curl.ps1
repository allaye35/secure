#!/usr/bin/env pwsh
# Script pour tester la création d'une mission sans agent via curl

# Configuration
$baseUrl = "http://localhost:8080/api/missions"

Write-Host "`n===== Test de création d'une mission sans agent avec tous les champs via curl =====" -ForegroundColor Cyan

# Utilisation du fichier JSON existant
$missionJsonFile = "c:\Users\allay\Documents\java_Project_2025\SecurityManagementApp\mission-sans-agent-2025.json"
$missionJson = Get-Content -Path $missionJsonFile -Raw

# Enregistrement du JSON dans un fichier temporaire pour curl
$tempFile = [System.IO.Path]::GetTempFileName()
$missionJson | Out-File -FilePath $tempFile -Encoding utf8

Write-Host "Contenu JSON de la mission sans agent à créer:" -ForegroundColor Yellow
Write-Host $missionJson

Write-Host "`nEnvoi de la requête POST pour créer la mission..." -ForegroundColor Green

# Exécution de la commande curl pour créer la mission
$curlCreateCommand = "curl -X POST '$baseUrl' -H 'Content-Type: application/json' -d '@$tempFile' -s"
$createResult = Invoke-Expression -Command $curlCreateCommand

# Affichage du résultat
Write-Host "`nRésultat de la création de mission:" -ForegroundColor Green
Write-Host $createResult

# Récupération de l'ID de la mission créée
$missionId = -1
if ($createResult -match '"id"\s*:\s*(\d+)') {
    $missionId = $matches[1]
    Write-Host "`nMission sans agent créée avec succès avec l'ID: $missionId" -ForegroundColor Green
} else {
    Write-Host "`nImpossible de récupérer l'ID de la mission créée. Veuillez vérifier la réponse pour les détails de l'erreur." -ForegroundColor Red
    
    # Essayons de déterminer le problème basé sur la réponse
    if ($createResult -match "error|erreur|exception|invalid|invalide") {
        Write-Host "`nL'API a retourné une erreur. Il est possible que certains champs ne soient pas pris en charge ou que les valeurs soient incorrectes." -ForegroundColor Yellow
        Write-Host "Consultez la documentation de l'API ou le code du backend pour voir quels champs sont acceptés." -ForegroundColor Yellow
    }
}

# Récupération de la mission créée si elle a été créée avec succès
if ($missionId -ne -1) {
    Write-Host "`nRécupération de la mission créée pour vérification..." -ForegroundColor Magenta

    $curlGetByIdCommand = "curl -X GET '$baseUrl/$missionId' -s"
    Write-Host "Exécution de la commande: $curlGetByIdCommand" -ForegroundColor Yellow
    $getByIdResult = Invoke-Expression -Command $curlGetByIdCommand

    Write-Host "`nDétails de la mission créée:" -ForegroundColor Green
    Write-Host $getByIdResult
}

# Suppression du fichier temporaire
Remove-Item -Path $tempFile

Write-Host "`n===== Test de création d'une mission sans agent terminé =====" -ForegroundColor Cyan
