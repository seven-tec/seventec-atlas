$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$npmCmd = "C:\Program Files\nodejs\npm.cmd"
$prepareScript = Join-Path $PSScriptRoot "local-prepare.ps1"
$devLocalScript = Join-Path $PSScriptRoot "dev-local.ps1"

function Test-CommandPath {
  param([string]$Path, [string]$Label)

  if (-not (Test-Path $Path)) {
    throw "$Label not found at $Path"
  }
}

try {
  Test-CommandPath -Path $npmCmd -Label "npm"
  Test-CommandPath -Path $prepareScript -Label "local-prepare.ps1"
  Test-CommandPath -Path $devLocalScript -Label "dev-local.ps1"

  Write-Host "Preparing local stack for demo mode..." -ForegroundColor Cyan
  & $prepareScript

  Push-Location $root
  Write-Host "Seeding flagship demo workspace..." -ForegroundColor Cyan
  & $npmCmd run demo:seed
}
finally {
  Pop-Location -ErrorAction SilentlyContinue
}

Write-Host "Starting SevenTec Atlas demo on http://localhost:3004" -ForegroundColor Green
& $devLocalScript
