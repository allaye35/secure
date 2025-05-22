#!/usr/bin/env pwsh
# Script pour créer une mission complète avec des agents assignés

# Configuration
$baseUrl = "http://localhost:8080/api/missions"

Write-Host "`n===== Création d'une mission complète avec agents =====" -ForegroundColor Cyan

# Chemin vers le fichier JSON contenant les données de la mission
$missionJsonPath = "mission-complete-avec-agents.json"

# Vérification que le fichier existe
if (-not (Test-Path $missionJsonPath)) {
    Write-Host "Erreur: Le fichier $missionJsonPath n'existe pas!" -ForegroundColor Red
    exit 1
}

# Lecture du contenu du fichier JSON
$missionJsonContent = Get-Content -Raw -Path $missionJsonPath
Write-Host "`nContenu JSON de la mission à créer:" -ForegroundColor Yellow
Write-Host $missionJsonContent

Write-Host "`nEnvoi de la requête POST pour créer la mission..." -ForegroundColor Green

# Exécution de la requête pour créer la mission
try {
    $headers = @{
        "Content-Type" = "application/json"
    }
    $createResult = Invoke-RestMethod -Method Post -Uri $baseUrl -Headers $headers -Body $missionJsonContent -ErrorAction Stop
    
    # Affichage du résultat
    Write-Host "`nRésultat de la création de mission:" -ForegroundColor Green
    Write-Host ($createResult | ConvertTo-Json -Depth 4)
    
    # Récupération de l'ID de la mission créée
    $missionId = $createResult.id
    Write-Host "`nMission créée avec succès avec l'ID: $missionId" -ForegroundColor Green
    
    # Vérification des agents assignés
    Write-Host "`nVérification des agents assignés à la mission:" -ForegroundColor Magenta
    $agentIds = $createResult.agentIds
    if ($agentIds.Count -gt 0) {
        Write-Host "Agents assignés à la mission (IDs): $($agentIds -join ', ')" -ForegroundColor Green
        
        # Récupération des détails des agents assignés
        Write-Host "`nDétails des agents assignés:" -ForegroundColor Green
        foreach ($agentId in $agentIds) {
            try {
                $agentUrl = "http://localhost:8080/api/agents/$agentId"
                $agent = Invoke-RestMethod -Method Get -Uri $agentUrl -ErrorAction Stop
                Write-Host "Agent ID $($agent.id): $($agent.nom) $($agent.prenom) - Statut: $($agent.statut)" -ForegroundColor Green
            } catch {
                Write-Host "Impossible de récupérer les détails de l'agent ID $agentId : $_" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "Aucun agent n'a été assigné à la mission!" -ForegroundColor Yellow
    }
} catch {
    Write-Host "`nErreur lors de la création de la mission: $_" -ForegroundColor Red
    
    # Affichage de plus de détails sur l'erreur
    if ($_.Exception.Response -ne $null) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "Détails de l'erreur: $errorBody" -ForegroundColor Red
    }
}

Write-Host "`n===== Test terminé =====" -ForegroundColor Cyan
