@echo off
REM Script pour tester la création d'une mission via curl (version française)

set BASE_URL=http://localhost:8080/api
set CONTENT_TYPE=application/json

echo.
echo ===== Test de création d'une mission directement via curl =====
echo.

REM Création d'une mission
echo Création d'une mission:

REM Préparer le JSON pour la mission
set MISSION_JSON={\"titre\":\"Mission Test Curl en Français\",\"description\":\"Description de la mission de test via curl en français\",\"dateDebut\":\"2025-05-21\",\"dateFin\":\"2025-06-20\",\"heureDebut\":\"08:00:00\",\"heureFin\":\"18:00:00\",\"nombreAgents\":2,\"quantite\":80,\"typeMission\":\"SURVEILLANCE\",\"statutMission\":\"PLANIFIEE\",\"tarifMissionId\":1}

echo.
echo Contenu de la mission:
echo %MISSION_JSON%
echo.

REM Envoi de la requête
curl -X POST "%BASE_URL%/missions" -H "Content-Type: %CONTENT_TYPE%" -d "%MISSION_JSON%" -v

echo.
echo ===== Test terminé =====
