@echo off
echo ======================================
echo   Test API - R�f�rences des Contrats  
echo ======================================
echo.

set BASE_URL=http://localhost:8080/api/contrats-de-travail
set CONTENT_TYPE=Content-Type: application/json

echo 1. V�rifier si la r�f�rence "44444444" existe d�j� (celle qui cause l'erreur)
curl -X GET "%BASE_URL%/check-reference/44444444" -H "%CONTENT_TYPE%"
echo.
echo.

echo 2. Tenter de cr�er un contrat avec r�f�rence "44444444" pour voir l'erreur
curl -X POST %BASE_URL% -H "%CONTENT_TYPE%" -d "{\"referenceContrat\": \"44444444\", \"typeContrat\": \"CDD\", \"dateDebut\": \"2025-05-15\", \"dateFin\": \"2025-08-15\", \"description\": \"Test erreur r�f�rence doublon\", \"salaireDeBase\": 2500, \"periodiciteSalaire\": \"MENSUEL\", \"agentDeSecuriteId\": 1, \"entrepriseId\": 1, \"missionId\": 1}"
echo.
echo.

echo 3. Cr�er un contrat avec une nouvelle r�f�rence unique g�n�r�e
curl -X POST %BASE_URL% -H "%CONTENT_TYPE%" -d "{\"referenceContrat\": \"CT-2025-%random%\", \"typeContrat\": \"CDD\", \"dateDebut\": \"2025-05-15\", \"dateFin\": \"2025-08-15\", \"description\": \"Contrat test avec r�f�rence unique\", \"salaireDeBase\": 2500, \"periodiciteSalaire\": \"MENSUEL\", \"agentDeSecuriteId\": 1, \"entrepriseId\": 1, \"missionId\": 1}"
echo.
echo.

echo Test de la validation des r�f�rences de contrat termin�.
