#!/usr/bin/env pwsh
# Script pour tester la robustesse de la création de mission avec des valeurs invalides

# Configuration
$baseUrl = "http://localhost:8080/api/missions"
$contentType = "application/json"

# Obtenir la date courante et les dates de début/fin
$dateDebut = (Get-Date).ToString('yyyy-MM-dd')
$dateFin = (Get-Date).AddDays(14).ToString('yyyy-MM-dd')

# Cas de test 1: Mission sans titre (champ obligatoire)
$mission1 = @{
    description = "Test de validation - Mission sans titre"
    dateDebut = $dateDebut
    dateFin = $dateFin
    heureDebut = "08:00:00"
    heureFin = "20:00:00"
    statutMission = "PLANIFIEE"
    typeMission = "SURVEILLANCE"
    nombreAgents = 3
    quantite = 120
    tarifMissionId = 1
    devisId = 1
}

# Cas de test 2: Mission avec date de fin avant date de début
$mission2 = @{
    titre = "Test date invalide"
    description = "Test de validation - Date de fin avant date de début"
    dateDebut = $dateFin  # On inverse intentionnellement
    dateFin = $dateDebut
    heureDebut = "08:00:00"
    heureFin = "20:00:00"
    statutMission = "PLANIFIEE"
    typeMission = "SURVEILLANCE"
    nombreAgents = 3
    quantite = 120
    tarifMissionId = 1
    devisId = 1
}

# Cas de test 3: Mission avec quantité négative
$mission3 = @{
    titre = "Test quantité négative"
    description = "Test de validation - Quantité négative"
    dateDebut = $dateDebut
    dateFin = $dateFin
    heureDebut = "08:00:00"
    heureFin = "20:00:00"
    statutMission = "PLANIFIEE"
    typeMission = "SURVEILLANCE"
    nombreAgents = 3
    quantite = -10  # Valeur négative intentionnelle
    tarifMissionId = 1
    devisId = 1
}

# Cas de test 4: Mission avec type inconnu
$mission4 = @{
    titre = "Test type inconnu"
    description = "Test de validation - Type de mission inconnu"
    dateDebut = $dateDebut
    dateFin = $dateFin
    heureDebut = "08:00:00"
    heureFin = "20:00:00"
    statutMission = "PLANIFIEE"
    typeMission = "TYPE_INVALIDE"  # Type invalide intentionnel
    nombreAgents = 3
    quantite = 120
    tarifMissionId = 1
    devisId = 1
}

# Cas de test 5: Mission avec référence à un tarif inexistant
$mission5 = @{
    titre = "Test référence inexistante"
    description = "Test de validation - Référence à un tarif inexistant"
    dateDebut = $dateDebut
    dateFin = $dateFin
    heureDebut = "08:00:00"
    heureFin = "20:00:00"
    statutMission = "PLANIFIEE"
    typeMission = "SURVEILLANCE"
    nombreAgents = 3
    quantite = 120
    tarifMissionId = 9999  # ID qui n'existe probablement pas
    devisId = 1
}

# Liste de tous les cas de test
$testCases = @(
    @{ Name = "Mission sans titre"; Mission = $mission1 },
    @{ Name = "Mission avec date de fin avant date de début"; Mission = $mission2 },
    @{ Name = "Mission avec quantité négative"; Mission = $mission3 },
    @{ Name = "Mission avec type inconnu"; Mission = $mission4 },
    @{ Name = "Mission avec référence à un tarif inexistant"; Mission = $mission5 }
)

# Exécuter chaque cas de test
foreach ($testCase in $testCases) {
    $missionJson = $testCase.Mission | ConvertTo-Json -Depth 4

    Write-Host "`n===== Test: $($testCase.Name) =====" -ForegroundColor Cyan
    Write-Host "Mission à créer:" -ForegroundColor Yellow
    Write-Host $missionJson

    Write-Host "`nEnvoi de la requête..." -ForegroundColor Green

    try {
        $response = Invoke-RestMethod -Method POST -Uri $baseUrl -ContentType $contentType -Body $missionJson
        
        Write-Host "Mission créée avec succès (non attendu pour ce test)!" -ForegroundColor Red
        Write-Host "ID de la mission: $($response.id)" -ForegroundColor Yellow
    } catch {
        Write-Host "Erreur lors de la création de la mission (attendu pour ce test)" -ForegroundColor Green
        Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
        
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            $reader.Close()
            Write-Host "Détails de l'erreur: $responseBody" -ForegroundColor Yellow
        } catch {
            Write-Host "Impossible de récupérer les détails de l'erreur" -ForegroundColor Red
        }
    }
}

Write-Host "`n===== Tests de validation terminés =====" -ForegroundColor Cyan
