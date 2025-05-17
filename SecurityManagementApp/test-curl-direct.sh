#!/bin/bash
# Test de création d'un contrat avec uniquement la référence en utilisant directement curl

# Créer un fichier temporaire pour le JSON
echo '{
  "referenceContrat": "CONTRAT-2025-CURL-DIRECT"
}' > contrat-curl.json

# Exécuter la commande curl
curl -X POST -F "dto=@contrat-curl.json;type=application/json" http://localhost:8080/api/contrats

# Supprimer le fichier temporaire
Remove-Item -Path contrat-curl.json
