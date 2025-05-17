# Test creating a contract with only the reference field
$url = "http://localhost:8080/api/contrats"

# Préparer le fichier JSON comme chaîne
$jsonContent = Get-Content -Path "contrat-minimal.json" -Raw

# Créer un objet de limite pour le multipart/form-data
$boundary = [System.Guid]::NewGuid().ToString()
$contentType = "multipart/form-data; boundary=$boundary"

# Créer le corps de la requête multipart/form-data avec uniquement le DTO (pas de fichier)
$body = @"
--$boundary
Content-Disposition: form-data; name="dto"
Content-Type: application/json

$jsonContent
--$boundary--
"@

# Faire la requête POST
try {
    $response = Invoke-RestMethod -Uri $url -Method Post -ContentType $contentType -Body $body
    Write-Host "Contrat créé avec succès :"
    $response | ConvertTo-Json
} catch {
    Write-Host "Erreur: $_"
    Write-Host "Statut: $($_.Exception.Response.StatusCode)"
    $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    Write-Host "Corps de l'erreur: $($reader.ReadToEnd())"
}
