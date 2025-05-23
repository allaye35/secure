# Script avancé de test pour l'API des missions
# Ce script utilise Invoke-RestMethod pour tester les différents endpoints du contrôleur MissionControleur
# avec une présentation plus claire des résultats et des objets PowerShell

# Configuration
$API_BASE = "http://localhost:8080/api"
$MISSIONS_API = "$API_BASE/missions"
$CONTENT_TYPE = "application/json"

# Fonction d'aide pour afficher les résultats formatés
function Show-TestResult {
    param (
        [string]$TestName,
        [scriptblock]$TestScript
    )
    
    Write-Host "`n=============================================" -ForegroundColor Cyan
    Write-Host "TEST: $TestName" -ForegroundColor Cyan
    Write-Host "=============================================`n" -ForegroundColor Cyan
    
    try {
        $result = & $TestScript
        
        if ($result -ne $null) {
            Write-Host "RÉSULTAT:" -ForegroundColor Green
            $result | Format-List | Out-String | Write-Host
        } else {
            Write-Host "Opération réussie (aucun résultat)" -ForegroundColor Green
        }
    } 
    catch {
        Write-Host "ERREUR:" -ForegroundColor Red
        Write-Host "  Message: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            $statusDescription = $_.Exception.Response.StatusDescription
            Write-Host "  Statut HTTP: $statusCode - $statusDescription" -ForegroundColor Red
            
            try {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $reader.BaseStream.Position = 0
                $reader.DiscardBufferedData()
                $responseBody = $reader.ReadToEnd()
                Write-Host "  Corps de la réponse: $responseBody" -ForegroundColor Red
            } 
            catch {
                Write-Host "  Impossible de lire le corps de la réponse" -ForegroundColor Red
            }
        }
    }
}

# Variable pour stocker l'ID de la mission créée
$createdMissionId = $null

# 1. Lister toutes les missions
Show-TestResult -TestName "Récupération de toutes les missions" -TestScript {
    $missions = Invoke-RestMethod -Uri $MISSIONS_API -Method Get -ContentType $CONTENT_TYPE
    
    Write-Host "Nombre de missions récupérées: $($missions.Count)" -ForegroundColor Yellow
    
    if ($missions.Count -gt 0) {
        Write-Host "Première mission:" -ForegroundColor Yellow
        return $missions[0]
    }
    else {
        Write-Host "Aucune mission trouvée" -ForegroundColor Yellow
        return $null
    }
}

# 2. Récupérer une mission par son ID
Show-TestResult -TestName "Récupération d'une mission par ID" -TestScript {
    $missionId = 1  # À ajuster selon les données disponibles
    return Invoke-RestMethod -Uri "$MISSIONS_API/$missionId" -Method Get -ContentType $CONTENT_TYPE
}

# 3. Simuler un calcul de montants
Show-TestResult -TestName "Simulation de calcul de montants" -TestScript {
    $missionSimulation = @{
        titre = "Test de simulation"
        description = "Mission pour tester la simulation de calcul"
        dateDebut = "2025-06-01"
        dateFin = "2025-06-02"
        heureDebut = "08:00"
        heureFin = "18:00"
        typeMission = "GARDIENNAGE"
        statutMission = "PLANIFIEE"
        tarifMissionId = 1  # À ajuster selon les données disponibles
        quantite = 2
    }
    
    return Invoke-RestMethod -Uri "$MISSIONS_API/simuler-calcul" -Method Post -Body ($missionSimulation | ConvertTo-Json) -ContentType $CONTENT_TYPE
}

# 4. Créer une mission
Show-TestResult -TestName "Création d'une mission" -TestScript {
    $newMission = @{
        titre = "Mission de test via API"
        description = "Création d'une mission via l'API REST avec Invoke-RestMethod"
        dateDebut = "2025-06-15"
        dateFin = "2025-06-16"
        heureDebut = "09:00"
        heureFin = "17:00"
        typeMission = "SURVEILLANCE"
        statutMission = "PLANIFIEE"
        tarifMissionId = 1  # À ajuster selon les données disponibles
        devisId = 1         # À ajuster selon les données disponibles
        quantite = 1
        nombreAgents = 2
    }
    
    $result = Invoke-RestMethod -Uri $MISSIONS_API -Method Post -Body ($newMission | ConvertTo-Json) -ContentType $CONTENT_TYPE
    
    # Stocker l'ID pour les tests suivants
    $script:createdMissionId = $result.id
    Write-Host "ID de la mission créée: $($script:createdMissionId)" -ForegroundColor Yellow
    
    return $result
}

# 5. Mettre à jour une mission
Show-TestResult -TestName "Mise à jour d'une mission" -TestScript {
    if (-not $script:createdMissionId) {
        Write-Host "Aucune mission créée précédemment. Test ignoré." -ForegroundColor Yellow
        return $null
    }
    
    $updatedMission = @{
        titre = "Mission mise à jour via API"
        description = "Mise à jour d'une mission via l'API REST avec Invoke-RestMethod"
        dateDebut = "2025-06-15"
        dateFin = "2025-06-16"
        heureDebut = "10:00"  # Changé de 09:00 à 10:00
        heureFin = "18:00"    # Changé de 17:00 à 18:00
        typeMission = "SURVEILLANCE"
        statutMission = "EN_COURS"  # Changé de PLANIFIEE à EN_COURS
        tarifMissionId = 1
        devisId = 1
        quantite = 2          # Changé de 1 à 2
        nombreAgents = 3      # Changé de 2 à 3
    }
    
    return Invoke-RestMethod -Uri "$MISSIONS_API/$script:createdMissionId" -Method Put -Body ($updatedMission | ConvertTo-Json) -ContentType $CONTENT_TYPE
}

