#!/usr/bin/env pwsh
# Script pour tester la création d'un devis puis l'ajout d'une mission

# Configuration
$baseUrl = "http://localhost:8080/api"
$contentType = "application/json"

Write-Host "`n===== Test de création d'un devis puis ajout de mission =====" -ForegroundColor Cyan

# Étape 1: Création d'un devis sans mission
Write-Host "`nÉtape 1: Création d'un devis sans mission:" -ForegroundColor Green

$devisSansMission = @{
  referenceDevis = "DEV-2ETAPES-$((Get-Date).ToString('yyyyMMdd-HHmmss'))"
  description = "Devis de test pour ajout de mission ultérieur"
  statut = "EN_ATTENTE"
  entrepriseId = 1
  clientId = 1
  dateValidite = (Get-Date).AddMonths(1).ToString('yyyy-MM-dd')
  conditionsGenerales = "Conditions générales de test en deux étapes"
  missions = @()
}

$devisJson = ConvertTo-Json -Depth 4 $devisSansMission

# Afficher le contenu du devis
Write-Host "Contenu du devis à créer:" -ForegroundColor Yellow
Write-Host $devisJson

# Étape 1: Créer le devis sans mission
try {
    $response = Invoke-RestMethod -Method POST -Uri "$baseUrl/devis" -ContentType $contentType -Body $devisJson
    
    Write-Host "Devis créé avec succès!" -ForegroundColor Green
    Write-Host "ID du devis: $($response.id)" -ForegroundColor Yellow
    Write-Host "Référence du devis: $($response.referenceDevis)" -ForegroundColor Yellow
    
    $devisId = $response.id
    
    # Étape 2: Ajouter une mission au devis
    Write-Host "`nÉtape 2: Ajout d'une mission au devis:" -ForegroundColor Green
    
    $mission = @{
      titre = "Mission ajoutée après création"
      description = "Description de la mission ajoutée après création du devis"
      dateDebut = (Get-Date).ToString('yyyy-MM-dd')
      dateFin = (Get-Date).AddDays(30).ToString('yyyy-MM-dd')
      heureDebut = "09:00:00"
      heureFin = "17:00:00"
      nombreAgents = 2
      quantite = 40
      typeMission = "SURVEILLANCE"
      devisId = $devisId  # Lier la mission au devis
      tarifMissionId = 1
    }
    
    $missionJson = ConvertTo-Json -Depth 4 $mission
    
    Write-Host "Contenu de la mission à ajouter:" -ForegroundColor Yellow
    Write-Host $missionJson
    
    # Essayer d'ajouter la mission via différents endpoints potentiels
    Write-Host "`nTentative d'ajout via /devis/{id}/missions:" -ForegroundColor Yellow
    try {
        $missionResponse = Invoke-RestMethod -Method POST -Uri "$baseUrl/devis/$devisId/missions" -ContentType $contentType -Body $missionJson
        Write-Host "Mission ajoutée avec succès via /devis/{id}/missions!" -ForegroundColor Green
        Write-Host "ID de la mission: $($missionResponse.id)" -ForegroundColor Yellow
    } catch {
        Write-Host "Échec de l'ajout via /devis/{id}/missions: $_" -ForegroundColor Red
        
        Write-Host "`nTentative d'ajout via /missions:" -ForegroundColor Yellow
        try {
            $missionResponse = Invoke-RestMethod -Method POST -Uri "$baseUrl/missions" -ContentType $contentType -Body $missionJson
            Write-Host "Mission ajoutée avec succès via /missions!" -ForegroundColor Green
            Write-Host "ID de la mission: $($missionResponse.id)" -ForegroundColor Yellow
        } catch {
            Write-Host "Échec de l'ajout via /missions: $_" -ForegroundColor Red
        }
    }
    
    # Étape 3: Vérifier le devis mis à jour
    Write-Host "`nÉtape 3: Vérification du devis mis à jour:" -ForegroundColor Green
    
    $devisUpdated = Invoke-RestMethod -Method GET -Uri "$baseUrl/devis/$devisId" -ContentType $contentType
    
    Write-Host "Détails du devis mis à jour:" -ForegroundColor Yellow
    Write-Host (ConvertTo-Json -Depth 5 $devisUpdated)
    
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
