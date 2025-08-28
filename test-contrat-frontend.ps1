# Script pour tester la création de contrat depuis le frontend

# Configuration des URLs
$API_BASE_URL = "http://localhost:8080/api"
$ENDPOINT = "$API_BASE_URL/contrats"
$TEST_TYPE = "IntegrationFrontend"
$TEST_ID = Get-Date -Format "yyyyMMdd-HHmmss"
$REFERENCE_CONTRAT = "CONTRAT-UI-TEST-$TEST_ID"

# Chemin du fichier PDF à tester (utiliser un fichier texte comme substitut si PDF non disponible)
$PDF_FILE_PATH = "C:\Users\allay\Documents\java_Project_2025\SecurityManagementApp\test-api-contrat.txt"

Write-Host "🧪 TEST: Création d'un contrat avec uniquement la référence et un fichier PDF ($TEST_TYPE)"
Write-Host "📝 Référence: $REFERENCE_CONTRAT"
Write-Host "📎 Fichier: $PDF_FILE_PATH"

try {
    # Créer un objet FormData similaire à celui du frontend
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    $bodyLines = New-Object System.Collections.ArrayList

    # Partie 1: JSON des données du contrat
    $contractData = @{
        referenceContrat = $REFERENCE_CONTRAT
        # Tous les autres champs sont optionnels
    }
    $jsonData = $contractData | ConvertTo-Json -Compress

    # Ajouter la partie dto
    [void]$bodyLines.Add("--$boundary")
    [void]$bodyLines.Add("Content-Disposition: form-data; name=`"dto`"")
    [void]$bodyLines.Add("Content-Type: application/json")
    [void]$bodyLines.Add("")
    [void]$bodyLines.Add($jsonData)

    # Ajouter la partie file si le fichier existe
    if (Test-Path $PDF_FILE_PATH) {
        $fileContent = [System.IO.File]::ReadAllBytes($PDF_FILE_PATH)
        $fileContentBase64 = [System.Convert]::ToBase64String($fileContent)
        $fileName = Split-Path $PDF_FILE_PATH -Leaf

        [void]$bodyLines.Add("--$boundary")
        [void]$bodyLines.Add("Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"")
        [void]$bodyLines.Add("Content-Type: application/pdf")
        [void]$bodyLines.Add("")
        [void]$bodyLines.Add($fileContentBase64)
    }

    # Fermeture du boundary
    [void]$bodyLines.Add("--$boundary--")

    # Construire le corps de la requête
    $body = $bodyLines -join $LF

    # Définir les en-têtes
    $headers = @{
        "Content-Type" = "multipart/form-data; boundary=$boundary"
    }

    Write-Host "📤 Envoi de la requête à $ENDPOINT..."

    # Envoi de la requête
    $response = Invoke-RestMethod -Uri $ENDPOINT -Method Post -Body $body -Headers $headers

    Write-Host "✅ Contrat créé avec succès!"
    Write-Host "📊 Détails du contrat:"
    $response | Format-List
}
catch {
    Write-Host "❌ Erreur lors de la création du contrat: $_"
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Code HTTP: $([int]$statusCode) - $statusCode"
        
        try {
            $streamReader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $errBody = $streamReader.ReadToEnd()
            $streamReader.Close()
            Write-Host "Détails de l'erreur: $errBody"
        }
        catch {
            Write-Host "Impossible de lire les détails de l'erreur."
        }
    }
}
