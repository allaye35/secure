#!/bin/bash
# Script bash pour tester la modification d'une mission via curl (avec PATCH)
# Ce script modifie tous les champs importants d'une mission existante

# Configuration
API_BASE_URL="http://localhost:8080/api" # URL de base de l'API
MISSION_ID=1 # ID de la mission à modifier - à adapter selon votre cas

# Données de la mission modifiée (au format JSON)
MISSION_DATA='{
  "titre": "Mission modifiée par curl (PATCH)",
  "description": "Test de modification via curl - méthode PATCH correcte",
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
  "commentaires": "Mission modifiée via curl pour test backend"
}'

# Sauvegarde des données dans un fichier temporaire
TEMP_FILE="mission-patch-temp.json"
echo $MISSION_DATA > $TEMP_FILE

echo -e "\033[36mDébut du test de modification de mission via curl (PATCH)...\033[0m"

# Requête curl pour modifier la mission avec PATCH
echo -e "\033[33mModification de la mission ID: $MISSION_ID avec PATCH\033[0m"
curl -X PATCH "$API_BASE_URL/missions/$MISSION_ID" \
     -H "Content-Type: application/json" \
     -d "@$TEMP_FILE" \
     --verbose

# Vérification du résultat - Récupération de la mission après modification
echo -e "\n\033[32mVérification du résultat - Récupération de la mission modifiée:\033[0m"
curl -X GET "$API_BASE_URL/missions/$MISSION_ID" \
     -H "Accept: application/json"

# Test avec paramètre nouvelleAdresse
echo -e "\n\033[33mModification avec paramètre nouvelleAdresse:\033[0m"
curl -X PATCH "$API_BASE_URL/missions/$MISSION_ID?nouvelleAdresse=123%20Rue%20de%20la%20S%C3%A9curit%C3%A9" \
     -H "Content-Type: application/json" \
     -d "@$TEMP_FILE" \
     --verbose

# Nettoyage
rm $TEMP_FILE
echo -e "\n\033[36mTest terminé. Fichier temporaire supprimé.\033[0m"
