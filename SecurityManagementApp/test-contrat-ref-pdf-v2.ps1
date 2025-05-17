# Script simplifié pour créer un contrat avec uniquement la référence et un fichier PDF
# Utilise l'approche simple mais efficace avec les commandes PowerShell standards

$url = "http://localhost:8080/api/contrats"

# Créer le fichier JSON temporaire pour le DTO
$jsonContent = '{
  "referenceContrat": "CONTRAT-2025-REF-PDF-V2"
}'
$jsonFile = New-TemporaryFile
$jsonContent | Set-Content -Path $jsonFile.FullName -Encoding UTF8

# Pour éviter les problèmes d'encodage, utilisons un vrai fichier "PDF"
# Comme nous n'avons pas de PDF réel, utilisons le fichier TXT comme pseudo-PDF
$pdfSource = "contrat-test.txt"
$pdfFile = "contrat-pseudo.pdf"
Copy-Item -Path $pdfSource -Destination $pdfFile -Force

Write-Host "Préparation d'un test avec référence et fichier PDF..."
Write-Host "JSON: $jsonContent"
Write-Host "Fichier PDF simulé: $pdfFile"

Write-Host "`nEnvoi de la requête au serveur..."

try {
    # Utiliser curl.exe qui est inclus dans Windows 10+
    # Cette approche est plus fiable pour l'envoi multipart
    $result = curl.exe -X POST `
        -F "dto=@$($jsonFile.FullName);type=application/json" `
        -F "file=@$pdfFile;type=application/pdf" `
        $url

    Write-Host "`nContrat créé avec succès !"
    Write-Host "Réponse du serveur:"
    $result
} 
catch {
    Write-Host "`nErreur lors de la création du contrat:"
    Write-Host $_.Exception.Message
}
finally {
    # Nettoyer les fichiers temporaires
    if (Test-Path $jsonFile.FullName) {
        Remove-Item -Path $jsonFile.FullName -Force
    }
    if (Test-Path $pdfFile) {
        Remove-Item -Path $pdfFile -Force
    }
}
