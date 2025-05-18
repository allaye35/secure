# Script pour vérifier les détails d'une mission
# verifier-mission.ps1

param (
    [Parameter(Mandatory=$false)]
    [int]$missionId = 1
)

Write-Host "Vérification des détails de la mission #$missionId" -ForegroundColor Cyan

try {
    $mission = Invoke-RestMethod -Uri "http://localhost:8080/api/missions/$missionId" -Method Get
    
    Write-Host "`nDétails de la mission:" -ForegroundColor Green
    Write-Host "ID: $($mission.id)" -ForegroundColor Yellow
    Write-Host "Titre: $($mission.titre)" -ForegroundColor Yellow
    Write-Host "Type: $($mission.typeMission)" -ForegroundColor Yellow
    Write-Host "Date début: $($mission.dateDebut)" -ForegroundColor Yellow
    Write-Host "Date fin: $($mission.dateFin)" -ForegroundColor Yellow
    
    # Vérifier l'association au contrat
    if ($null -eq $mission.contratId) {
        Write-Host "`nContrat: Non associé à un contrat" -ForegroundColor Red
    } else {
        Write-Host "`nContrat associé:" -ForegroundColor Green
        Write-Host "ID du contrat: $($mission.contratId)" -ForegroundColor Yellow
        
        # Récupérer les détails du contrat associé
        $contrat = Invoke-RestMethod -Uri "http://localhost:8080/api/contrats/$($mission.contratId)" -Method Get
        Write-Host "Référence du contrat: $($contrat.referenceContrat)" -ForegroundColor Yellow
        Write-Host "Date de signature: $($contrat.dateSignature)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Erreur lors de la récupération des détails de la mission" -ForegroundColor Red
    Write-Host "Message d'erreur: $($_.Exception.Message)" -ForegroundColor Red
}
