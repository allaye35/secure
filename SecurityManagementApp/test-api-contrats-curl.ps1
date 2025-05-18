# Script pour tester l'API de contrats avec curl
# Utiliser curl pour tester les endpoints de l'API Contrats sans gestion de fichiers
# -----------------------------------------------------------

# Configuration de base
$baseUrl = "http://localhost:8080/api/contrats"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reference = "CONTRAT-TEST-$timestamp"

Write-Host "===== TEST DE L'API CONTRATS AVEC CURL (SANS GESTION DE FICHIERS) =====" -ForegroundColor Cyan

# Charger le contrat JSON de test
$contratJson = Get-Content -Path "test-api-contrat.json" -Raw | ConvertFrom-Json

# Modifier la référence pour éviter les conflits
$contratJson.referenceContrat = $reference

# Utiliser un devis ID fictif si nécessaire (peut être modifié)
$devisId = $contratJson.devisId

# Convertir à nouveau en JSON pour l'envoi
$jsonContent = $contratJson | ConvertTo-Json

# 1. Création d'un contrat
Write-Host "`n1. TEST CREATION D'UN CONTRAT" -ForegroundColor Yellow
Write-Host "Envoi de la requête création avec devisId: $devisId..." -ForegroundColor Yellow

$jsonFile = "temp-contrat-$timestamp.json"
$jsonContent | Out-File -FilePath $jsonFile

$response = Invoke-Expression "curl -s -X POST $baseUrl -H 'Content-Type: application/json' -d '@$jsonFile'" | ConvertFrom-Json

if ($null -eq $response.id) {
    Write-Host "Erreur lors de la création du contrat" -ForegroundColor Red
    Write-Host $response -ForegroundColor Red
    exit
}

$contratId = $response.id
Write-Host "Contrat créé avec succès ID: $contratId" -ForegroundColor Green
Write-Host "Détails:" -ForegroundColor Green
$response | Format-List

# Nettoyer le fichier temporaire
Remove-Item -Path $jsonFile -Force

# 2. Récupération du contrat par ID
Write-Host "`n2. TEST RECUPERATION D'UN CONTRAT PAR ID" -ForegroundColor Yellow

$getResponse = Invoke-Expression "curl -s -X GET `"$baseUrl/$contratId`"" | ConvertFrom-Json

if ($null -eq $getResponse.id) {
    Write-Host "Erreur lors de la récupération du contrat" -ForegroundColor Red
    exit
}

Write-Host "Contrat récupéré avec succès:" -ForegroundColor Green
$getResponse | Format-List

# 3. Récupération du contrat par référence
Write-Host "`n3. TEST RECUPERATION D'UN CONTRAT PAR REFERENCE" -ForegroundColor Yellow

$refResponse = Invoke-Expression "curl -s -X GET `"$baseUrl/ref/$reference`"" | ConvertFrom-Json

if ($null -eq $refResponse.id) {
    Write-Host "Erreur lors de la récupération du contrat par référence" -ForegroundColor Red
    exit
}

Write-Host "Contrat récupéré par référence avec succès:" -ForegroundColor Green
$refResponse | Format-List

# 4. Récupération de tous les contrats
Write-Host "`n4. TEST RECUPERATION DE TOUS LES CONTRATS" -ForegroundColor Yellow

$allResponse = Invoke-Expression "curl -s -X GET $baseUrl" | ConvertFrom-Json

Write-Host "Nombre de contrats récupérés: $($allResponse.Count)" -ForegroundColor Green

# 5. Test de modification d'un contrat
Write-Host "`n5. TEST MODIFICATION D'UN CONTRAT" -ForegroundColor Yellow

# Modification des propriétés pour le test
$contratJson.dureeMois = 24
$contratJson.preavisMois = 3

# Convertir en JSON pour l'envoi
$jsonContentUpdate = $contratJson | ConvertTo-Json
$jsonUpdateFile = "temp-contrat-update-$timestamp.json"
$jsonContentUpdate | Out-File -FilePath $jsonUpdateFile

$updateResponse = Invoke-Expression "curl -s -X PUT `"$baseUrl/$contratId`" -H 'Content-Type: application/json' -d '@$jsonUpdateFile'" | ConvertFrom-Json

# Nettoyer le fichier temporaire
Remove-Item -Path $jsonUpdateFile -Force

if ($null -eq $updateResponse.id) {
    Write-Host "Erreur lors de la modification du contrat" -ForegroundColor Red
    exit
}

Write-Host "Contrat modifié avec succès:" -ForegroundColor Green
$updateResponse | Format-List

# Vérifier que les modifications ont bien été appliquées
if ($updateResponse.dureeMois -eq 24 -and $updateResponse.preavisMois -eq 3) {
    Write-Host "✓ Vérification des modifications: OK" -ForegroundColor Green
} else {
    Write-Host "❌ Vérification des modifications: KO" -ForegroundColor Red
}

# 6. Test de récupération par ID de devis
Write-Host "`n6. TEST RECUPERATION D'UN CONTRAT PAR ID DE DEVIS" -ForegroundColor Yellow

$devisIdResponse = Invoke-Expression "curl -s -X GET `"$baseUrl/devis/$devisId`"" | ConvertFrom-Json

if ($null -eq $devisIdResponse.id) {
    Write-Host "⚠️ Pas de contrat trouvé pour le devis ID: $devisId" -ForegroundColor Yellow
} else {
    Write-Host "Contrat récupéré par ID de devis avec succès:" -ForegroundColor Green
    $devisIdResponse | Format-List
}

# 7. Suppression du contrat (avec confirmation)
Write-Host "`n7. TEST SUPPRESSION D'UN CONTRAT" -ForegroundColor Yellow

$confirmation = Read-Host "Voulez-vous supprimer le contrat créé pour ce test? (O/N)"

if ($confirmation -eq "O" -or $confirmation -eq "o") {
    Invoke-Expression "curl -s -X DELETE `"$baseUrl/$contratId`""
    Write-Host "Commande de suppression envoyée pour le contrat ID: $contratId" -ForegroundColor Green
    
    # Vérification de la suppression
    $testDelete = Invoke-Expression "curl -s -X GET `"$baseUrl/$contratId`""
    if ($testDelete -match "error|introuvable|not found" -or $testDelete -eq "") {
        Write-Host "✓ Vérification de suppression: Le contrat n'existe plus" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur: Le contrat existe toujours après suppression!" -ForegroundColor Red
    }
} else {
    Write-Host "Suppression annulée. Le contrat ID: $contratId est conservé." -ForegroundColor Yellow
}

Write-Host "`n===== FIN DES TESTS CURL =====" -ForegroundColor Cyan
