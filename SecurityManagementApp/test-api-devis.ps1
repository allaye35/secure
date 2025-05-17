# Script pour tester l'API de création de devis
$url = "http://localhost:8080/api/devis"

# Charger le contenu JSON du devis
$jsonContent = Get-Content -Path "test-api-devis.json" -Raw

# Faire la requête POST
try {
    $headers = @{
        "Content-Type" = "application/json"
    }
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $jsonContent -Headers $headers
    Write-Host "Devis créé avec succès :"
    $response | ConvertTo-Json -Depth 3
    Write-Host "ID du devis créé: $($response.id)" -ForegroundColor Green
    
    # Sauvegarder l'ID pour l'utiliser plus tard
    $response.id | Out-File -FilePath "devis-id.txt"
} catch {
    Write-Host "Erreur lors de la création du devis:" -ForegroundColor Red
    Write-Host "Statut: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    Write-Host "Détails: $($reader.ReadToEnd())" -ForegroundColor Red
}
