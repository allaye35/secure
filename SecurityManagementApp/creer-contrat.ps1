# Script pour créer un nouveau contrat avec fichier PDF
$url = "http://localhost:8080/api/contrats"

# Préparer le fichier JSON comme chaîne
$jsonContent = Get-Content -Path "mon-nouveau-contrat.json" -Raw

# Créer un objet de limite pour le multipart/form-data
$boundary = [System.Guid]::NewGuid().ToString()
$contentType = "multipart/form-data; boundary=$boundary"

# Créer le corps de la requête multipart/form-data
$body = @"
--$boundary
Content-Disposition: form-data; name="dto"
Content-Type: application/json

$jsonContent
--$boundary
Content-Disposition: form-data; name="file"; filename="mon-nouveau-contrat.pdf"
Content-Type: application/pdf

$(Get-Content -Path "mon-nouveau-contrat.txt" -Raw)
--$boundary--
"@

# Faire la requête POST
try {
    $response = Invoke-RestMethod -Uri $url -Method Post -ContentType $contentType -Body $body
    Write-Host "Contrat créé avec succès :"
    $response | ConvertTo-Json
    Write-Host "ID du contrat créé: $($response.id)"
    Write-Host "Fichier PDF sauvegardé à: $($response.pdfUrl)"
} catch {
    Write-Host "Erreur: $_"
    Write-Host "Statut: $($_.Exception.Response.StatusCode)"
    $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    Write-Host "Corps de l'erreur: $($reader.ReadToEnd())"
}
