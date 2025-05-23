# Script PowerShell pour tester l'API de Devis avec Curl
# -------------------------------------------------------

# Configuration
$baseUrl = "http://localhost:8080/api/devis"
$contentType = "application/json"
$devisJsonFile = "devis-complet-test.json"

# Fonctions utiles
function ConvertPSObjectToHashtable {
    param (
        [Parameter(ValueFromPipeline)]
        $InputObject
    )
    process {
        if ($null -eq $InputObject) { return $null }
        if ($InputObject -is [System.Collections.IEnumerable] -and $InputObject -isnot [string]) {
            $collection = @(
                foreach ($object in $InputObject) { ConvertPSObjectToHashtable $object }
            )
            return $collection
        }
        if ($InputObject -is [psobject]) {
            $hash = @{}
            foreach ($property in $InputObject.PSObject.Properties) {
                $hash[$property.Name] = ConvertPSObjectToHashtable $property.Value
            }
            return $hash
        }
        return $InputObject
    }
}

# Affichage de l'entête
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "    TEST DE L'API DEVIS AVEC TOUTES LES ÉTAPES    " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Création d'un devis
Write-Host "`n1. Création d'un devis complet:" -ForegroundColor Green
try {
    # Lire le contenu du fichier JSON
    $devisJson = Get-Content -Path $devisJsonFile -Raw
    
    # Envoyer la requête POST pour créer le devis
    $response = Invoke-RestMethod -Method POST -Uri $baseUrl -ContentType $contentType -Body $devisJson
    
    Write-Host "Devis créé avec succès!" -ForegroundColor Green
    Write-Host "ID du devis: $($response.id)" -ForegroundColor Yellow
    Write-Host "Référence du devis: $($response.referenceDevis)" -ForegroundColor Yellow
    
    # Sauvegarder l'ID pour les autres étapes
    $devisId = $response.id
    
    # Afficher les détails du devis créé
    Write-Host "`nDétails du devis créé:" -ForegroundColor Green
    $devisDetail = Invoke-RestMethod -Method GET -Uri "$baseUrl/$devisId" -ContentType $contentType
    Write-Host (ConvertTo-Json -Depth 4 $devisDetail)
} catch {
    Write-Host "Erreur lors de la création du devis" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Détails: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    # Arrêter le script en cas d'erreur lors de la création
    exit 1
}

# 2. Obtenir tous les devis
Write-Host "`n2. Liste de tous les devis:" -ForegroundColor Green
try {
    $allDevis = Invoke-RestMethod -Method GET -Uri $baseUrl -ContentType $contentType
    Write-Host "$($allDevis.Count) devis trouvés" -ForegroundColor Yellow
    
    # Afficher les infos basiques de chaque devis
    foreach ($devis in $allDevis) {
        Write-Host "- ID: $($devis.id), Référence: $($devis.referenceDevis), Statut: $($devis.statut), Client: $($devis.clientId)" -ForegroundColor Gray
    }
} catch {
    Write-Host "Erreur lors de la récupération des devis" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Obtenir les devis disponibles (non associés à un contrat)
Write-Host "`n3. Devis disponibles (non associés à un contrat):" -ForegroundColor Green
try {
    $availableDevis = Invoke-RestMethod -Method GET -Uri "$baseUrl/disponibles" -ContentType $contentType
    Write-Host "$($availableDevis.Count) devis disponibles trouvés" -ForegroundColor Yellow
    
    # Afficher les infos basiques de chaque devis disponible
    foreach ($devis in $availableDevis) {
        Write-Host "- ID: $($devis.id), Référence: $($devis.referenceDevis), Statut: $($devis.statut)" -ForegroundColor Gray
    }
} catch {
    Write-Host "Erreur lors de la récupération des devis disponibles" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Rechercher un devis par référence
Write-Host "`n4. Recherche d'un devis par référence:" -ForegroundColor Green
try {
    $reference = $devisDetail.referenceDevis
    $searchResult = Invoke-RestMethod -Method GET -Uri "$baseUrl/search?reference=$reference" -ContentType $contentType
    
    Write-Host "Devis trouvé par référence: $reference" -ForegroundColor Yellow
    Write-Host "- ID: $($searchResult.id), Statut: $($searchResult.statut)" -ForegroundColor Gray
    Write-Host "- Description: $($searchResult.description)" -ForegroundColor Gray
} catch {
    Write-Host "Erreur lors de la recherche du devis par référence" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Mettre à jour le devis
Write-Host "`n5. Mise à jour du devis:" -ForegroundColor Green
try {
    # Lire le devis existant
    $existingDevis = Invoke-RestMethod -Method GET -Uri "$baseUrl/$devisId" -ContentType $contentType
    
    # Convertir en hashtable pour pouvoir modifier les propriétés
    $devisToUpdate = ConvertPSObjectToHashtable $existingDevis
    
    # Modifier quelques propriétés
    $devisToUpdate.description = "Devis modifié par l'API de test"
    $devisToUpdate.statut = "ACCEPTE"
    $devisToUpdate.conditionsGenerales = "Conditions modifiées par l'API de test"
    
    # Ne garder que les propriétés du DevisCreateDto
    $devisUpdateDto = @{
        referenceDevis = $devisToUpdate.referenceDevis
        description = $devisToUpdate.description
        statut = $devisToUpdate.statut
        entrepriseId = $devisToUpdate.entrepriseId
        clientId = $devisToUpdate.clientId
        dateValidite = $devisToUpdate.dateValidite
        conditionsGenerales = $devisToUpdate.conditionsGenerales
        missionExistanteIds = @()
    }
    
    # Convertir en JSON
    $devisUpdateJson = ConvertTo-Json -InputObject $devisUpdateDto -Depth 3
    
    # Envoyer la requête PUT pour mettre à jour le devis
    $updatedDevis = Invoke-RestMethod -Method PUT -Uri "$baseUrl/$devisId" -ContentType $contentType -Body $devisUpdateJson
    
    Write-Host "Devis mis à jour avec succès!" -ForegroundColor Green
    Write-Host "- Nouveau statut: $($updatedDevis.statut)" -ForegroundColor Yellow
    Write-Host "- Nouvelle description: $($updatedDevis.description)" -ForegroundColor Yellow
} catch {
    Write-Host "Erreur lors de la mise à jour du devis" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Détails: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# 6. Confirmation avant suppression
Write-Host "`n6. Suppression du devis:" -ForegroundColor Red
$confirmation = Read-Host "Voulez-vous supprimer le devis créé? (O/N)"
if ($confirmation -eq "O") {
    try {
        # Envoyer la requête DELETE pour supprimer le devis
        Invoke-RestMethod -Method DELETE -Uri "$baseUrl/$devisId" -ContentType $contentType
        
        Write-Host "Devis supprimé avec succès!" -ForegroundColor Green
        
        # Vérifier que le devis a bien été supprimé
        try {
            $deletedDevis = Invoke-RestMethod -Method GET -Uri "$baseUrl/$devisId" -ContentType $contentType
            Write-Host "ATTENTION: Le devis existe toujours!" -ForegroundColor Red
        } catch {
            Write-Host "Vérification réussie: Le devis n'existe plus." -ForegroundColor Green
        }
    } catch {
        Write-Host "Erreur lors de la suppression du devis" -ForegroundColor Red
        Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "Suppression annulée. Le devis reste dans le système." -ForegroundColor Yellow
}

Write-Host "`n====================================================" -ForegroundColor Cyan
Write-Host "                TESTS TERMINÉS                      " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
