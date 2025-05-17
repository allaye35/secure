# Test amélioré pour créer un contrat avec uniquement la référence et un vrai fichier PDF
# Ce script utilise la méthode recommandée pour PowerShell avec un fichier temporaire

$url = "http://localhost:8080/api/contrats"
$boundary = [System.Guid]::NewGuid().ToString()

# Créer un fichier JSON temporaire
$jsonFile = [System.IO.Path]::GetTempFileName()
@{
    referenceContrat = "CONTRAT-2025-REF-PDF-PRO"
} | ConvertTo-Json | Set-Content -Path $jsonFile

Write-Host "Création d'un contrat avec uniquement la référence et un fichier PDF..."

# Créer un objet HttpClient pour l'envoi multipart
Add-Type -AssemblyName System.Net.Http

try {
    # Créer le client HTTP
    $client = New-Object System.Net.Http.HttpClient
    
    # Créer le contenu multipart
    $content = New-Object System.Net.Http.MultipartFormDataContent($boundary)
    
    # Ajouter le JSON comme première partie
    $jsonContent = New-Object System.Net.Http.StringContent((Get-Content -Path $jsonFile -Raw))
    $jsonContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse("application/json")
    $content.Add($jsonContent, "dto")
    
    # Préparer le fichier contrat-test.txt comme un fichier PDF
    $fileBytes = [System.IO.File]::ReadAllBytes("$PWD\contrat-test.txt")
    $fileContent = New-Object System.Net.Http.ByteArrayContent($fileBytes)
    $fileContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse("application/pdf")
    $content.Add($fileContent, "file", "contrat-pro-test.pdf")
    
    # Envoyer la requête
    $task = $client.PostAsync($url, $content)
    $task.Wait()
    
    $response = $task.Result
    Write-Host "Réponse HTTP: $($response.StatusCode)"
    
    if ($response.IsSuccessStatusCode) {
        # Lire la réponse
        $resultTask = $response.Content.ReadAsStringAsync()
        $resultTask.Wait()
        $result = $resultTask.Result
        
        Write-Host "Contrat créé avec succès !"
        Write-Host "Détails du contrat:"
        $result | ConvertFrom-Json | ConvertTo-Json -Depth 3
    }
    else {
        Write-Host "Échec de la création du contrat. Code: $($response.StatusCode)"
        $resultTask = $response.Content.ReadAsStringAsync()
        $resultTask.Wait()
        Write-Host "Message d'erreur: $($resultTask.Result)"
    }
}
catch {
    Write-Host "Exception: $($_.Exception.Message)"
}
finally {
    # Nettoyer les ressources
    if ($null -ne $client) {
        $client.Dispose()
    }
    
    # Supprimer le fichier JSON temporaire
    if (Test-Path $jsonFile) {
        Remove-Item -Path $jsonFile -Force
    }
}
