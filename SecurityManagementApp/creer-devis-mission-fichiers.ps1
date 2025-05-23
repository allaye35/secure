# Script utilisant des fichiers JSON existants pour créer un devis avec mission
# et l'accepter via l'API

# Configuration
$baseUrl = "http://localhost:8080/api"
$contentType = "application/json"

# Génération de références uniques
$datePart = (Get-Date).ToString("yyyyMMdd")
$randomPart = Get-Random -Minimum 1000 -Maximum 9999
$missionReference = "MISSION-$datePart-$randomPart"
$devisReference = "DEV-$datePart-$randomPart"

Write-Host "ÉTAPE 1: Création d'une mission à partir du fichier JSON..." -ForegroundColor Yellow

# Lire le fichier mission
$missionJson = Get-Content -Raw -Path "mission-sans-agent-2025.json"

# Modification du JSON pour mettre à jour la référence
$missionObj = $missionJson | ConvertFrom-Json
$missionObj.titre = "Mission test $missionReference"
$missionJson = $missionObj | ConvertTo-Json

Write-Host "Payload de la mission:" -ForegroundColor Gray
Write-Host $missionJson

try {
    # Création de la mission
    $mission = Invoke-RestMethod -Method POST -Uri "$baseUrl/missions" -Body $missionJson -ContentType $contentType
    
    Write-Host "Mission créée avec ID: $($mission.id)" -ForegroundColor Green
    
    Write-Host "`nÉTAPE 2: Création d'un devis avec la mission..." -ForegroundColor Yellow
    
    # Lire le fichier devis
    $devisJson = Get-Content -Raw -Path "devis-complet-test.json"
    
    # Modification du JSON pour mettre à jour la référence et l'ID de mission
    $devisObj = $devisJson | ConvertFrom-Json
    $devisObj.referenceDevis = $devisReference
    $devisObj.description = "Devis pour mission $missionReference"
    $devisObj.missionExistanteIds = @($mission.id)
    $devisJson = $devisObj | ConvertTo-Json
    
    Write-Host "Payload du devis:" -ForegroundColor Gray
    Write-Host $devisJson
    
    # Création du devis
    $devis = Invoke-RestMethod -Method POST -Uri "$baseUrl/devis" -Body $devisJson -ContentType $contentType
    
    Write-Host "Devis créé avec ID: $($devis.id)" -ForegroundColor Green
    
    Write-Host "`nÉTAPE 3: Acceptation du devis..." -ForegroundColor Yellow
    
    # Préparation du payload pour la mise à jour du devis
    $devisObj.statut = "ACCEPTE_PAR_ENTREPRISE"
    $updateDevisJson = $devisObj | ConvertTo-Json
    
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
