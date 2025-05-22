#!/usr/bin/env pwsh
# Script de test pour la création de devis avec mission (sans statutMission)

# Configuration
$baseUrl = "http://localhost:8080/api/devis"
$contentType = "application/json"

Write-Host "`n===== Test de création d'un devis avec mission (sans statutMission) =====" -ForegroundColor Cyan

# Création d'un devis avec mission
Write-Host "`nCréation d'un devis avec mission:" -ForegroundColor Green
$devisAvecMission = @{
  referenceDevis = "DEV-AVEC-MISSION-$((Get-Date).ToString('yyyyMMdd-HHmmss'))"
  description = "Devis de test avec mission via API"
  statut = "EN_ATTENTE"
  entrepriseId = 1
  clientId = 1
  dateValidite = (Get-Date).AddMonths(1).ToString('yyyy-MM-dd')
  conditionsGenerales = "Conditions générales de test pour devis avec mission"
  missions = @(
    @{
      titre = "Mission de test 1"
      description = "Description de la mission de test"
      dateDebut = (Get-Date).ToString('yyyy-MM-dd')
      dateFin = (Get-Date).AddDays(30).ToString('yyyy-MM-dd')
      heureDebut = "08:00:00"
      heureFin = "18:00:00"
      nombreAgents = 2
      quantite = 80
      typeMission = "SURVEILLANCE"
      tarifMissionId = 1
      # statutMission n'est pas spécifié
    }
  )
}

# Afficher le contenu du devis qui sera envoyé
Write-Host "Contenu du devis à créer:" -ForegroundColor Yellow
$devisJson = ConvertTo-Json -Depth 4 $devisAvecMission
Write-Host $devisJson

# Tenter de créer le devis
try {
    $response = Invoke-RestMethod -Method POST -Uri $baseUrl -ContentType $contentType -Body $devisJson
    Write-Host "Devis créé avec succès!" -ForegroundColor Green
    Write-Host "ID du devis: $($response.id)" -ForegroundColor Yellow
    Write-Host "Référence du devis: $($response.referenceDevis)" -ForegroundColor Yellow
    
    # Afficher les détails du devis créé
    Write-Host "`nDétails du devis créé:" -ForegroundColor Green
    $devisDetail = Invoke-RestMethod -Method GET -Uri "$baseUrl/$($response.id)" -ContentType $contentType
    Write-Host (ConvertTo-Json -Depth 4 $devisDetail)
} catch {
    Write-Host "Erreur lors de la création du devis" -ForegroundColor Red
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
