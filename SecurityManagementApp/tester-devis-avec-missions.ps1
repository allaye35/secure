# Script PowerShell pour tester un devis avec missions associées
# -------------------------------------------------------

# Configuration
$baseUrl = "http://localhost:8080/api/devis"
$missionsUrl = "http://localhost:8080/api/missions"
$contentType = "application/json"
$devisJsonFile = "devis-avec-missions.json"

# Affichage de l'entête
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   TEST DE L'API DEVIS AVEC MISSIONS ASSOCIÉES     " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Vérifier les missions disponibles
Write-Host "`n1. Récupération des missions disponibles:" -ForegroundColor Green
try {
    $missions = Invoke-RestMethod -Method GET -Uri $missionsUrl -ContentType $contentType
    
    Write-Host "$($missions.Count) missions trouvées dans le système" -ForegroundColor Yellow
    
    # Afficher les détails des missions
    foreach ($mission in $missions) {
        Write-Host "- ID: $($mission.id), Titre: $($mission.titre), Type: $($mission.typeMission)" -ForegroundColor Gray
        Write-Host "  Associée à un devis: $($mission.devisId -ne $null)" -ForegroundColor Gray
    }
    
    # Sélectionner les missions disponibles pour le devis
    $availableMissions = $missions | Where-Object { $_.devisId -eq $null }
    Write-Host "`n$($availableMissions.Count) missions disponibles pour association à un devis" -ForegroundColor Yellow
    
    if ($availableMissions.Count -eq 0) {
        Write-Host "ATTENTION: Aucune mission disponible pour associer au devis!" -ForegroundColor Red
        Write-Host "Création d'une mission de test..." -ForegroundColor Yellow
        
        # Créer une mission de test
        $missionData = @{
            titre = "Mission de test pour devis"
            description = "Mission créée automatiquement pour test d'association à un devis"
            dateDebut = (Get-Date).ToString('yyyy-MM-dd')
            dateFin = (Get-Date).AddDays(30).ToString('yyyy-MM-dd')
            heureDebut = "08:00:00"
            heureFin = "18:00:00"
            statutMission = "PLANIFIEE"
            typeMission = "GARDIENNAGE"
            nombreAgents = 2
            quantite = 80
            siteId = 1
        } | ConvertTo-Json
        
        $newMission = Invoke-RestMethod -Method POST -Uri $missionsUrl -ContentType $contentType -Body $missionData
        Write-Host "Mission créée avec succès! ID: $($newMission.id)" -ForegroundColor Green
        
        # Mise à jour des missions disponibles
        $availableMissions = @($newMission)
    }
    
    # Récupérer les IDs des missions disponibles
    $missionIds = $availableMissions | ForEach-Object { $_.id }
    Write-Host "IDs des missions disponibles: $($missionIds -join ', ')" -ForegroundColor Yellow
    
    # Mettre à jour le fichier JSON du devis avec les IDs des missions
    $devisJson = Get-Content -Path $devisJsonFile -Raw | ConvertFrom-Json
    $devisJson.missionExistanteIds = $missionIds
    $devisJson | ConvertTo-Json -Depth 4 | Set-Content -Path $devisJsonFile
    
    Write-Host "Fichier JSON de devis mis à jour avec les IDs des missions disponibles" -ForegroundColor Green
} catch {
    Write-Host "Erreur lors de la récupération des missions" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Détails: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# 2. Création du devis avec missions associées
Write-Host "`n2. Création du devis avec missions associées:" -ForegroundColor Green
try {
    # Lire le contenu du fichier JSON
    $devisJson = Get-Content -Path $devisJsonFile -Raw
    
    # Envoyer la requête POST pour créer le devis
    $response = Invoke-RestMethod -Method POST -Uri $baseUrl -ContentType $contentType -Body $devisJson
    
    Write-Host "Devis créé avec succès!" -ForegroundColor Green
    Write-Host "ID du devis: $($response.id)" -ForegroundColor Yellow
    Write-Host "Référence du devis: $($response.referenceDevis)" -ForegroundColor Yellow
    Write-Host "Nombre de missions associées: $($response.missionIds.Count)" -ForegroundColor Yellow
    
    # Sauvegarder l'ID pour les autres étapes
    $devisId = $response.id
    
    # Afficher les détails des missions associées
    Write-Host "`nDétails des missions associées:" -ForegroundColor Green
    foreach ($mission in $response.missions) {
        Write-Host "- ID: $($mission.id), Titre: $($mission.titre), Type: $($mission.typeMission)" -ForegroundColor Gray
        Write-Host "  Statut: $($mission.statutMission), Montant TTC: $($mission.montantTTC)" -ForegroundColor Gray
    }
    
    # Montants totaux
    Write-Host "`nMontants totaux du devis:" -ForegroundColor Green
    Write-Host "- Montant HT: $($response.montantTotalHT)" -ForegroundColor Yellow
    Write-Host "- Montant TVA: $($response.montantTotalTVA)" -ForegroundColor Yellow
    Write-Host "- Montant TTC: $($response.montantTotalTTC)" -ForegroundColor Yellow
    Write-Host "- Nombre d'agents: $($response.nombreTotalAgents)" -ForegroundColor Yellow
    Write-Host "- Nombre d'heures: $($response.nombreTotalHeures)" -ForegroundColor Yellow
} catch {
    Write-Host "Erreur lors de la création du devis" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "Détails: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    # Arrêter le script en cas d'erreur lors de la création
    exit 1
}

# 3. Vérifier le statut des missions associées
Write-Host "`n3. Vérification du statut des missions associées:" -ForegroundColor Green
try {
    foreach ($missionId in $response.missionIds) {
        $mission = Invoke-RestMethod -Method GET -Uri "$missionsUrl/$missionId" -ContentType $contentType
        
        Write-Host "Mission ID: $($mission.id), Titre: $($mission.titre)" -ForegroundColor Yellow
        Write-Host "- Statut: $($mission.statutMission)" -ForegroundColor Gray
        Write-Host "- Devis associé: $($mission.devisId)" -ForegroundColor Gray
        
        # Vérifier que le statut a bien été mis à jour        if ($mission.statutMission -eq "EN_ATTENTE_DE_VALIDATION_DEVIS") {
            Write-Host "- Statut correct: La mission est en attente de validation du devis" -ForegroundColor Green
        } else {
            Write-Host "- ATTENTION: Le statut de la mission n'a pas ete mis a jour correctement!" -ForegroundColor Red
        }
        
        # Vérifier que la mission est bien associée au devis créé
        if ($mission.devisId -eq $devisId) {
            Write-Host "- Association correcte: La mission est bien associée au devis créé ✓" -ForegroundColor Green
        } else {
            Write-Host "- ATTENTION: La mission n'est pas correctement associée au devis!" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "Erreur lors de la vérification des missions" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Confirmation avant suppression
Write-Host "`n4. Suppression du devis:" -ForegroundColor Red
$confirmation = Read-Host "Voulez-vous supprimer le devis créé? (O/N)"
if ($confirmation -eq "O") {
    try {
        # Envoyer la requête DELETE pour supprimer le devis
        Invoke-RestMethod -Method DELETE -Uri "$baseUrl/$devisId" -ContentType $contentType
        
        Write-Host "Devis supprimé avec succès!" -ForegroundColor Green
        
        # Vérifier l'état des missions après suppression
        Write-Host "`nVérification des missions après suppression du devis:" -ForegroundColor Green
        foreach ($missionId in $response.missionIds) {
            try {
                $mission = Invoke-RestMethod -Method GET -Uri "$missionsUrl/$missionId" -ContentType $contentType
                
                Write-Host "Mission ID: $($mission.id), Titre: $($mission.titre)" -ForegroundColor Yellow
                Write-Host "- Nouveau statut: $($mission.statutMission)" -ForegroundColor Gray
                Write-Host "- Devis associé: $($mission.devisId)" -ForegroundColor Gray
                
                # Vérifier que la mission n'est plus associée à un devis                if ($mission.devisId -eq $null) {
                    Write-Host "- Association correcte: La mission n'est plus associee a un devis" -ForegroundColor Green
                } else {
                    Write-Host "- ATTENTION: La mission est toujours associee a un devis!" -ForegroundColor Red
                }
            } catch {
                Write-Host "Erreur lors de la vérification de la mission $missionId après suppression" -ForegroundColor Red
                Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    } catch {
        Write-Host "Erreur lors de la suppression du devis" -ForegroundColor Red
        Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "Suppression annulée. Le devis reste dans le système." -ForegroundColor Yellow
}

Write-Host "`n====================================================" -ForegroundColor Cyan
Write-Host "                TESTS TERMINÉS                      " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
