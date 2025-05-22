#!/usr/bin/env pwsh
# Script pour créer une mission complète avec tous les champs et relations
# Date de création: 22 mai 2025

# Configuration
$baseUrl = "http://localhost:8080/api/missions"
$color = @{
    Title = "Magenta"
    Info = "Yellow"
    Success = "Green"
    Error = "Red"
    Subtitle = "Cyan"
}

Write-Host "`n===== Création d'une mission complète avec tous les champs et relations =====" -ForegroundColor $color.Title

# Construction du JSON pour la mission
$missionJson = @"
{
  "titre": "Mission complète avec tous les champs",
  "description": "Mission de sécurité avancée créée pour tester l'API avec tous les champs et relations",
  "dateDebut": "2025-06-15",
  "dateFin": "2025-07-15",
  "heureDebut": "08:00:00",
  "heureFin": "20:00:00",
  "statutMission": "PLANIFIEE",
  "typeMission": "SURVEILLANCE",
  "nombreAgents": 3,
  "quantite": 10,
  "tarifMissionId": 1,
  "siteId": 1,
  "geolocalisationId": 1,
  "agentIds": [1, 2, 3],
  "planningId": 1,
  "contratId": 1,
  "montantHT": 1500.00,
  "montantTVA": 300.00,
  "montantTTC": 1800.00,
  "commentaires": "Mission complète créée via API REST avec tous les champs et relations possibles"
}
"@

# Enregistrement du JSON dans un fichier temporaire
$tempFile = [System.IO.Path]::GetTempFileName()
$missionJson | Out-File -FilePath $tempFile -Encoding utf8

Write-Host "`nContenu JSON de la mission à créer:" -ForegroundColor $color.Info
Write-Host $missionJson

Write-Host "`nEnvoi de la requête POST pour créer la mission..." -ForegroundColor $color.Subtitle

