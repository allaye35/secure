#!/bin/bash
# Script de test pour l'API des missions
# Ce script utilise curl pour tester les différents endpoints du contrôleur MissionControleur

# Configuration
API_BASE="http://localhost:8080/api"
MISSIONS_API="$API_BASE/missions"
CONTENT_TYPE="application/json"
CURL_OPTS="-s -H \"Content-Type: $CONTENT_TYPE\""

# Couleurs pour le terminal
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

function print_header() {
    echo -e "\n${CYAN}===== TEST: $1 =====${NC}\n"
}

function print_json() {
    echo "$1" | python -m json.tool 2>/dev/null || echo "$1"
}

# 1. Test de récupération de toutes les missions
print_header "Récupération de toutes les missions"
RESPONSE=$(curl -s -H "Content-Type: $CONTENT_TYPE" -X GET $MISSIONS_API)
echo -e "${GREEN}Réponse:${NC}"
print_json "$RESPONSE"

# 2. Test de récupération d'une mission par ID
print_header "Récupération d'une mission par ID"
MISSION_ID=1 # À ajuster selon les données disponibles
RESPONSE=$(curl -s -H "Content-Type: $CONTENT_TYPE" -X GET "$MISSIONS_API/$MISSION_ID")
echo -e "${GREEN}Réponse:${NC}"
print_json "$RESPONSE"

# 3. Test de simulation de calcul
print_header "Simulation de calcul de montants"
SIMULATION_BODY='{
    "titre": "Test de simulation",
    "description": "Mission pour tester la simulation de calcul",
    "dateDebut": "2025-06-01",
    "dateFin": "2025-06-02",
    "heureDebut": "08:00",
    "heureFin": "18:00",
    "typeMission": "GARDIENNAGE",
    "statutMission": "PLANIFIEE",
    "tarifMissionId": 1,
    "quantite": 2
}'
RESPONSE=$(curl -s -H "Content-Type: $CONTENT_TYPE" -X POST -d "$SIMULATION_BODY" "$MISSIONS_API/simuler-calcul")
echo -e "${GREEN}Réponse:${NC}"
print_json "$RESPONSE"

# 4. Test de création d'une mission
print_header "Création d'une mission"
MISSION_BODY='{
    "titre": "Mission de test via API",
    "description": "Création d'une mission via l'API REST avec curl",
    "dateDebut": "2025-06-15",
    "dateFin": "2025-06-16",
    "heureDebut": "09:00",
    "heureFin": "17:00",
    "typeMission": "SURVEILLANCE",
    "statutMission": "PLANIFIEE",
    "tarifMissionId": 1,
    "devisId": 1,
    "quantite": 1,
    "nombreAgents": 2
}'
RESPONSE=$(curl -s -H "Content-Type: $CONTENT_TYPE" -X POST -d "$MISSION_BODY" "$MISSIONS_API")
echo -e "${GREEN}Réponse:${NC}"
print_json "$RESPONSE"

# Extraction de l'ID de la mission créée
CREATED_MISSION_ID=$(echo $RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
if [ -z "$CREATED_MISSION_ID" ]; then
    echo -e "${YELLOW}Impossible d'extraire l'ID de la mission créée. Utilisation de l'ID 1 pour les tests suivants.${NC}"
    CREATED_MISSION_ID=1
else
    echo -e "${GREEN}ID de la mission créée: $CREATED_MISSION_ID${NC}"
fi

# 5. Test de mise à jour d'une mission
print_header "Mise à jour d'une mission"
UPDATE_BODY='{
    "titre": "Mission mise à jour via API",
    "description": "Mise à jour d'une mission via l'API REST avec curl",
    "dateDebut": "2025-06-15",
    "dateFin": "2025-06-16",
    "heureDebut": "10:00",
    "heureFin": "18:00",
    "typeMission": "SURVEILLANCE",
    "statutMission": "EN_COURS",
    "tarifMissionId": 1,
    "devisId": 1,
    "quantite": 2,
    "nombreAgents": 3
}'
RESPONSE=$(curl -s -H "Content-Type: $CONTENT_TYPE" -X PUT -d "$UPDATE_BODY" "$MISSIONS_API/$CREATED_MISSION_ID")
echo -e "${GREEN}Réponse:${NC}"
print_json "$RESPONSE"

