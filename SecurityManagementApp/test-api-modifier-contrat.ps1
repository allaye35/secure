# Script pour tester la modification d'un contrat existant en lui associant un nouveau fichier PDF
Write-Host "===== TEST DE MODIFICATION D'UN CONTRAT AVEC NOUVEAU PDF =====" -ForegroundColor Cyan

# URL de l'API et ID du contrat à modifier
$baseUrl = "http://localhost:8080/api/contrats"
$contratId = 24  # Remplacer par l'ID du contrat que vous souhaitez modifier

# 1. Récupérer le contrat actuel
Write-Host "1. Récupération du contrat actuel (ID: $contratId)..." -ForegroundColor Yellow
try {
    $contratActuel = Invoke-RestMethod -Uri "$baseUrl/$contratId" -Method Get
    
    Write-Host "Contrat récupéré avec succès:" -ForegroundColor Green
    $contratActuel | ConvertTo-Json -Depth 3
    
    # 2. Préparer les modifications
    Write-Host "`n2. Préparation des modifications..." -ForegroundColor Yellow
    
    # Créer un nouveau contenu pour le PDF
    $nouveauContenuPdf = @"
CONTRAT DE PRESTATION MODIFIÉ
=============================

AVENANT AU CONTRAT $($contratActuel.referenceContrat)

Date de modification: $(Get-Date -Format "dd/MM/yyyy")

Ce document constitue un avenant au contrat initial et remplace 
le document précédent. Toutes les autres clauses du contrat
initial restent inchangées.

ENTRE LES SOUSSIGNÉS:

Boulevard Security, SARL au capital de 50 000€
ET
Société Cliente

MODIFICATION:
- Durée du contrat: $($contratActuel.dureeMois) mois
- Préavis: $($contratActuel.preavisMois) mois
- Tacite reconduction: $($contratActuel.taciteReconduction)

Fait à Paris, le $(Get-Date -Format "dd/MM/yyyy")
"@
    
    # Écrire le contenu dans un fichier temporaire
    $nouveauFichierPdf = [System.IO.Path]::GetTempFileName() + ".pdf"
    $nouveauContenuPdf | Out-File -FilePath $nouveauFichierPdf -Encoding UTF8
    
    # Préparer l'objet DTO pour la mise à jour
    $contratModifieDto = @{
        referenceContrat = $contratActuel.referenceContrat
        dateSignature = $contratActuel.dateSignature
        dureeMois = $contratActuel.dureeMois
        taciteReconduction = $contratActuel.taciteReconduction
        preavisMois = $contratActuel.preavisMois
        devisId = $contratActuel.devisId
        missionIds = @()
        articleIds = @()
    } | ConvertTo-Json
    
    # 3. Envoyer la requête de mise à jour avec le nouveau PDF
    Write-Host "`n3. Envoi de la requête de mise à jour..." -ForegroundColor Yellow
    
    # Créer un objet de limite pour le multipart/form-data
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    # Construire le corps multipart manuellement
    $bodyLines = @()
    
    # Partie 1 : le JSON des données du contrat
    $bodyLines += "--$boundary"
    $bodyLines += "Content-Disposition: form-data; name=`"dto`""
    $bodyLines += "Content-Type: application/json$LF"
    $bodyLines += $contratModifieDto
    
    # Partie 2 : le fichier PDF
    $bodyLines += "--$boundary"
    $bodyLines += "Content-Disposition: form-data; name=`"file`"; filename=`"contrat-modifie.pdf`""
    $bodyLines += "Content-Type: application/octet-stream$LF"
    $bodyLines += $nouveauContenuPdf
    
    # Fin du multipart
    $bodyLines += "--$boundary--$LF"
    
    $multipartBody = $bodyLines -join $LF
    
    # Headers pour la requête
    $headers = @{
        "Content-Type" = "multipart/form-data; boundary=$boundary"
    }
    
    # Faire la requête PUT pour modifier le contrat
    $contratResponse = Invoke-RestMethod -Uri "$baseUrl/$contratId" -Method Put -Body $multipartBody -Headers $headers
    
    Write-Host "Contrat modifié avec succès:" -ForegroundColor Green
    $contratResponse | ConvertTo-Json -Depth 3
    
    Write-Host "ID du contrat modifié: $($contratResponse.id)" -ForegroundColor Green
    Write-Host "Nouveau chemin du PDF: $($contratResponse.pdfUrl)" -ForegroundColor Green
    
    # 4. Vérifier que le PDF a bien été mis à jour
    Write-Host "`n4. Vérification du fichier PDF mis à jour..." -ForegroundColor Yellow
    
    # Récupérer le contrat mis à jour pour confirmer que le PDF a changé
    $contratMisAJour = Invoke-RestMethod -Uri "$baseUrl/$contratId" -Method Get
    
    if ($contratMisAJour.pdfUrl -ne $contratActuel.pdfUrl) {
        Write-Host "✅ Le chemin du PDF a bien été mis à jour!" -ForegroundColor Green
        Write-Host "Ancien chemin: $($contratActuel.pdfUrl)" -ForegroundColor DarkGray
        Write-Host "Nouveau chemin: $($contratMisAJour.pdfUrl)" -ForegroundColor Green
    } else {
        Write-Host "❌ Le chemin du PDF n'a pas changé!" -ForegroundColor Red
    }
    
    # Nettoyage
    Remove-Item -Path $nouveauFichierPdf -Force
    
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

Write-Host "===== FIN DU TEST =====" -ForegroundColor Cyan
