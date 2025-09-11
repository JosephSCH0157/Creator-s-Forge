@echo off
setlocal ENABLEEXTENSIONS ENABLEDELAYEDEXPANSION

REM === Go to repo root (folder where this .bat lives) ===
cd /d "%~dp0"

REM === Nice console cosmetics (optional) ===
title Creator's Forge - Dev Launcher
color 0A

echo [1/4] Checking Docker...
where docker >nul 2>nul
if errorlevel 1 (
  echo   Docker not found on PATH. Skipping Docker checks.
) else (
  for /f "delims=" %%i in ('docker ps -a --format "{{.Names}}" ^| findstr /i "^forge_postgres$"') do set CONTAINER_FOUND=1
  if defined CONTAINER_FOUND (
    for /f "delims=" %%i in ('docker inspect -f "{{.State.Running}}" forge_postgres 2^>nul') do set ISRUN=%%i
    if /i "!ISRUN!"=="true" (
      echo   forge_postgres is already running.
    ) else (
      echo   Starting forge_postgres...
      docker start forge_postgres >nul
    )
  ) else (
    echo   No forge_postgres container found. Creating one...
    docker run -d --name forge_postgres -p 5432:5432 ^
      -e POSTGRES_USER=forge_user ^
      -e POSTGRES_PASSWORD=forge_pass ^
      -e POSTGRES_DB=creators_forge ^
      postgres:16-alpine >nul
  )
)

echo [2/4] Ensuring server .env exists...
if not exist ".\server\.env" (
  echo   Creating server\.env with defaults...
  > ".\server\.env" (
    echo DATABASE_URL=postgres://forge_user:forge_pass@127.0.0.1:5432/creators_forge
    echo PORT=5177
  )
)

echo [3/4] Launching API server (port 5177)...
start "Forge Server" cmd /k "cd /d .\server && npm run dev"

echo [4/4] Launching Vite web (port 5173)...
start "Forge Web" cmd /k "cd /d .\web && npm run dev"

REM (Optional) Open the web app after a short delay
timeout /t 3 >nul
start "" "http://127.0.0.1:5173/"

echo.
echo All set. Two terminals were opened:
echo   - "Forge Server" for the API (http://127.0.0.1:5177)
echo   - "Forge Web"    for Vite (http://127.0.0.1:5173)
echo.
endlocal
