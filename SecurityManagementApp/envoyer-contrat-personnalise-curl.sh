#!/bin/bash
# Script pour tester la création d'un contrat complet personnalisé avec curl
# envoyer-contrat-personnalise-curl.sh

echo "Test de création d'un contrat complet personnalisé via curl"

# Définir le chemin du fichier JSON
JSON_FILE="contrat-complet-personnalise.json"

echo "Données à envoyer:"
cat $JSON_FILE

echo ""
echo "Envoi de la requête..."
curl -X POST "http://localhost:8080/api/contrats" \
  -H "Content-Type: application/json" \
  -d @$JSON_FILE

echo ""
echo "Si la requête a réussi, le résultat JSON du contrat créé s'affichera ci-dessus."
