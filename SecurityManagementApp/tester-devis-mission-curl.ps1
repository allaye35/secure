#!/usr/bin/env pwsh
# Script pour tester la création d'un devis avec mission via curl.exe (pas l'alias PowerShell)

# Configuration
$baseUrl = "http://localhost:8080/api/devis"
$contentType = "application/json"

Write-Host "`n===== Test de création d'un devis avec mission via curl =====" -ForegroundColor Cyan

# Création d'un devis avec mission
Write-Host "`nCréation d'un devis avec mission:" -ForegroundColor Green

# Préparer le JSON pour le devis avec mission
$devisData = @{
  referenceDevis = "DEV-CURL-$((Get-Date).ToString('yyyyMMdd-HHmmss'))"
  description = "Devis de test avec mission via curl"
  statut = "EN_ATTENTE"
  entrepriseId = 1
  clientId = 1
  dateValidite = (Get-Date).AddMonths(1).ToString('yyyy-MM-dd')
  conditionsGenerales = "Conditions générales de test via curl"
  missions = @(
    @{
      titre = "Mission Test Curl"
      description = "Description de la mission via curl"
      dateDebut = (Get-Date).ToString('yyyy-MM-dd')
      dateFin = (Get-Date).AddDays(30).ToString('yyyy-MM-dd')
      heureDebut = "08:00:00"
      heureFin = "18:00:00"
      nombreAgents = 2
      quantite = 80
      typeMission = "SURVEILLANCE"
      statutMission = "PLANIFIEE"
      tarifMissionId = 1
    }
  )
}

$devisJson = ConvertTo-Json -Depth 4 $devisData

# Afficher le contenu du devis
Write-Host "Contenu du devis à créer:" -ForegroundColor Yellow
Write-Host $devisJson

# Écrire le JSON dans un fichier temporaire pour éviter les problèmes d'échappement
$tempFile = [System.IO.Path]::GetTempFileName()
$devisJson | Out-File -FilePath $tempFile -Encoding utf8

# Envoi de la requête en utilisant curl.exe (pas l'alias PowerShell)
Write-Host "`nEnvoi de la requête:" -ForegroundColor Green
$response = & curl.exe -X POST "$baseUrl" -H "Content-Type: $contentType" -d "@$tempFile" --silent

Write-Host "`nRéponse:" -ForegroundColor Green
Write-Host $response

# Essayons de convertir la réponse en objet JSON si possible
try {
    $responseObj = $response | ConvertFrom-Json
    
    if ($responseObj.id) {
        Write-Host "Devis créé avec succès!" -ForegroundColor Green
        Write-Host "ID du devis: $($responseObj.id)" -ForegroundColor Yellow
        
        # Récupérer les détails du devis créé
        Write-Host "`nRécupération des détails du devis créé:" -ForegroundColor Green
        $devisDetails = & curl.exe -X GET "$baseUrl/$($responseObj.id)" -H "Content-Type: $contentType" --silent
        $devisDetailsObj = $devisDetails | ConvertFrom-Json
        
        Write-Host "Détails du devis:" -ForegroundColor Yellow
        $devisDetailsJson = $devisDetailsObj | ConvertTo-Json -Depth 4
        Write-Host $devisDetailsJson
    }
} catch {
    Write-Host "Erreur lors de la création du devis ou du traitement de la réponse" -ForegroundColor Red
    Write-Host "Détail de l'erreur: $_" -ForegroundColor Red
}

# Supprimer le fichier temporaire
Remove-Item -Path $tempFile

Write-Host "`n===== Test terminé =====" -ForegroundColor Cyan
