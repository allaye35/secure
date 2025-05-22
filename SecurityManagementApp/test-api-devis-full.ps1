# Script pour tester l'API des devis
# Ce script teste tous les endpoints CRUD pour l'API des devis

Write-Host "===== DÉBUT DES TESTS DE L'API DEVIS =====" -ForegroundColor Cyan

# Configuration de base
$baseUrl = "http://localhost:8080/api/devis"
$headers = @{
    "Content-Type" = "application/json"
}

# Variables pour stocker les IDs créés pendant le test
$createdDevisId = $null

# -----------------------------------------------------
# 1. Test de création d'un nouveau devis (POST)
# -----------------------------------------------------
Write-Host "`n1. TEST: Création d'un nouveau devis (POST /api/devis)" -ForegroundColor Yellow

# Créer un devis avec une référence unique basée sur l'horodatage
$newDevis = @{
    referenceDevis = "DEV-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    description = "Devis de test créé par script PowerShell"
    statut = "EN_ATTENTE"
    dateValidite = (Get-Date).AddMonths(3).ToString("yyyy-MM-dd") # Date de validité: 3 mois
    conditionsGenerales = "Conditions générales pour test automatisé"
    typeMission = "GARDIENNAGE"
    montantHT = 3500.00
    montantTVA = 700.00
    montantTTC = 4200.00
    nombreAgents = 2
    quantite = 20
    entrepriseId = 1
    clientId = 1
}

# Convertir l'objet en JSON
$newDevisJson = $newDevis | ConvertTo-Json

try {
    # Faire la requête POST
    $createResponse = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $newDevisJson -Headers $headers -ErrorAction Stop
    
    # Conserver l'ID pour les prochains tests
    $createdDevisId = $createResponse.id
    $createdReference = $createResponse.referenceDevis
    
    Write-Host "  Succès ✓ - Devis créé avec ID: $createdDevisId et référence: $createdReference" -ForegroundColor Green
    Write-Host "  Détails du devis créé:" -ForegroundColor Green
    $createResponse | ConvertTo-Json | Write-Host
}
catch {
    Write-Host "  Échec ✗ - Erreur lors de la création du devis: $($_.Exception.Message)" -ForegroundColor Red
    # Ne pas arrêter le script, continuer avec les autres tests
}

# -----------------------------------------------------
# 2. Test de récupération de tous les devis (GET)
# -----------------------------------------------------
Write-Host "`n2. TEST: Récupération de tous les devis (GET /api/devis)" -ForegroundColor Yellow

try {
    $allDevis = Invoke-RestMethod -Uri $baseUrl -Method Get -Headers $headers -ErrorAction Stop
    $count = $allDevis.Count
    
    Write-Host "  Succès ✓ - $count devis récupérés" -ForegroundColor Green
    # Afficher seulement quelques informations pour chaque devis
    $allDevis | ForEach-Object {
        Write-Host "    - ID: $($_.id), Référence: $($_.referenceDevis), Statut: $($_.statut)" -ForegroundColor Gray
    }
}
catch {
    Write-Host "  Échec ✗ - Erreur lors de la récupération des devis: $($_.Exception.Message)" -ForegroundColor Red
}

# -----------------------------------------------------
# 3. Test de récupération des devis disponibles (GET)
# -----------------------------------------------------
Write-Host "`n3. TEST: Récupération des devis disponibles (GET /api/devis/disponibles)" -ForegroundColor Yellow

try {
    $disponiblesUrl = "$baseUrl/disponibles"
    $disponiblesDevis = Invoke-RestMethod -Uri $disponiblesUrl -Method Get -Headers $headers -ErrorAction Stop
    $count = $disponiblesDevis.Count
    
    Write-Host "  Succès ✓ - $count devis disponibles récupérés (non liés à un contrat)" -ForegroundColor Green
}
catch {
    Write-Host "  Échec ✗ - Erreur lors de la récupération des devis disponibles: $($_.Exception.Message)" -ForegroundColor Red
}
}
catch {
    Write-Host "  Échec ✗ - Erreur lors de la récupération des devis disponibles: $($_.Exception.Message)" -ForegroundColor Red
}

# -----------------------------------------------------
# 4. Test de récupération d'un devis par ID (GET)
# -----------------------------------------------------
Write-Host "`n4. TEST: Récupération d'un devis par ID (GET /api/devis/{id})" -ForegroundColor Yellow

if ($createdDevisId) {
    try {
        $devisUrl = "$baseUrl/$createdDevisId"
        $devis = Invoke-RestMethod -Uri $devisUrl -Method Get -Headers $headers -ErrorAction Stop
        
        Write-Host "  Succès ✓ - Devis récupéré avec ID: $($devis.id)" -ForegroundColor Green
        Write-Host "  Référence: $($devis.referenceDevis), Montant TTC: $($devis.montantTTC)" -ForegroundColor Green
    }
    catch {
        Write-Host "  Échec ✗ - Erreur lors de la récupération du devis: $($_.Exception.Message)" -ForegroundColor Red
    }
}
else {
    Write-Host "  Ignoré - Aucun ID de devis disponible pour le test" -ForegroundColor Yellow
}

