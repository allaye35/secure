# Script pour créer un devis avec une mission associée et l'accepter
# Ce script va:
# 1. Créer une nouvelle mission
# 2. Créer un devis associé à cette mission
# 3. Accepter le devis (changer son statut)

# Configuration
$baseUrl = "http://localhost:8080/api"
$contentType = "application/json"

# Génération de références uniques
$datePart = (Get-Date).ToString("yyyyMMdd")
$randomPart = Get-Random -Minimum 1000 -Maximum 9999
$missionReference = "MISSION-$datePart-$randomPart"
$devisReference = "DEV-$datePart-$randomPart"

Write-Host "ÉTAPE 1: Création d'une mission..." -ForegroundColor Yellow

# Préparation du payload pour la mission
$missionPayload = @{
    titre = "Mission test PowerShell $missionReference"
    description = "Mission de test via PowerShell"
    dateDebut = (Get-Date).ToString("yyyy-MM-dd")
    dateFin = (Get-Date).AddDays(15).ToString("yyyy-MM-dd")
    heureDebut = "09:00:00"
    heureFin = "17:00:00"
    statutMission = "PLANIFIEE"
    typeMission = "SURVEILLANCE"
    nombreAgents = 2
    quantite = 80
    tarifId = 1
}

$missionJson = $missionPayload | ConvertTo-Json
Write-Host "Payload de la mission:" -ForegroundColor Gray
Write-Host $missionJson

try {
    # Création de la mission
    $mission = Invoke-RestMethod -Method POST -Uri "$baseUrl/missions" -Body $missionJson -ContentType $contentType
    
    Write-Host "Mission créée avec ID: $($mission.id)" -ForegroundColor Green
    
    Write-Host "`nÉTAPE 2: Création d'un devis avec la mission..." -ForegroundColor Yellow
    
    # Préparation du payload pour le devis
    $devisPayload = @{
        referenceDevis = $devisReference
        description = "Devis pour mission $missionReference"
        statut = "EN_ATTENTE"
        dateValidite = (Get-Date).AddMonths(1).ToString("yyyy-MM-dd")
        conditionsGenerales = "Conditions générales standard"
        entrepriseId = 1
        clientId = 1
        missionExistanteIds = @($mission.id)
    }
    
    $devisJson = $devisPayload | ConvertTo-Json
    Write-Host "Payload du devis:" -ForegroundColor Gray
    Write-Host $devisJson
    
    # Création du devis
    $devis = Invoke-RestMethod -Method POST -Uri "$baseUrl/devis" -Body $devisJson -ContentType $contentType
    
    Write-Host "Devis créé avec ID: $($devis.id)" -ForegroundColor Green
    
    Write-Host "`nÉTAPE 3: Acceptation du devis..." -ForegroundColor Yellow
    
    # Préparation du payload pour la mise à jour du devis
    $updateDevisPayload = @{
        referenceDevis = $devis.referenceDevis
        description = $devis.description
        statut = "ACCEPTE_PAR_ENTREPRISE"
        dateValidite = $devis.dateValidite
        conditionsGenerales = $devis.conditionsGenerales
        entrepriseId = $devis.entrepriseId
        clientId = $devis.clientId
        missionExistanteIds = @($mission.id)
    }
    
    $updateDevisJson = $updateDevisPayload | ConvertTo-Json
    
    # Mise à jour du devis
    $updatedDevis = Invoke-RestMethod -Method PUT -Uri "$baseUrl/devis/$($devis.id)" -Body $updateDevisJson -ContentType $contentType
    
    Write-Host "Devis accepté! Nouveau statut: $($updatedDevis.statut)" -ForegroundColor Green
    
    # Afficher le résultat final
    Write-Host "`nRésumé du devis avec mission:" -ForegroundColor Cyan
    $updatedDevis | ConvertTo-Json -Depth 3
    
} catch {
    Write-Host "Erreur lors de l'opération" -ForegroundColor Red
    
    if ($_.Exception.Response -ne $null) {
        Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
    
    Write-Host "Message d'erreur: $($_.Exception.Message)" -ForegroundColor Red
    
    # Essayer d'obtenir plus de détails sur l'erreur
    if ($_.ErrorDetails.Message) {
        try {
            $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "Détails: $($errorDetails)" -ForegroundColor Red
        } catch {
            Write-Host "Détails: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    }
}
