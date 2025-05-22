#!/usr/bin/env pwsh
# Test simple de création d'une mission

# Configuration
$baseUrl = "http://localhost:8080/api/missions"
$contentType = "application/json"

# Date actuelle
$dateStr = (Get-Date).ToString('yyyyMMdd-HHmmss')

# Affichage titre
Write-Host "`n===== Test de création d'une mission simple =====" -ForegroundColor Cyan

# Structure simplifiée de mission
$json = @"
{
  "titre": "Mission test $dateStr",
  "description": "Description mission test simple",
  "dateDebut": "2025-05-25",
  "dateFin": "2025-05-30",
  "heureDebut": "09:00:00",
  "heureFin": "17:00:00",
  "nombreAgents": 2,  "quantite": 80,
  "typeMission": "SURVEILLANCE",
  "statut": "PLANIFIEE",
  "tarifMissionId": 1,
  "devisId": 1,
  "agentIds": [1, 2]
}
"@

# Afficher le contenu de la mission qui sera envoyée
Write-Host "Contenu de la mission à créer:" -ForegroundColor Yellow
Write-Host $json

# Tenter de créer la mission
try {
    $response = Invoke-RestMethod -Method POST -Uri $baseUrl -ContentType $contentType -Body $json
    
    Write-Host "`nMission créée avec succès!" -ForegroundColor Green
    Write-Host "ID de la mission: $($response.id)" -ForegroundColor Yellow
    Write-Host "Titre de la mission: $($response.titre)" -ForegroundColor Yellow
    
} catch {
    Write-Host "`nErreur lors de la création de la mission" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    # Tenter de récupérer le corps de la réponse pour plus d'informations
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "Détails de l'erreur: $responseBody" -ForegroundColor Red
    } catch {
        Write-Host "Impossible de récupérer les détails de l'erreur" -ForegroundColor Red
    }
}

Write-Host "`n===== Test terminé =====" -ForegroundColor Cyan
