@echo off
REM Script pour tester la création d'un contrat complet personnalisé avec curl
REM envoyer-contrat-personnalise-curl.bat

echo Test de création d'un contrat complet personnalisé via curl

REM Définir le chemin du fichier JSON
set JSON_FILE=contrat-complet-personnalise.json

echo Données à envoyer:
type %JSON_FILE%

echo.
echo Envoi de la requête...
curl -X POST "http://localhost:8080/api/contrats" ^
  -H "Content-Type: application/json" ^
  -d @%JSON_FILE%

echo.
echo Si la requête a réussi, le résultat JSON du contrat créé s'affichera ci-dessus.
