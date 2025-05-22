#!/usr/bin/env pwsh
# Script de test pour l'API Devis avec curl

# Configuration
$baseUrl = "http://localhost:8080/api/devis"
$contentType = "application/json"

Write-Host "`n===== Test de l'API Devis =====" -ForegroundColor Cyan

# 1. Récupérer tous les devis
Write-Host "`n1. Récupération de tous les devis:" -ForegroundColor Green
Invoke-RestMethod -Method GET -Uri "$baseUrl" -ContentType $contentType | ConvertTo-Json -Depth 4

# 2. Récupérer uniquement les devis disponibles pour création de contrat
Write-Host "`n2. Récupération des devis disponibles pour contrat:" -ForegroundColor Green
Invoke-RestMethod -Method GET -Uri "$baseUrl/disponibles" -ContentType $contentType | ConvertTo-Json -Depth 4

# 3. Création d'un nouveau devis
Write-Host "`n3. Création d'un nouveau devis:" -ForegroundColor Green
$nouveauDevis = @{
  referenceDevis = "DEV-TEST-$((Get-Date).ToString('yyyyMMdd-HHmmss'))"
  description = "Devis de test via API"
  statut = "EN_ATTENTE"
  entrepriseId = 1
  clientId = 1
  dateValidite = (Get-Date).AddMonths(1).ToString('yyyy-MM-dd')
  conditionsGenerales = "Conditions générales de test"
  missions = @(
    @{
      titre = "Mission de test 1"
      description = "Description de la mission de test"
      dateDebut = (Get-Date).ToString('yyyy-MM-dd')
      dateFin = (Get-Date).AddDays(30).ToString('yyyy-MM-dd')      heureDebut = "08:00:00"
      heureFin = "18:00:00"
      nombreAgents = 2
      quantite = 80
      typeMission = "SURVEILLANCE"
      statutMission = "PLANIFIEE"
      tarifMissionId = 1
    }
  )
}

$devisId = (Invoke-RestMethod -Method POST -Uri "$baseUrl" -ContentType $contentType -Body (ConvertTo-Json -Depth 4 $nouveauDevis)).id
Write-Host "Devis créé avec l'ID: $devisId" -ForegroundColor Yellow

# 4. Récupérer un devis par ID
Write-Host "`n4. Récupération du devis par ID:" -ForegroundColor Green
Invoke-RestMethod -Method GET -Uri "$baseUrl/$devisId" -ContentType $contentType | ConvertTo-Json -Depth 4

# 5. Récupérer un devis par référence
Write-Host "`n5. Récupération du devis par référence:" -ForegroundColor Green
$reference = $nouveauDevis.referenceDevis
Invoke-RestMethod -Method GET -Uri "$baseUrl/search?reference=$reference" -ContentType $contentType | ConvertTo-Json -Depth 4

# 6. Mettre à jour un devis
Write-Host "`n6. Mise à jour du devis:" -ForegroundColor Green
$devisModifie = @{
  referenceDevis = $nouveauDevis.referenceDevis
  description = "Devis de test modifié via API"
  statut = "ACCEPTE"
  entrepriseId = 1
  clientId = 1
  dateValidite = (Get-Date).AddMonths(2).ToString('yyyy-MM-dd')
  conditionsGenerales = "Conditions générales modifiées"
  missions = @(
    @{
      id = 0  # L'ID sera ignoré pour une nouvelle mission
      titre = "Mission de test modifiée"
      description = "Description modifiée de la mission de test"
      dateDebut = (Get-Date).ToString('yyyy-MM-dd')
      dateFin = (Get-Date).AddDays(45).ToString('yyyy-MM-dd')
      heureDebut = "09:00:00"
      heureFin = "17:00:00"
      nombreAgents = 3
      quantite = 120
      typeMission = "GARDIENNAGE"
      tarifMissionId = 1
    }
  )
}

Invoke-RestMethod -Method PUT -Uri "$baseUrl/$devisId" -ContentType $contentType -Body (ConvertTo-Json -Depth 4 $devisModifie) | ConvertTo-Json -Depth 4

# 7. Vérifier la mise à jour
Write-Host "`n7. Vérification de la mise à jour:" -ForegroundColor Green
Invoke-RestMethod -Method GET -Uri "$baseUrl/$devisId" -ContentType $contentType | ConvertTo-Json -Depth 4

# 8. Test final: Suppression du devis
Write-Host "`n8. Suppression du devis (ATTENTION: Cette action est irréversible):" -ForegroundColor Red
$confirmation = Read-Host "Voulez-vous supprimer le devis? (O/N)"
if ($confirmation -eq "O") {
  Invoke-RestMethod -Method DELETE -Uri "$baseUrl/$devisId" -Verbose
  Write-Host "Devis supprimé avec succès" -ForegroundColor Yellow
  
  # Vérifier que le devis a bien été supprimé
  Write-Host "`n9. Vérification de la suppression:" -ForegroundColor Green
  try {
    Invoke-RestMethod -Method GET -Uri "$baseUrl/$devisId" -Verbose
  } catch {
    Write-Host "Erreur 404 attendue: Le devis n'existe plus" -ForegroundColor Yellow
  }
} else {
  Write-Host "Suppression annulée" -ForegroundColor Yellow
}

# 10. Test de création d'un devis sans mission
Write-Host "`n10. Création d'un devis sans mission:" -ForegroundColor Green
$devisSansMission = @{
  referenceDevis = "DEV-SANS-MISSION-$((Get-Date).ToString('yyyyMMdd-HHmmss'))"
  description = "Devis de test sans mission via API"
  statut = "EN_ATTENTE"
  entrepriseId = 1
  clientId = 1
  dateValidite = (Get-Date).AddMonths(1).ToString('yyyy-MM-dd')
  conditionsGenerales = "Conditions générales de test pour devis sans mission"
  missions = @()
}

try {
    $devisSansMissionId = (Invoke-RestMethod -Method POST -Uri "$baseUrl" -ContentType $contentType -Body (ConvertTo-Json -Depth 4 $devisSansMission)).id
    Write-Host "Devis sans mission créé avec l'ID: $devisSansMissionId" -ForegroundColor Yellow
    
    # Vérifier les détails du devis sans mission
    Write-Host "`nVérification du devis sans mission:" -ForegroundColor Green
    Invoke-RestMethod -Method GET -Uri "$baseUrl/$devisSansMissionId" -ContentType $contentType | ConvertTo-Json -Depth 4
} catch {
    Write-Host "Erreur lors de la création du devis sans mission" -ForegroundColor Red
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

Write-Host "`n===== Tests terminés =====" -ForegroundColor Cyan
