@echo off
REM Test API Contrat avec curl (sans gestion de fichiers)
REM Script pour Windows CMD

set baseUrl=http://localhost:8080/api/contrats
set timestamp=%date:~-4%%date:~3,2%%date:~0,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set timestamp=%timestamp: =0%
set reference=CONTRAT-TEST-%timestamp%

echo ===== TEST API CONTRATS AVEC CURL (WINDOWS) =====
echo Reference: %reference%

REM Créer un fichier JSON temporaire pour la création
echo Creating test contract JSON...
set jsonFile=temp-contract-%timestamp%.json

REM Lire le contenu du fichier JSON et remplacer la référence
powershell -Command "(Get-Content -Raw 'test-api-contrat.json') -replace 'CONTRAT-2025-API-TEST', '%reference%' | Set-Content -Encoding utf8 '%jsonFile%'"

echo.
echo [1] CREATION D'UN CONTRAT
curl -s -X POST %baseUrl% -H "Content-Type: application/json" -d @%jsonFile%
echo.

REM Récupérer l'ID du contrat créé (cette partie est complexe avec curl uniquement)
REM Pour simplifier, nous allons récupérer l'ID à partir du fichier de création
for /f "tokens=2 delims=:" %%i in ('findstr /C:"\"id\":" %jsonFile%') do (
    set contractId=%%i
    set contractId=!contractId:,=!
    set contractId=!contractId: =!
)

echo Contract ID: %contractId%

REM Supprimer le fichier temporaire
del %jsonFile%

echo.
echo [2] RECUPERATION PAR ID
curl -s -X GET %baseUrl%/%contractId%
echo.

echo.
echo [3] RECUPERATION PAR REFERENCE
curl -s -X GET %baseUrl%/ref/%reference%
echo.

echo.
echo [4] MODIFICATION DU CONTRAT
REM Créer un fichier JSON pour la mise à jour
echo Creating update JSON...
set updateFile=temp-update-%timestamp%.json

REM Récupérer le contrat et modifier les valeurs
powershell -Command "$contract = (Invoke-RestMethod -Uri '%baseUrl%/%contractId%' -Method Get); $contract.dureeMois = 24; $contract.preavisMois = 3; $contract | ConvertTo-Json | Set-Content -Encoding utf8 '%updateFile%'"

curl -s -X PUT %baseUrl%/%contractId% -H "Content-Type: application/json" -d @%updateFile%
echo.

REM Supprimer le fichier temporaire
del %updateFile%

echo.
echo [5] RECUPERATION PAR ID DE DEVIS
REM Récupérer l'ID du devis à partir du contrat
for /f "tokens=2 delims=:" %%i in ('powershell -Command "(Invoke-RestMethod -Uri '%baseUrl%/%contractId%' -Method Get).devisId"') do (
    set devisId=%%i
    set devisId=!devisId:,=!
    set devisId=!devisId: =!
)

echo Devis ID: %devisId%
curl -s -X GET %baseUrl%/devis/%devisId%
echo.

echo.
echo [6] SUPPRESSION DU CONTRAT
set /p delete="Voulez-vous supprimer le contrat? (O/N): "
if /i "%delete%"=="O" (
    curl -s -X DELETE %baseUrl%/%contractId%
    echo.
    echo Verification de la suppression:
    curl -s -X GET %baseUrl%/%contractId%
    echo.
) else (
    echo Suppression annulee.
)

echo.
echo ===== TEST TERMINE =====
