# Script PowerShell pour creer un nouveau devis pour une mission

# Generer une reference unique
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reference = "DEV-MISSION-$timestamp"

# Donnees du devis
$devisData = @{
    referenceDevis = $reference
    description = "Devis pour nouvelle mission de securite evenementielle"
    statut = "EN_ATTENTE"
    dateCreation = (Get-Date -Format "yyyy-MM-dd")
    dateValidite = (Get-Date).AddDays(30).ToString("yyyy-MM-dd")
    conditionsGenerales = "Paiement a 30 jours apres reception de la facture"
    entrepriseId = 1
    clientId = 1
} | ConvertTo-Json

# Headers
$headers = @{
    "Content-Type" = "application/json"
}

try {
    Write-Host "Creation du devis avec reference: $reference" -ForegroundColor Yellow
    
    # Creer le devis
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/devis" -Method POST -Headers $headers -Body $devisData
    
    Write-Host "Devis cree avec succes!" -ForegroundColor Green
    Write-Host "ID: $($response.id)" -ForegroundColor Cyan
    Write-Host "Reference: $($response.referenceDevis)" -ForegroundColor Cyan
    Write-Host "Description: $($response.description)" -ForegroundColor Cyan
    
    # Afficher les devis disponibles apres creation
    Write-Host "`nDevis disponibles pour missions:" -ForegroundColor Magenta
    $devisDisponibles = Invoke-RestMethod -Uri "http://localhost:8080/api/devis/disponibles" -Method GET
    
    $devisDisponibles | ForEach-Object {
        Write-Host "  ID: $($_.id) - $($_.referenceDevis) - $($_.description)" -ForegroundColor White
    }
    
} catch {
    Write-Host "Erreur lors de la creation du devis:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Details: $responseBody" -ForegroundColor Red
    }
}
