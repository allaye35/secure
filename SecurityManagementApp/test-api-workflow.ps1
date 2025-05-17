# Script pour tester le workflow complet: création de devis puis contrat
Write-Host "===== DÉBUT DU WORKFLOW DE TEST =====" -ForegroundColor Cyan
Write-Host "1. Création d'un nouveau devis via l'API..." -ForegroundColor Yellow

$devisUrl = "http://localhost:8080/api/devis"
$contratUrl = "http://localhost:8080/api/contrats"

# Charger et modifier légèrement le contenu JSON du devis pour garantir l'unicité
$jsonContent = Get-Content -Path "test-api-devis.json" -Raw
$devisObj = $jsonContent | ConvertFrom-Json
# Ajouter un timestamp à la référence pour qu'elle soit unique
$devisObj.referenceDevis = "DEV-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$devisJsonModified = $devisObj | ConvertTo-Json

# Création du devis
try {
    $headers = @{
        "Content-Type" = "application/json"
    }
    $devisResponse = Invoke-RestMethod -Uri $devisUrl -Method Post -Body $devisJsonModified -Headers $headers
    
    Write-Host "Devis créé avec succès :" -ForegroundColor Green
    $devisResponse | ConvertTo-Json -Depth 3
    
    $devisId = $devisResponse.id
    Write-Host "ID du devis créé: $devisId" -ForegroundColor Green
    
    # Maintenant créer un contrat qui référence ce devis
    Write-Host "`n2. Création d'un contrat associé au devis..." -ForegroundColor Yellow
    
    # Charger le JSON du contrat et mettre à jour l'ID du devis
    $contratJson = Get-Content -Path "test-api-contrat.json" -Raw
    $contratObj = $contratJson | ConvertFrom-Json
    $contratObj.devisId = $devisId
    # Ajouter un timestamp à la référence pour qu'elle soit unique
    $contratObj.referenceContrat = "CONT-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    $contratJsonModified = $contratObj | ConvertTo-Json
    
    # Préparer le fichier PDF
    $pdfContent = Get-Content -Path "test-api-contrat.txt" -Raw
    
    # Créer un fichier PDF temporaire à partir du contenu texte
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
    $bodyLines += $contratJsonModified
    
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
    
    # Faire la requête POST pour créer le contrat
    $contratResponse = Invoke-RestMethod -Uri $contratUrl -Method Post -Body $multipartBody -Headers $headers
    
    Write-Host "Contrat créé avec succès :" -ForegroundColor Green
    $contratResponse | ConvertTo-Json -Depth 3
    
    Write-Host "ID du contrat créé: $($contratResponse.id)" -ForegroundColor Green
    Write-Host "Chemin du PDF: $($contratResponse.pdfPath)" -ForegroundColor Green
    
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

Write-Host "===== FIN DU WORKFLOW DE TEST =====" -ForegroundColor Cyan
