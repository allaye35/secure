@echo off
REM Script de test pour l'API des missions
REM Ce script utilise curl pour tester les différents endpoints du contrôleur MissionControleur

REM Configuration
set API_BASE=http://localhost:8080/api
set MISSIONS_API=%API_BASE%/missions
set CONTENT_TYPE=application/json
set CURL_OPTS=-s -H "Content-Type: %CONTENT_TYPE%"

echo.
echo ===== TEST: Récupération de toutes les missions =====
echo.
curl %CURL_OPTS% -X GET %MISSIONS_API%

echo.
echo ===== TEST: Récupération d'une mission par ID =====
echo.
set MISSION_ID=1
curl %CURL_OPTS% -X GET %MISSIONS_API%/%MISSION_ID%

echo.
echo ===== TEST: Simulation de calcul de montants =====
echo.
set SIMULATION_BODY={"titre":"Test de simulation","description":"Mission pour tester la simulation de calcul","dateDebut":"2025-06-01","dateFin":"2025-06-02","heureDebut":"08:00","heureFin":"18:00","typeMission":"GARDIENNAGE","statutMission":"PLANIFIEE","tarifMissionId":1,"quantite":2}
curl %CURL_OPTS% -X POST -d "%SIMULATION_BODY%" %MISSIONS_API%/simuler-calcul

echo.
echo ===== TEST: Création d'une mission =====
echo.
set MISSION_BODY={"titre":"Mission de test via API","description":"Création d'une mission via l'API REST avec curl","dateDebut":"2025-06-15","dateFin":"2025-06-16","heureDebut":"09:00","heureFin":"17:00","typeMission":"SURVEILLANCE","statutMission":"PLANIFIEE","tarifMissionId":1,"devisId":1,"quantite":1,"nombreAgents":2}
curl %CURL_OPTS% -X POST -d "%MISSION_BODY%" %MISSIONS_API%

REM Normalement, on récupérerait l'ID ici, mais c'est difficile en batch pur
set CREATED_MISSION_ID=1
echo.
echo Utilisez l'ID de mission approprié pour les tests suivants
echo.

echo.
echo ===== TEST: Mise à jour d'une mission =====
echo.
set UPDATE_BODY={"titre":"Mission mise à jour via API","description":"Mise à jour d'une mission via l'API REST avec curl","dateDebut":"2025-06-15","dateFin":"2025-06-16","heureDebut":"10:00","heureFin":"18:00","typeMission":"SURVEILLANCE","statutMission":"EN_COURS","tarifMissionId":1,"devisId":1,"quantite":2,"nombreAgents":3}
curl %CURL_OPTS% -X PUT -d "%UPDATE_BODY%" %MISSIONS_API%/%CREATED_MISSION_ID%

echo.
echo ===== TEST: Affectation d'agents à la mission =====
echo.
set AGENT_IDS=[1,2]
curl %CURL_OPTS% -X PUT -d "%AGENT_IDS%" %MISSIONS_API%/%CREATED_MISSION_ID%/agents

echo.
echo ===== TEST: Retrait d'un agent de la mission =====
echo.
set AGENT_ID=1
curl %CURL_OPTS% -X DELETE %MISSIONS_API%/%CREATED_MISSION_ID%/agent/%AGENT_ID%

echo.
echo ===== TEST: Association d'un site à la mission =====
echo.
set SITE_ID=1
curl %CURL_OPTS% -X PUT %MISSIONS_API%/%CREATED_MISSION_ID%/site/%SITE_ID%

echo.
echo ===== TEST: Association d'un planning à la mission =====
echo.
set PLANNING_ID=1
curl %CURL_OPTS% -X PUT %MISSIONS_API%/%CREATED_MISSION_ID%/planning/%PLANNING_ID%

echo.
echo ===== TEST: Association d'une facture à la mission =====
echo.
set FACTURE_ID=1
curl %CURL_OPTS% -X PUT %MISSIONS_API%/%CREATED_MISSION_ID%/factures/%FACTURE_ID%

echo.
echo ===== TEST: Association d'une géolocalisation à la mission =====
echo.
curl %CURL_OPTS% -X PUT %MISSIONS_API%/%CREATED_MISSION_ID%/geoloc

echo.
echo ===== TEST: Récupération des missions commençant après une date =====
echo.
set DATE=2025-06-01
curl %CURL_OPTS% -X GET "%MISSIONS_API%/apres?date=%DATE%"

echo.
echo ===== TEST: Récupération des missions finissant avant une date =====
echo.
set DATE=2025-12-31
curl %CURL_OPTS% -X GET "%MISSIONS_API%/avant?date=%DATE%"

echo.
echo ===== TEST: Récupération des missions par agent =====
echo.
set AGENT_ID=1
curl %CURL_OPTS% -X GET %MISSIONS_API%/agent/%AGENT_ID%

echo.
echo ===== TEST: Suppression de la mission =====
echo.
curl %CURL_OPTS% -X DELETE %MISSIONS_API%/%CREATED_MISSION_ID%

echo.
echo ===== TESTS TERMINÉS =====
echo.
