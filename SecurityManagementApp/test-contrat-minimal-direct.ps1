# Script pour tester la création d'un contrat minimal
# test-contrat-minimal-direct.ps1

Write-Host "Test de création d'un contrat minimal (référence + date uniquement)" -ForegroundColor Cyan

# Définir directement le JSON au lieu de lire un fichier
$jsonBody = @{
    referenceContrat = "TEST-MINIMAL-2025-001"
    dateSignature = "2025-05-18"
} | ConvertTo-Json

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
    
    # Vérifier les champs optionnels
    Write-Host "`nChamps optionnels:" -ForegroundColor Cyan
    Write-Host "Devis associé: $(if ($null -eq $response.devisId) { 'Aucun' } else { $response.devisId })" -ForegroundColor Yellow
    Write-Host "Missions: $(if ($response.missionIds.Count -eq 0) { 'Aucune' } else { $response.missionIds -join ', ' })" -ForegroundColor Yellow
    Write-Host "Articles: $(if ($response.articleIds.Count -eq 0) { 'Aucun' } else { $response.articleIds -join ', ' })" -ForegroundColor Yellow
    
    # Sauvegarde de l'ID pour des tests ultérieurs
    $response.id | Out-File -FilePath "contrat-minimal-id.txt"
    Write-Host "`nID du contrat sauvegardé dans 'contrat-minimal-id.txt'" -ForegroundColor Gray
}
catch {
    Write-Host "Erreur lors de la création du contrat" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        Write-Host "Status code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        
        $responseStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($responseStream)
        $responseBody = $reader.ReadToEnd()
        
        Write-Host "Message d'erreur:" -ForegroundColor Red
        Write-Host $responseBody -ForegroundColor Red
    }
    else {
        Write-Host "Message d'erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}
