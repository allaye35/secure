# Script pour créer un devis avec une mission associée
# Ce script va:
# 1. Créer une nouvelle mission
# 2. Créer un devis associé à cette mission

# Configuration de base
$baseUrl = "http://localhost:8080/api"
$contentType = "application/json"

# Génération d\'identifiants uniques
$datePart = (Get-Date).ToString("yyyyMMdd")
$randomPart = Get-Random -Minimum 1000 -Maximum 9999
$missionReference = "MISSION-$datePart-$randomPart"
$devisReference = "DEV-$datePart-$randomPart"

$newMissionId = $null

# Étape 1: Créer une nouvelle mission
Write-Host "Étape 1: Création d\'une nouvelle mission..." -ForegroundColor Yellow
$missionPayload = @{
    "referenceMission" = $missionReference
    "titre" = "Mission de sécurité - $missionReference"
    "description" = "Mission de surveillance créée par script PowerShell pour devis"
    "dateDebut" = (Get-Date).ToString("yyyy-MM-dd")
    "dateFin" = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
    "heureDebut" = "08:00:00"
    "heureFin" = "18:00:00"
    "typeMission" = "SURVEILLANCE" 
    "nombreAgents" = 2
    "quantite" = 40 # Nombre d\'heures total, par exemple
    "tarifId" = 1 # ID d\'un tarif existant
    "entrepriseId" = 1 # ID de l\'entreprise prestataire
    "clientId" = 1 # ID du client bénéficiaire
} | ConvertTo-Json

Write-Host "Payload de la mission :"
Write-Host $missionPayload -ForegroundColor Cyan

try {
    $missionResponse = Invoke-RestMethod -Method POST -Uri "$baseUrl/missions" -Body $missionPayload -ContentType $contentType
    Write-Host "Mission créée avec succès!" -ForegroundColor Green
    Write-Host "ID de la mission: $($missionResponse.id)" -ForegroundColor Yellow
    $newMissionId = $missionResponse.id
} catch {
    Write-Host "Erreur lors de la création de la mission" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "StatusDescription: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        try { 
            $errorInfo = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "Message d\'erreur API: $($errorInfo.message)" -ForegroundColor Red 
        } catch { 
            Write-Host "Message d\'erreur brut: $($_.ErrorDetails.Message)" -ForegroundColor Red 
        }
    } else { 
        Write-Host "Message d\'erreur général: $($_.Exception.Message)" -ForegroundColor Red 
    }
    exit 1 # Arrêter le script si la création de la mission échoue
}

if ($null -eq $newMissionId) {
    Write-Host "Impossible de continuer: l\'ID de la mission n\'a pas été récupéré." -ForegroundColor Red
    exit 1
}

# Étape 2: Créer un devis associé à cette mission
Write-Host "`nÉtape 2: Création d\'un devis avec la mission $($newMissionId) associée..." -ForegroundColor Yellow
$devisPayload = @{
    "referenceDevis" = $devisReference
    "description" = "Devis pour mission de sécurité $missionReference"
    "statut" = "EN_ATTENTE"
    "dateValidite" = (Get-Date).AddMonths(1).ToString("yyyy-MM-dd")
    "conditionsGenerales" = "Conditions générales standard"
    "entrepriseId" = 1 # ID de l\'entreprise prestataire
    "clientId" = 1 # ID du client bénéficiaire
    "missionExistanteIds" = @($newMissionId) # Utiliser l\'ID de la mission créée à l\'étape 1
} | ConvertTo-Json

Write-Host "Payload du devis :"
Write-Host $devisPayload -ForegroundColor Cyan

try {
    $devisResponse = Invoke-RestMethod -Method POST -Uri "$baseUrl/devis" -Body $devisPayload -ContentType $contentType
    
    Write-Host "Devis créé avec succès!" -ForegroundColor Green
    Write-Host "ID du devis: $($devisResponse.id)" -ForegroundColor Yellow
    Write-Host "Référence du devis: $($devisResponse.referenceDevis)" -ForegroundColor Yellow
    
    Write-Host "`nDétails du devis créé:" -ForegroundColor Green
    $devisResponse | ConvertTo-Json -Depth 3 | Write-Host
} catch {
    Write-Host "Erreur lors de la création du devis" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "StatusDescription: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        try { 
            $errorInfo = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "Message d\'erreur API: $($errorInfo.message)" -ForegroundColor Red 
        } catch { 
            Write-Host "Message d\'erreur brut: $($_.ErrorDetails.Message)" -ForegroundColor Red 
        }
    } else { 
        Write-Host "Message d\'erreur général: $($_.Exception.Message)" -ForegroundColor Red 
    }
}
