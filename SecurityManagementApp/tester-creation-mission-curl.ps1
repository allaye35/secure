#!/usr/bin/env pwsh
# Script pour tester la création d'une mission via curl.exe (pas l'alias PowerShell)

# Configuration
$baseUrl = "http://localhost:8080/api"
$contentType = "application/json"

Write-Host "`n===== Test de création d'une mission directement via curl =====" -ForegroundColor Cyan

# Création d'une mission
Write-Host "`nCréation d'une mission:" -ForegroundColor Green

# Préparer le JSON pour la mission
$missionData = @{
  titre = "Mission Test Curl via PowerShell"
  description = "Description de la mission de test via curl et PowerShell"
  dateDebut = (Get-Date).ToString('yyyy-MM-dd')
  dateFin = (Get-Date).AddDays(30).ToString('yyyy-MM-dd')
  heureDebut = "08:00:00"
  heureFin = "18:00:00"
  nombreAgents = 2
  quantite = 1
  typeMission = "SURVEILLANCE"
  statutMission = "PLANIFIEE"  # Une des valeurs de l'énumération StatutMission  montantHT = 100.00
  montantTVA = 20.00
  montantTTC = 120.00
  tarifMissionId = 1
}

$missionJson = ConvertTo-Json -Depth 4 $missionData

# Afficher le contenu de la mission
Write-Host "Contenu de la mission:" -ForegroundColor Yellow
Write-Host $missionJson

# Écrire le JSON dans un fichier temporaire pour éviter les problèmes d'échappement
$tempFile = [System.IO.Path]::GetTempFileName()
$missionJson | Out-File -FilePath $tempFile -Encoding utf8

# Envoi de la requête en utilisant curl.exe (pas l'alias PowerShell)
Write-Host "`nEnvoi de la requête avec curl.exe:" -ForegroundColor Green
$outputFile = "curl-mission-output.txt"
$errorFile = "curl-mission-error.txt"

try {
    # Exécuter curl.exe avec redirection de la sortie pour capture
    $process = Start-Process -FilePath "curl.exe" -ArgumentList `
        "-X", "POST", `
        "$baseUrl/missions", `
        "-H", "Content-Type: $contentType", `
        "-d", "@$tempFile", `
        "-v" `
        -NoNewWindow -PassThru -Wait -RedirectStandardOutput $outputFile -RedirectStandardError $errorFile
    
    # Vérifier le code de sortie
    if ($process.ExitCode -eq 0) {
        Write-Host "La commande curl a réussi (Code: $($process.ExitCode))" -ForegroundColor Green
    } else {
        Write-Host "La commande curl a échoué (Code: $($process.ExitCode))" -ForegroundColor Red
    }

    # Afficher la sortie
    if (Test-Path $outputFile) {
        Write-Host "`nRésultat de la requête:" -ForegroundColor Cyan
        Get-Content $outputFile
    }
    
    # Afficher les informations détaillées (y compris les en-têtes HTTP)
    if (Test-Path $errorFile) {
        Write-Host "`nInformations détaillées:" -ForegroundColor Yellow
        Get-Content $errorFile
    }
} catch {
    Write-Host "Erreur lors de l'exécution de curl: $_" -ForegroundColor Red
} finally {
    # Nettoyage des fichiers temporaires
    if (Test-Path $tempFile) { Remove-Item -Path $tempFile }    # Laisser les fichiers de sortie pour diagnostic si nécessaire
}

# Test alternatif avec Invoke-RestMethod
Write-Host "`nTest alternatif avec Invoke-RestMethod:" -ForegroundColor Green
try {
    $response = Invoke-RestMethod -Method POST -Uri "$baseUrl/missions" -ContentType $contentType -Body $missionJson
    Write-Host "Mission créée avec succès!" -ForegroundColor Green
    Write-Host "ID de la mission: $($response.id)" -ForegroundColor Yellow
    
    # Afficher les détails de la mission créée
    Write-Host "`nDétails de la mission créée:" -ForegroundColor Green
    $missionDetail = Invoke-RestMethod -Method GET -Uri "$baseUrl/missions/$($response.id)" -ContentType $contentType
    Write-Host (ConvertTo-Json -Depth 4 $missionDetail)
} catch {
    Write-Host "Erreur lors de la création de la mission" -ForegroundColor Red
    Write-Host "StatusCode: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "StatusDescription: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    
    # Tenter de récupérer le corps de la réponse pour plus d'informations
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        $reader.Close()
        Write-Host "Détails de l'erreur: $responseBody" -ForegroundColor Red
    } catch {
        Write-Host "Impossible de récupérer les détails de l'erreur" -ForegroundColor Red
    }
}

Write-Host "`n===== Test terminé =====" -ForegroundColor Cyan
