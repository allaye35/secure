# Tester l'upload d'un fichier avec curl
$referenceContrat = "TEST-PDF-" + (Get-Date -Format "yyyyMMddHHmmss")
$filePath = "C:\Users\allay\Documents\java_Project_2025\SecurityManagementApp\test-api-contrat.txt"

Write-Host "Test d'upload de fichier PDF avec curl"
Write-Host "Référence: $referenceContrat"
Write-Host "Fichier: $filePath"

# Vérifier que curl est disponible
try {
    $curlVersion = & curl --version
    Write-Host "Curl disponible: $($curlVersion[0])"
} catch {
    Write-Host "Curl n'est pas disponible. Installation..."
    # Curl est généralement déjà installé sur Windows 10/11
}

# Construire la commande curl
$command = @"
curl -X POST "http://localhost:8080/api/contrats" `
  -H "Content-Type: multipart/form-data" `
  -F "dto={`"referenceContrat`":`"$referenceContrat`"};type=application/json" `
  -F "file=@`"$filePath`";type=application/pdf"
"@

Write-Host "Exécution de la commande:"
Write-Host $command

# Exécuter la commande
try {
    Invoke-Expression $command
} catch {
    Write-Host "Erreur lors de l'exécution de curl: $_"
}
