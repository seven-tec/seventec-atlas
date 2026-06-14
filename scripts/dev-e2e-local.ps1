$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$webDir = Join-Path $root "apps\web"
$dbLocalScript = Join-Path $PSScriptRoot "db-local.ps1"
$composeFile = Join-Path $root "docker-compose.yml"
$postgresDataDir = Join-Path $root ".local\postgres\data"
$postgresExe = "C:\Program Files\PostgreSQL\18\bin\postgres.exe"
$pgIsReadyExe = "C:\Program Files\PostgreSQL\18\bin\pg_isready.exe"
$npmCmd = "C:\Program Files\nodejs\npm.cmd"
$postgresPort = 5433
$postgresHost = "127.0.0.1"
$startedPostgres = $false
$postgresProcess = $null
$postgresStdout = Join-Path $root ".local\pg-e2e-out.log"
$postgresStderr = Join-Path $root ".local\pg-e2e-err.log"

function Test-CommandPath {
  param([string]$Path, [string]$Label)

  if (-not (Test-Path $Path)) {
    throw "$Label not found at $Path"
  }
}

function Test-DockerComposeUsable {
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    return $false
  }

  try {
    & docker info *> $null
    return $LASTEXITCODE -eq 0
  }
  catch {
    return $false
  }
}

function Remove-StalePostmasterPid {
  param([string]$DataDir)

  $pidFile = Join-Path $DataDir "postmaster.pid"

  if (-not (Test-Path $pidFile)) {
    return
  }

  $pidLine = Get-Content $pidFile -TotalCount 1 -ErrorAction SilentlyContinue
  $isLive = $false

  if ($pidLine -match "^\d+$") {
    $isLive = $null -ne (Get-Process -Id ([int]$pidLine) -ErrorAction SilentlyContinue)
  }

  if (-not $isLive) {
    Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
  }
}

function Wait-ForPostgres {
  param([string]$PgHost, [int]$Port, [int]$Retries = 20)

  for ($i = 0; $i -lt $Retries; $i++) {
    & $pgIsReadyExe -h $PgHost -p $Port *> $null

    if ($LASTEXITCODE -eq 0) {
      return $true
    }

    Start-Sleep -Seconds 1
  }

  return $false
}

function Start-LocalPostgresForE2E {
  Test-CommandPath -Path $postgresExe -Label "PostgreSQL executable"
  Test-CommandPath -Path $pgIsReadyExe -Label "pg_isready"

  if (-not (Test-Path $postgresDataDir)) {
    throw "PostgreSQL data directory not found at $postgresDataDir"
  }

  if (Wait-ForPostgres -PgHost $postgresHost -Port $postgresPort -Retries 1) {
    Write-Host "PostgreSQL already running on $postgresHost`:$postgresPort" -ForegroundColor Green
    return
  }

  Remove-StalePostmasterPid -DataDir $postgresDataDir
  Remove-Item $postgresStdout,$postgresStderr -Force -ErrorAction SilentlyContinue

  $postgresArgs = "-D `"$postgresDataDir`" -p $postgresPort"
  $script:postgresProcess = Start-Process `
    -FilePath $postgresExe `
    -ArgumentList $postgresArgs `
    -RedirectStandardOutput $postgresStdout `
    -RedirectStandardError $postgresStderr `
    -PassThru

  if (-not (Wait-ForPostgres -PgHost $postgresHost -Port $postgresPort -Retries 25)) {
    if ($script:postgresProcess -and -not $script:postgresProcess.HasExited) {
      Stop-Process -Id $script:postgresProcess.Id -Force -ErrorAction SilentlyContinue
    }

    if (Test-Path $postgresStderr) {
      Get-Content $postgresStderr | Write-Output
    }

    throw "PostgreSQL did not become ready on $postgresHost`:$postgresPort"
  }

  $script:startedPostgres = $true
  Write-Host "PostgreSQL started on $postgresHost`:$postgresPort" -ForegroundColor Green
}

try {
  Test-CommandPath -Path $npmCmd -Label "npm"

  if ((Test-Path $composeFile) -and (Test-Path $dbLocalScript) -and (Test-DockerComposeUsable)) {
    Write-Host "Using Docker Compose PostgreSQL backend for E2E" -ForegroundColor Cyan
    & $dbLocalScript up
  }
  else {
    Start-LocalPostgresForE2E
  }

  Write-Host "Starting apps/web on http://localhost:3004 for E2E" -ForegroundColor Cyan
  Push-Location $webDir
  & $npmCmd run dev -- --port 3004
}
finally {
  Pop-Location -ErrorAction SilentlyContinue

  if ($startedPostgres -and $postgresProcess -and -not $postgresProcess.HasExited) {
    Write-Host "Stopping local PostgreSQL..." -ForegroundColor Yellow
    Stop-Process -Id $postgresProcess.Id -Force -ErrorAction SilentlyContinue
  }
}
