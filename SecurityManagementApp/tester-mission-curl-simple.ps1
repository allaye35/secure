#!/usr/bin/env pwsh
# Script pour tester la création d'une mission complète avec curl

# Configuration
$baseUrl = "http://localhost:8080/api/missions"
$contentType = "application/json"

# Création de l'objet mission à envoyer
$mission = @{
    titre = "Mission test via curl"
    description = "Test de création d'une mission via curl avec devis ID obligatoire"
    dateDebut = (Get-Date).ToString('yyyy-MM-dd')
    dateFin = (Get-Date).AddDays(10).ToString('yyyy-MM-dd')
    heureDebut = "09:00:00"
    heureFin = "17:00:00"
    statutMission = "PLANIFIEE"
    typeMission = "SURVEILLANCE"
    nombreAgents = 2
    quantite = 64
    devisId = 1
    tarifMissionId = 1
}

# Convertir l'objet en JSON
$missionJson = $mission | ConvertTo-Json

Write-Host "`n===== Test de création d'une mission avec curl =====" -ForegroundColor Cyan
Write-Host "Mission à créer:" -ForegroundColor Yellow
Write-Host $missionJson

Write-Host "`nEnvoi de la requête avec curl..." -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Method POST -Uri $baseUrl -ContentType $contentType -Body $missionJson
    
    Write-Host "Mission créée avec succès!" -ForegroundColor Green
    Write-Host "ID de la mission: $($response.id)" -ForegroundColor Yellow
    
    # Afficher les détails de la mission créée
    Write-Host "`nDétails de la mission créée:" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 4)
} catch {
    Write-Host "Erreur lors de la création de la mission" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
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
