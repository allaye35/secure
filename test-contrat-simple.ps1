# Test simple de création de contrat avec fichier
$referenceContrat = "TEST-SIMPLE-" + (Get-Date -Format "yyyyMMddHHmmss")
$filePath = "C:\Users\allay\Documents\java_Project_2025\SecurityManagementApp\test-api-contrat.txt"

# Créer le FormData 
$boundary = [System.Guid]::NewGuid().ToString()
$bodyLines = New-Object System.Collections.ArrayList

# Ajouter les données JSON
$jsonData = @{
    referenceContrat = $referenceContrat
} | ConvertTo-Json

# Ajouter la partie JSON
[void]$bodyLines.Add("--$boundary")
[void]$bodyLines.Add("Content-Disposition: form-data; name=`"dto`"")
[void]$bodyLines.Add("Content-Type: application/json")
[void]$bodyLines.Add("")
[void]$bodyLines.Add($jsonData)

# Ajouter le fichier
if (Test-Path $filePath) {
    # Pour simplifier, on utilise le contenu comme texte plutôt que binaire
    $fileContent = Get-Content -Path $filePath -Raw
    $fileName = Split-Path $filePath -Leaf

    [void]$bodyLines.Add("--$boundary")
    [void]$bodyLines.Add("Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"")
    [void]$bodyLines.Add("Content-Type: application/pdf")
    [void]$bodyLines.Add("")
    [void]$bodyLines.Add($fileContent)
}

# Finaliser le body
[void]$bodyLines.Add("--$boundary--")
$body = $bodyLines -join "`r`n"

# Envoyer la requête
try {
    $url = "http://localhost:8080/api/contrats"
    Write-Host "Envoi de la requête à $url avec référence: $referenceContrat"
    
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "multipart/form-data; boundary=$boundary"
    
    Write-Host "Création réussie! ID du contrat:" $response.id
    Write-Host "Référence:" $response.referenceContrat
    Write-Host "Fichier PDF:" $response.pdfUrl
} catch {
    Write-Host "ERREUR:" $_.Exception.Message
    if ($_.Exception.Response) {
        $result = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($result)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Détails:" $responseBody
    }
}
