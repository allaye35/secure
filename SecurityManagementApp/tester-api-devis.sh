#!/bin/bash
# Script de test pour l'API Devis avec curl (version bash)

# Configuration
BASE_URL="http://localhost:8080/api/devis"
CONTENT_TYPE="application/json"

echo -e "\n===== Test de l'API Devis ====="

# 1. Récupérer tous les devis
echo -e "\n1. Récupération de tous les devis:"
curl -s -X GET "$BASE_URL" -H "Content-Type: $CONTENT_TYPE" | jq '.'

# 2. Récupérer uniquement les devis disponibles pour création de contrat
echo -e "\n2. Récupération des devis disponibles pour contrat:"
curl -s -X GET "$BASE_URL/disponibles" -H "Content-Type: $CONTENT_TYPE" | jq '.'

# 3. Création d'un nouveau devis
echo -e "\n3. Création d'un nouveau devis:"
DATE_NOW=$(date +%Y-%m-%d)
DATE_FUTURE=$(date -d "+30 days" +%Y-%m-%d 2>/dev/null || date -v+30d +%Y-%m-%d)
DATE_FUTURE_45=$(date -d "+45 days" +%Y-%m-%d 2>/dev/null || date -v+45d +%Y-%m-%d)
DATE_FUTURE_60=$(date -d "+60 days" +%Y-%m-%d 2>/dev/null || date -v+60d +%Y-%m-%d)
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

# Création du JSON pour le nouveau devis
read -r -d '' NOUVEAU_DEVIS << EOM
{
  "referenceDevis": "DEV-TEST-$TIMESTAMP",
  "description": "Devis de test via API",
  "statut": "EN_ATTENTE",
  "entrepriseId": 1,
  "clientId": 1,
  "dateValidite": "$DATE_FUTURE_60",
  "conditionsGenerales": "Conditions générales de test",
  "missions": [
    {
      "titre": "Mission de test 1",
      "description": "Description de la mission de test",
      "dateDebut": "$DATE_NOW",
      "dateFin": "$DATE_FUTURE",
      "heureDebut": "08:00:00",
      "heureFin": "18:00:00",
      "nombreAgents": 2,
      "quantite": 80,
      "typeMission": "GARDIENNAGE",
      "tarifMissionId": 1
    }
  ]
}
EOM

# Envoyer la requête et extraire l'ID du devis créé
RESPONSE=$(curl -s -X POST "$BASE_URL" -H "Content-Type: $CONTENT_TYPE" -d "$NOUVEAU_DEVIS")
DEVIS_ID=$(echo $RESPONSE | jq -r '.id')

echo "Devis créé avec l'ID: $DEVIS_ID"
echo $RESPONSE | jq '.'

# 4. Récupérer un devis par ID
echo -e "\n4. Récupération du devis par ID:"
curl -s -X GET "$BASE_URL/$DEVIS_ID" -H "Content-Type: $CONTENT_TYPE" | jq '.'

# 5. Récupérer un devis par référence
echo -e "\n5. Récupération du devis par référence:"
REFERENCE=$(echo $RESPONSE | jq -r '.referenceDevis')
curl -s -X GET "$BASE_URL/search?reference=$REFERENCE" -H "Content-Type: $CONTENT_TYPE" | jq '.'

# 6. Mettre à jour un devis
echo -e "\n6. Mise à jour du devis:"

# Création du JSON pour la mise à jour du devis
read -r -d '' DEVIS_MODIFIE << EOM
{
  "referenceDevis": "$REFERENCE",
  "description": "Devis de test modifié via API",
  "statut": "ACCEPTE",
  "entrepriseId": 1,
  "clientId": 1,
  "dateValidite": "$DATE_FUTURE_60",
  "conditionsGenerales": "Conditions générales modifiées",
  "missions": [
    {
      "titre": "Mission de test modifiée",
      "description": "Description modifiée de la mission de test",
      "dateDebut": "$DATE_NOW",
      "dateFin": "$DATE_FUTURE_45",
      "heureDebut": "09:00:00",
      "heureFin": "17:00:00",
      "nombreAgents": 3,
      "quantite": 120,
      "typeMission": "GARDIENNAGE",
      "tarifMissionId": 1
    }
  ]
}
EOM

curl -s -X PUT "$BASE_URL/$DEVIS_ID" -H "Content-Type: $CONTENT_TYPE" -d "$DEVIS_MODIFIE" | jq '.'

# 7. Vérifier la mise à jour
echo -e "\n7. Vérification de la mise à jour:"
curl -s -X GET "$BASE_URL/$DEVIS_ID" -H "Content-Type: $CONTENT_TYPE" | jq '.'

# 8. Test final: Suppression du devis
echo -e "\n8. Suppression du devis (ATTENTION: Cette action est irréversible):"
read -p "Voulez-vous supprimer le devis? (O/N) " confirmation

if [[ $confirmation == "O" || $confirmation == "o" ]]; then
  curl -X DELETE "$BASE_URL/$DEVIS_ID" -v
  echo "Devis supprimé avec succès"
  
  # Vérifier que le devis a bien été supprimé
  echo -e "\n9. Vérification de la suppression:"
  curl -X GET "$BASE_URL/$DEVIS_ID" -v
else
  echo "Suppression annulée"
fi

echo -e "\n===== Tests terminés ====="
