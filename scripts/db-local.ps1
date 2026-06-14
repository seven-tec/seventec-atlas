param(
  [ValidateSet("up", "down", "restart", "status", "logs")]
  [string]$Action = "up"
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$composeFile = Join-Path $root "docker-compose.yml"
$containerName = "seventec-atlas-postgres"
$postgresPort = 5433
$postgresHost = "127.0.0.1"

function Test-CommandAvailable {
  param([string]$Name)

  return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Get-ComposeMode {
  if (Test-CommandAvailable "docker") {
    try {
      & docker compose version *> $null
      if ($LASTEXITCODE -eq 0) {
        return "docker"
      }
    }
    catch {
    }
  }

  if (Test-CommandAvailable "docker-compose") {
    try {
      & docker-compose version *> $null
      if ($LASTEXITCODE -eq 0) {
        return "docker-compose"
      }
    }
    catch {
    }
  }

  throw "Docker Compose is not available. Install Docker Desktop (or docker-compose) to use the portable local database flow."
}

function Invoke-Compose {
  param([string[]]$Args)

  if (-not (Test-Path $composeFile)) {
    throw "docker-compose.yml not found at $composeFile"
  }

  $mode = Get-ComposeMode

  if ($mode -eq "docker") {
    & docker compose -f $composeFile @Args
    return
  }

  & docker-compose -f $composeFile @Args
}

function Get-ContainerHealth {
  try {
    $status = & docker inspect --format "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}" $containerName 2>$null
    return ($status | Select-Object -First 1).Trim()
  }
  catch {
    return $null
  }
}

function Wait-ForHealthy {
  param([int]$Retries = 24)

  for ($i = 0; $i -lt $Retries; $i++) {
    $health = Get-ContainerHealth

    if ($health -eq "healthy") {
      return $true
    }

    Start-Sleep -Seconds 2
  }

  return $false
}

switch ($Action) {
  "up" {
    Write-Host "Starting PostgreSQL via Docker Compose..." -ForegroundColor Cyan
    Invoke-Compose -Args @("up", "-d", "postgres")

    if (-not (Wait-ForHealthy)) {
      Write-Host "PostgreSQL container logs:" -ForegroundColor Yellow
      Invoke-Compose -Args @("logs", "--tail", "80", "postgres")
      throw "PostgreSQL container did not become healthy on $postgresHost`:$postgresPort"
    }

    Write-Host "PostgreSQL is ready on $postgresHost`:$postgresPort" -ForegroundColor Green
    Write-Host "DATABASE_URL=postgresql://atlas:atlasdev@$postgresHost`:$postgresPort/seventec_atlas" -ForegroundColor DarkGray
  }
  "down" {
    Write-Host "Stopping PostgreSQL container..." -ForegroundColor Yellow
    Invoke-Compose -Args @("stop", "postgres")
  }
  "restart" {
    Write-Host "Restarting PostgreSQL container..." -ForegroundColor Cyan
    Invoke-Compose -Args @("restart", "postgres")

    if (-not (Wait-ForHealthy)) {
      Write-Host "PostgreSQL container logs:" -ForegroundColor Yellow
      Invoke-Compose -Args @("logs", "--tail", "80", "postgres")
      throw "PostgreSQL container did not become healthy after restart."
    }

    Write-Host "PostgreSQL is healthy again." -ForegroundColor Green
  }
  "status" {
    Invoke-Compose -Args @("ps", "postgres")
  }
  "logs" {
    Invoke-Compose -Args @("logs", "--tail", "120", "postgres")
  }
}
