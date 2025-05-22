#!/usr/bin/env pwsh
# Script pour tester l'API des missions avec PowerShell
# Ce script utilise Invoke-RestMethod au lieu de curl pour éviter les problèmes d'encodage

# Configuration
$baseUrl = "http://localhost:8080/api/missions"

Write-Host "`n===== Test complet de l'API des missions avec PowerShell =====" -ForegroundColor Cyan

# =============== 1. CRÉATION D'UNE MISSION ===============
Write-Host "`n1. CRÉATION D'UNE MISSION" -ForegroundColor Magenta

# Construction du JSON pour la mission
$missionJson = @{
  titre = "Mission de test PowerShell"
  description = "Test complet de l'API des missions"
  dateDebut = "2025-07-01"
  dateFin = "2025-07-10"
  heureDebut = "08:00:00"
  heureFin = "18:00:00"
  statutMission = "PLANIFIEE"
  typeMission = "CQP_APS"
  nombreAgents = 2
  quantite = 1
  tarifMissionId = 1
  siteId = 7
}

$missionJsonString = $missionJson | ConvertTo-Json

Write-Host "Contenu JSON de la mission à créer:" -ForegroundColor Yellow
Write-Host $missionJsonString

Write-Host "`nEnvoi de la requête POST pour créer la mission..." -ForegroundColor Green

# Exécution de la requête pour créer la mission
try {
    $headers = @{
        "Content-Type" = "application/json"
    }
    $createResult = Invoke-RestMethod -Method Post -Uri $baseUrl -Headers $headers -Body $missionJsonString -ErrorAction Stop
    
    # Affichage du résultat
    Write-Host "`nRésultat de la création de mission:" -ForegroundColor Green
    Write-Host ($createResult | ConvertTo-Json -Depth 3)
    
    # Récupération de l'ID de la mission créée pour les tests suivants
    $missionId = $createResult.id
    Write-Host "`nMission créée avec succès avec l'ID: $missionId" -ForegroundColor Green
} catch {
    Write-Host "`nErreur lors de la création de la mission: $_" -ForegroundColor Red
    $missionId = -1
    Write-Host "`nImpossible de récupérer l'ID de la mission créée. Les tests suivants pourraient échouer." -ForegroundColor Red
}

# =============== 2. RÉCUPÉRATION DE TOUTES LES MISSIONS ===============
Write-Host "`n2. RÉCUPÉRATION DE TOUTES LES MISSIONS" -ForegroundColor Magenta

try {
    Write-Host "Envoi de la requête GET pour récupérer toutes les missions..." -ForegroundColor Yellow
    $getAllResult = Invoke-RestMethod -Method Get -Uri $baseUrl -ErrorAction Stop
    
    Write-Host "`nListe des missions (affichage limité):" -ForegroundColor Green
    # Limiter l'affichage pour ne pas surcharger la console
    $getAllResultJson = $getAllResult | ConvertTo-Json -Depth 3
    if ($getAllResultJson.Length -gt 500) {
        Write-Host ($getAllResultJson.Substring(0, 500) + "... (tronqué)")
    } else {
        Write-Host $getAllResultJson
    }
} catch {
    Write-Host "`nErreur lors de la récupération des missions: $_" -ForegroundColor Red
}

# =============== 3. RÉCUPÉRATION D'UNE MISSION PAR SON ID ===============
if ($missionId -ne -1) {
    Write-Host "`n3. RÉCUPÉRATION DE LA MISSION PAR SON ID ($missionId)" -ForegroundColor Magenta
    
    try {
        Write-Host "Envoi de la requête GET pour récupérer la mission par ID..." -ForegroundColor Yellow
        $getByIdResult = Invoke-RestMethod -Method Get -Uri "$baseUrl/$missionId" -ErrorAction Stop
        
        Write-Host "`nDétails de la mission:" -ForegroundColor Green
        Write-Host ($getByIdResult | ConvertTo-Json -Depth 3)
    } catch {
        Write-Host "`nErreur lors de la récupération de la mission par ID: $_" -ForegroundColor Red
    }
}

