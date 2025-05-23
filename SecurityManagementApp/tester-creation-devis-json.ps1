# Chemin vers le fichier JSON contenant les données du devis
$jsonFilePath = "tester-creation-devis.json"

# URL de l'API
$apiUrl = "http://localhost:8080/api/devis"

# Vérifier si le fichier existe
if (-not (Test-Path $jsonFilePath)) {
    Write-Error "Le fichier $jsonFilePath n'existe pas!"
    exit 1
}

# Lire le contenu du fichier JSON
$jsonContent = Get-Content -Path $jsonFilePath -Raw

Write-Host "Envoi du devis avec les données suivantes :"
Write-Host $jsonContent

# Envoi de la requête POST avec curl
Write-Host "Envoi de la requête à $apiUrl..."
curl.exe -X POST `
    -H "Content-Type: application/json" `
    -d $jsonContent `
    $apiUrl

Write-Host "Requête envoyée. Vérifiez la réponse ci-dessus."
