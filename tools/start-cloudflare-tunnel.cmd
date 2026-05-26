@echo off
setlocal

set "ROOT=%~dp0.."
set "CLOUDFLARED=%ROOT%\tools\cloudflared.exe"
set "CONFIG=%ROOT%\cloudflare\tunnel\config.yml"

if not exist "%CLOUDFLARED%" (
  echo cloudflared.exe was not found at:
  echo %CLOUDFLARED%
  echo.
  echo Please place cloudflared.exe in the tools folder first.
  exit /b 1
)

if not exist "%CONFIG%" (
  echo Cloudflare tunnel config was not found:
  echo %CONFIG%
  echo.
  echo Copy cloudflare\tunnel\config.example.yml to cloudflare\tunnel\config.yml
  echo then edit tunnel, credentials-file, and hostname.
  exit /b 1
)

"%CLOUDFLARED%" tunnel --config "%CONFIG%" run
