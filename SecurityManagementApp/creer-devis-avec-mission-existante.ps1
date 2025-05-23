# Script pour créer un devis avec une mission existante et l'accepter
# Ce script va:
# 1. Récupérer une mission existante
# 2. Créer un devis associé à cette mission
# 3. Accepter le devis (changer son statut)

# Configuration de base
$baseUrl = "http://localhost:8080/api"
$contentType = "application/json"
$headers = @{
    "Content-Type" = "application/json"
}

# Génération d'un identifiant unique pour le devis
$datePart = (Get-Date).ToString("yyyyMMdd")
$randomPart = Get-Random -Minimum 1000 -Maximum 9999
$devisReference = "DEV-$datePart-$randomPart"

# Étape 1: Récupérer une mission existante (par exemple, avec l'ID 8)
$missionId = 8
Write-Host "Étape 1: Récupération de la mission avec ID $missionId..." -ForegroundColor Yellow

try {
    $mission = Invoke-RestMethod -Method GET -Uri "$baseUrl/missions/$missionId" -ContentType $contentType
    
    Write-Host "Mission récupérée avec succès!" -ForegroundColor Green
    Write-Host "Titre de la mission: $($mission.titre)" -ForegroundColor Yellow
    
    # Étape 2: Créer un devis associé à cette mission
    Write-Host "`nÉtape 2: Création d'un devis avec la mission associée..." -ForegroundColor Yellow
    
    $devisJson = @{
        "referenceDevis" = $devisReference
        "description" = "Devis pour mission de sécurité existante"
        "statut" = "EN_ATTENTE"
        "dateValidite" = (Get-Date).AddMonths(1).ToString("yyyy-MM-dd")
        "conditionsGenerales" = "Conditions générales standard"
        "entrepriseId" = 1
        "clientId" = 1
        "missionExistanteIds" = @($missionId)
    } | ConvertTo-Json
    
    $devisResponse = Invoke-RestMethod -Method POST -Uri "$baseUrl/devis" -Body $devisJson -ContentType $contentType
    
    Write-Host "Devis créé avec succès!" -ForegroundColor Green
    Write-Host "ID du devis: $($devisResponse.id)" -ForegroundColor Yellow
    Write-Host "Référence du devis: $($devisResponse.referenceDevis)" -ForegroundColor Yellow
    
    # Étape 3: Accepter le devis (changer son statut)
    Write-Host "`nÉtape 3: Acceptation du devis par l'entreprise..." -ForegroundColor Yellow
    
    # Créer un objet pour la mise à jour du devis (on conserve toutes les données mais on change le statut)
    $updateDevisJson = @{
        "referenceDevis" = $devisResponse.referenceDevis
        "description" = $devisResponse.description
        "statut" = "ACCEPTE_PAR_ENTREPRISE"
        "dateValidite" = $devisResponse.dateValidite
        "conditionsGenerales" = $devisResponse.conditionsGenerales
        "entrepriseId" = $devisResponse.entrepriseId
        "clientId" = $devisResponse.clientId
        "missionExistanteIds" = @($missionId)
    } | ConvertTo-Json
    
    $updatedDevis = Invoke-RestMethod -Method PUT -Uri "$baseUrl/devis/$($devisResponse.id)" -Body $updateDevisJson -ContentType $contentType
    
    Write-Host "Devis accepté avec succès!" -ForegroundColor Green
    Write-Host "Statut du devis mis à jour: $($updatedDevis.statut)" -ForegroundColor Yellow
    
    # Afficher le résultat final
    Write-Host "`nRésumé du devis avec mission:" -ForegroundColor Cyan
    $updatedDevis | ConvertTo-Json -Depth 3
    
} catch {
    Write-Host "Erreur lors de l'opération" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    # Essayer d'obtenir plus de détails sur l'erreur
    if ($_.ErrorDetails.Message) {
        try {
            $errorInfo = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "Message d'erreur: $($errorInfo.message)" -ForegroundColor Red
        } catch {
            Write-Host "Message d'erreur: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "Message d'erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}
