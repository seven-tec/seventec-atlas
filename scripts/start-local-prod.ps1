$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$webDir = Join-Path $root "apps\web"
$npmCmd = "C:\Program Files\nodejs\npm.cmd"
$prepareScript = Join-Path $PSScriptRoot "local-prepare.ps1"

function Test-CommandPath {
  param([string]$Path, [string]$Label)

  if (-not (Test-Path $Path)) {
    throw "$Label not found at $Path"
  }
}

function Stop-LocalWeb {
  $lines = netstat -ano | Select-String ':3004'
  $pids = @()

  foreach ($line in $lines) {
    $parts = ($line.ToString() -split '\s+') | Where-Object { $_ }
    if ($parts.Count -ge 5 -and $parts[3] -eq 'LISTENING') {
      $pids += $parts[4]
    }
  }

  foreach ($webPid in ($pids | Select-Object -Unique)) {
    Stop-Process -Id ([int]$webPid) -Force -ErrorAction SilentlyContinue
  }
}

try {
  Test-CommandPath -Path $npmCmd -Label "npm"
  Test-CommandPath -Path $prepareScript -Label "local-prepare.ps1"

  Write-Host "Preparing local production-like stack..." -ForegroundColor Cyan
  & $prepareScript

  Write-Host "Ensuring port 3004 is free..." -ForegroundColor Cyan
  Stop-LocalWeb

  Push-Location $root
  Write-Host "Building Next.js app..." -ForegroundColor Cyan
  & $npmCmd run build

  Push-Location $webDir
  Write-Host "Starting production-like server on http://localhost:3004" -ForegroundColor Green
  & $npmCmd run start
}
finally {
  Pop-Location -ErrorAction SilentlyContinue
  Pop-Location -ErrorAction SilentlyContinue
}
