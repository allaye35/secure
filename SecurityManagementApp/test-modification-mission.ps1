# Script PowerShell pour tester la modification d'une mission via curl
# Ce script modifie tous les champs importants d'une mission existante

# Configuration
$apiBaseUrl = "http://localhost:8080/api" # URL de base de l'API
$missionId = 1 # ID de la mission à modifier - à adapter selon votre cas

# Données de la mission modifiée (au format JSON)
$missionData = @"
{
  "titre": "Mission modifiée par curl",
  "description": "Test de modification via curl - tous champs importants modifiés",
  "dateDebut": "2025-09-01",
  "dateFin": "2025-09-30",
  "heureDebut": "09:00:00",
  "heureFin": "18:00:00",
  "statutMission": "PLANIFIEE",
  "typeMission": "SURVEILLANCE",
  "nombreAgents": 5,
  "quantite": 15,
  "tarifMissionId": 2,
  "siteId": 2,
  "montantHT": 2500.00,
  "montantTVA": 500.00,
  "montantTTC": 3000.00,
  "commentaires": "Mission modifiée via curl pour test backend"
}
"@

# Sauvegarde des données dans un fichier temporaire
$tempFile = "mission-modification-temp.json"
$missionData | Out-File -FilePath $tempFile -Encoding utf8

Write-Host "Début du test de modification de mission via curl..." -ForegroundColor Cyan

# Requête curl pour modifier la mission
Write-Host "Modification de la mission ID: $missionId" -ForegroundColor Yellow
curl -X PUT "$apiBaseUrl/missions/$missionId" `
     -H "Content-Type: application/json" `
     -d "@$tempFile" `
     --verbose

# Vérification du résultat - Récupération de la mission après modification
Write-Host "`nVérification du résultat - Récupération de la mission modifiée:" -ForegroundColor Green
curl -X GET "$apiBaseUrl/missions/$missionId" `
     -H "Accept: application/json"

# Nettoyage
Remove-Item -Path $tempFile -Force
Write-Host "`nTest terminé. Fichier temporaire supprimé." -ForegroundColor Cyan

# Instructions supplémentaires
Write-Host "`nInstructions supplémentaires:" -ForegroundColor Magenta
Write-Host "- Si vous avez besoin de vous authentifier, ajoutez l'en-tête Authorization aux requêtes curl:"
Write-Host '  -H "Authorization: Bearer VOTRE_TOKEN_JWT"' -ForegroundColor Gray
Write-Host "- Pour tester d'autres types de modifications, ajustez les valeurs dans le JSON"
Write-Host "- Pour modifier l'ID de la mission à tester, changez la valeur de \$missionId au début du script"

.\test-modification-mission-par-etapes.ps1
