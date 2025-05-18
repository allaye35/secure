# Script pour tester la création de contrat avec seulement référence et date
# test-contrat-minimal.ps1

Write-Host "Test de création d'un contrat minimal (référence + date uniquement)" -ForegroundColor Cyan

# Lecture du fichier JSON contenant les données minimales du contrat
$jsonContent = Get-Content -Raw -Path "test-contrat-minimal.json"
Write-Host "Données à envoyer:" -ForegroundColor Yellow
Write-Host $jsonContent

# Envoi de la requête POST à l'API
Write-Host "Envoi de la requête..." -ForegroundColor Yellow
try {
    # S'assurer que le JSON est bien formaté et encodé
    $utf8Bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonContent)
    $encodedJson = [System.Text.Encoding]::UTF8.GetString($utf8Bytes)
    
    # Utiliser Invoke-RestMethod pour une meilleure gestion des réponses JSON
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/contrats" -Method Post -Body $encodedJson -ContentType "application/json"
    
    # Convertir la réponse JSON en objet PowerShell
    $result = $response.Content | ConvertFrom-Json
    
    # Affichage du résultat
    Write-Host "Contrat créé avec succès!" -ForegroundColor Green
    Write-Host "ID du contrat: $($result.id)" -ForegroundColor Green
    Write-Host "Référence: $($result.referenceContrat)" -ForegroundColor Green
    Write-Host "Date de signature: $($result.dateSignature)" -ForegroundColor Green
    
    # Vérifier les champs optionnels
    Write-Host "`nChamps optionnels:" -ForegroundColor Cyan
    Write-Host "Devis associé: $(if ($null -eq $result.devisId) { 'Aucun' } else { $result.devisId })" -ForegroundColor Yellow
    Write-Host "Missions: $(if ($null -eq $result.missionIds -or $result.missionIds.Count -eq 0) { 'Aucune' } else { $result.missionIds -join ', ' })" -ForegroundColor Yellow
    Write-Host "Articles: $(if ($null -eq $result.articleIds -or $result.articleIds.Count -eq 0) { 'Aucun' } else { $result.articleIds -join ', ' })" -ForegroundColor Yellow
    
    # Sauvegarde de l'ID pour des tests ultérieurs
    $result.id | Out-File -FilePath "contrat-minimal-id.txt"
    Write-Host "`nID du contrat sauvegardé dans 'contrat-minimal-id.txt'" -ForegroundColor Gray
}
catch {
    Write-Host "Erreur lors de la création du contrat" -ForegroundColor Red
    Write-Host "Status code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    # Récupérer et afficher le message d'erreur
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorContent = $reader.ReadToEnd()
        $reader.Close()
        
        Write-Host "Message d'erreur:" -ForegroundColor Red
        Write-Host $errorContent
    } else {
        Write-Host "Message d'erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}
