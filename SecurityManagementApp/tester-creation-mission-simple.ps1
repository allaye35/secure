#!/usr/bin/env pwsh
# Script pour tester la création d'une mission via Invoke-RestMethod

# Configuration
$baseUrl = "http://localhost:8080/api/missions"
$contentType = "application/json"

Write-Host "`n===== Test de création d'une mission =====" -ForegroundColor Cyan

# Préparation des données de la mission
$mission = @{
  titre = "Mission test PowerShell $((Get-Date).ToString('yyyyMMdd-HHmmss'))"
  dateDebut = (Get-Date).ToString('yyyy-MM-dd')
  dateFin = (Get-Date).AddDays(30).ToString('yyyy-MM-dd')
  heureDebut = "08:00:00"
  heureFin = "18:00:00"
  statutMission = "PLANIFIEE"
  typeMission = "SURVEILLANCE"
  description = "Mission créée pour tester la création via PowerShell"
  nombreAgents = 2
  quantite = 1
  montantHT = 100.00
  montantTVA = 20.00
  montantTTC = 120.00
}

# Conversion en JSON
$missionJson = ConvertTo-Json -Depth 4 $mission

# Afficher les données à envoyer
Write-Host "`nDonnées de la mission à créer:" -ForegroundColor Yellow
Write-Host $missionJson

# Tenter de créer la mission
try {
    $response = Invoke-RestMethod -Method POST -Uri $baseUrl -ContentType $contentType -Body $missionJson
    Write-Host "`nMission créée avec succès!" -ForegroundColor Green
    Write-Host "ID de la mission: $($response.id)" -ForegroundColor Yellow
    
    # Afficher les détails de la mission créée
    if ($response.id) {
        Write-Host "`nDétails de la mission créée:" -ForegroundColor Green
        $missionDetail = Invoke-RestMethod -Method GET -Uri "$baseUrl/$($response.id)" -ContentType $contentType
        Write-Host (ConvertTo-Json -Depth 4 $missionDetail)
    }
} catch {
    Write-Host "`nErreur lors de la création de la mission" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "StatusDescription: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    
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
