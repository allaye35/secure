# Script pour tester la création et la récupération d'un contrat
$baseUrl = "http://localhost:8080/api/contrats"

Write-Host "Test de l'API Contrats" -ForegroundColor Cyan

# Générer une référence unique
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$reference = "CONTRAT-$timestamp"

# Préparation du contrat
$contratData = @{
    referenceContrat = $reference
    dateSignature = (Get-Date).ToString("yyyy-MM-dd")
    dureeMois = 12
    taciteReconduction = $true
    preavisMois = 2
    devisId = 23
    missionIds = @()
    articleIds = @()
}

$jsonData = $contratData | ConvertTo-Json

# 1. Création d'un contrat
Write-Host "1. Création d'un contrat..." -ForegroundColor Yellow
try {
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $jsonData -Headers $headers
    Write-Host "Contrat créé avec succès!" -ForegroundColor Green
    $contratId = $response.id
    Write-Host "ID du contrat: $contratId" -ForegroundColor Green
    $response | ConvertTo-Json
}
catch {
    Write-Host "Erreur lors de la création du contrat:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit
}

# 2. Récupération du contrat par ID
Write-Host "`n2. Récupération du contrat par ID..." -ForegroundColor Yellow
try {
    $getResponse = Invoke-RestMethod -Uri "$baseUrl/$contratId" -Method Get
    Write-Host "Contrat récupéré avec succès!" -ForegroundColor Green
    $getResponse | ConvertTo-Json
}
catch {
    Write-Host "Erreur lors de la récupération du contrat:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`nTests terminés." -ForegroundColor Cyan
