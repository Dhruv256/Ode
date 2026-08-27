@echo off
set "BIRTHDAY_WORLD_DIR=C:\Users\dhruv\OneDrive\Desktop\Projectzz\Birthday website generator"
if not exist "%BIRTHDAY_WORLD_DIR%\package.json" (
  echo Birthday World could not find its project folder:
  echo %BIRTHDAY_WORLD_DIR%
  echo.
  pause
  exit /b 1
)
cd /d "%BIRTHDAY_WORLD_DIR%"
for /f %%P in ('powershell -NoProfile -Command "$port = 4010; while (Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue) { $port++ }; Write-Output $port"') do set "BIRTHDAY_WORLD_PORT=%%P"
echo.
echo Building Birthday World. This can take a moment.
echo It will open on http://localhost:%BIRTHDAY_WORLD_PORT%
echo.
call npm run build
if errorlevel 1 (
  echo.
  echo The build did not complete. Keep this window open and share the message above.
  pause
  exit /b 1
)
start "Birthday World" http://localhost:%BIRTHDAY_WORLD_PORT%
echo.
echo Birthday World is running at http://localhost:%BIRTHDAY_WORLD_PORT%
echo Keep this window open while you use the app.
echo.
call npm run start -- --port %BIRTHDAY_WORLD_PORT%
pause
