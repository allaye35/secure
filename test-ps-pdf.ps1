# Test d'upload de fichier PDF avec PowerShell
$referenceContrat = "TEST-PS-PDF-" + (Get-Date -Format "yyyyMMddHHmmss")
$filePath = "C:\Users\allay\Documents\java_Project_2025\SecurityManagementApp\test-api-contrat.txt"
$url = "http://localhost:8080/api/contrats"

Write-Host "Test d'upload de fichier PDF avec PowerShell"
Write-Host "Référence: $referenceContrat"
Write-Host "Fichier: $filePath"
Write-Host "URL: $url"

# Vérifier que le fichier existe
if (-not (Test-Path $filePath)) {
    Write-Host "Le fichier n'existe pas: $filePath"
    exit 1
}

# Créer la requête multipart/form-data
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"
$bodyLines = New-Object System.Collections.ArrayList

# Partie 1: JSON dto
$jsonData = @{
    referenceContrat = $referenceContrat
} | ConvertTo-Json -Compress

[void]$bodyLines.Add("--$boundary")
[void]$bodyLines.Add("Content-Disposition: form-data; name=`"dto`"")
[void]$bodyLines.Add("Content-Type: application/json")
[void]$bodyLines.Add("")
[void]$bodyLines.Add($jsonData)

# Partie 2: fichier PDF
$fileBytes = [System.IO.File]::ReadAllBytes($filePath)
$fileName = Split-Path $filePath -Leaf

[void]$bodyLines.Add("--$boundary")
[void]$bodyLines.Add("Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"")
[void]$bodyLines.Add("Content-Type: application/pdf")
[void]$bodyLines.Add("")
[void]$bodyLines.Add([System.Text.Encoding]::UTF8.GetString($fileBytes))

# Finaliser le body
[void]$bodyLines.Add("--$boundary--")
$body = $bodyLines -join $LF

# Headers
$headers = @{
    "Content-Type" = "multipart/form-data; boundary=$boundary"
}

# Envoyer la requête
try {
    Write-Host "Envoi de la requête..."
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -Headers $headers -ContentType "multipart/form-data; boundary=$boundary"
    
    Write-Host "Contrat créé avec succès!"
    Write-Host "ID: $($response.id)"
    Write-Host "Référence: $($response.referenceContrat)"
    Write-Host "PDF URL: $($response.pdfUrl)"
} catch {
    Write-Host "Erreur lors de l'envoi de la requête: $($_.Exception.Message)"
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseText = $reader.ReadToEnd()
        Write-Host "Réponse: $responseText"
        $reader.Close()
    }
}
