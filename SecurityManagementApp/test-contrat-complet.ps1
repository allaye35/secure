# Script pour tester la création d'un contrat complet avec missions
# test-contrat-complet.ps1

Write-Host "Test de création d'un contrat complet avec référence, date et mission" -ForegroundColor Cyan

# Définir le JSON
$jsonBody = Get-Content -Raw -Path "test-contrat-complet.json"

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
    $response.id | Out-File -FilePath "contrat-complet-id.txt"
    Write-Host "`nID du contrat sauvegardé dans 'contrat-complet-id.txt'" -ForegroundColor Gray

    # Récupérer des détails sur les missions pour vérifier qu'elles sont bien liées
    Write-Host "`nRécupération des détails des missions..." -ForegroundColor Cyan
    foreach ($missionId in $response.missionIds) {
        try {
            $missionResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/missions/$missionId" -Method Get
            Write-Host "Mission #$missionId : $($missionResponse.titre) - Bien associée au contrat ID: $($missionResponse.contratId)" -ForegroundColor Green
        } catch {
            Write-Host "Impossible de récupérer les détails de la mission #$missionId" -ForegroundColor Red
        }
    }
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
