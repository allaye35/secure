# Script pour créer un devis sans mission
# Ce script crée un devis vide (sans mission) via l'API REST

# Configuration
$baseUrl = "http://localhost:8080/api/devis"
$contentType = "application/json"

# Génération d'une référence unique
$reference = "DEV-" + (Get-Date).ToString("yyyyMMdd") + "-" + (Get-Random -Minimum 1000 -Maximum 9999)

# Paramètres personnalisables (peuvent être modifiés selon les besoins)
$description = "Devis sans mission - Test automatisé"
$statut = "EN_ATTENTE" # Valeurs possibles: EN_ATTENTE, ACCEPTE_PAR_ENTREPRISE, REFUSE_PAR_ENTREPRISE, VALIDE_PAR_CLIENT
$entrepriseId = 1 # ID de l'entreprise prestataire
$clientId = 1 # ID du client bénéficiaire
$dateValidite = (Get-Date).AddMonths(1).ToString("yyyy-MM-dd") # Date de validité par défaut: 1 mois
$conditionsGenerales = "Conditions générales standard"

# Création du payload JSON pour le devis sans mission
$devisJson = @{
    "referenceDevis" = $reference
    "description" = "Devis sans mission - Test automatisé"
    "statut" = "EN_ATTENTE"
    "dateValidite" = (Get-Date).AddMonths(1).ToString("yyyy-MM-dd")
    "conditionsGenerales" = "Conditions générales standard"
    "entrepriseId" = 1
    "clientId" = 1
    "missionExistanteIds" = @()
} | ConvertTo-Json

# Afficher le JSON qui sera envoyé
Write-Host "JSON qui sera envoyé :"
Write-Host $devisJson -ForegroundColor Cyan

# Essayer de créer le devis
try {
    Write-Host "`nCréation du devis..." -ForegroundColor Yellow
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Method POST -Uri $baseUrl -Body $devisJson -ContentType $contentType
    
    Write-Host "Devis créé avec succès!" -ForegroundColor Green
    Write-Host "ID du devis: $($response.id)" -ForegroundColor Yellow
    Write-Host "Référence du devis: $($response.referenceDevis)" -ForegroundColor Yellow
    
    # Afficher les détails du devis créé
    Write-Host "`nDétails du devis créé:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Erreur lors de la création du devis" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "StatusDescription: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    
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
