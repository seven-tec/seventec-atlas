$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$webDir = Join-Path $root "apps\web"
$dbLocalScript = Join-Path $PSScriptRoot "db-local.ps1"
$composeFile = Join-Path $root "docker-compose.yml"
$postgresDataDir = Join-Path $root ".local\postgres\data"
$postgresExe = "C:\Program Files\PostgreSQL\18\bin\postgres.exe"
$pgCtlExe = "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe"
$pgIsReadyExe = "C:\Program Files\PostgreSQL\18\bin\pg_isready.exe"
$npmCmd = "C:\Program Files\nodejs\npm.cmd"
$postgresPort = 5433
$postgresHost = "127.0.0.1"
$startedPostgres = $false

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
    Remove-Item -LiteralPath $pidFile -Force
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

function Start-LocalPostgres {
  Test-CommandPath -Path $postgresExe -Label "PostgreSQL executable"
  Test-CommandPath -Path $pgCtlExe -Label "pg_ctl"
  Test-CommandPath -Path $pgIsReadyExe -Label "pg_isready"

  if (-not (Test-Path $postgresDataDir)) {
    throw "PostgreSQL data directory not found at $postgresDataDir"
  }

  if (Wait-ForPostgres -PgHost $postgresHost -Port $postgresPort -Retries 1) {
    Write-Host "PostgreSQL already running on $postgresHost`:$postgresPort" -ForegroundColor Green
    return
  }

  Remove-StalePostmasterPid -DataDir $postgresDataDir

  & $pgCtlExe start -D $postgresDataDir -o "`"-p $postgresPort`"" *> $null

  if (-not (Wait-ForPostgres -PgHost $postgresHost -Port $postgresPort)) {
    & $pgCtlExe stop -D $postgresDataDir -m fast *> $null

    throw "PostgreSQL did not become ready on $postgresHost`:$postgresPort"
  }

  $script:startedPostgres = $true
  Write-Host "PostgreSQL started on $postgresHost`:$postgresPort" -ForegroundColor Green
}

try {
  Test-CommandPath -Path $npmCmd -Label "npm"

  if ((Test-Path $composeFile) -and (Test-Path $dbLocalScript) -and (Test-DockerComposeUsable)) {
    Write-Host "Using Docker Compose PostgreSQL backend" -ForegroundColor Cyan
    & $dbLocalScript up
  }
  else {
    Start-LocalPostgres
  }

  Write-Host "Starting apps/web on http://localhost:3004" -ForegroundColor Cyan
  Push-Location $webDir
  & $npmCmd run dev -- --port 3004
}
finally {
  Pop-Location -ErrorAction SilentlyContinue

  if ($startedPostgres) {
    Write-Host "Stopping local PostgreSQL..." -ForegroundColor Yellow
    & $pgCtlExe stop -D $postgresDataDir -m fast *> $null
  }
}
