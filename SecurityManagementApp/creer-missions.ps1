# Script pour créer une ou plusieurs missions via l'API REST

# Configuration
$baseUrl = "http://localhost:8080/api/missions"
$contentType = "application/json"

# Génération d'une référence unique pour chaque mission
function Generate-MissionReference {
    return "MIS-" + (Get-Date).ToString("yyyyMMdd") + "-" + (Get-Random -Minimum 1000 -Maximum 9999)
}

# Liste des missions à créer
$missions = @(
    @{ "description" = "Mission 1 - Test automatisé"; "dateDebut" = (Get-Date).ToString("yyyy-MM-dd"); "dateFin" = (Get-Date).AddDays(7).ToString("yyyy-MM-dd") },
    @{ "description" = "Mission 2 - Test automatisé"; "dateDebut" = (Get-Date).AddDays(1).ToString("yyyy-MM-dd"); "dateFin" = (Get-Date).AddDays(8).ToString("yyyy-MM-dd") }
)

# Création des missions
$missionIds = @()
foreach ($mission in $missions) {
    $missionJson = @{
        "referenceMission" = Generate-MissionReference
        "description" = $mission.description
        "dateDebut" = $mission.dateDebut
        "dateFin" = $mission.dateFin
        "entrepriseId" = 1
        "clientId" = 1
    } | ConvertTo-Json

    Write-Host "JSON de la mission :" -ForegroundColor Cyan
    Write-Host $missionJson

    try {
        $headers = @{ "Content-Type" = $contentType }
        $response = Invoke-RestMethod -Method POST -Uri $baseUrl -Body $missionJson -ContentType $contentType

        Write-Host "Mission créée avec succès!" -ForegroundColor Green
        Write-Host "ID de la mission: $($response.id)" -ForegroundColor Yellow

        # Ajouter l'ID de la mission à la liste
        $missionIds += $response.id
    } catch {
        Write-Host "Erreur lors de la création de la mission" -ForegroundColor Red
        Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        Write-Host "StatusDescription: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    }
}

# Afficher les IDs des missions créées
Write-Host "IDs des missions créées : $($missionIds -join ", ")" -ForegroundColor Cyan

# Sauvegarder les IDs dans un fichier pour utilisation ultérieure
$missionIds | Out-File -FilePath "missions-creees.txt" -Encoding UTF8
