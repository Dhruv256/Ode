@echo off
setlocal
set "BIRTHDAY_WORLD_DIR=C:\Users\dhruv\OneDrive\Desktop\Projectzz\Birthday website generator"

if not exist "%BIRTHDAY_WORLD_DIR%\package.json" (
  echo Birthday World could not find its project folder.
  pause
  exit /b 1
)

cd /d "%BIRTHDAY_WORLD_DIR%"
echo.
echo Supabase database setup for Birthday World
echo First rotate the database password in Supabase Dashboard ^> Project Settings ^> Database.
echo This tool will encode the new password and create the correct Session Pooler URL.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$password = Read-Host 'Paste the NEW database password'; if ([string]::IsNullOrWhiteSpace($password)) { exit 1 }; $encoded = [uri]::EscapeDataString($password); $url = 'postgresql://postgres.kyddluhdgguwljohuufo:' + $encoded + '@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require'; $envPath = Join-Path (Get-Location) '.env.local'; $existing = if (Test-Path $envPath) { Get-Content $envPath | Where-Object { $_ -notmatch '^DATABASE_URL=' } } else { @() }; Set-Content -Path $envPath -Value @($existing + ('DATABASE_URL=' + $url)); Set-Clipboard -Value $url; Write-Host ''; Write-Host 'Done. A valid DATABASE_URL was written to .env.local and copied to your clipboard.'; Write-Host 'Paste it into Vercel as the Secret named DATABASE_URL.'"

if errorlevel 1 (
  echo.
  echo No database password was entered. Nothing was changed.
  pause
  exit /b 1
)

echo.
echo Next: paste the copied value into Vercel, then redeploy.
pause