# 6. Test d'affectation d'agents à la mission
print_header "Affectation d'agents à la mission"
AGENT_IDS='[1, 2]'
RESPONSE=$(curl -s -H "Content-Type: $CONTENT_TYPE" -X PUT -d "$AGENT_IDS" "$MISSIONS_API/$CREATED_MISSION_ID/agents")
echo -e "${GREEN}Réponse:${NC}"
print_json "$RESPONSE"

# 7. Test de retrait d'un agent de la mission
print_header "Retrait d'un agent de la mission"
AGENT_ID=1
RESPONSE=$(curl -s -H "Content-Type: $CONTENT_TYPE" -X DELETE "$MISSIONS_API/$CREATED_MISSION_ID/agent/$AGENT_ID")
echo -e "${GREEN}Réponse:${NC}"
print_json "$RESPONSE"

# 8. Test d'association d'un site à la mission
print_header "Association d'un site à la mission"
SITE_ID=1
RESPONSE=$(curl -s -H "Content-Type: $CONTENT_TYPE" -X PUT "$MISSIONS_API/$CREATED_MISSION_ID/site/$SITE_ID")
echo -e "${GREEN}Réponse:${NC}"
print_json "$RESPONSE"

# 9. Test d'association d'un planning à la mission
print_header "Association d'un planning à la mission"
PLANNING_ID=1
RESPONSE=$(curl -s -H "Content-Type: $CONTENT_TYPE" -X PUT "$MISSIONS_API/$CREATED_MISSION_ID/planning/$PLANNING_ID")
echo -e "${GREEN}Réponse:${NC}"
print_json "$RESPONSE"

# 10. Test d'association d'une facture à la mission
print_header "Association d'une facture à la mission"
FACTURE_ID=1
RESPONSE=$(curl -s -H "Content-Type: $CONTENT_TYPE" -X PUT "$MISSIONS_API/$CREATED_MISSION_ID/factures/$FACTURE_ID")
echo -e "${GREEN}Réponse:${NC}"
print_json "$RESPONSE"

# 11. Test d'association d'une géolocalisation à la mission
print_header "Association d'une géolocalisation à la mission"
RESPONSE=$(curl -s -H "Content-Type: $CONTENT_TYPE" -X PUT "$MISSIONS_API/$CREATED_MISSION_ID/geoloc")
echo -e "${GREEN}Réponse:${NC}"
print_json "$RESPONSE"

# 12. Test de récupération des missions commençant après une date
print_header "Récupération des missions commençant après une date"
DATE="2025-06-01"
RESPONSE=$(curl -s -H "Content-Type: $CONTENT_TYPE" -X GET "$MISSIONS_API/apres?date=$DATE")
echo -e "${GREEN}Réponse:${NC}"
print_json "$RESPONSE"

# 13. Test de récupération des missions finissant avant une date
print_header "Récupération des missions finissant avant une date"
DATE="2025-12-31"
RESPONSE=$(curl -s -H "Content-Type: $CONTENT_TYPE" -X GET "$MISSIONS_API/avant?date=$DATE")
echo -e "${GREEN}Réponse:${NC}"
print_json "$RESPONSE"

# 14. Test de récupération des missions par agent
print_header "Récupération des missions par agent"
AGENT_ID=1
RESPONSE=$(curl -s -H "Content-Type: $CONTENT_TYPE" -X GET "$MISSIONS_API/agent/$AGENT_ID")
echo -e "${GREEN}Réponse:${NC}"
print_json "$RESPONSE"

# 15. Test de suppression de la mission
print_header "Suppression de la mission"
RESPONSE=$(curl -s -H "Content-Type: $CONTENT_TYPE" -X DELETE "$MISSIONS_API/$CREATED_MISSION_ID")
echo -e "${GREEN}Mission supprimée avec succès${NC}"

echo -e "\n${CYAN}===== TESTS TERMINÉS =====${NC}\n"
