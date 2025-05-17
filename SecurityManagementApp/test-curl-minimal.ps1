#!/bin/bash
$url = "http://localhost:8080/api/contrats"

# Créer un objet de limite pour le multipart/form-data
$boundary = [System.Guid]::NewGuid().ToString()
$contentType = "multipart/form-data; boundary=$boundary"

# Créer un JSON avec uniquement la référence du contrat
$json = '{
  "referenceContrat": "CONTRAT-2025-CURL-TEST"
}'

# Créer le corps de la requête multipart/form-data
$body = @"
--$boundary
Content-Disposition: form-data; name="dto"
Content-Type: application/json

$json
--$boundary--
"@

# Afficher la commande curl équivalente
Write-Host "Commande curl équivalente (pour référence seulement):"
Write-Host "curl -X POST -H 'Content-Type: multipart/form-data; boundary=$boundary' --data-binary '$body' http://localhost:8080/api/contrats"

# Faire la requête POST
try {
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
