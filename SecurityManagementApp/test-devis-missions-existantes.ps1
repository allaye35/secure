#!/usr/bin/env pwsh
# Script de test simplifié pour la création de devis via l'API avec missions existantes

# Configuration
$baseUrl = "http://localhost:8080/api/devis"
$contentType = "application/json"

Write-Host "`n===== Test de création de devis avec missions existantes =====" -ForegroundColor Cyan

# Création d'un nouveau devis
Write-Host "`nCréation d'un nouveau devis:" -ForegroundColor Green
$nouveauDevis = @{
  referenceDevis = "DEV-TEST-$((Get-Date).ToString('yyyyMMdd-HHmmss'))"
  description = "Devis de test via API avec missions existantes"
  statut = "EN_ATTENTE"
  entrepriseId = 1
  clientId = 1
  dateValidite = (Get-Date).AddMonths(1).ToString('yyyy-MM-dd')
  conditionsGenerales = "Conditions générales de test"
  missionExistanteIds = @(1, 2)
}

# Afficher le contenu du devis qui sera envoyé
Write-Host "Contenu du devis à créer:" -ForegroundColor Yellow
$devisJson = ConvertTo-Json -Depth 4 $nouveauDevis
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
