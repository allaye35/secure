# Test script pour l'API des devis utilisant curl.exe
# Les commandes curl sont plus faciles à copier/coller dans un terminal ou à adapter pour d'autres outils

# Définir l'URL de base
$BASE_URL = "http://localhost:8080/api/devis"
$CONTENT_TYPE = "Content-Type: application/json"

# Créer une référence unique pour ce test
$UNIQUE_REF = "DEV-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "Référence unique pour ce test: $UNIQUE_REF" -ForegroundColor Cyan

# Variable pour stocker l'ID du devis créé
$DEVIS_ID = $null

# -----------------------------------------------------------------------
# 1. CRÉER UN DEVIS (POST)
# -----------------------------------------------------------------------
Write-Host "`n[TEST 1] Création d'un devis (POST)" -ForegroundColor Yellow

$CREATE_PAYLOAD = @"
{
  "referenceDevis": "$UNIQUE_REF",
  "description": "Devis test CURL",
  "statut": "EN_ATTENTE",
  "dateValidite": "2025-12-31",
  "conditionsGenerales": "Conditions test CURL",
  "entrepriseId": 1,
  "clientId": 1,
  "montantHT": 2500.00,
  "montantTVA": 500.00,
  "montantTTC": 3000.00,
  "typeMission": "GARDIENNAGE",
  "nombreAgents": 1,
  "quantite": 15
}
"@

Write-Host "Commande curl:"
Write-Host "curl -X POST $BASE_URL -H `"$CONTENT_TYPE`" -d '$CREATE_PAYLOAD'" -ForegroundColor Gray

# Exécuter la commande et capturer la sortie
$result = Invoke-Expression "curl.exe -s -X POST $BASE_URL -H `"$CONTENT_TYPE`" -d '$CREATE_PAYLOAD'"
Write-Host "Résultat:"
Write-Host $result

# Extraire l'ID du résultat pour les tests suivants
# Nous supposons que le résultat est au format JSON avec un champ "id"
try {
    $devisObj = $result | ConvertFrom-Json
    $DEVIS_ID = $devisObj.id
    Write-Host "Devis créé avec ID: $DEVIS_ID" -ForegroundColor Green
}
catch {
    Write-Host "Impossible d'extraire l'ID du devis" -ForegroundColor Red
}

# -----------------------------------------------------------------------
# 2. OBTENIR TOUS LES DEVIS (GET)
# -----------------------------------------------------------------------
Write-Host "`n[TEST 2] Récupération de tous les devis (GET)" -ForegroundColor Yellow

Write-Host "Commande curl:"
Write-Host "curl -X GET $BASE_URL" -ForegroundColor Gray

# Exécuter la requête GET
Write-Host "Résultat (premières lignes seulement):"
Invoke-Expression "curl.exe -s -X GET $BASE_URL" | Select-Object -First 5

# -----------------------------------------------------------------------
# 3. OBTENIR LES DEVIS DISPONIBLES (GET)
# -----------------------------------------------------------------------
Write-Host "`n[TEST 3] Récupération des devis disponibles (GET)" -ForegroundColor Yellow

Write-Host "Commande curl:"
Write-Host "curl -X GET $BASE_URL/disponibles" -ForegroundColor Gray

# Exécuter la requête GET
Write-Host "Résultat (premières lignes seulement):"
Invoke-Expression "curl.exe -s -X GET $BASE_URL/disponibles" | Select-Object -First 5

# -----------------------------------------------------------------------
# 4. OBTENIR UN DEVIS PAR ID (GET)
# -----------------------------------------------------------------------
if ($DEVIS_ID) {
    Write-Host "`n[TEST 4] Récupération d'un devis par ID (GET)" -ForegroundColor Yellow
    
    Write-Host "Commande curl:"
    Write-Host "curl -X GET $BASE_URL/$DEVIS_ID" -ForegroundColor Gray
    
    # Exécuter la requête GET
    Write-Host "Résultat:"
    Invoke-Expression "curl.exe -s -X GET $BASE_URL/$DEVIS_ID"
}
else {
    Write-Host "`n[TEST 4] Ignoré - Aucun ID de devis disponible" -ForegroundColor Yellow
}

