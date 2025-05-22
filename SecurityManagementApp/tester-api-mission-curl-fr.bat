@echo off
REM Script pour tester l'API des missions via curl (version batch en français)

REM Configuration
set baseUrl=http://localhost:8080/api/missions

echo.
echo ===== Test complet de l'API des missions avec curl =====
echo.

REM =============== 1. CRÉATION D'UNE MISSION ===============
echo 1. CRÉATION D'UNE MISSION
echo.

REM Création d'un fichier temporaire pour le contenu JSON
set tempFile=%TEMP%\mission-create-%RANDOM%.json

REM Construction du JSON pour la mission
echo {> %tempFile%
echo   "titre": "Mission de test via curl",>> %tempFile%
echo   "description": "Test complet de l'API des missions avec curl",>> %tempFile%
echo   "dateDebut": "2025-07-01",>> %tempFile%
echo   "dateFin": "2025-07-10",>> %tempFile%
echo   "heureDebut": "08:00:00",>> %tempFile%
echo   "heureFin": "18:00:00",>> %tempFile%
echo   "statutMission": "PLANIFIEE",>> %tempFile%
echo   "typeMission": "GARDIENNAGE",>> %tempFile%
echo   "nombreAgents": 2,>> %tempFile%
echo   "quantite": 80,>> %tempFile%
echo   "tarifMissionId": 1,>> %tempFile%
echo   "commentaires": "Mission créée pour tester l'API REST">> %tempFile%
echo }>> %tempFile%

echo Contenu JSON de la mission à créer:
type %tempFile%
echo.

echo Envoi de la requête POST pour créer la mission...
echo.

REM Exécution de la commande curl pour créer la mission
curl -X POST "%baseUrl%" -H "Content-Type: application/json" -d @%tempFile%

echo.
echo Mission créée avec succès (si aucune erreur ci-dessus)
echo.

REM =============== 2. RÉCUPÉRATION DE TOUTES LES MISSIONS ===============
echo 2. RÉCUPÉRATION DE TOUTES LES MISSIONS
echo.

curl -X GET "%baseUrl%"

echo.
echo.

REM =============== 3. RECHERCHE DE MISSIONS PAR CRITÈRES ===============
echo 3. RECHERCHE DE MISSIONS PAR CRITÈRES
echo.

set searchDate=2025-06-01
echo 3.1 - Recherche des missions commençant après le %searchDate%
echo.

curl -X GET "%baseUrl%/apres?date=%searchDate%"

echo.
echo.

REM =============== 4. SIMULER UN CALCUL DE MISSION SANS CRÉATION ===============
echo 4. SIMULER UN CALCUL DE MISSION SANS CRÉATION
echo.

REM Création d'un fichier temporaire pour le contenu JSON
set tempSimulateFile=%TEMP%\mission-simulate-%RANDOM%.json

REM Construction du JSON pour la simulation
echo {> %tempSimulateFile%
echo   "titre": "Mission de simulation",>> %tempSimulateFile%
echo   "typeMission": "GARDIENNAGE",>> %tempSimulateFile%
echo   "dateDebut": "2025-08-01",>> %tempSimulateFile%
echo   "dateFin": "2025-08-10",>> %tempSimulateFile%
echo   "heureDebut": "08:00:00",>> %tempSimulateFile%
echo   "heureFin": "18:00:00",>> %tempSimulateFile%
echo   "nombreAgents": 2,>> %tempSimulateFile%
echo   "quantite": 80,>> %tempSimulateFile%
echo   "tarifMissionId": 1>> %tempSimulateFile%
echo }>> %tempSimulateFile%

echo Contenu JSON pour la simulation:
type %tempSimulateFile%
echo.

echo Exécution de la simulation de calcul...
echo.

curl -X POST "%baseUrl%/simuler-calcul" -H "Content-Type: application/json" -d @%tempSimulateFile%

echo.
echo.

REM Nettoyage des fichiers temporaires
del %tempFile%
del %tempSimulateFile%

echo ===== Test complet de l'API des missions terminé =====
echo.

pause
