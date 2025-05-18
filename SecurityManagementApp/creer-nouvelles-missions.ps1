# Script pour créer de nouvelles missions pour le test
# creer-nouvelles-missions.ps1

Write-Host "Création de nouvelles missions pour le test de contrat" -ForegroundColor Cyan

# Création de la première mission
Write-Host "Création de la mission 1..." -ForegroundColor Yellow
$jsonMission1 = Get-Content -Raw -Path "nouvelle-mission-1.json"
Write-Host $jsonMission1

try {
    $mission1 = Invoke-RestMethod -Uri "http://localhost:8080/api/missions" -Method Post -Body $jsonMission1 -ContentType "application/json"
    Write-Host "Mission 1 créée avec succès! ID: $($mission1.id)" -ForegroundColor Green
    $mission1.id | Out-File -FilePath "mission-1-id.txt"
} catch {
    Write-Host "Erreur lors de la création de la mission 1" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Création de la seconde mission
Write-Host "`nCréation de la mission 2..." -ForegroundColor Yellow
$jsonMission2 = Get-Content -Raw -Path "nouvelle-mission-2.json"
Write-Host $jsonMission2

try {
    $mission2 = Invoke-RestMethod -Uri "http://localhost:8080/api/missions" -Method Post -Body $jsonMission2 -ContentType "application/json"
    Write-Host "Mission 2 créée avec succès! ID: $($mission2.id)" -ForegroundColor Green
    $mission2.id | Out-File -FilePath "mission-2-id.txt"
} catch {
    Write-Host "Erreur lors de la création de la mission 2" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Mise à jour du fichier de test de contrat avec les IDs des nouvelles missions
Write-Host "`nMise à jour du fichier test-contrat-avec-mission.json avec les nouveaux IDs de mission..." -ForegroundColor Yellow

$contratTest = @{
    referenceContrat = "TEST-MISSION-2025-001"
    dateSignature = "2025-05-18"
    missionIds = @($mission1.id, $mission2.id)
} | ConvertTo-Json

$contratTest | Out-File -FilePath "test-contrat-avec-mission.json"
Write-Host "Fichier test-contrat-avec-mission.json mis à jour!" -ForegroundColor Green
Write-Host $contratTest
