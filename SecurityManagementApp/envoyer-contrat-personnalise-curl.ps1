# Script pour tester la création d'un contrat complet personnalisé avec curl
# envoyer-contrat-personnalise-curl.ps1

Write-Host "Test de création d'un contrat complet personnalisé via curl" -ForegroundColor Cyan

# Définir le chemin du fichier JSON
$JSON_FILE = "contrat-complet-personnalise.json"

Write-Host "Données à envoyer:" -ForegroundColor Yellow
Get-Content $JSON_FILE

Write-Host "`nEnvoi de la requête..." -ForegroundColor Yellow
$result = curl.exe -X POST "http://localhost:8080/api/contrats" `
  -H "Content-Type: application/json" `
  -d "@$JSON_FILE"

Write-Host "`nRésultat:" -ForegroundColor Green
Write-Host $result

# Tenter de convertir le résultat en JSON pour extraire l'ID
try {
    $jsonResult = $result | ConvertFrom-Json
    if ($jsonResult.id) {
        Write-Host "`nID du contrat: $($jsonResult.id)" -ForegroundColor Green
        # Sauvegarder l'ID pour référence future
        $jsonResult.id | Out-File -FilePath "contrat-personnalise-curl-id.txt"
        Write-Host "ID sauvegardé dans 'contrat-personnalise-curl-id.txt'" -ForegroundColor Gray
    }
} catch {
    Write-Host "Impossible de parser la réponse comme du JSON valide" -ForegroundColor Yellow
}
