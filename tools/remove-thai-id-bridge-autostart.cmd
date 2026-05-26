@echo off
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -Command "Unregister-ScheduledTask -TaskName 'G-HUB Thai ID Bridge' -Confirm:$false; Write-Host 'Removed: G-HUB Thai ID Bridge'"
