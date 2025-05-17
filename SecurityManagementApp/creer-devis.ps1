# Script pour créer un nouveau devis
$url = "http://localhost:8080/api/devis"

# Préparer le fichier JSON comme chaîne
$jsonContent = Get-Content -Path "mon-nouveau-devis.json" -Raw

# Faire la requête POST
try {
    $response = Invoke-RestMethod -Uri $url -Method Post -ContentType "application/json" -Body $jsonContent
    Write-Host "Devis créé avec succès :"
    $response | ConvertTo-Json
    Write-Host "ID du devis créé: $($response.id)"
} catch {
    Write-Host "Erreur: $_"
    Write-Host "Statut: $($_.Exception.Response.StatusCode)"
    $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    Write-Host "Corps de l'erreur: $($reader.ReadToEnd())"
}