# 6. Affecter des agents à la mission
Show-TestResult -TestName "Affectation d'agents à la mission" -TestScript {
    if (-not $script:createdMissionId) {
        Write-Host "Aucune mission créée précédemment. Test ignoré." -ForegroundColor Yellow
        return $null
    }
    
    $agentIds = @(1, 2)  # À ajuster selon les données disponibles
    
    return Invoke-RestMethod -Uri "$MISSIONS_API/$script:createdMissionId/agents" -Method Put -Body ($agentIds | ConvertTo-Json) -ContentType $CONTENT_TYPE
}

# 7. Retirer un agent de la mission
Show-TestResult -TestName "Retrait d'un agent de la mission" -TestScript {
    if (-not $script:createdMissionId) {
        Write-Host "Aucune mission créée précédemment. Test ignoré." -ForegroundColor Yellow
        return $null
    }
    
    $agentIdToRemove = 1  # À ajuster selon les données disponibles
    
    return Invoke-RestMethod -Uri "$MISSIONS_API/$script:createdMissionId/agent/$agentIdToRemove" -Method Delete -ContentType $CONTENT_TYPE
}

# 8. Associer un site à la mission
Show-TestResult -TestName "Association d'un site à la mission" -TestScript {
    if (-not $script:createdMissionId) {
        Write-Host "Aucune mission créée précédemment. Test ignoré." -ForegroundColor Yellow
        return $null
    }
    
    $siteId = 1  # À ajuster selon les données disponibles
    
    return Invoke-RestMethod -Uri "$MISSIONS_API/$script:createdMissionId/site/$siteId" -Method Put -ContentType $CONTENT_TYPE
}

# 9. Associer un planning à la mission
Show-TestResult -TestName "Association d'un planning à la mission" -TestScript {
    if (-not $script:createdMissionId) {
        Write-Host "Aucune mission créée précédemment. Test ignoré." -ForegroundColor Yellow
        return $null
    }
    
    $planningId = 1  # À ajuster selon les données disponibles
    
    return Invoke-RestMethod -Uri "$MISSIONS_API/$script:createdMissionId/planning/$planningId" -Method Put -ContentType $CONTENT_TYPE
}

# 10. Associer une facture à la mission
Show-TestResult -TestName "Association d'une facture à la mission" -TestScript {
    if (-not $script:createdMissionId) {
        Write-Host "Aucune mission créée précédemment. Test ignoré." -ForegroundColor Yellow
        return $null
    }
    
    $factureId = 1  # À ajuster selon les données disponibles
    
    return Invoke-RestMethod -Uri "$MISSIONS_API/$script:createdMissionId/factures/$factureId" -Method Put -ContentType $CONTENT_TYPE
}

# 11. Associer une géolocalisation à la mission
Show-TestResult -TestName "Association d'une géolocalisation à la mission" -TestScript {
    if (-not $script:createdMissionId) {
        Write-Host "Aucune mission créée précédemment. Test ignoré." -ForegroundColor Yellow
        return $null
    }
    
    return Invoke-RestMethod -Uri "$MISSIONS_API/$script:createdMissionId/geoloc" -Method Put -ContentType $CONTENT_TYPE
}

# 12. Récupérer les missions commençant après une date
Show-TestResult -TestName "Récupération des missions commençant après une date" -TestScript {
    $date = "2025-06-01"
    $missions = Invoke-RestMethod -Uri "$MISSIONS_API/apres?date=$date" -Method Get -ContentType $CONTENT_TYPE
    
    Write-Host "Nombre de missions trouvées: $($missions.Count)" -ForegroundColor Yellow
    
    if ($missions.Count -gt 0) {
        return $missions[0]  # Retourner la première mission
    }
    else {
        return $null
    }
}

# 13. Récupérer les missions finissant avant une date
Show-TestResult -TestName "Récupération des missions finissant avant une date" -TestScript {
    $date = "2025-12-31"
    $missions = Invoke-RestMethod -Uri "$MISSIONS_API/avant?date=$date" -Method Get -ContentType $CONTENT_TYPE
    
    Write-Host "Nombre de missions trouvées: $($missions.Count)" -ForegroundColor Yellow
    
    if ($missions.Count -gt 0) {
        return $missions[0]  # Retourner la première mission
    }
    else {
        return $null
    }
}

# 14. Récupérer les missions d'un agent
Show-TestResult -TestName "Récupération des missions par agent" -TestScript {
    $agentId = 1  # À ajuster selon les données disponibles
    $missions = Invoke-RestMethod -Uri "$MISSIONS_API/agent/$agentId" -Method Get -ContentType $CONTENT_TYPE
    
    Write-Host "Nombre de missions trouvées: $($missions.Count)" -ForegroundColor Yellow
    
    if ($missions.Count -gt 0) {
        return $missions[0]  # Retourner la première mission
    }
    else {
        return $null
    }
}

# 15. Supprimer la mission créée (exécuter en dernier)
Show-TestResult -TestName "Suppression de la mission" -TestScript {
    if (-not $script:createdMissionId) {
        Write-Host "Aucune mission créée précédemment. Test ignoré." -ForegroundColor Yellow
        return $null
    }
    
    Invoke-RestMethod -Uri "$MISSIONS_API/$script:createdMissionId" -Method Delete -ContentType $CONTENT_TYPE
    
    Write-Host "Mission #$script:createdMissionId supprimée avec succès" -ForegroundColor Green
    return $null
}

Write-Host "`n===== TOUS LES TESTS SONT TERMINÉS =====" -ForegroundColor Cyan
