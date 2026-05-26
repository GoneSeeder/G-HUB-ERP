$ErrorActionPreference = "Stop"

$taskName = "G-HUB Thai ID Bridge"
$scriptPath = Join-Path $PSScriptRoot "thai-id-bridge.ps1"

if (-not (Test-Path -LiteralPath $scriptPath)) {
  throw "Thai ID bridge script not found: $scriptPath"
}

$action = New-ScheduledTaskAction `
  -Execute "powershell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$scriptPath`""

$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -ExecutionTimeLimit (New-TimeSpan -Days 0)

Register-ScheduledTask `
  -TaskName $taskName `
  -Action $action `
  -Trigger $trigger `
  -Settings $settings `
  -Description "Starts the local G-HUB Thai ID card bridge at Windows login." `
  -Force | Out-Null

Start-ScheduledTask -TaskName $taskName
Write-Host "Installed and started: $taskName"
