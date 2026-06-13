$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$devLocalScript = Join-Path $PSScriptRoot "dev-local.ps1"
$postgresDataDir = Join-Path $root ".local\postgres\data"
$pgCtlExe = "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe"

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
    Write-Host "Stopping web process PID $webPid" -ForegroundColor Yellow
    Stop-Process -Id ([int]$webPid) -Force -ErrorAction SilentlyContinue
  }
}

function Stop-LocalPostgres {
  if (-not (Test-Path $postgresDataDir)) {
    return
  }

  if (-not (Test-Path $pgCtlExe)) {
    return
  }

  & $pgCtlExe status -D $postgresDataDir *> $null
  if ($LASTEXITCODE -eq 0) {
    Write-Host "Stopping PostgreSQL via pg_ctl" -ForegroundColor Yellow
    & $pgCtlExe stop -D $postgresDataDir -m fast *> $null
    Start-Sleep -Seconds 2
  }
}

Stop-LocalWeb
Stop-LocalPostgres

Write-Host "Restarting local stack..." -ForegroundColor Cyan
& $devLocalScript
