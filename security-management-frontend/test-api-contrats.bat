@echo off
echo ======================================
echo   Test API Contrats de Travail
echo ======================================
echo.

set BASE_URL=http://localhost:8080/api/contrats-de-travail
set CONTENT_TYPE=Content-Type: application/json

echo 1. Récupérer tous les contrats de travail
curl -X GET %BASE_URL% -H "%CONTENT_TYPE%" 
echo.
echo.

echo 2. Vérifier si une référence existe (test avec reference "CT-2025-001")
curl -X GET "%BASE_URL%/check-reference/CT-2025-001" -H "%CONTENT_TYPE%"
echo.
echo.

echo 3. Créer un nouveau contrat de travail
curl -X POST %BASE_URL% -H "%CONTENT_TYPE%" -d "{\"referenceContrat\": \"CT-2025-TEST\", \"typeContrat\": \"CDD\", \"dateDebut\": \"2025-05-15\", \"dateFin\": \"2025-08-15\", \"description\": \"Contrat test via cURL\", \"salaireDeBase\": 2500, \"periodiciteSalaire\": \"MENSUEL\", \"agentDeSecuriteId\": 1, \"entrepriseId\": 1, \"missionId\": 1}"
echo.
echo.

echo 4. Récupérer un contrat par ID (remplacez ID par l'ID du contrat créé)
set CONTRACT_ID=1
curl -X GET "%BASE_URL%/%CONTRACT_ID%" -H "%CONTENT_TYPE%"
echo.
echo.

echo 5. Mettre à jour un contrat existant
curl -X PUT "%BASE_URL%/%CONTRACT_ID%" -H "%CONTENT_TYPE%" -d "{\"referenceContrat\": \"CT-2025-TEST-UPDATED\", \"typeContrat\": \"CDD\", \"dateDebut\": \"2025-05-15\", \"dateFin\": \"2025-09-15\", \"description\": \"Contrat test mis à jour via cURL\", \"salaireDeBase\": 2600, \"periodiciteSalaire\": \"MENSUEL\", \"agentDeSecuriteId\": 1, \"entrepriseId\": 1, \"missionId\": 1}"
echo.
echo.

echo 6. Prolonger un contrat
curl -X PATCH "%BASE_URL%/%CONTRACT_ID%/prolonger?nouvelleDateFin=2025-12-31" -H "%CONTENT_TYPE%"
echo.
echo.

echo 7. Récupérer les contrats d'un agent
set AGENT_ID=1
curl -X GET "%BASE_URL%/agent/%AGENT_ID%" -H "%CONTENT_TYPE%"
echo.
echo.

echo 8. Récupérer les métadonnées (missions, agents, entreprises)
curl -X GET "http://localhost:8080/api/missions" -H "%CONTENT_TYPE%"
echo.
echo.
curl -X GET "http://localhost:8080/api/agents" -H "%CONTENT_TYPE%"
echo.
echo.
curl -X GET "http://localhost:8080/api/entreprises" -H "%CONTENT_TYPE%"
echo.
echo.
curl -X GET "http://localhost:8080/api/articles-contrat-travail" -H "%CONTENT_TYPE%"
echo.
echo.

echo 9. Supprimer un contrat (décommentez pour tester)
rem curl -X DELETE "%BASE_URL%/%CONTRACT_ID%" -H "%CONTENT_TYPE%"
rem echo.
rem echo.

echo Test de l'API terminé.
