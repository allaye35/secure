#!/bin/bash
# Script pour tester la création de mission via curl

# Construire la requête curl
curl -X POST "http://localhost:8080/api/missions" \
     -H "Content-Type: application/json" \
     -d '{
         "titre": "Mission créée directement avec curl",
         "description": "Mission de test via curl",
         "typeMission": "SURVEILLANCE",
         "statutMission": "PLANIFIEE",
         "dateDebut": "2025-06-01",
         "dateFin": "2025-06-10",
         "heureDebut": "08:00:00",
         "heureFin": "16:00:00",
         "nombreAgents": 2,
         "quantite": 80,
         "devisId": 1,
         "tarifMissionId": 1
     }'
