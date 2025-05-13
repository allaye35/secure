@echo off
echo ======================================
echo   Test de création de contrat de travail
echo ======================================
echo.

set BASE_URL=http://localhost:8080/api/contrats-de-travail
set CONTENT_TYPE=Content-Type: application/json

:: Générer une référence unique avec date et heure
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (
    set DATE_STAMP=%%c-%%a-%%b
)
for /f "tokens=1-2 delims=: " %%a in ('time /t') do (
    set TIME_STAMP=%%a%%b
)

set REF=CT-%DATE_STAMP%-%TIME_STAMP%

echo Création d'un contrat avec référence unique: %REF%
curl -X POST %BASE_URL% -H "%CONTENT_TYPE%" -d "{\"referenceContrat\": \"%REF%\", \"typeContrat\": \"CDD\", \"dateDebut\": \"%DATE_STAMP%\", \"dateFin\": \"2025-08-15\", \"description\": \"Contrat test via cURL\", \"salaireDeBase\": 2500, \"periodiciteSalaire\": \"MENSUEL\", \"agentDeSecuriteId\": 1, \"entrepriseId\": 1, \"missionId\": 1}"
echo.
echo.

echo Test de création terminé.
