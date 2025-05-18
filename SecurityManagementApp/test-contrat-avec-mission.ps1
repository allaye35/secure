# Script pour tester la création d'un contrat avec missions
# test-contrat-avec-mission.ps1

Write-Host "Test de création d'un contrat avec référence, date et missions" -ForegroundColor Cyan

# Définir directement le JSON au lieu de lire un fichier
$jsonBody = Get-Content -Raw -Path "test-contrat-avec-mission.json"

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
    $response.id | Out-File -FilePath "contrat-avec-mission-id.txt"
    Write-Host "`nID du contrat sauvegardé dans 'contrat-avec-mission-id.txt'" -ForegroundColor Gray

    # Récupérer des détails sur les missions pour vérifier qu'elles sont bien liées
    Write-Host "`nRécupération des détails des missions..." -ForegroundColor Cyan
    foreach ($missionId in $response.missionIds) {
        try {
            $missionResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/missions/$missionId" -Method Get
            Write-Host "Mission #$missionId : $($missionResponse.titreMission) - Bien associée au contrat ID: $($missionResponse.contratId)" -ForegroundColor Green
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