try {
    # Méthode 1: Utilisation de curl
    Write-Host "Méthode 1: Utilisation de curl" -ForegroundColor $color.Info
    $curlCreateCommand = "curl -X POST '$baseUrl' -H 'Content-Type: application/json' -d '@$tempFile'"
    Write-Host "Exécution de la commande: $curlCreateCommand" -ForegroundColor $color.Info
    $createResult = Invoke-Expression -Command $curlCreateCommand

    # Affichage du résultat
    Write-Host "`nRésultat de la création de mission (curl):" -ForegroundColor $color.Success
    Write-Host $createResult

    # Récupération de l'ID de la mission créée
    $missionId = -1
    if ($createResult -match '"id"\s*:\s*(\d+)') {
        $missionId = $matches[1]
        Write-Host "`nMission créée avec succès avec l'ID: $missionId (via curl)" -ForegroundColor $color.Success
    } else {
        Write-Host "`nImpossible de récupérer l'ID de la mission créée avec curl." -ForegroundColor $color.Error
    }

    # Méthode 2: Utilisation de Invoke-RestMethod (plus moderne et robuste)
    Write-Host "`nMéthode 2: Utilisation de Invoke-RestMethod" -ForegroundColor $color.Info
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    $missionJsonObject = $missionJson | ConvertFrom-Json
    # Modification du titre pour éviter les doublons
    $missionJsonObject.titre = "Mission complète avec Invoke-RestMethod"
    $missionJsonUpdated = $missionJsonObject | ConvertTo-Json -Depth 10
    
    $createResultRM = Invoke-RestMethod -Method Post -Uri $baseUrl -Headers $headers -Body $missionJsonUpdated
    
    # Affichage du résultat
    Write-Host "`nRésultat de la création de mission (Invoke-RestMethod):" -ForegroundColor $color.Success
    Write-Host ($createResultRM | ConvertTo-Json -Depth 4)
    
    # Récupération de l'ID de la mission créée
    $missionIdRM = $createResultRM.id
    Write-Host "`nMission créée avec succès avec l'ID: $missionIdRM (via Invoke-RestMethod)" -ForegroundColor $color.Success

    # Vérification des agents assignés
    if ($createResultRM.agentIds -and $createResultRM.agentIds.Count -gt 0) {
        Write-Host "`nVérification des agents assignés à la mission:" -ForegroundColor $color.Subtitle
        Write-Host "Agents assignés à la mission (IDs): $($createResultRM.agentIds -join ', ')" -ForegroundColor $color.Success
        
        # Récupération des détails des agents assignés
        Write-Host "`nDétails des agents assignés:" -ForegroundColor $color.Success
        foreach ($agentId in $createResultRM.agentIds) {
            try {
                $agentUrl = "http://localhost:8080/api/agents/$agentId"
                $agent = Invoke-RestMethod -Method Get -Uri $agentUrl
                Write-Host "Agent #$agentId : $($agent.nom) $($agent.prenom)" -ForegroundColor $color.Info
            } catch {
                Write-Host "Impossible de récupérer les détails de l'agent #$agentId" -ForegroundColor $color.Error
            }
        }
    } else {
        Write-Host "`nAucun agent n'a été assigné à la mission ou l'assignation a échoué." -ForegroundColor $color.Info
    }

    # Vérification des autres relations
    Write-Host "`nVérification des autres relations:" -ForegroundColor $color.Subtitle
    
    # Site
    if ($createResultRM.siteId) {
        try {
            $siteUrl = "http://localhost:8080/api/sites/$($createResultRM.siteId)"
            $site = Invoke-RestMethod -Method Get -Uri $siteUrl
            Write-Host "Site #$($createResultRM.siteId) : $($site.nom)" -ForegroundColor $color.Info
        } catch {
            Write-Host "Impossible de récupérer les détails du site #$($createResultRM.siteId)" -ForegroundColor $color.Error
        }
    }
    
    # Planning
    if ($createResultRM.planningId) {
        try {
            $planningUrl = "http://localhost:8080/api/plannings/$($createResultRM.planningId)"
            $planning = Invoke-RestMethod -Method Get -Uri $planningUrl
            Write-Host "Planning #$($createResultRM.planningId) associé" -ForegroundColor $color.Info
        } catch {
            Write-Host "Impossible de récupérer les détails du planning #$($createResultRM.planningId)" -ForegroundColor $color.Error
        }
    }
    
    # Contrat
    if ($createResultRM.contratId) {
        try {
            $contratUrl = "http://localhost:8080/api/contrats/$($createResultRM.contratId)"
            $contrat = Invoke-RestMethod -Method Get -Uri $contratUrl
            Write-Host "Contrat #$($createResultRM.contratId) : $($contrat.referenceContrat)" -ForegroundColor $color.Info
        } catch {
            Write-Host "Impossible de récupérer les détails du contrat #$($createResultRM.contratId)" -ForegroundColor $color.Error
        }
    }
    
    # Géolocalisation
    if ($createResultRM.geolocalisationId) {
        try {
            $geoUrl = "http://localhost:8080/api/geolocalisations/$($createResultRM.geolocalisationId)"
            $geo = Invoke-RestMethod -Method Get -Uri $geoUrl
            Write-Host "Géolocalisation #$($createResultRM.geolocalisationId) associée" -ForegroundColor $color.Info
        } catch {
            Write-Host "Impossible de récupérer les détails de la géolocalisation #$($createResultRM.geolocalisationId)" -ForegroundColor $color.Error
        }
    }

    # Sauvegarde de l'ID pour une utilisation ultérieure
    if ($missionIdRM -ne -1) {
        $missionIdRM | Out-File -FilePath "mission-complete-id.txt"
        Write-Host "`nL'ID de la mission a été sauvegardé dans 'mission-complete-id.txt'" -ForegroundColor $color.Success
    }

    # Sauvegarde du JSON de la mission créée
    $createResultRM | ConvertTo-Json -Depth 4 | Out-File -FilePath "mission-complete-creee.json"
    Write-Host "Les détails de la mission créée ont été sauvegardés dans 'mission-complete-creee.json'" -ForegroundColor $color.Success

} catch {
    Write-Host "`nErreur lors de la création de la mission" -ForegroundColor $color.Error
    
    if ($_.Exception.Response) {
        Write-Host "Code de statut: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor $color.Error
        
        # Tentative de récupération du message d'erreur du serveur
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $reader.BaseStream.Position = 0
            $reader.DiscardBufferedData()
            $responseBody = $reader.ReadToEnd()
            Write-Host "Message d'erreur du serveur: $responseBody" -ForegroundColor $color.Error
        } catch {
            Write-Host "Impossible de lire le message d'erreur du serveur" -ForegroundColor $color.Error
        }
    }
    
    Write-Host "Message d'erreur: $($_.Exception.Message)" -ForegroundColor $color.Error
}

# Suppression du fichier temporaire
Remove-Item -Path $tempFile

Write-Host "`n===== Fin de la création de mission complète =====" -ForegroundColor $color.Title
