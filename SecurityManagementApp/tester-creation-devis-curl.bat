@echo off
:: Script pour tester la création d'un devis avec des missions existantes

:: URL de l'API
set API_URL=http://localhost:8080/api/devis

:: Générer une référence unique basée sur la date/heure
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~0,4%"
set "MM=%dt:~4,2%"
set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%"
set "Min=%dt:~10,2%"
set "Sec=%dt:~12,2%"
set "datestamp=%YY%%MM%%DD%-%HH%%Min%%Sec%"

:: Données du devis à créer
set JSON_DATA={^
  "referenceDevis": "DEV-TEST-%datestamp%",^
  "description": "Devis de test via curl avec missions existantes",^
  "statut": "EN_ATTENTE",^
  "entrepriseId": 1,^
  "clientId": 1,^
  "dateValidite": "%YY%-%MM%-%DD%",^
  "conditionsGenerales": "Conditions générales de test",^
  "missionExistanteIds": [1, 2]^
}

echo Envoi du devis avec les données suivantes:
echo %JSON_DATA%

:: Envoi de la requête avec curl
echo Envoi de la requête à %API_URL%...
curl -X POST ^
  -H "Content-Type: application/json" ^
  -d "%JSON_DATA%" ^
  "%API_URL%"

echo.
echo Requête envoyée. Vérifiez la réponse ci-dessus.
