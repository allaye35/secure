# Script pour tester l'API de création de devis avec curl
$url = "http://localhost:8080/api/devis"

# Charger le contenu JSON du devis
$jsonContent = Get-Content -Path "test-api-devis.json" -Raw

# Écrire le JSON dans un fichier temporaire pour curl
$jsonContent | Out-File -Encoding utf8 -FilePath "temp-devis.json"

# Faire la requête POST avec curl
Write-Host "Envoi du devis à l'API..." -ForegroundColor Yellow
$curlCommand = 'curl -X POST "{0}" -H "Content-Type: application/json" -d "@temp-devis.json"' -f $url
$response = Invoke-Expression $curlCommand

Write-Host "Réponse reçue:" -ForegroundColor Cyan
Write-Host $response

# Tenter de convertir la réponse en objet JSON
try {
    $responseObject = $response | ConvertFrom-Json
    if ($responseObject.id) {
        Write-Host "Devis créé avec succès! ID: $($responseObject.id)" -ForegroundColor Green
        # Sauvegarder l'ID pour l'utiliser plus tard
        $responseObject.id | Out-File -FilePath "devis-id.txt"
    }
} catch {
    Write-Host "Erreur lors du traitement de la réponse" -ForegroundColor Red
    Write-Host $_ -ForegroundColor Red
}

# Nettoyer
Remove-Item -Path "temp-devis.json"
