# Test de création d'un contrat avec uniquement la référence et un fichier PDF
$url = "http://localhost:8080/api/contrats"

# Préparer le fichier JSON comme chaîne
$jsonContent = '{
  "referenceContrat": "CONTRAT-2025-REF-PDF"
}'

# Créer un objet de limite pour le multipart/form-data
$boundary = [System.Guid]::NewGuid().ToString()
$contentType = "multipart/form-data; boundary=$boundary"

# Obtenir le contenu du fichier "PDF" (ici un fichier texte pour le test)
$fileContent = Get-Content -Path "contrat-test.txt" -Raw
$fileBytes = [System.Text.Encoding]::UTF8.GetBytes($fileContent)
$fileBase64 = [Convert]::ToBase64String($fileBytes)

# Créer le corps de la requête multipart/form-data avec DTO et fichier
$body = @"
--$boundary
Content-Disposition: form-data; name="dto"
Content-Type: application/json

$jsonContent
--$boundary
Content-Disposition: form-data; name="file"; filename="contrat-test.pdf"
Content-Type: application/pdf

$fileContent
--$boundary--
"@

# Faire la requête POST
try {
    Write-Host "Envoi d'une requête pour créer un contrat avec référence et fichier PDF..."
    $response = Invoke-RestMethod -Uri $url -Method Post -ContentType $contentType -Body $body
    Write-Host "Contrat créé avec succès !"
    Write-Host "Détails du contrat créé:"
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Erreur lors de la création du contrat:"
    Write-Host "Statut: $($_.Exception.Response.StatusCode)"
    $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    Write-Host "Réponse d'erreur: $($reader.ReadToEnd())"
}
