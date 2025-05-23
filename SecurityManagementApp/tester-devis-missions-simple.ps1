# Script PowerShell simplifié pour tester un devis avec missions
# -------------------------------------------------------

# Configuration
$baseUrl = "http://localhost:8080/api/devis"
$missionsUrl = "http://localhost:8080/api/missions"
$contentType = "application/json"

# Affichage de l'entête
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   TEST DE L'API DEVIS AVEC MISSIONS ASSOCIEES     " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

# 1. Création du devis (sans missions pour commencer)
Write-Host "`n1. Creation d'un devis sans missions:" -ForegroundColor Green

$devisData = @{
    referenceDevis = "DEV-2025-TEST-MISSIONS-" + (Get-Random)
    description = "Devis de test pour association de missions"
    statut = "EN_ATTENTE"
    entrepriseId = 1
    clientId = 1
    dateValidite = (Get-Date).AddMonths(6).ToString('yyyy-MM-dd')
    conditionsGenerales = "Conditions generales de test"
    missionExistanteIds = @()
} | ConvertTo-Json

try {
    $devis = Invoke-RestMethod -Method POST -Uri $baseUrl -ContentType $contentType -Body $devisData
    
    Write-Host "Devis cree avec succes!" -ForegroundColor Green
    Write-Host "ID du devis: $($devis.id)" -ForegroundColor Yellow
    Write-Host "Reference: $($devis.referenceDevis)" -ForegroundColor Yellow
    
    $devisId = $devis.id
} catch {
    Write-Host "Erreur lors de la creation du devis" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Récupération des missions existantes
Write-Host "`n2. Recuperation des missions existantes:" -ForegroundColor Green

try {
    $missions = Invoke-RestMethod -Method GET -Uri $missionsUrl -ContentType $contentType
    
    $availableMissions = $missions | Where-Object { $_.devisId -eq $null }
    
    Write-Host "$($availableMissions.Count) missions disponibles trouvees" -ForegroundColor Yellow
    
    if ($availableMissions.Count -gt 0) {
        # Prendre les 2 premières missions disponibles (ou moins s'il n'y en a pas assez)
        $missionCount = [Math]::Min(2, $availableMissions.Count)
        $selectedMissions = $availableMissions | Select-Object -First $missionCount
        
        Write-Host "Missions selectionnees pour association:" -ForegroundColor Green
        foreach ($mission in $selectedMissions) {
            Write-Host "- ID: $($mission.id), Titre: $($mission.titre)" -ForegroundColor Gray
        }
        
        $missionIds = $selectedMissions | ForEach-Object { $_.id }
    } else {
        Write-Host "Aucune mission disponible. Creation d'une mission de test..." -ForegroundColor Yellow
          $missionData = @{
            titre = "Mission de test pour devis"
            description = "Mission créée automatiquement pour test"
            dateDebut = (Get-Date).ToString('yyyy-MM-dd')
            dateFin = (Get-Date).AddDays(30).ToString('yyyy-MM-dd')
            heureDebut = "08:00:00"
            heureFin = "18:00:00"
            statutMission = "PLANIFIEE"
            typeMission = "GARDIENNAGE"
            nombreAgents = 2
            quantite = 80
            tarifMissionId = 1
            siteId = 1
            agentIds = @()
            clientId = 1
            entrepriseId = 1
        } | ConvertTo-Json
        
        $newMission = Invoke-RestMethod -Method POST -Uri $missionsUrl -ContentType $contentType -Body $missionData
        Write-Host "Mission creee avec succes! ID: $($newMission.id)" -ForegroundColor Green
        
        $missionIds = @($newMission.id)
    }
} catch {
    Write-Host "Erreur lors de la recuperation ou creation des missions" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    # Continuer quand même, on utilisera un tableau vide
    $missionIds = @()
}

# 3. Mise à jour du devis avec les missions
Write-Host "`n3. Association des missions au devis:" -ForegroundColor Green

if ($missionIds.Count -gt 0) {
    $updateData = @{
        referenceDevis = $devis.referenceDevis
        description = $devis.description
        statut = $devis.statut
        entrepriseId = $devis.entrepriseId
        clientId = $devis.clientId
        dateValidite = $devis.dateValidite
        conditionsGenerales = $devis.conditionsGenerales
        missionExistanteIds = $missionIds
    } | ConvertTo-Json
    
    try {
        $updatedDevis = Invoke-RestMethod -Method PUT -Uri "$baseUrl/$devisId" -ContentType $contentType -Body $updateData
        
        Write-Host "Devis mis a jour avec succes!" -ForegroundColor Green
        Write-Host "Nombre de missions associees: $($updatedDevis.missionIds.Count)" -ForegroundColor Yellow
        
        # Vérifier les montants totaux
        Write-Host "`nMontants totaux du devis:" -ForegroundColor Green
        Write-Host "- Montant HT: $($updatedDevis.montantTotalHT)" -ForegroundColor Yellow
        Write-Host "- Montant TVA: $($updatedDevis.montantTotalTVA)" -ForegroundColor Yellow
        Write-Host "- Montant TTC: $($updatedDevis.montantTotalTTC)" -ForegroundColor Yellow
        
        # Vérifier les missions associées
        Write-Host "`nDetails des missions associees:" -ForegroundColor Green
        foreach ($mission in $updatedDevis.missions) {
            Write-Host "- ID: $($mission.id), Titre: $($mission.titre)" -ForegroundColor Gray
            Write-Host "  Statut: $($mission.statutMission), Montant TTC: $($mission.montantTTC)" -ForegroundColor Gray
        }
        
        # Vérifier le statut des missions dans l'API
        Write-Host "`nVerification du statut des missions via l'API:" -ForegroundColor Green
        foreach ($missionId in $updatedDevis.missionIds) {
            $mission = Invoke-RestMethod -Method GET -Uri "$missionsUrl/$missionId" -ContentType $contentType
            
            Write-Host "Mission ID: $($mission.id)" -ForegroundColor Yellow
            Write-Host "- Statut: $($mission.statutMission)" -ForegroundColor Gray
            Write-Host "- Devis associe: $($mission.devisId)" -ForegroundColor Gray
            
            # Vérifier l'association
            if ($mission.devisId -eq $devisId) {
                Write-Host "- Association OK: La mission est bien associee au devis" -ForegroundColor Green
            } else {
                Write-Host "- PROBLEME: La mission n'est pas correctement associee au devis!" -ForegroundColor Red
            }
        }
    } catch {
        Write-Host "Erreur lors de la mise a jour du devis" -ForegroundColor Red
        Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "Aucune mission a associer, etape ignoree" -ForegroundColor Yellow
}

# 4. Suppression du devis
Write-Host "`n4. Suppression du devis:" -ForegroundColor Red
$confirmation = Read-Host "Voulez-vous supprimer le devis cree? (O/N)"

if ($confirmation -eq "O") {
    try {
        Invoke-RestMethod -Method DELETE -Uri "$baseUrl/$devisId" -ContentType $contentType
        
        Write-Host "Devis supprime avec succes!" -ForegroundColor Green
        
        # Vérifier que le devis n'existe plus
        try {
            $deletedDevis = Invoke-RestMethod -Method GET -Uri "$baseUrl/$devisId" -ContentType $contentType
            Write-Host "PROBLEME: Le devis existe toujours!" -ForegroundColor Red
        } catch {
            Write-Host "Verification OK: Le devis n'existe plus" -ForegroundColor Green
        }
        
        # Vérifier le statut des missions après suppression
        if ($missionIds.Count -gt 0) {
            Write-Host "`nVerification des missions apres suppression:" -ForegroundColor Green
            foreach ($missionId in $missionIds) {
                try {
                    $mission = Invoke-RestMethod -Method GET -Uri "$missionsUrl/$missionId" -ContentType $contentType
                    
                    Write-Host "Mission ID: $($mission.id)" -ForegroundColor Yellow
                    Write-Host "- Statut apres suppression: $($mission.statutMission)" -ForegroundColor Gray
                    Write-Host "- Devis associe: $($mission.devisId)" -ForegroundColor Gray
                    
                    if ($mission.devisId -eq $null) {
                        Write-Host "- Desassociation OK: La mission n'est plus liee a un devis" -ForegroundColor Green
                    } else {
                        Write-Host "- PROBLEME: La mission est encore associee au devis $($mission.devisId)!" -ForegroundColor Red
                    }
                } catch {
                    Write-Host "Erreur lors de la verification de la mission $missionId" -ForegroundColor Red
                    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
        }
    } catch {
        Write-Host "Erreur lors de la suppression du devis" -ForegroundColor Red
        Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "Suppression annulee. Le devis reste dans le systeme." -ForegroundColor Yellow
}

Write-Host "`n====================================================" -ForegroundColor Cyan
Write-Host "                TESTS TERMINES                      " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
