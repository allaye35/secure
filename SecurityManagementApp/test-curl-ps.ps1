# Test de création d'un contrat avec uniquement la référence en utilisant curl via PowerShell

# Créer un fichier temporaire pour le JSON
$jsonContent = '{
  "referenceContrat": "CONTRAT-2025-CURL-PS"
}'

# Écrire le contenu JSON dans un fichier temporaire
$jsonContent | Out-File -FilePath "contrat-curl-temp.json" -Encoding utf8

# Afficher la commande qui sera exécutée
Write-Host "Exécution de la commande curl pour créer un contrat avec uniquement la référence..."

# Vérifier si curl est disponible
if (Get-Command "curl.exe" -ErrorAction SilentlyContinue) {
    # Exécuter curl directement
    curl.exe -X POST -F "dto=@contrat-curl-temp.json;type=application/json" http://localhost:8080/api/contrats
} else {
    # Utiliser Invoke-WebRequest comme alternative à curl
    $boundary = [System.Guid]::NewGuid().ToString()
    
    $bodyLines = @(
        "--$boundary",
        "Content-Disposition: form-data; name=`"dto`"",
        "Content-Type: application/json",
        "",
        $jsonContent,
        "--$boundary--"
    )
    
    $body = $bodyLines -join "`r`n"
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/contrats" -Method Post `
            -ContentType "multipart/form-data; boundary=$boundary" -Body $body
        
        Write-Host "Réponse du serveur (status $($response.StatusCode)):"
        Write-Host $response.Content
    }
    catch {
        Write-Host "Erreur lors de l'appel à l'API:"
        Write-Host $_.Exception.Message
    }
}

# Supprimer le fichier temporaire
Remove-Item -Path "contrat-curl-temp.json" -ErrorAction SilentlyContinue
