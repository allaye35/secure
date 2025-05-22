#!/usr/bin/env pwsh
# Script pour tester la création d'une mission

# Configuration
$baseUrl = "http://localhost:8080/api"
$contentType = "application/json"

Write-Host "`n===== Test de création d'une mission =====" -ForegroundColor Cyan

# Création d'une mission
Write-Host "`nCréation d'une mission:" -ForegroundColor Green

$mission = @{
  titre = "Mission de test via script"
  dateDebut = (Get-Date).ToString('yyyy-MM-dd')
  dateFin = (Get-Date).AddDays(30).ToString('yyyy-MM-dd')
  heureDebut = "08:00:00"
  heureFin = "18:00:00"
  statutMission = "PLANIFIEE"
  typeMission = "SURVEILLANCE"
  description = "Mission créée pour tester la création via script"
  nombreAgents = 1
  quantite = 1
  montantHT = 100.00
  montantTVA = 20.00
  montantTTC = 120.00
}

$missionJson = ConvertTo-Json -Depth 4 $mission

# Afficher le contenu de la mission
Write-Host "Contenu de la mission à créer:" -ForegroundColor Yellow
Write-Host $missionJson

# Créer la mission
try {
    $response = Invoke-RestMethod -Method POST -Uri "$baseUrl/missions" -ContentType $contentType -Body $missionJson
    
    Write-Host "Mission créée avec succès!" -ForegroundColor Green
    Write-Host "ID de la mission: $($response.id)" -ForegroundColor Yellow
    
    # Récupérer les détails de la mission créée
    Write-Host "`nDétails de la mission créée:" -ForegroundColor Green
    $missionDetails = Invoke-RestMethod -Method GET -Uri "$baseUrl/missions/$($response.id)" -ContentType $contentType
    Write-Host (ConvertTo-Json -Depth 4 $missionDetails)
    
    # Sauvegarder l'ID de la mission pour utilisation ultérieure
    $response.id | Out-File -FilePath "mission-test-id.txt"
    Write-Host "ID de la mission sauvegardé dans le fichier 'mission-test-id.txt'" -ForegroundColor Green
    
} catch {
    Write-Host "Erreur lors de la création de la mission" -ForegroundColor Red
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
