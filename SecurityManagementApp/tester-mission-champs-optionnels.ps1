#!/usr/bin/env pwsh
# Script pour tester la création de missions avec des champs optionnels via curl

# Configuration
$baseUrl = "http://localhost:8080/api/missions"
$contentType = "application/json"

# Fonction pour afficher les résultats
function Afficher-ResultatTest {
    param (
        [string]$nomTest,
        [object]$reponse,
        [string]$erreur = $null
    )
    
    Write-Host "`n----- Test: $nomTest -----" -ForegroundColor Cyan
    
    if ($erreur) {
        Write-Host "❌ ÉCHEC: $erreur" -ForegroundColor Red
    }
    else {
        Write-Host "✅ SUCCÈS: Mission créée avec ID: $($reponse.id)" -ForegroundColor Green
        Write-Host "Détails:" -ForegroundColor Yellow
        Write-Host ($reponse | ConvertTo-Json -Depth 3)
    }
    
    Write-Host "----- Fin du test -----`n" -ForegroundColor Cyan
}

# Obtenir les dates pour les tests
$dateDebut = (Get-Date).ToString('yyyy-MM-dd')
$dateFin = (Get-Date).AddDays(14).ToString('yyyy-MM-dd')

Write-Host "===== TESTS DE CRÉATION DE MISSIONS AVEC DIFFÉRENTS CHAMPS OPTIONNELS =====" -ForegroundColor Magenta

# -------------------------------
# Test 1: Mission complète avec tous les champs
# -------------------------------
$missionComplete = @{
    titre = "Mission complète avec tous les champs"
    description = "Test de création d'une mission avec tous les champs renseignés"
    dateDebut = $dateDebut
    dateFin = $dateFin
    heureDebut = "08:00:00"
    heureFin = "18:00:00"
    statutMission = "PLANIFIEE"
    typeMission = "SURVEILLANCE"
    nombreAgents = 2
    quantite = 80
    tarifMissionId = 1
    devisId = 1
}

try {
    $reponse1 = Invoke-RestMethod -Method POST -Uri $baseUrl -ContentType $contentType -Body ($missionComplete | ConvertTo-Json)
    Afficher-ResultatTest -nomTest "Mission complète" -reponse $reponse1
} catch {
    Afficher-ResultatTest -nomTest "Mission complète" -erreur "Erreur: $($_.Exception.Message)"
}

# -------------------------------
# Test 2: Mission minimale (juste titre et type)
# -------------------------------
$missionMinimale = @{
    titre = "Mission minimale"
    typeMission = "GARDE_DU_CORPS"
}

try {
    $reponse2 = Invoke-RestMethod -Method POST -Uri $baseUrl -ContentType $contentType -Body ($missionMinimale | ConvertTo-Json)
    Afficher-ResultatTest -nomTest "Mission minimale" -reponse $reponse2
} catch {
    # Récupérer plus d'informations sur l'erreur
    $detailsErreur = "Statut: $($_.Exception.Response.StatusCode.value__)"
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        $reader.Close()
        $detailsErreur += ", Détails: $responseBody"
    } catch {
        $detailsErreur += ", Impossible de récupérer les détails de l'erreur"
    }
    Afficher-ResultatTest -nomTest "Mission minimale" -erreur $detailsErreur
}

# -------------------------------
# Test 3: Mission avec seulement un tarif (pour le calcul)
# -------------------------------
$missionAvecTarif = @{
    titre = "Mission avec tarif uniquement"
    typeMission = "SECURITE_EVENEMENTIELLE"
    nombreAgents = 1
    quantite = 24
    tarifMissionId = 1
}

try {
    $reponse3 = Invoke-RestMethod -Method POST -Uri $baseUrl -ContentType $contentType -Body ($missionAvecTarif | ConvertTo-Json)
    Afficher-ResultatTest -nomTest "Mission avec tarif uniquement" -reponse $reponse3
} catch {
    # Récupérer plus d'informations sur l'erreur
    $detailsErreur = "Statut: $($_.Exception.Response.StatusCode.value__)"
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        $reader.Close()
        $detailsErreur += ", Détails: $responseBody"
    } catch {
        $detailsErreur += ", Impossible de récupérer les détails de l'erreur"
    }
    Afficher-ResultatTest -nomTest "Mission avec tarif uniquement" -erreur $detailsErreur
}

# -------------------------------
# Test 4: Mission avec dates mais sans heures
# -------------------------------
$missionAvecDates = @{
    titre = "Mission avec dates uniquement"
    description = "Test de création d'une mission avec dates mais sans heures"
    dateDebut = $dateDebut
    dateFin = $dateFin
    typeMission = "RONDEUR"
    statutMission = "EN_ATTENTE_DE_VALIDATION_DEVIS"
}

try {
    $reponse4 = Invoke-RestMethod -Method POST -Uri $baseUrl -ContentType $contentType -Body ($missionAvecDates | ConvertTo-Json)
    Afficher-ResultatTest -nomTest "Mission avec dates uniquement" -reponse $reponse4
} catch {
    # Récupérer plus d'informations sur l'erreur
    $detailsErreur = "Statut: $($_.Exception.Response.StatusCode.value__)"
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        $reader.Close()
        $detailsErreur += ", Détails: $responseBody"
    } catch {
        $detailsErreur += ", Impossible de récupérer les détails de l'erreur"
    }
    Afficher-ResultatTest -nomTest "Mission avec dates uniquement" -erreur $detailsErreur
}

# -------------------------------
# Test 5: Mission avec devis mais sans tarif
# -------------------------------
$missionAvecDevis = @{
    titre = "Mission avec devis uniquement"
    description = "Test de création d'une mission liée à un devis sans tarif"
    statutMission = "EN_ATTENTE_DE_VALIDATION_DEVIS"
    devisId = 1
}

try {
    $reponse5 = Invoke-RestMethod -Method POST -Uri $baseUrl -ContentType $contentType -Body ($missionAvecDevis | ConvertTo-Json)
    Afficher-ResultatTest -nomTest "Mission avec devis uniquement" -reponse $reponse5
} catch {
    # Récupérer plus d'informations sur l'erreur
    $detailsErreur = "Statut: $($_.Exception.Response.StatusCode.value__)"
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        $reader.Close()
        $detailsErreur += ", Détails: $responseBody"
    } catch {
        $detailsErreur += ", Impossible de récupérer les détails de l'erreur"
    }
    Afficher-ResultatTest -nomTest "Mission avec devis uniquement" -erreur $detailsErreur
}

Write-Host "===== TESTS TERMINÉS =====" -ForegroundColor Magenta
