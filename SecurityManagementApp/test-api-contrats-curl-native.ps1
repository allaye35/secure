# Test API Contrat - Utilisation de curl.exe directement

# Configuration
$baseUrl = "http://localhost:8080/api/contrats"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reference = "CONTRAT-TEST-CURL-$timestamp"

Write-Host "===== TEST API CONTRATS AVEC CURL.EXE =====" -ForegroundColor Cyan
Write-Host "Référence: $reference" -ForegroundColor Green

# Préparation du fichier JSON de test
$jsonFile = "temp-curl-$timestamp.json"
$jsonContent = Get-Content -Path "test-api-contrat.json" -Raw | ConvertFrom-Json
$jsonContent.referenceContrat = $reference
$jsonContent | ConvertTo-Json | Out-File -FilePath $jsonFile -Encoding utf8

# 1. Création d'un contrat
Write-Host "`n[1] CRÉATION D'UN CONTRAT" -ForegroundColor Yellow

# Utilisation de curl.exe (chemin complet)
$curlResult = & "C:\Windows\System32\curl.exe" -s -X POST "$baseUrl" -H "Content-Type: application/json" -d "@$jsonFile"
Write-Host $curlResult -ForegroundColor White

# Convertir le résultat JSON en objet PowerShell
$contractObj = $curlResult | ConvertFrom-Json
$contractId = $contractObj.id
Write-Host "Contrat créé avec ID: $contractId" -ForegroundColor Green

# Supprimer le fichier temporaire
Remove-Item -Path $jsonFile -Force

# 2. Récupération par ID
Write-Host "`n[2] RÉCUPÉRATION PAR ID" -ForegroundColor Yellow
$getByIdResult = & "C:\Windows\System32\curl.exe" -s -X GET "$baseUrl/$contractId"
Write-Host $getByIdResult -ForegroundColor White

# 3. Récupération par référence
Write-Host "`n[3] RÉCUPÉRATION PAR RÉFÉRENCE" -ForegroundColor Yellow
$getByRefResult = & "C:\Windows\System32\curl.exe" -s -X GET "$baseUrl/ref/$reference"
Write-Host $getByRefResult -ForegroundColor White

# 4. Modification du contrat
Write-Host "`n[4] MODIFICATION DU CONTRAT" -ForegroundColor Yellow

# Préparer les modifications
$updateObj = $getByIdResult | ConvertFrom-Json
$updateObj.dureeMois = 24
$updateObj.preavisMois = 3

$updateFile = "temp-update-$timestamp.json"
$updateObj | ConvertTo-Json | Out-File -FilePath $updateFile -Encoding utf8

# Envoyer la mise à jour
$updateResult = & "C:\Windows\System32\curl.exe" -s -X PUT "$baseUrl/$contractId" -H "Content-Type: application/json" -d "@$updateFile"
Write-Host $updateResult -ForegroundColor White

# Supprimer le fichier temporaire
Remove-Item -Path $updateFile -Force

# 5. Récupération par ID de devis
Write-Host "`n[5] RÉCUPÉRATION PAR ID DE DEVIS" -ForegroundColor Yellow
$devisId = ($updateResult | ConvertFrom-Json).devisId

if ($devisId) {
    $getByDevisResult = & "C:\Windows\System32\curl.exe" -s -X GET "$baseUrl/devis/$devisId"
    Write-Host $getByDevisResult -ForegroundColor White
} else {
    Write-Host "Pas d'ID de devis disponible" -ForegroundColor Yellow
}

# 6. Suppression du contrat
Write-Host "`n[6] SUPPRESSION DU CONTRAT" -ForegroundColor Yellow
$confirmation = Read-Host "Voulez-vous supprimer le contrat créé (ID: $contractId)? (O/N)"

if ($confirmation -eq "O" -or $confirmation -eq "o") {
    $deleteResult = & "C:\Windows\System32\curl.exe" -s -X DELETE "$baseUrl/$contractId"
    Write-Host $deleteResult -ForegroundColor White
    
    # Vérifier la suppression
    $checkResult = & "C:\Windows\System32\curl.exe" -s -X GET "$baseUrl/$contractId"
    
    if ([String]::IsNullOrEmpty($checkResult) -or $checkResult -match "error") {
        Write-Host "Vérification: Le contrat a bien été supprimé" -ForegroundColor Green
    } else {
        Write-Host "Erreur: Le contrat existe toujours après suppression!" -ForegroundColor Red
    }
} else {
    Write-Host "Suppression annulée, le contrat a été conservé" -ForegroundColor Yellow
}

Write-Host "`n===== TEST TERMINÉ =====" -ForegroundColor Cyan
