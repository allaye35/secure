# Script pour vérifier si les fichiers PDF sont inclus lors de la récupération de tous les contrats
Write-Host "===== VÉRIFICATION DES PDF LORS DE LA RÉCUPÉRATION DES CONTRATS =====" -ForegroundColor Cyan

# URL de l'API des contrats
$url = "http://localhost:8080/api/contrats"

# Récupération de tous les contrats
Write-Host "Récupération de tous les contrats..." -ForegroundColor Yellow
try {
    $contrats = Invoke-RestMethod -Uri $url -Method Get
    
    Write-Host "Nombre de contrats récupérés: $($contrats.Count)" -ForegroundColor Green
    
    # Afficher les informations sur chaque contrat
    foreach ($contrat in $contrats) {
        Write-Host "`nContrat ID: $($contrat.id)" -ForegroundColor Cyan
        Write-Host "Référence: $($contrat.referenceContrat)" -ForegroundColor White
        Write-Host "Date de signature: $($contrat.dateSignature)" -ForegroundColor White
        
        # Vérifier si le PDF est présent
        if ($contrat.pdfUrl -ne $null -and $contrat.pdfUrl -ne "") {
            Write-Host "PDF URL: $($contrat.pdfUrl)" -ForegroundColor Green
            
            # Vérifier si le fichier existe réellement
            if (Test-Path $contrat.pdfUrl) {
                Write-Host "✅ Le fichier PDF existe sur le disque" -ForegroundColor Green
            } else {
                Write-Host "❌ Le fichier PDF n'existe pas sur le disque!" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Pas de PDF associé à ce contrat" -ForegroundColor Red
        }
    }
    
    # Maintenant, récupérons un contrat spécifique pour voir si les détails sont les mêmes
    if ($contrats.Count -gt 0) {
        $contratId = $contrats[0].id
        Write-Host "`n=== Test de récupération d'un contrat spécifique (ID: $contratId) ===" -ForegroundColor Yellow
        
        $contratDetail = Invoke-RestMethod -Uri "$url/$contratId" -Method Get
        Write-Host "Contrat récupéré par ID:" -ForegroundColor White
        $contratDetail | ConvertTo-Json -Depth 3
        
        # Comparer le PDF URL entre les deux appels
        if ($contratDetail.pdfUrl -eq $contrats[0].pdfUrl) {
            Write-Host "✅ Le chemin du PDF est identique entre la liste et le détail" -ForegroundColor Green
        } else {
            Write-Host "❌ Différence de chemin PDF entre la liste et le détail!" -ForegroundColor Red
            Write-Host "Liste: $($contrats[0].pdfUrl)" -ForegroundColor Red
            Write-Host "Détail: $($contratDetail.pdfUrl)" -ForegroundColor Red
        }
    }
    
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

Write-Host "`n===== FIN DE LA VÉRIFICATION =====" -ForegroundColor Cyan
