# Script pour créer un contrat avec un fichier PDF attaché
$url = "http://localhost:8080/api/contrats"

# Préparer le fichier JSON comme chaîne
$jsonContent = Get-Content -Path "test-api-contrat.json" -Raw

# Créer un fichier PDF temporaire à partir du contenu texte
$pdfContent = Get-Content -Path "test-api-contrat.txt" -Raw
$tempPdfPath = [System.IO.Path]::GetTempFileName() + ".pdf"
$pdfContent | Out-File -FilePath $tempPdfPath -Encoding UTF8

# Créer un objet de limite pour le multipart/form-data
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

# Construire le corps multipart manuellement
$bodyLines = @()

# Partie 1 : le JSON des données du contrat
$bodyLines += "--$boundary"
$bodyLines += "Content-Disposition: form-data; name=`"dto`""
$bodyLines += "Content-Type: application/json$LF"
$bodyLines += $jsonContent

# Partie 2 : le fichier PDF
$bodyLines += "--$boundary"
$bodyLines += "Content-Disposition: form-data; name=`"file`"; filename=`"contrat.pdf`""
$bodyLines += "Content-Type: application/octet-stream$LF"
$bodyLines += $pdfContent

# Fin du multipart
$bodyLines += "--$boundary--$LF"

$multipartBody = $bodyLines -join $LF

# Headers pour la requête
$headers = @{
    "Content-Type" = "multipart/form-data; boundary=$boundary"
}

# Faire la requête POST
try {
    Write-Host "Envoi de la requête création de contrat avec fichier PDF attaché..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $multipartBody -Headers $headers
      Write-Host "Contrat créé avec succès :" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 3
    
    Write-Host "ID du contrat créé: $($response.id)" -ForegroundColor Green
    Write-Host "Fichier PDF sauvegardé à: $($response.pdfPath)" -ForegroundColor Green
    
    # Nettoyage
    Remove-Item -Path $tempPdfPath -Force
} catch {
    Write-Host "Erreur: $_" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        Write-Host "Statut: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host "Corps de l'erreur: $($reader.ReadToEnd())" -ForegroundColor Red
    } else {
        Write-Host "Exception sans réponse HTTP: $($_.Exception.Message)" -ForegroundColor Red
    }
}
