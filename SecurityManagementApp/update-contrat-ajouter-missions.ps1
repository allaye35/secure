# Script pour mettre à jour un contrat et lui ajouter des missions
# update-contrat-ajouter-missions.ps1

# Récupération de l'ID du contrat créé
$contratId = Get-Content -Path "contrat-avec-mission-id.txt"
Write-Host "Mise à jour du contrat #$contratId pour ajouter des missions" -ForegroundColor Cyan

# Récupération du contrat existant
try {
    $contratExistant = Invoke-RestMethod -Uri "http://localhost:8080/api/contrats/$contratId" -Method Get
    Write-Host "Contrat récupéré:" -ForegroundColor Yellow
    Write-Host "Référence: $($contratExistant.referenceContrat)" -ForegroundColor Yellow
    Write-Host "Date de signature: $($contratExistant.dateSignature)" -ForegroundColor Yellow
    
    # Création du payload de mise à jour
    $updateData = @{
        referenceContrat = $contratExistant.referenceContrat
        dateSignature = $contratExistant.dateSignature
        missionIds = @(1)  # Ajout de la mission avec ID 1
        articleIds = @()
    }
    
    $jsonUpdate = $updateData | ConvertTo-Json
    Write-Host "`nPayload de mise à jour:" -ForegroundColor Yellow
    Write-Host $jsonUpdate
    
    # Envoi de la requête de mise à jour
    Write-Host "`nEnvoi de la requête de mise à jour..." -ForegroundColor Yellow
    $updatedContrat = Invoke-RestMethod -Uri "http://localhost:8080/api/contrats/$contratId" -Method Put -Body $jsonUpdate -ContentType "application/json"
    
    # Vérification du résultat
    Write-Host "`nContrat mis à jour avec succès!" -ForegroundColor Green
    Write-Host "ID du contrat: $($updatedContrat.id)" -ForegroundColor Green
    Write-Host "Référence: $($updatedContrat.referenceContrat)" -ForegroundColor Green
    Write-Host "Date de signature: $($updatedContrat.dateSignature)" -ForegroundColor Green
    
    # Afficher les missions
    Write-Host "`nMissions:" -ForegroundColor Cyan
    if ($updatedContrat.missionIds.Count -eq 0) {
        Write-Host "  Aucune mission associée" -ForegroundColor Yellow
    } else {
        foreach ($missionId in $updatedContrat.missionIds) {
            Write-Host "  - Mission ID: $missionId" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "Erreur lors de la mise à jour du contrat" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        Write-Host "Status code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorContent = $reader.ReadToEnd()
        $reader.Close()
        
        Write-Host "Message d'erreur:" -ForegroundColor Red
        Write-Host $errorContent -ForegroundColor Red
    } else {
        Write-Host "Message d'erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}
