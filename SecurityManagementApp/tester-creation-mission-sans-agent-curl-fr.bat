@echo off
REM Script pour tester la création d'une mission sans agent via curl (version française)

REM Configuration
set BASE_URL=http://localhost:8080/api/missions
set CONTENT_TYPE=application/json
set JSON_FILE=c:\Users\allay\Documents\java_Project_2025\SecurityManagementApp\mission-sans-agent-2025.json

echo.
echo ===== Test de création d'une mission sans agent avec tous les champs via curl =====
echo.

REM Affichage du contenu du fichier JSON
echo Contenu JSON de la mission sans agent à créer:
type %JSON_FILE%
echo.

echo Envoi de la requête POST pour créer la mission...
echo.

REM Exécution de la commande curl pour créer la mission
curl -X POST "%BASE_URL%" -H "Content-Type: %CONTENT_TYPE%" -d @%JSON_FILE% -v

echo.
echo Récupération des missions pour vérifier la création...
echo.

curl -X GET "%BASE_URL%" 

echo.
echo ===== Test de création d'une mission sans agent terminé =====
echo.

pause
