@echo off
echo.
echo JobHunter Max - Ollama Setup
echo ================================
echo.

REM Check if Ollama is installed
where ollama >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [X] Ollama not found
    echo.
    echo [!] Please install Ollama first:
    echo     Visit: https://ollama.com
    echo.
    echo     Download and install the Windows version
    echo.
    pause
    exit /b 1
)

echo [OK] Ollama is installed
echo.

REM Check if Ollama is running
curl -s http://localhost:11434/api/tags >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] Ollama is not running
    echo     Please start Ollama and run this script again
    echo.
    pause
    exit /b 1
)

echo [OK] Ollama is running
echo.

REM Pull llama3.2 model
echo [!] Downloading llama3.2 model (this may take a few minutes)...
echo.

ollama pull llama3.2

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [OK] Setup complete!
    echo.
    echo [*] You can now use AI features in JobHunter Max
    echo     1. Open JobHunter Max
    echo     2. Go to Settings
    echo     3. Select 'Ollama (Local)' as AI Provider
    echo     4. Choose 'llama3.2' as the model
    echo.
) else (
    echo.
    echo [X] Failed to download model
    echo     Please check your internet connection and try again
    echo.
    pause
    exit /b 1
)

pause
