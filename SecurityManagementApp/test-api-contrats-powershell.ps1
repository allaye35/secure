# Test API Contrat sans gestion de fichier - Avec Invoke-RestMethod
# Script PowerShell pour tester l'API des contrats

# Configuration
$baseUrl = "http://localhost:8080/api/contrats"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reference = "CONTRAT-TEST-PS-$timestamp"

# En-têtes pour les requêtes
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "===== TEST API CONTRATS AVEC POWERSHELL =====" -ForegroundColor Cyan
Write-Host "Référence générée: $reference" -ForegroundColor Green

# Récupérer et modifier le contrat JSON de test
$contractData = Get-Content -Path "test-api-contrat.json" | ConvertFrom-Json
$contractData.referenceContrat = $reference

# ÉTAPE 1: Créer un contrat
Write-Host "`n[1] CRÉATION D'UN CONTRAT" -ForegroundColor Yellow
try {
    $contractJson = $contractData | ConvertTo-Json
    Write-Host "Envoi données: $contractJson" -ForegroundColor Gray
    
    $createResponse = Invoke-RestMethod -Uri $baseUrl -Method Post -Headers $headers -Body $contractJson
    
    $contractId = $createResponse.id
    Write-Host "Contrat créé avec ID: $contractId" -ForegroundColor Green
    Write-Host "Détails du contrat créé:" -ForegroundColor Magenta
    $createResponse | Format-List
} catch {
    Write-Host "Erreur lors de la création du contrat: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Détails de l'erreur: $errorBody" -ForegroundColor Red
    }
    exit
}

# ÉTAPE 2: Récupérer le contrat par ID
Write-Host "`n[2] RÉCUPÉRATION PAR ID" -ForegroundColor Yellow
try {
    $getByIdResponse = Invoke-RestMethod -Uri "$baseUrl/$contractId" -Method Get
    Write-Host "Contrat récupéré avec succès:" -ForegroundColor Green
    $getByIdResponse | Format-List
} catch {
    Write-Host "Erreur lors de la récupération du contrat par ID: $_" -ForegroundColor Red
    exit
}

# ÉTAPE 3: Récupérer le contrat par référence
Write-Host "`n[3] RÉCUPÉRATION PAR RÉFÉRENCE" -ForegroundColor Yellow
try {
    $getByRefResponse = Invoke-RestMethod -Uri "$baseUrl/ref/$reference" -Method Get
    Write-Host "Contrat récupéré par référence avec succès:" -ForegroundColor Green
    $getByRefResponse | Format-List
} catch {
    Write-Host "Erreur lors de la récupération du contrat par référence: $_" -ForegroundColor Red
    exit
}

# ÉTAPE 4: Modifier le contrat
Write-Host "`n[4] MODIFICATION DU CONTRAT" -ForegroundColor Yellow
try {
    # Modifier quelques champs
    $updateData = $contractData
    $updateData.dureeMois = 24
    $updateData.preavisMois = 3
    
    $updateJson = $updateData | ConvertTo-Json
    
    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/$contractId" -Method Put -Headers $headers -Body $updateJson
    Write-Host "Contrat modifié avec succès:" -ForegroundColor Green
    $updateResponse | Format-List
    
    # Vérifier les modifications
    if ($updateResponse.dureeMois -eq 24 -and $updateResponse.preavisMois -eq 3) {
        Write-Host "✅ Modifications correctement appliquées" -ForegroundColor Green
    } else {
        Write-Host "❌ Modifications incorrectes" -ForegroundColor Red
    }
} catch {
    Write-Host "Erreur lors de la modification du contrat: $_" -ForegroundColor Red
    exit
}

# ÉTAPE 5: Récupérer par ID de devis
Write-Host "`n[5] RÉCUPÉRATION PAR ID DE DEVIS" -ForegroundColor Yellow
$devisId = $updateResponse.devisId

if ($devisId) {
    try {
        $getByDevisResponse = Invoke-RestMethod -Uri "$baseUrl/devis/$devisId" -Method Get
        Write-Host "Contrat récupéré par ID de devis avec succès:" -ForegroundColor Green
        $getByDevisResponse | Format-List
    } catch {
        Write-Host "Erreur lors de la récupération par ID de devis: $_" -ForegroundColor Red
    }
} else {
    Write-Host "Pas d'ID de devis disponible pour le test" -ForegroundColor Yellow
}

# ÉTAPE 6: Suppression (optionnelle)
Write-Host "`n[6] SUPPRESSION DU CONTRAT" -ForegroundColor Yellow
$confirmation = Read-Host "Voulez-vous supprimer le contrat créé (ID: $contractId)? (O/N)"

if ($confirmation -eq "O" -or $confirmation -eq "o") {
    try {
        Invoke-RestMethod -Uri "$baseUrl/$contractId" -Method Delete
        Write-Host "✅ Commande de suppression exécutée" -ForegroundColor Green
        
        # Vérifier la suppression
        try {
            $verifyDelete = Invoke-RestMethod -Uri "$baseUrl/$contractId" -Method Get
            Write-Host "❌ Erreur: le contrat existe toujours après suppression!" -ForegroundColor Red
        } catch {
            Write-Host "✅ Vérification: le contrat a bien été supprimé" -ForegroundColor Green
        }
    } catch {
        Write-Host "Erreur lors de la suppression: $_" -ForegroundColor Red
    }
} else {
    Write-Host "Suppression annulée. Le contrat (ID: $contractId) est conservé." -ForegroundColor Yellow
}

Write-Host "`n===== TEST TERMINÉ =====" -ForegroundColor Cyan