# -----------------------------------------------------
# 5. Test de recherche d'un devis par référence (GET)
# -----------------------------------------------------
Write-Host "`n5. TEST: Recherche d'un devis par référence (GET /api/devis/search)" -ForegroundColor Yellow

if ($createdReference) {
    try {
        $searchUrl = "$baseUrl/search?reference=$createdReference"
        $searchResult = Invoke-RestMethod -Uri $searchUrl -Method Get -Headers $headers -ErrorAction Stop
        
        Write-Host "  Succès ✓ - Devis trouvé avec référence: $createdReference" -ForegroundColor Green
        Write-Host "  ID: $($searchResult.id), Description: $($searchResult.description)" -ForegroundColor Green
    }
    catch {
        Write-Host "  Échec ✗ - Erreur lors de la recherche du devis: $($_.Exception.Message)" -ForegroundColor Red
    }
}
else {
    Write-Host "  Ignoré - Aucune référence de devis disponible pour le test" -ForegroundColor Yellow
}

# -----------------------------------------------------
# 6. Test de mise à jour d'un devis (PUT)
# -----------------------------------------------------
Write-Host "`n6. TEST: Mise à jour d'un devis (PUT /api/devis/{id})" -ForegroundColor Yellow

if ($createdDevisId) {
    try {
        # Modifier le statut et la description du devis
        $updateData = @{
            referenceDevis = $createdReference
            description = "Devis mis à jour par le script de test"
            statut = "VALIDE_PAR_CLIENT"
            dateValidite = $newDevis.dateValidite
            conditionsGenerales = $newDevis.conditionsGenerales
            typeMission = $newDevis.typeMission
            montantHT = 4000.00  # Augmentation du montant
            montantTVA = 800.00
            montantTTC = 4800.00
            nombreAgents = $newDevis.nombreAgents
            quantite = $newDevis.quantite
            entrepriseId = $newDevis.entrepriseId
            clientId = $newDevis.clientId
        }
        
        $updateUrl = "$baseUrl/$createdDevisId"
        $updateJson = $updateData | ConvertTo-Json
        $updatedDevis = Invoke-RestMethod -Uri $updateUrl -Method Put -Body $updateJson -Headers $headers -ErrorAction Stop
        
        Write-Host "  Succès ✓ - Devis mis à jour avec ID: $($updatedDevis.id)" -ForegroundColor Green
        Write-Host "  Nouveau statut: $($updatedDevis.statut), Nouveau montant TTC: $($updatedDevis.montantTTC)" -ForegroundColor Green
    }
    catch {
        Write-Host "  Échec ✗ - Erreur lors de la mise à jour du devis: $($_.Exception.Message)" -ForegroundColor Red
    }
}
else {
    Write-Host "  Ignoré - Aucun ID de devis disponible pour le test" -ForegroundColor Yellow
}

# -----------------------------------------------------
# 7. Test de suppression d'un devis (DELETE)
# -----------------------------------------------------
Write-Host "`n7. TEST: Suppression d'un devis (DELETE /api/devis/{id})" -ForegroundColor Yellow

if ($createdDevisId) {
    try {
        # Demander confirmation avant suppression
        $confirmation = Read-Host "Êtes-vous sûr de vouloir supprimer le devis ID=$createdDevisId ? (o/n)"
        
        if ($confirmation -eq "o") {
            $deleteUrl = "$baseUrl/$createdDevisId"
            Invoke-RestMethod -Uri $deleteUrl -Method Delete -Headers $headers -ErrorAction Stop
            
            Write-Host "  Succès ✓ - Devis supprimé avec ID: $createdDevisId" -ForegroundColor Green
            
            # Vérifier que le devis a bien été supprimé
            Write-Host "  Vérification de la suppression..." -ForegroundColor Gray
            
            try {
                $verifyUrl = "$baseUrl/$createdDevisId"
                $verifyDevis = Invoke-RestMethod -Uri $verifyUrl -Method Get -Headers $headers -ErrorAction Stop
                Write-Host "  Échec de vérification - Le devis existe toujours!" -ForegroundColor Red
            }
            catch {
                if ($_.Exception.Response.StatusCode.value__ -eq 404) {
                    Write-Host "  Vérification réussie ✓ - Le devis n'existe plus (404 Not Found)" -ForegroundColor Green
                }
                else {
                    Write-Host "  Erreur de vérification: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
        }
        else {
            Write-Host "  Test de suppression annulé par l'utilisateur" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "  Échec ✗ - Erreur lors de la suppression du devis: $($_.Exception.Message)" -ForegroundColor Red
    }
}
else {
    Write-Host "  Ignoré - Aucun ID de devis disponible pour le test" -ForegroundColor Yellow
}

# -----------------------------------------------------
Write-Host "`n===== FIN DES TESTS DE L'API DEVIS =====" -ForegroundColor Cyan
