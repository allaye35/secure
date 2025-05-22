#!/usr/bin/env pwsh
# Script pour tester la création de mission via la commande curl directe

# Configuration
$baseUrl = "http://localhost:8080/api/missions"

Write-Host "`n===== Test de création de mission avec curl =====" -ForegroundColor Cyan

# Construction du JSON pour la requête
$jsonContent = @"
{
  "titre": "Mission créée directement par curl",
  "description": "Test de la création d'une mission via la commande curl",
  "dateDebut": "2025-06-10",
  "dateFin": "2025-06-15",
  "heureDebut": "09:00:00",
  "heureFin": "17:00:00",
  "statutMission": "PLANIFIEE",
  "typeMission": "TELESURVEILLANCE",
  "nombreAgents": 1,
  "quantite": 40,
  "tarifMissionId": 1
}
"@

# Enregistrement du JSON dans un fichier temporaire pour éviter les problèmes d'échappement
$tempFile = [System.IO.Path]::GetTempFileName()
$jsonContent | Out-File -FilePath $tempFile -Encoding utf8

Write-Host "Contenu JSON de la mission:" -ForegroundColor Yellow
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
Write-Host "`nRésultat de la création de mission:" -ForegroundColor Green
Write-Host $result

Write-Host "`n===== Test terminé =====" -ForegroundColor Cyan

# Tester également une requête GET pour récupérer toutes les missions
Write-Host "`n===== Liste de toutes les missions =====" -ForegroundColor Cyan
Write-Host "Récupération de toutes les missions..." -ForegroundColor Green

$curlGetCommand = "curl -X GET '$baseUrl'"
Write-Host "Exécution de la commande:" -ForegroundColor Yellow 
Write-Host $curlGetCommand

$resultGet = Invoke-Expression -Command $curlGetCommand

Write-Host "`nListe des missions:" -ForegroundColor Green
Write-Host $resultGet

Write-Host "`n===== Fin de la liste =====" -ForegroundColor Cyan
