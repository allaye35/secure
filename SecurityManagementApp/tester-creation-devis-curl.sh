#!/bin/bash
# Script pour tester la création d'un devis avec des missions existantes

# URL de l'API
API_URL="http://localhost:8080/api/devis"

# Données du devis à créer
JSON_DATA='{
  "referenceDevis": "DEV-TEST-'$(date +%Y%m%d-%H%M%S)'",
  "description": "Devis de test via curl avec missions existantes",
  "statut": "EN_ATTENTE",
  "entrepriseId": 1,
  "clientId": 1,
  "dateValidite": "'$(date -d "+1 month" +%Y-%m-%d)'",
  "conditionsGenerales": "Conditions générales de test",
  "missionExistanteIds": [1, 2]
}'

echo "Envoi du devis avec les données suivantes:"
echo "$JSON_DATA"

# Envoi de la requête avec curl
echo "Envoi de la requête à $API_URL..."
curl -X POST \
  -H "Content-Type: application/json" \
  -d "$JSON_DATA" \
  "$API_URL"

echo ""
echo "Requête envoyée. Vérifiez la réponse ci-dessus."
