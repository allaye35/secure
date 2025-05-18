# Test API Contrat sans gestion de fichier avec curl - Version simplifiée

# Configuration
$baseUrl = "http://localhost:8080/api/contrats"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reference = "CONTRAT-TEST-$timestamp"

# Récupérer le contrat JSON de test
$jsonContract = Get-Content -Path "test-api-contrat.json" -Raw
$jsonContract = $jsonContract -replace "CONTRAT-2025-API-TEST", $reference

Write-Host "===== TEST API CONTRATS AVEC CURL =====" -ForegroundColor Cyan
Write-Host "Référence générée: $reference" -ForegroundColor Green

# ÉTAPE 1: Créer un contrat
Write-Host "`n[1] CRÉATION D'UN CONTRAT" -ForegroundColor Yellow
Write-Host "Envoi requête POST..." -ForegroundColor Gray

$tempFile = "temp-curl-contract-$timestamp.json"
$jsonContract | Out-File -FilePath $tempFile -Encoding utf8

$curlCreate = "curl -s -X POST $baseUrl -H `"Content-Type: application/json`" -d `"@$tempFile`""
Write-Host "Exécution: $curlCreate" -ForegroundColor Gray

$createResult = Invoke-Expression $curlCreate

# Nettoyer le fichier temporaire
Remove-Item -Path $tempFile -Force -ErrorAction SilentlyContinue

Write-Host "Résultat création:" -ForegroundColor Magenta
Write-Host $createResult -ForegroundColor White

# Extraire l'ID du contrat créé
try {
    $contractObj = $createResult | ConvertFrom-Json
    $contractId = $contractObj.id
    Write-Host "Contrat créé avec ID: $contractId" -ForegroundColor Green
} catch {
    Write-Host "Échec de la création du contrat ou impossible de parser le résultat JSON" -ForegroundColor Red
    exit
}

# ÉTAPE 2: Récupérer le contrat par ID
Write-Host "`n[2] RÉCUPÉRATION PAR ID" -ForegroundColor Yellow
$curlGetById = "curl -s -X GET `"$baseUrl/$contractId`""
Write-Host "Exécution: $curlGetById" -ForegroundColor Gray

$getByIdResult = Invoke-Expression $curlGetById
Write-Host "Résultat récupération par ID:" -ForegroundColor Magenta
Write-Host $getByIdResult -ForegroundColor White

# ÉTAPE 3: Récupérer le contrat par référence
Write-Host "`n[3] RÉCUPÉRATION PAR RÉFÉRENCE" -ForegroundColor Yellow
$curlGetByRef = "curl -s -X GET `"$baseUrl/ref/$reference`""
Write-Host "Exécution: $curlGetByRef" -ForegroundColor Gray

$getByRefResult = Invoke-Expression $curlGetByRef
Write-Host "Résultat récupération par référence:" -ForegroundColor Magenta
Write-Host $getByRefResult -ForegroundColor White

# ÉTAPE 4: Modifier le contrat
Write-Host "`n[4] MODIFICATION DU CONTRAT" -ForegroundColor Yellow

# Créer un JSON modifié pour le update
$contractObj = $getByIdResult | ConvertFrom-Json
$contractObj.dureeMois = 24
$contractObj.preavisMois = 3
$updatedJson = $contractObj | ConvertTo-Json

$tempUpdateFile = "temp-curl-update-$timestamp.json"
$updatedJson | Out-File -FilePath $tempUpdateFile -Encoding utf8

$curlUpdate = "curl -s -X PUT `"$baseUrl/$contractId`" -H `"Content-Type: application/json`" -d `"@$tempUpdateFile`""
Write-Host "Exécution: $curlUpdate" -ForegroundColor Gray

$updateResult = Invoke-Expression $curlUpdate

# Nettoyer le fichier temporaire de mise à jour
Remove-Item -Path $tempUpdateFile -Force -ErrorAction SilentlyContinue

Write-Host "Résultat modification:" -ForegroundColor Magenta
Write-Host $updateResult -ForegroundColor White

# ÉTAPE 5: Récupérer par ID de devis
Write-Host "`n[5] RÉCUPÉRATION PAR ID DE DEVIS" -ForegroundColor Yellow
try {
    $devisId = ($getByIdResult | ConvertFrom-Json).devisId
    
    if ($devisId) {
        $curlGetByDevisId = "curl -s -X GET `"$baseUrl/devis/$devisId`""
        Write-Host "Exécution: $curlGetByDevisId" -ForegroundColor Gray
        
        $getByDevisResult = Invoke-Expression $curlGetByDevisId
        
        Write-Host "Résultat récupération par ID de devis:" -ForegroundColor Magenta
        Write-Host $getByDevisResult -ForegroundColor White
    } else {
        Write-Host "Pas d'ID de devis disponible pour le test" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Erreur lors de la récupération de l'ID du devis" -ForegroundColor Red
}

# ÉTAPE 6: Suppression (optionnelle)
Write-Host "`n[6] SUPPRESSION DU CONTRAT" -ForegroundColor Yellow
$confirmation = Read-Host "Voulez-vous supprimer le contrat créé (ID: $contractId)? (O/N)"

if ($confirmation -eq "O" -or $confirmation -eq "o") {
    $curlDelete = "curl -s -X DELETE `"$baseUrl/$contractId`""
    Write-Host "Exécution: $curlDelete" -ForegroundColor Gray
    
    $deleteResult = Invoke-Expression $curlDelete
    Write-Host "Résultat suppression:" -ForegroundColor Magenta
    Write-Host $deleteResult -ForegroundColor White
    
    # Vérification que le contrat n'existe plus
    $checkAfterDelete = Invoke-Expression $curlGetById
    
    if ([string]::IsNullOrEmpty($checkAfterDelete) -or ($checkAfterDelete | ConvertFrom-Json).error) {
        Write-Host "✅ Le contrat a bien été supprimé" -ForegroundColor Green
    } else {
        Write-Host "❌ Le contrat existe toujours après suppression" -ForegroundColor Red
    }
} else {
    Write-Host "Suppression annulée. Le contrat (ID: $contractId) est conservé." -ForegroundColor Yellow
}

Write-Host "`n===== TEST TERMINÉ =====" -ForegroundColor Cyan
