$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$composeFile = Join-Path $root "docker-compose.yml"
$webEnvPath = Join-Path $root "apps\web\.env.local"
$postgresDataDir = Join-Path $root ".local\postgres\data"
$postgresHost = "127.0.0.1"
$postgresPort = 5433
$webUrl = "http://localhost:3004/sign-in"
$containerName = "seventec-atlas-postgres"
$pgIsReadyExe = "C:\Program Files\PostgreSQL\18\bin\pg_isready.exe"

function Test-HttpOk {
  param([string]$Url)

  try {
    $response = Invoke-WebRequest -UseBasicParsing $Url -TimeoutSec 5
    return $response.StatusCode -eq 200
  }
  catch {
    return $false
  }
}

function Test-PortListening {
  param([int]$Port)

  $lines = netstat -ano | Select-String (":" + $Port)

  foreach ($line in $lines) {
    $parts = ($line.ToString() -split '\s+') | Where-Object { $_ }
    if ($parts.Count -ge 5 -and $parts[3] -eq "LISTENING") {
      return $true
    }
  }

  return $false
}

function Get-EnvMap {
  param([string]$Path)

  $map = @{}

  if (-not (Test-Path $Path)) {
    return $map
  }

  foreach ($line in Get-Content $Path) {
    if ($line -match '^\s*#' -or $line -match '^\s*$') {
      continue
    }

    $match = [regex]::Match($line, '^([A-Z0-9_]+)="?(.*?)"?$')
    if ($match.Success) {
      $map[$match.Groups[1].Value] = $match.Groups[2].Value
    }
  }

  return $map
}

function Get-Status {
  param(
    [string]$Name,
    [bool]$Ok,
    [string]$Details
  )

  [pscustomobject]@{
    check = $Name
    ok = $Ok
    details = $Details
  }
}

function Test-DockerComposeAvailable {
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    return $false
  }

  try {
    & docker compose version *> $null
    return $LASTEXITCODE -eq 0
  }
  catch {
    return $false
  }
}

function Get-DockerContainerHealth {
  try {
    $status = & docker inspect --format "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}" $containerName 2>$null
    return ($status | Select-Object -First 1).Trim()
  }
  catch {
    return $null
  }
}

$envMap = Get-EnvMap -Path $webEnvPath
$statuses = @()
$dockerComposeAvailable = Test-DockerComposeAvailable
$dockerComposeConfigured = Test-Path $composeFile
$dockerHealth = $null
$legacyPostgresAvailable = (Test-Path $postgresDataDir) -and (Test-Path $pgIsReadyExe)
$postgresMode = "unavailable"

if ($dockerComposeAvailable -and $dockerComposeConfigured) {
  $postgresMode = "docker"
  $dockerHealth = Get-DockerContainerHealth
}
elseif ($legacyPostgresAvailable) {
  $postgresMode = "legacy"
}

$statuses += Get-Status -Name "apps/web/.env.local exists" -Ok (Test-Path $webEnvPath) -Details $webEnvPath
$statuses += Get-Status -Name "docker-compose.yml exists" -Ok $dockerComposeConfigured -Details $composeFile
$statuses += Get-Status -Name "postgres backend mode" -Ok ($postgresMode -ne "unavailable") -Details $postgresMode

if ($postgresMode -eq "docker") {
  $statuses += Get-Status -Name "docker compose available" -Ok $true -Details "docker compose"
  $statuses += Get-Status -Name "postgres data dir exists (legacy fallback)" -Ok $true -Details "not required in docker mode"
  $statuses += Get-Status -Name "pg_isready available (legacy fallback)" -Ok $true -Details "not required in docker mode"
}
elseif ($postgresMode -eq "legacy") {
  $statuses += Get-Status -Name "docker compose available" -Ok $true -Details "not required in legacy mode"
  $statuses += Get-Status -Name "postgres data dir exists (legacy fallback)" -Ok (Test-Path $postgresDataDir) -Details $postgresDataDir
  $statuses += Get-Status -Name "pg_isready available (legacy fallback)" -Ok (Test-Path $pgIsReadyExe) -Details $pgIsReadyExe
}
else {
  $statuses += Get-Status -Name "docker compose available" -Ok $dockerComposeAvailable -Details "docker compose"
  $statuses += Get-Status -Name "postgres data dir exists (legacy fallback)" -Ok (Test-Path $postgresDataDir) -Details $postgresDataDir
  $statuses += Get-Status -Name "pg_isready available (legacy fallback)" -Ok (Test-Path $pgIsReadyExe) -Details $pgIsReadyExe
}
$statuses += Get-Status -Name "DATABASE_URL configured" -Ok ($envMap.ContainsKey("DATABASE_URL") -and $envMap["DATABASE_URL"].Length -gt 0) -Details ($envMap["DATABASE_URL"])
$statuses += Get-Status -Name "AUTH_SECRET configured" -Ok ($envMap.ContainsKey("AUTH_SECRET") -and $envMap["AUTH_SECRET"] -ne "replace-me") -Details "AUTH_SECRET present"
$statuses += Get-Status -Name "AI_PROVIDER configured" -Ok ($envMap.ContainsKey("AI_PROVIDER") -and $envMap["AI_PROVIDER"].Length -gt 0) -Details ($envMap["AI_PROVIDER"])
$statuses += Get-Status -Name "OPENROUTER_API_KEY configured" -Ok ($envMap.ContainsKey("OPENROUTER_API_KEY") -and $envMap["OPENROUTER_API_KEY"] -ne "replace-me") -Details "OPENROUTER_API_KEY present"
$statuses += Get-Status -Name "OPENROUTER_MODEL configured" -Ok ($envMap.ContainsKey("OPENROUTER_MODEL") -and $envMap["OPENROUTER_MODEL"].Length -gt 0) -Details ($envMap["OPENROUTER_MODEL"])
$statuses += Get-Status -Name "port 5433 listening" -Ok (Test-PortListening -Port $postgresPort) -Details "${postgresHost}:$postgresPort"
$statuses += Get-Status -Name "port 3004 listening" -Ok (Test-PortListening -Port 3004) -Details "localhost:3004"

if ($postgresMode -eq "docker") {
  if ([string]::IsNullOrWhiteSpace($dockerHealth)) {
    $dockerHealthDetails = "not-running"
  }
  else {
    $dockerHealthDetails = $dockerHealth
  }

  $statuses += Get-Status -Name "docker postgres healthy" -Ok ($dockerHealth -eq "healthy") -Details $dockerHealthDetails
}
elseif ($postgresMode -eq "legacy") {
  & $pgIsReadyExe -h $postgresHost -p $postgresPort *> $null
  $statuses += Get-Status -Name "postgres accepts connections" -Ok ($LASTEXITCODE -eq 0) -Details "${postgresHost}:$postgresPort"
}
else {
  $statuses += Get-Status -Name "postgres accepts connections" -Ok $false -Details "neither docker compose nor pg_isready available"
}

$statuses += Get-Status -Name "web sign-in responds" -Ok (Test-HttpOk -Url $webUrl) -Details $webUrl

$allOk = ($statuses | Where-Object { -not $_.ok }).Count -eq 0

foreach ($status in $statuses) {
  if ($status.ok) {
    $prefix = "[OK]"
    $color = "Green"
  }
  else {
    $prefix = "[FAIL]"
    $color = "Red"
  }

  Write-Host "$prefix $($status.check) - $($status.details)" -ForegroundColor $color
}

Write-Host ""
if ($allOk) {
  Write-Host "Local environment check passed." -ForegroundColor Green
  exit 0
}

Write-Host "Local environment check failed." -ForegroundColor Yellow
exit 1
