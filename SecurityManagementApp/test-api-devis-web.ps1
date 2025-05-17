# Script pour tester l'API de création de devis avec Invoke-WebRequest
$url = "http://localhost:8080/api/devis"

# Charger le contenu JSON du devis
$jsonContent = Get-Content -Path "test-api-devis.json" -Raw

# Faire la requête POST
try {
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    Write-Host "Envoi du devis à l'API..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri $url -Method Post -Headers $headers -Body $jsonContent
    
    Write-Host "Réponse reçue avec statut: $($response.StatusCode)" -ForegroundColor Cyan
    
    if ($response.StatusCode -eq 201 -or $response.StatusCode -eq 200) {
        $responseObject = $response.Content | ConvertFrom-Json
        Write-Host "Devis créé avec succès! ID: $($responseObject.id)" -ForegroundColor Green
        
        # Sauvegarder l'ID pour l'utiliser plus tard
        $responseObject.id | Out-File -FilePath "devis-id.txt"
        
        # Afficher l'objet complet
        $responseObject | ConvertTo-Json -Depth 3
    }
} catch {
    Write-Host "Erreur lors de la création du devis:" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    # Récupérer le contenu de l'erreur
    $errorResponse = $_.Exception.Response
    if ($errorResponse) {
        $reader = [System.IO.StreamReader]::new($errorResponse.GetResponseStream())
        $errorContent = $reader.ReadToEnd()
        Write-Host "Message d'erreur: $errorContent" -ForegroundColor Red
    } else {
        Write-Host "Exception: $($_.Exception.Message)" -ForegroundColor Red
    }
}
