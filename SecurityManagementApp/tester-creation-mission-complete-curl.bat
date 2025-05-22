@echo off
REM Script pour tester la création d'une mission complète avec tous les champs via curl

REM Configuration
set BASE_URL=http://localhost:8080/api/missions
set CONTENT_TYPE=application/json

echo.
echo ===== Test de création d'une mission complète avec tous les champs via curl =====
echo.

REM Création d'un fichier temporaire pour le contenu JSON
set tempFile=%TEMP%\mission-complete-%RANDOM%.json

REM Construction du JSON pour la mission complète
echo {> %tempFile%
echo   "titre": "Mission complète avec tous les champs",>> %tempFile%
echo   "description": "Mission créée pour tester tous les champs possibles de l'API des missions",>> %tempFile%
echo   "dateDebut": "2025-07-01",>> %tempFile%
echo   "dateFin": "2025-07-10",>> %tempFile%
echo   "heureDebut": "08:00:00",>> %tempFile%
echo   "heureFin": "18:00:00",>> %tempFile%
echo   "statutMission": "PLANIFIEE",>> %tempFile%
echo   "typeMission": "GARDIENNAGE",>> %tempFile%
echo   "adresse": "123 Avenue de la Sécurité, 75001 Paris",>> %tempFile%
echo   "nombreAgents": 3,>> %tempFile%
echo   "quantite": 80,>> %tempFile%
echo   "tarifMissionId": 1,>> %tempFile%
echo   "montantHT": 2400.00,>> %tempFile%
echo   "montantTVA": 480.00,>> %tempFile%
echo   "montantTTC": 2880.00,>> %tempFile%
echo   "clientId": 1,>> %tempFile%
echo   "siteId": 2,>> %tempFile%
echo   "referenceInterne": "MIS-2025-COMPLETE-001",>> %tempFile%
echo   "priorite": "HAUTE",>> %tempFile%
echo   "equipementsRequis": "Talkies-walkies, lampes torches, uniforme complet",>> %tempFile%
echo   "instructionsSpeciales": "Contrôler rigoureusement les badges d'accès",>> %tempFile%
echo   "risquesIdentifies": "Zone sensible avec équipements de valeur",>> %tempFile%
echo   "contactsUrgence": "Responsable sécurité: 06 12 34 56 78",>> %tempFile%
echo   "latitude": 48.8566,>> %tempFile%
echo   "longitude": 2.3522,>> %tempFile%
echo   "recurrence": "HEBDOMADAIRE",>> %tempFile%
echo   "commentaires": "Mission complète avec tous les champs possibles pour tester l'API REST">> %tempFile%
echo }>> %tempFile%

echo Contenu JSON de la mission complète à créer:
type %tempFile%
echo.

echo Envoi de la requête POST pour créer la mission...
echo.

REM Exécution de la commande curl pour créer la mission
curl -X POST "%BASE_URL%" -H "Content-Type: %CONTENT_TYPE%" -d @%tempFile% -v

echo.
echo Récupération des missions pour vérifier la création...
echo.

curl -X GET "%BASE_URL%" 

REM Nettoyage des fichiers temporaires
del %tempFile%

echo.
echo ===== Test de création d'une mission complète terminé =====
echo.

pause
