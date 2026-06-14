$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$npmCmd = "C:\Program Files\nodejs\npm.cmd"
$dbLocalScript = Join-Path $PSScriptRoot "db-local.ps1"
$webEnvPath = Join-Path $root "apps\web\.env.local"

function Test-CommandPath {
  param([string]$Path, [string]$Label)

  if (-not (Test-Path $Path)) {
    throw "$Label not found at $Path"
  }
}

try {
  Test-CommandPath -Path $npmCmd -Label "npm"
  Test-CommandPath -Path $dbLocalScript -Label "db-local.ps1"

  if (-not (Test-Path $webEnvPath)) {
    throw "Expected env file not found at $webEnvPath"
  }

  Write-Host "Starting local PostgreSQL backend..." -ForegroundColor Cyan
  & $dbLocalScript up

  Push-Location $root

  Write-Host "Generating Prisma client..." -ForegroundColor Cyan
  & $npmCmd run db:generate

  Write-Host "Applying committed Prisma migrations..." -ForegroundColor Cyan
  & $npmCmd run db:migrate:deploy

  Write-Host "Local stack preparation completed." -ForegroundColor Green
}
finally {
  Pop-Location -ErrorAction SilentlyContinue
}
