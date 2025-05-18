# Script pour tester la création d'un contrat complet personnalisé
# envoyer-contrat-personnalise.ps1

Write-Host "Test de création d'un contrat complet personnalisé avec référence, date, missions, devis et articles" -ForegroundColor Cyan

# Définir le JSON
$jsonBody = Get-Content -Raw -Path "contrat-complet-personnalise.json"

Write-Host "Données à envoyer:" -ForegroundColor Yellow
Write-Host $jsonBody

Write-Host "Envoi de la requête..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/contrats" -Method Post -Body $jsonBody -ContentType "application/json"
    
    # Affichage du résultat
    Write-Host "Contrat créé avec succès!" -ForegroundColor Green
    Write-Host "ID du contrat: $($response.id)" -ForegroundColor Green
    Write-Host "Référence: $($response.referenceContrat)" -ForegroundColor Green
    Write-Host "Date de signature: $($response.dateSignature)" -ForegroundColor Green
    Write-Host "Durée (mois): $($response.dureeMois)" -ForegroundColor Green
    Write-Host "Tacite reconduction: $($response.taciteReconduction)" -ForegroundColor Green
    Write-Host "Préavis (mois): $($response.preavisMois)" -ForegroundColor Green
    
    # Vérifier les champs optionnels
    Write-Host "`nChamps optionnels:" -ForegroundColor Cyan
    Write-Host "Devis associé: $(if ($null -eq $response.devisId) { 'Aucun' } else { $response.devisId })" -ForegroundColor Yellow
    
    # Afficher les détails des missions
    Write-Host "Missions:" -ForegroundColor Yellow
    if ($response.missionIds.Count -eq 0) {
        Write-Host "  Aucune mission associée" -ForegroundColor Yellow
    } else {
        foreach ($missionId in $response.missionIds) {
            Write-Host "  - Mission ID: $missionId" -ForegroundColor Yellow
        }
    }
    
    Write-Host "Articles: $(if ($response.articleIds.Count -eq 0) { 'Aucun' } else { $response.articleIds -join ', ' })" -ForegroundColor Yellow
    
    # Sauvegarde de l'ID pour des tests ultérieurs
    $response.id | Out-File -FilePath "contrat-complet-personnalise-id.txt"
    Write-Host "`nID du contrat sauvegardé dans 'contrat-complet-personnalise-id.txt'" -ForegroundColor Gray
} catch {
    Write-Host "Erreur lors de la création du contrat" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        try {
            $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "Détails de l'erreur:" -ForegroundColor Red
            Write-Host $errorDetails -ForegroundColor Red
        } catch {
            Write-Host "Détails de l'erreur:" -ForegroundColor Red
            Write-Host $_.ErrorDetails.Message -ForegroundColor Red
        }
    }
    exit 1
}
