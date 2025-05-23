# Script pour créer un devis avec une mission associée (via cURL)
# Ce script utilise curl pour:
# 1. Créer une nouvelle mission
# 2. Créer un devis associé à cette mission
# 3. Accepter le devis (changer son statut)

# Configuration de base
$baseUrl = "http://localhost:8080/api"
$datePart = (Get-Date).ToString("yyyyMMdd")
$randomPart = Get-Random -Minimum 1000 -Maximum 9999
$missionReference = "MISSION-$datePart-$randomPart"
$devisReference = "DEV-$datePart-$randomPart"

Write-Host "Étape 1: Création d'une nouvelle mission..." -ForegroundColor Yellow

# Créer une mission via curl
$missionCurlCommand = 'curl -s -X POST "http://localhost:8080/api/missions" -H "Content-Type: application/json" -d "{\"titre\":\"Mission test cURL\",\"description\":\"Mission de test via cURL\",\"dateDebut\":\"2025-05-25\",\"dateFin\":\"2025-06-05\",\"heureDebut\":\"09:00:00\",\"heureFin\":\"17:00:00\",\"statutMission\":\"PLANIFIEE\",\"typeMission\":\"SURVEILLANCE\",\"nombreAgents\":2,\"quantite\":80,\"tarifId\":1}"'

$missionResult = Invoke-Expression $missionCurlCommand
Write-Host "Résultat de la création de mission:" -ForegroundColor Cyan
Write-Host $missionResult

try {
    $mission = $missionResult | ConvertFrom-Json
    $missionId = $mission.id
    
    Write-Host "Mission créée avec ID: $missionId" -ForegroundColor Green
    
    Write-Host "`nÉtape 2: Création d'un devis avec la mission associée..." -ForegroundColor Yellow
    
    # Créer un devis qui utilise cette mission
    $devisCurlCommand = "curl -s -X POST `"http://localhost:8080/api/devis`" -H `"Content-Type: application/json`" -d `"{\\`"referenceDevis\\`":\\`"$devisReference\\`",\\`"description\\`":\\`"Devis pour mission de test cURL\\`",\\`"statut\\`":\\`"EN_ATTENTE\\`",\\`"dateValidite\\`":\\`"2025-06-23\\`",\\`"conditionsGenerales\\`":\\`"Conditions générales standard\\`",\\`"entrepriseId\\`":1,\\`"clientId\\`":1,\\`"missionExistanteIds\\`":[\\`"$missionId\\`"]}`""
    
    $devisResult = Invoke-Expression $devisCurlCommand
    Write-Host "Résultat de la création du devis:" -ForegroundColor Cyan
    Write-Host $devisResult
    
    $devis = $devisResult | ConvertFrom-Json
    $devisId = $devis.id
    
    Write-Host "Devis créé avec ID: $devisId" -ForegroundColor Green
    
    Write-Host "`nÉtape 3: Acceptation du devis par l'entreprise..." -ForegroundColor Yellow
    
    # Mettre à jour le statut du devis
    $updateDevisCurlCommand = "curl -s -X PUT `"http://localhost:8080/api/devis/$devisId`" -H `"Content-Type: application/json`" -d `"{\\`"referenceDevis\\`":\\`"$devisReference\\`",\\`"description\\`":\\`"Devis pour mission de test cURL\\`",\\`"statut\\`":\\`"ACCEPTE_PAR_ENTREPRISE\\`",\\`"dateValidite\\`":\\`"2025-06-23\\`",\\`"conditionsGenerales\\`":\\`"Conditions générales standard\\`",\\`"entrepriseId\\`":1,\\`"clientId\\`":1,\\`"missionExistanteIds\\`":[\\`"$missionId\\`"]}`""
    
    $updatedDevisResult = Invoke-Expression $updateDevisCurlCommand
    Write-Host "Résultat de la mise à jour du devis:" -ForegroundColor Cyan
    Write-Host $updatedDevisResult
    
    Write-Host "`nProcessus terminé avec succès!" -ForegroundColor Green
} catch {
    Write-Host "Erreur lors du traitement des résultats: $_" -ForegroundColor Red
}
