# Script pour tester les opérations CRUD sur l'API de contrats (sans gestion de fichier)
$baseUrl = "http://localhost:8080/api/contrats"

Write-Host "===== TEST DE L'API CONTRATS (SANS GESTION DE FICHIERS) =====" -ForegroundColor Cyan

# Timestamp unique pour éviter les conflits de référence
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reference = "CONTRAT-TEST-$timestamp"

# 1. Création d'un contrat
Write-Host "`n1. TEST CREATION D'UN CONTRAT" -ForegroundColor Yellow

# Charger le contenu JSON de base
$jsonBase = Get-Content -Path "test-api-contrat.json" | ConvertFrom-Json

# Vérifier si le devis existe et n'est pas déjà associé à un contrat
$devisId = $jsonBase.devisId
Write-Host "Vérification du devis ID: $devisId..." -ForegroundColor Yellow
try {
    $devisUrl = "http://localhost:8080/api/devis/$devisId"
    $devis = Invoke-RestMethod -Uri $devisUrl -Method Get
    
    if ($null -ne $devis.contratId) {
        Write-Host "ATTENTION: Le devis ID $devisId est déjà associé au contrat ID $($devis.contratId)" -ForegroundColor Yellow
        # Générer un nouveau devisId aléatoire entre 100 et 999 pour éviter les conflits
        $jsonBase.devisId = Get-Random -Minimum 100 -Maximum 999
        Write-Host "Utilisation d'un nouveau devis ID fictif pour le test: $($jsonBase.devisId)" -ForegroundColor Yellow
    } else {
        Write-Host "Devis ID $devisId disponible pour l'association" -ForegroundColor Green
    }
} catch {
    Write-Host "Le devis ID $devisId n'existe pas ou n'est pas accessible. Poursuite du test avec cette valeur." -ForegroundColor Yellow
}

# Modifier la référence pour éviter les conflits
$jsonBase.referenceContrat = $reference

# Convertir à nouveau en JSON
$jsonContent = $jsonBase | ConvertTo-Json

# Faire la requête POST pour créer un contrat
try {
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    Write-Host "Envoi de la requête création de contrat..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $jsonContent -Headers $headers
    
    Write-Host "Contrat créé avec succès :" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
    
    # Stocke l'ID pour les tests suivants
    $contratId = $response.id
    Write-Host "ID du contrat créé: $contratId" -ForegroundColor Green
} catch {
    Write-Host "Erreur lors de la création du contrat: $_" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Détail de l'erreur: $errorBody" -ForegroundColor Red
    }
    exit
}

# 2. Récupération du contrat par ID
Write-Host "`n2. TEST RECUPERATION D'UN CONTRAT PAR ID" -ForegroundColor Yellow
try {
    $getResponse = Invoke-RestMethod -Uri "$baseUrl/$contratId" -Method Get
    Write-Host "Contrat récupéré avec succès :" -ForegroundColor Green
    $getResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Erreur lors de la récupération du contrat: $_" -ForegroundColor Red
    exit
}

# 3. Récupération du contrat par référence
Write-Host "`n3. TEST RECUPERATION D'UN CONTRAT PAR REFERENCE" -ForegroundColor Yellow
try {
    $refResponse = Invoke-RestMethod -Uri "$baseUrl/ref/$reference" -Method Get
    Write-Host "Contrat récupéré par référence avec succès :" -ForegroundColor Green
    $refResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Erreur lors de la récupération du contrat par référence: $_" -ForegroundColor Red
    exit
}

# 4. Récupération de tous les contrats
Write-Host "`n4. TEST RECUPERATION DE TOUS LES CONTRATS" -ForegroundColor Yellow
try {
    $allResponse = Invoke-RestMethod -Uri $baseUrl -Method Get
    Write-Host "Nombre de contrats récupérés: $($allResponse.Count)" -ForegroundColor Green
    
    # Afficher uniquement les 3 premiers contrats si plus de 3 existent
    if ($allResponse.Count -gt 3) {
        Write-Host "Affichage des 3 premiers contrats uniquement:" -ForegroundColor Yellow
        $allResponse[0..2] | ConvertTo-Json -Depth 3
    } else {
        $allResponse | ConvertTo-Json -Depth 3
    }
} catch {
    Write-Host "Erreur lors de la récupération de tous les contrats: $_" -ForegroundColor Red
    exit
}

# 5. Modification d'un contrat
Write-Host "`n5. TEST MODIFICATION D'UN CONTRAT" -ForegroundColor Yellow
try {
    # Préparer les modifications
    $jsonUpdate = Get-Content -Path "test-api-contrat.json" | ConvertFrom-Json
    $jsonUpdate.referenceContrat = $reference
    $jsonUpdate.dureeMois = 24  # Modifier la durée
    $jsonUpdate.preavisMois = 3  # Modifier le préavis
    
    $jsonUpdateContent = $jsonUpdate | ConvertTo-Json
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    # Faire la requête PUT pour modifier le contrat
    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/$contratId" -Method Put -Body $jsonUpdateContent -Headers $headers
    
    Write-Host "Contrat modifié avec succès :" -ForegroundColor Green
    $updateResponse | ConvertTo-Json -Depth 3
    
    # Vérifier que les modifications ont bien été appliquées
    if ($updateResponse.dureeMois -eq 24 -and $updateResponse.preavisMois -eq 3) {
        Write-Host "Vérification des modifications: ✓ OK" -ForegroundColor Green
    } else {
        Write-Host "Vérification des modifications: ❌ KO - Les modifications n'ont pas été correctement appliquées" -ForegroundColor Red
    }
} catch {
    Write-Host "Erreur lors de la modification du contrat: $_" -ForegroundColor Red
    exit
}

# 6. Test de récupération par ID de devis
Write-Host "`n6. TEST RECUPERATION D'UN CONTRAT PAR ID DE DEVIS" -ForegroundColor Yellow
try {
    $devisId = $response.devisId
    $devisResponse = Invoke-RestMethod -Uri "$baseUrl/devis/$devisId" -Method Get
    
    Write-Host "Contrat récupéré par ID de devis avec succès :" -ForegroundColor Green
    $devisResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Erreur lors de la récupération du contrat par ID de devis: $_" -ForegroundColor Red
}

# 7. Suppression du contrat
Write-Host "`n7. TEST SUPPRESSION D'UN CONTRAT" -ForegroundColor Yellow
try {
    # Demander confirmation avant suppression
    $confirmation = Read-Host "Voulez-vous supprimer le contrat créé pour ce test? (O/N)"
    
    if ($confirmation -eq "O" -or $confirmation -eq "o") {
        Invoke-RestMethod -Uri "$baseUrl/$contratId" -Method Delete
        Write-Host "Contrat supprimé avec succès!" -ForegroundColor Green
        
        # Vérifier que le contrat est bien supprimé
        try {
            Invoke-RestMethod -Uri "$baseUrl/$contratId" -Method Get | Out-Null
            Write-Host "❌ Erreur: Le contrat existe toujours après suppression!" -ForegroundColor Red
        } catch {
            Write-Host "✓ Vérification de suppression: Le contrat n'existe plus" -ForegroundColor Green
        }
    } else {
        Write-Host "Suppression annulée. Le contrat ID:$contratId est conservé." -ForegroundColor Yellow
    }
} catch {
    Write-Host "Erreur lors de la suppression du contrat: $_" -ForegroundColor Red
}

Write-Host "`n===== FIN DES TESTS =====" -ForegroundColor Cyan