# -----------------------------------------------------------------------
# 5. RECHERCHER UN DEVIS PAR RÉFÉRENCE (GET)
# -----------------------------------------------------------------------
Write-Host "`n[TEST 5] Recherche d'un devis par référence (GET)" -ForegroundColor Yellow

Write-Host "Commande curl:"
Write-Host "curl -X GET `"$BASE_URL/search?reference=$UNIQUE_REF`"" -ForegroundColor Gray

# Exécuter la requête GET
Write-Host "Résultat:"
Invoke-Expression "curl.exe -s -X GET `"$BASE_URL/search?reference=$UNIQUE_REF`""

# -----------------------------------------------------------------------
# 6. METTRE À JOUR UN DEVIS (PUT)
# -----------------------------------------------------------------------
if ($DEVIS_ID) {
    Write-Host "`n[TEST 6] Mise à jour d'un devis (PUT)" -ForegroundColor Yellow
    
    $UPDATE_PAYLOAD = @"
    {
      "referenceDevis": "$UNIQUE_REF",
      "description": "Devis test CURL - MODIFIÉ",
      "statut": "VALIDE_PAR_CLIENT",
      "dateValidite": "2025-12-31",
      "conditionsGenerales": "Conditions test CURL mises à jour",
      "entrepriseId": 1,
      "clientId": 1,
      "montantHT": 3000.00,
      "montantTVA": 600.00,
      "montantTTC": 3600.00,
      "typeMission": "GARDIENNAGE",
      "nombreAgents": 1,
      "quantite": 15
    }
"@
    
    Write-Host "Commande curl:"
    Write-Host "curl -X PUT $BASE_URL/$DEVIS_ID -H `"$CONTENT_TYPE`" -d '$UPDATE_PAYLOAD'" -ForegroundColor Gray
    
    # Exécuter la requête PUT
    Write-Host "Résultat:"
    Invoke-Expression "curl.exe -s -X PUT $BASE_URL/$DEVIS_ID -H `"$CONTENT_TYPE`" -d '$UPDATE_PAYLOAD'"
}
else {
    Write-Host "`n[TEST 6] Ignoré - Aucun ID de devis disponible" -ForegroundColor Yellow
}

# -----------------------------------------------------------------------
# 7. SUPPRIMER UN DEVIS (DELETE)
# -----------------------------------------------------------------------
if ($DEVIS_ID) {
    Write-Host "`n[TEST 7] Suppression d'un devis (DELETE)" -ForegroundColor Yellow
    
    # Demander confirmation
    $confirmation = Read-Host "Voulez-vous supprimer le devis avec ID=$DEVIS_ID ? (o/n)"
    
    if ($confirmation -eq "o") {
        Write-Host "Commande curl:"
        Write-Host "curl -X DELETE $BASE_URL/$DEVIS_ID" -ForegroundColor Gray
        
        # Exécuter la requête DELETE
        $deleteResult = Invoke-Expression "curl.exe -s -X DELETE $BASE_URL/$DEVIS_ID"
        Write-Host "Devis supprimé. Résultat: $deleteResult"
        
        # Vérifier la suppression
        Write-Host "`nVérification de la suppression:"
        Write-Host "curl -X GET $BASE_URL/$DEVIS_ID" -ForegroundColor Gray
        
        $checkResult = Invoke-Expression "curl.exe -s -i -X GET $BASE_URL/$DEVIS_ID"
        if ($checkResult -match "404") {
            Write-Host "Suppression confirmée - Le devis n'existe plus (404 Not Found)" -ForegroundColor Green
        }
        else {
            Write-Host "Attention - Le devis pourrait encore exister" -ForegroundColor Red
            Write-Host $checkResult
        }
    }
    else {
        Write-Host "Suppression annulée par l'utilisateur" -ForegroundColor Yellow
    }
}
else {
    Write-Host "`n[TEST 7] Ignoré - Aucun ID de devis disponible" -ForegroundColor Yellow
}

Write-Host "`nTests terminés." -ForegroundColor Cyan