# =============== 4. MISE À JOUR DE LA MISSION ===============
if ($missionId -ne -1) {
    Write-Host "`n4. MISE À JOUR DE LA MISSION" -ForegroundColor Magenta
    
    # Construction du JSON pour la mise à jour
    $updateJson = @{
      titre = "Mission mise à jour via PowerShell"
      description = "Test de mise à jour avec PowerShell"
      dateDebut = "2025-07-01"
      dateFin = "2025-07-15"
      heureDebut = "09:00:00"
      heureFin = "19:00:00"
      statutMission = "EN_COURS"
      typeMission = "CQP_APS"
      nombreAgents = 3
      quantite = 2
      tarifMissionId = 1
      siteId = 7
    }
    
    $updateJsonString = $updateJson | ConvertTo-Json
    
    Write-Host "Contenu JSON pour la mise à jour:" -ForegroundColor Yellow
    Write-Host $updateJsonString
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        $updateResult = Invoke-RestMethod -Method Patch -Uri "$baseUrl/$missionId" -Headers $headers -Body $updateJsonString -ErrorAction Stop
        
        Write-Host "`nRésultat de la mise à jour:" -ForegroundColor Green
        Write-Host ($updateResult | ConvertTo-Json -Depth 3)
    } catch {
        Write-Host "`nErreur lors de la mise à jour de la mission: $_" -ForegroundColor Red
    }
}

# =============== 5. RECHERCHE DE MISSIONS PAR CRITÈRES ===============
Write-Host "`n5. RECHERCHE DE MISSIONS PAR CRITÈRES" -ForegroundColor Magenta

# 5.1 - Recherche des missions commençant après une date
$searchDate = "2025-06-01"
Write-Host "5.1 - Recherche des missions commençant après le $searchDate" -ForegroundColor Yellow

try {
    Write-Host "Envoi de la requête GET pour rechercher les missions..." -ForegroundColor Yellow
    $searchResult = Invoke-RestMethod -Method Get -Uri "$baseUrl/apres?date=$searchDate" -ErrorAction Stop
    
    Write-Host "`nRésultat de la recherche:" -ForegroundColor Green
    # Limiter l'affichage pour ne pas surcharger la console
    $searchResultJson = $searchResult | ConvertTo-Json -Depth 3
    if ($searchResultJson.Length -gt 500) {
        Write-Host ($searchResultJson.Substring(0, 500) + "... (tronqué)")
    } else {
        Write-Host $searchResultJson
    }
} catch {
    Write-Host "`nErreur lors de la recherche des missions: $_" -ForegroundColor Red
}

# =============== 6. SIMULER UN CALCUL DE MISSION SANS CRÉATION ===============
Write-Host "`n6. SIMULER UN CALCUL DE MISSION SANS CRÉATION" -ForegroundColor Magenta

# Construction du JSON pour la simulation
$simulateJson = @{
  titre = "Mission de simulation"
  typeMission = "CQP_APS"
  dateDebut = "2025-08-01"
  dateFin = "2025-08-10"
  heureDebut = "08:00:00"
  heureFin = "18:00:00"
  nombreAgents = 2
  quantite = 1
  tarifMissionId = 1
  siteId = 7
}

$simulateJsonString = $simulateJson | ConvertTo-Json

Write-Host "Contenu JSON pour la simulation:" -ForegroundColor Yellow
Write-Host $simulateJsonString

try {
    $headers = @{
        "Content-Type" = "application/json"
    }
    $simulateResult = Invoke-RestMethod -Method Post -Uri "$baseUrl/simuler-calcul" -Headers $headers -Body $simulateJsonString -ErrorAction Stop
    
    Write-Host "`nRésultat de la simulation:" -ForegroundColor Green
    Write-Host ($simulateResult | ConvertTo-Json -Depth 3)
} catch {
    Write-Host "`nErreur lors de la simulation de calcul: $_" -ForegroundColor Red
}

# =============== 7. SUPPRESSION DE LA MISSION CRÉÉE ===============
if ($missionId -ne -1) {
    Write-Host "`n7. SUPPRESSION DE LA MISSION" -ForegroundColor Magenta
    
    try {
        Write-Host "Envoi de la requête DELETE pour supprimer la mission..." -ForegroundColor Yellow
        $deleteResult = Invoke-RestMethod -Method Delete -Uri "$baseUrl/$missionId" -ErrorAction Stop
        
        Write-Host "`nRésultat de la suppression:" -ForegroundColor Green
        Write-Host "Mission supprimée avec succès"
        
        # Vérification que la mission a bien été supprimée
        Write-Host "`nVérification de la suppression en essayant de récupérer la mission..." -ForegroundColor Yellow
        try {
            $checkDeleteResult = Invoke-RestMethod -Method Get -Uri "$baseUrl/$missionId" -ErrorAction Stop
            Write-Host "`nAttention: La mission existe toujours après la tentative de suppression!" -ForegroundColor Red
            Write-Host ($checkDeleteResult | ConvertTo-Json -Depth 3)
        } catch {
            Write-Host "`nConfirmation: La mission a bien été supprimée (code 404 reçu)" -ForegroundColor Green
        }
    } catch {
        Write-Host "`nErreur lors de la suppression de la mission: $_" -ForegroundColor Red
    }
}

Write-Host "`n===== Test complet de l'API des missions terminé =====" -ForegroundColor Cyan
