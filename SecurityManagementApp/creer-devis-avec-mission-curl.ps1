# Script pour créer un devis avec une mission associée et l'accepter en utilisant CURL
# Ce script utilise curl via PowerShell pour:
# 1. Créer une nouvelle mission
# 2. Créer un devis associé à cette mission
# 3. Accepter le devis (changer son statut)

# Configuration de base
$baseUrl = "http://localhost:8080/api"
$datePart = (Get-Date).ToString("yyyyMMdd")
$randomPart = Get-Random -Minimum 1000 -Maximum 9999
$missionReference = "MISSION-$datePart-$randomPart"
$devisReference = "DEV-$datePart-$randomPart"

# Fonction pour exécuter une commande curl
function Invoke-Curl {
    param (
        [string]$method,
        [string]$url,
        [string]$data
    )
    
    $curlCommand = "curl -s -X $method -H `"Content-Type: application/json`" -d `"$data`" $url"
    Write-Host "Exécution de: $curlCommand" -ForegroundColor Gray
    $result = Invoke-Expression $curlCommand
    return $result
}

# Étape 1: Créer une nouvelle mission
Write-Host "Étape 1: Création d'une nouvelle mission..." -ForegroundColor Yellow

$missionData = @{
    titre = "Mission de sécurité - $missionReference"
    description = "Mission de surveillance créée par script curl"
    dateDebut = (Get-Date).ToString("yyyy-MM-dd")
    dateFin = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
    heureDebut = "08:00:00"
    heureFin = "18:00:00"
    typeMission = "SURVEILLANCE"
    nombreAgents = 2
    quantite = 40
    tarifId = 1
} | ConvertTo-Json -Compress

# Échapper les guillemets pour curl
$missionData = $missionData.Replace('"', '\"')

try {
    $missionResult = Invoke-Curl -method "POST" -url "$baseUrl/missions" -data $missionData
    $missionResponse = $missionResult | ConvertFrom-Json
    
    Write-Host "Mission créée avec succès!" -ForegroundColor Green
    Write-Host "ID de la mission: $($missionResponse.id)" -ForegroundColor Yellow
    
    # Étape 2: Créer un devis associé à cette mission
    Write-Host "`nÉtape 2: Création d'un devis avec la mission associée..." -ForegroundColor Yellow
    
    $devisData = @{
        referenceDevis = $devisReference
        description = "Devis pour mission de sécurité $missionReference"
        statut = "EN_ATTENTE"
        dateValidite = (Get-Date).AddMonths(1).ToString("yyyy-MM-dd")
        conditionsGenerales = "Conditions générales standard"
        entrepriseId = 1
        clientId = 1
        missionExistanteIds = @($missionResponse.id)
    } | ConvertTo-Json -Compress
    
    # Échapper les guillemets pour curl
    $devisData = $devisData.Replace('"', '\"')
    
    $devisResult = Invoke-Curl -method "POST" -url "$baseUrl/devis" -data $devisData
    $devisResponse = $devisResult | ConvertFrom-Json
    
    Write-Host "Devis créé avec succès!" -ForegroundColor Green
    Write-Host "ID du devis: $($devisResponse.id)" -ForegroundColor Yellow
    Write-Host "Référence du devis: $($devisResponse.referenceDevis)" -ForegroundColor Yellow
    
    # Étape 3: Accepter le devis (changer son statut)
    Write-Host "`nÉtape 3: Acceptation du devis par l'entreprise..." -ForegroundColor Yellow
    
    # Créer un objet pour la mise à jour du devis
    $updateDevisData = @{
        referenceDevis = $devisResponse.referenceDevis
        description = $devisResponse.description
        statut = "ACCEPTE_PAR_ENTREPRISE"
        dateValidite = $devisResponse.dateValidite
        conditionsGenerales = $devisResponse.conditionsGenerales
        entrepriseId = $devisResponse.entrepriseId
        clientId = $devisResponse.clientId
        missionExistanteIds = @($missionResponse.id)
    } | ConvertTo-Json -Compress
    
    # Échapper les guillemets pour curl
    $updateDevisData = $updateDevisData.Replace('"', '\"')
    
    $updatedDevisResult = Invoke-Curl -method "PUT" -url "$baseUrl/devis/$($devisResponse.id)" -data $updateDevisData
    $updatedDevis = $updatedDevisResult | ConvertFrom-Json
    
    Write-Host "Devis accepté avec succès!" -ForegroundColor Green
    Write-Host "Statut du devis mis à jour: $($updatedDevis.statut)" -ForegroundColor Yellow
    
    # Afficher le résultat final
    Write-Host "`nRésumé du devis avec mission:" -ForegroundColor Cyan
    $updatedDevis | ConvertTo-Json -Depth 3
    
} catch {
    Write-Host "Erreur lors de l'opération" -ForegroundColor Red
    Write-Host "Détails de l'erreur: $_" -ForegroundColor Red
}
