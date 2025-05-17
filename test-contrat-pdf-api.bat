@echo off
echo Testing Contract PDF API endpoints
powershell -ExecutionPolicy Bypass -File "%~dp0Test-ContratPdfApi.ps1"
echo.
echo Press any key to exit...
pause >nul
