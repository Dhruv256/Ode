@echo off
setlocal DisableDelayedExpansion
set "BIRTHDAY_WORLD_DIR=C:\Users\dhruv\OneDrive\Desktop\Projectzz\Birthday website generator"

if not exist "%BIRTHDAY_WORLD_DIR%\package.json" (
  echo Birthday World could not find its project folder:
  echo %BIRTHDAY_WORLD_DIR%
  pause
  exit /b 1
)

cd /d "%BIRTHDAY_WORLD_DIR%"
echo.
echo Clerk setup for Birthday World
echo Paste the keys from your Clerk Dashboard when prompted.
echo They will be saved only in this project's ignored .env.local file.
echo.

set /p "CLERK_PUBLISHABLE=NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "
set /p "CLERK_SECRET=CLERK_SECRET_KEY: "

if "%CLERK_PUBLISHABLE%"=="" (
  echo A publishable key is required.
  pause
  exit /b 1
)

if "%CLERK_SECRET%"=="" (
  echo A secret key is required.
  pause
  exit /b 1
)

> ".env.local" (
  echo NEXT_PUBLIC_CLERK_ENABLED=true
  echo NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=%CLERK_PUBLISHABLE%
  echo CLERK_SECRET_KEY=%CLERK_SECRET%
  echo NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
  echo NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
  echo NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
  echo NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
)

for /f %%P in ('powershell -NoProfile -Command "$port = 4010; while (Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue) { $port++ }; Write-Output $port"') do set "BIRTHDAY_WORLD_PORT=%%P"

echo.
echo Building Birthday World with Clerk enabled...
call npm run build
if errorlevel 1 (
  echo.
  echo The build did not complete. Share the error above if you need help.
  pause
  exit /b 1
)

start "Birthday World" http://localhost:%BIRTHDAY_WORLD_PORT%
echo.
echo Birthday World is running at http://localhost:%BIRTHDAY_WORLD_PORT%
echo Sign in from the top-right corner, then open /dashboard.
echo Keep this window open while you use the app.
echo.
call npm run start -- --port %BIRTHDAY_WORLD_PORT%
pause
