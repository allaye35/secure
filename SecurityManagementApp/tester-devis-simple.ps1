#!/usr/bin/env pwsh
# Test simplé de création de devis avec mission

# Configuration
$baseUrl = "http://localhost:8080/api/devis"
$contentType = "application/json"

# Date actuelle et référence
$dateStr = (Get-Date).ToString('yyyyMMdd-HHmmss')
$reference = "DEV-SIMPLE-$dateStr"

# Affichage titre
Write-Host "`n===== Test SIMPLIFIÉ de création d'un devis avec mission =====" -ForegroundColor Cyan

# Structure simplifiée du devis
$json = @"
{
  "referenceDevis": "$reference",
  "description": "Devis simplifié avec mission",
  "statut": "EN_ATTENTE",
  "dateCreation": "2025-05-21",
  "dateValidite": "2025-06-21",
  "conditionsGenerales": "Conditions simples de test",
  "entrepriseId": 1,
  "clientId": 1,
  "montantHT": 1000,
  "montantTVA": 200,
  "montantTTC": 1200,
  "missions": [
    {
      "titre": "Mission de test",
      "description": "Description mission test",
      "dateDebut": "2025-05-25",
      "dateFin": "2025-05-30",
      "heureDebut": "09:00:00",      "heureFin": "17:00:00",      "nombreAgents": 2,
      "quantite": 80,
      "typeMission": "SURVEILLANCE",
      "statut": "PLANIFIEE",
      "tarifMissionId": 1,
      "agentIds": [1, 2]
    }
  ]
}
"@

# Afficher le contenu du devis qui sera envoyé
Write-Host "Contenu du devis à créer:" -ForegroundColor Yellow
Write-Host $json

# Tenter de créer le devis
try {
    $response = Invoke-RestMethod -Method POST -Uri $baseUrl -ContentType $contentType -Body $json
    
    Write-Host "`nDevis créé avec succès!" -ForegroundColor Green
    Write-Host "ID du devis: $($response.id)" -ForegroundColor Yellow
    Write-Host "Référence du devis: $($response.referenceDevis)" -ForegroundColor Yellow
    
    # Afficher les missions créées
    if ($response.missions -and $response.missions.Count -gt 0) {
        Write-Host "`nMissions créées avec ce devis:" -ForegroundColor Green
        foreach ($mission in $response.missions) {
            Write-Host "Mission ID: $($mission.id) - Titre: $($mission.titre)" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "`nErreur lors de la création du devis" -ForegroundColor Red
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
