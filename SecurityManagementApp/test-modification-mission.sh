#!/bin/bash
# Script bash pour tester la modification d'une mission via curl
# Ce script modifie tous les champs importants d'une mission existante

# Configuration
API_BASE_URL="http://localhost:8080/api" # URL de base de l'API
MISSION_ID=1 # ID de la mission à modifier - à adapter selon votre cas

# Données de la mission modifiée (au format JSON)
MISSION_DATA='{
  "titre": "Mission modifiée par curl (bash)",
  "description": "Test de modification via curl bash - tous champs importants modifiés",
  "dateDebut": "2025-09-01",
  "dateFin": "2025-09-30",
  "heureDebut": "09:00:00",
  "heureFin": "18:00:00",
  "statutMission": "PLANIFIEE",
  "typeMission": "SURVEILLANCE",
  "nombreAgents": 5,
  "quantite": 15,
  "tarifMissionId": 2,
  "siteId": 2,
  "montantHT": 2500.00,
  "montantTVA": 500.00,
  "montantTTC": 3000.00,
  "commentaires": "Mission modifiée via curl bash pour test backend"
}'

# Sauvegarde des données dans un fichier temporaire
TEMP_FILE="mission-modification-temp.json"
echo $MISSION_DATA > $TEMP_FILE

echo -e "\033[36mDébut du test de modification de mission via curl...\033[0m"

# Requête curl pour modifier la mission
echo -e "\033[33mModification de la mission ID: $MISSION_ID\033[0m"
curl -X PUT "$API_BASE_URL/missions/$MISSION_ID" \
     -H "Content-Type: application/json" \
     -d "@$TEMP_FILE" \
     --verbose

# Vérification du résultat - Récupération de la mission après modification
echo -e "\n\033[32mVérification du résultat - Récupération de la mission modifiée:\033[0m"
curl -X GET "$API_BASE_URL/missions/$MISSION_ID" \
     -H "Accept: application/json"

# Nettoyage
rm $TEMP_FILE
echo -e "\n\033[36mTest terminé. Fichier temporaire supprimé.\033[0m"

# Instructions supplémentaires
echo -e "\n\033[35mInstructions supplémentaires:\033[0m"
echo "- Si vous avez besoin de vous authentifier, ajoutez l'en-tête Authorization aux requêtes curl:"
echo '  -H "Authorization: Bearer VOTRE_TOKEN_JWT"'
echo "- Pour tester d'autres types de modifications, ajustez les valeurs dans le JSON"
echo "- Pour modifier l'ID de la mission à tester, changez la valeur de MISSION_ID au début du script"
