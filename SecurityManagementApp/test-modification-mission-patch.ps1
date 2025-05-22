# Script PowerShell pour tester la modification d'une mission via curl (avec PATCH)
# Ce script modifie tous les champs importants d'une mission existante

# Configuration
$apiBaseUrl = "http://localhost:8080/api" # URL de base de l'API
$missionId = 1 # ID de la mission à modifier - à adapter selon votre cas

# Données de la mission modifiée (au format JSON)
$missionData = @"
{
  "titre": "Mission modifiée par curl (PATCH)",
  "description": "Test de modification via curl - méthode PATCH correcte",
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
$tempFile = "mission-patch-temp.json"
$missionData | Out-File -FilePath $tempFile -Encoding utf8

Write-Host "Début du test de modification de mission via curl (PATCH)..." -ForegroundColor Cyan

# Requête curl pour modifier la mission avec PATCH
Write-Host "Modification de la mission ID: $missionId avec PATCH" -ForegroundColor Yellow
curl -X PATCH "$apiBaseUrl/missions/$missionId" `
     -H "Content-Type: application/json" `
     -d "@$tempFile" `
     --verbose

# Vérification du résultat - Récupération de la mission après modification
Write-Host "`nVérification du résultat - Récupération de la mission modifiée:" -ForegroundColor Green
curl -X GET "$apiBaseUrl/missions/$missionId" `
     -H "Accept: application/json"

# Test avec paramètre nouvelleAdresse
Write-Host "`nModification avec paramètre nouvelleAdresse:" -ForegroundColor Yellow
curl -X PATCH "$apiBaseUrl/missions/$missionId?nouvelleAdresse=123%20Rue%20de%20la%20S%C3%A9curit%C3%A9" `
     -H "Content-Type: application/json" `
     -d "@$tempFile" `
     --verbose

# Nettoyage
Remove-Item -Path $tempFile -Force
Write-Host "`nTest terminé. Fichier temporaire supprimé." -ForegroundColor Cyan
