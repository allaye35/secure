# Script pour tester la création d'un contrat complet avec une approche simplifiée
# test-contrat-direct-simple.ps1

Write-Host "Test de création d'un contrat complet avec référence, date et mission" -ForegroundColor Cyan

# Définir directement le JSON au lieu de lire un fichier
$jsonBody = @{
    referenceContrat = "TEST-COMPLET-2025-001"
    dateSignature = "2025-05-18"
    dureeMois = 12
    taciteReconduction = $true
    preavisMois = 3
    missionIds = @(2)
} | ConvertTo-Json

Write-Host "Données à envoyer:" -ForegroundColor Yellow
Write-Host $jsonBody

Write-Host "`nEnvoi de la requête..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod `
        -Uri "http://localhost:8080/api/contrats" `
        -Method Post `
        -Body $jsonBody `
        -ContentType "application/json; charset=utf-8" `
        -ErrorAction Stop

    # Affichage du résultat
    Write-Host "`nContrat créé avec succès!" -ForegroundColor Green
    Write-Host "ID du contrat: $($response.id)" -ForegroundColor Green
    Write-Host "Référence: $($response.referenceContrat)" -ForegroundColor Green
    Write-Host "Date de signature: $($response.dateSignature)" -ForegroundColor Green
    
    # Vérifier les missions
    Write-Host "`nMissions:" -ForegroundColor Cyan
    if ($response.missionIds.Count -eq 0) {
        Write-Host "  Aucune mission associée" -ForegroundColor Yellow
    } else {
        foreach ($missionId in $response.missionIds) {
            Write-Host "  - Mission ID: $missionId" -ForegroundColor Yellow
        }
    }
    
    # Sauvegarde de l'ID pour des tests ultérieurs
    $response.id | Out-File -FilePath "contrat-complet-id.txt"
    Write-Host "`nID du contrat sauvegardé dans 'contrat-complet-id.txt'" -ForegroundColor Gray
}
catch {
    Write-Host "`nErreur lors de la création du contrat" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        Write-Host "Code de statut: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red

        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            $reader.Close()
            
            Write-Host "Message d'erreur:" -ForegroundColor Red
            Write-Host $responseBody -ForegroundColor Red
        }
        catch {
            Write-Host "Impossible de lire la réponse d'erreur" -ForegroundColor Red
        }
    }
    else {
        Write-Host "Message d'erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}
