#!/usr/bin/env pwsh
# Script pour tester la création d'une mission minimale avec curl

# Configuration
$baseUrl = "http://localhost:8080/api/missions"

Write-Host "`n===== Test de création d'une mission minimale avec curl =====" -ForegroundColor Cyan

# Construction du JSON minimal pour la requête
$jsonContent = @"
{
  "titre": "Mission minimale",
  "typeMission": "SSIAP_1"
}
"@

# Enregistrement du JSON dans un fichier temporaire pour éviter les problèmes d'échappement
$tempFile = [System.IO.Path]::GetTempFileName()
$jsonContent | Out-File -FilePath $tempFile -Encoding utf8

Write-Host "Contenu JSON de la mission minimale:" -ForegroundColor Yellow
Write-Host $jsonContent

Write-Host "`nEnvoi de la requête avec curl..." -ForegroundColor Green

# Construction de la commande curl
$curlCommand = "curl -X POST '$baseUrl' -H 'Content-Type: application/json' -d '@$tempFile'"

# Afficher la commande
Write-Host "Exécution de la commande:" -ForegroundColor Yellow
Write-Host $curlCommand

# Exécution de la commande curl et capture de la sortie
$result = Invoke-Expression -Command $curlCommand

# Suppression du fichier temporaire
Remove-Item -Path $tempFile

# Affichage du résultat
Write-Host "`nRésultat de la création de mission minimale:" -ForegroundColor Green
Write-Host $result

# Si la mission a été créée avec succès, essayer de la récupérer par son ID
if ($result -match '"id"\s*:\s*(\d+)') {
    $missionId = $matches[1]
    Write-Host "`nRécupération des détails de la mission créée (ID: $missionId)..." -ForegroundColor Yellow
    
    $curlGetCommand = "curl -X GET '$baseUrl/$missionId'"
    $resultGet = Invoke-Expression -Command $curlGetCommand
    
    Write-Host "Détails de la mission:" -ForegroundColor Green
    Write-Host $resultGet
}

Write-Host "`n===== Test terminé =====" -ForegroundColor Cyan
