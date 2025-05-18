# Script pour vérifier le contrat minimal créé
# verifier-contrat-minimal.ps1

# Vérifier si le fichier d'ID existe
if (Test-Path "contrat-minimal-id.txt") {
    $contratId = Get-Content -Path "contrat-minimal-id.txt"
    Write-Host "Vérification du contrat #$contratId" -ForegroundColor Cyan
    
    try {
        # Récupérer le contrat par son ID
        $response = Invoke-RestMethod -Uri "http://localhost:8080/api/contrats/$contratId" -Method Get
        
        # Affichage des détails
        Write-Host "Contrat récupéré avec succès!" -ForegroundColor Green
        Write-Host "ID: $($response.id)" -ForegroundColor Green
        Write-Host "Référence: $($response.referenceContrat)" -ForegroundColor Green
        Write-Host "Date de signature: $($response.dateSignature)" -ForegroundColor Green
        
        # Vérifier les champs optionnels
        Write-Host "`nChamps optionnels:" -ForegroundColor Cyan
        Write-Host "Devis associé: $(if ($null -eq $response.devisId) { 'Aucun' } else { $response.devisId })" -ForegroundColor Yellow
        Write-Host "Missions: $(if ($null -eq $response.missionIds -or $response.missionIds.Count -eq 0) { 'Aucune' } else { $response.missionIds -join ', ' })" -ForegroundColor Yellow
        Write-Host "Articles: $(if ($null -eq $response.articleIds -or $response.articleIds.Count -eq 0) { 'Aucun' } else { $response.articleIds -join ', ' })" -ForegroundColor Yellow
    }
    catch {
        Write-Host "Erreur lors de la récupération du contrat" -ForegroundColor Red
        Write-Host "Status code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        Write-Host "Message d'erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}
else {
    Write-Host "Erreur: Fichier d'ID du contrat non trouvé. Exécutez d'abord 'test-contrat-minimal.ps1'" -ForegroundColor Red
}
