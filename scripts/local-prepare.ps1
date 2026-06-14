$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$npmCmd = "C:\Program Files\nodejs\npm.cmd"
$dbLocalScript = Join-Path $PSScriptRoot "db-local.ps1"
$webEnvPath = Join-Path $root "apps\web\.env.local"
$composeFile = Join-Path $root "docker-compose.yml"
$postgresDataDir = Join-Path $root ".local\postgres\data"
$postgresExe = "C:\Program Files\PostgreSQL\18\bin\postgres.exe"
$pgCtlExe = "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe"
$pgIsReadyExe = "C:\Program Files\PostgreSQL\18\bin\pg_isready.exe"
$postgresPort = 5433
$postgresHost = "127.0.0.1"
$postgresStdout = Join-Path $root ".local\pg-prepare-out.log"
$postgresStderr = Join-Path $root ".local\pg-prepare-err.log"

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

function Wait-ForPostgres {
  param([int]$Retries = 20)

  for ($i = 0; $i -lt $Retries; $i++) {
    & $pgIsReadyExe -h $postgresHost -p $postgresPort *> $null

    if ($LASTEXITCODE -eq 0) {
      return $true
    }

    Start-Sleep -Seconds 1
  }

  return $false
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

function Start-LegacyPostgres {
  Test-CommandPath -Path $postgresExe -Label "postgres executable"
  Test-CommandPath -Path $pgIsReadyExe -Label "pg_isready"

  if (-not (Test-Path $postgresDataDir)) {
    throw "Legacy PostgreSQL data directory not found at $postgresDataDir"
  }

  if (Wait-ForPostgres -Retries 1) {
    Write-Host "Legacy PostgreSQL already running on $postgresHost`:$postgresPort" -ForegroundColor Green
    return
  }

  Remove-StalePostmasterPid -DataDir $postgresDataDir

  Remove-Item $postgresStdout,$postgresStderr -Force -ErrorAction SilentlyContinue

  $postgresArgs = "-D `"$postgresDataDir`" -p $postgresPort"
  Start-Process `
    -FilePath $postgresExe `
    -ArgumentList $postgresArgs `
    -RedirectStandardOutput $postgresStdout `
    -RedirectStandardError $postgresStderr `
    -WindowStyle Hidden | Out-Null

  if (-not (Wait-ForPostgres)) {
    if (Test-Path $postgresStderr) {
      Get-Content $postgresStderr | Write-Output
    }
    throw "Legacy PostgreSQL did not become ready on $postgresHost`:$postgresPort"
  }

  Write-Host "Legacy PostgreSQL started on $postgresHost`:$postgresPort" -ForegroundColor Green
}

try {
  Test-CommandPath -Path $npmCmd -Label "npm"

  if (-not (Test-Path $webEnvPath)) {
    throw "Expected env file not found at $webEnvPath"
  }

  if ((Test-Path $composeFile) -and (Test-Path $dbLocalScript) -and (Test-DockerComposeUsable)) {
    Write-Host "Starting Docker Compose PostgreSQL backend..." -ForegroundColor Cyan
    & $dbLocalScript up
  }
  else {
    Write-Host "Starting legacy PostgreSQL backend..." -ForegroundColor Cyan
    Start-LegacyPostgres
  }

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
