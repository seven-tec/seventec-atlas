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
$webUrl = "http://localhost:3004/sign-in"
$postgresStdout = Join-Path $root ".local\pg-e2e-out.log"
$postgresStderr = Join-Path $root ".local\pg-e2e-err.log"
$nextStdout = Join-Path $root ".local\next-e2e-out.log"
$nextStderr = Join-Path $root ".local\next-e2e-err.log"
$postgresProcess = $null
$nextProcess = $null
$usingDockerCompose = $false

function Test-CommandPath {
  param([string]$Path, [string]$Label)

  if (-not (Test-Path $Path)) {
    throw "$Label not found at $Path"
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
  param([int]$Retries = 25)

  for ($i = 0; $i -lt $Retries; $i++) {
    & $pgIsReadyExe -h $postgresHost -p $postgresPort *> $null

    if ($LASTEXITCODE -eq 0) {
      return $true
    }

    Start-Sleep -Seconds 1
  }

  return $false
}

function Wait-ForWeb {
  param([int]$Retries = 40)

  for ($i = 0; $i -lt $Retries; $i++) {
    try {
      $response = Invoke-WebRequest -UseBasicParsing $webUrl -TimeoutSec 5
      if ($response.StatusCode -eq 200) {
        return $true
      }
    }
    catch {
    }

    Start-Sleep -Seconds 1
  }

  return $false
}

try {
  Test-CommandPath -Path $npmCmd -Label "npm"

  if ((Test-Path $composeFile) -and (Test-Path $dbLocalScript) -and (Test-DockerComposeAvailable)) {
    Write-Host "Using Docker Compose PostgreSQL backend for E2E" -ForegroundColor Cyan
    & $dbLocalScript up
    $usingDockerCompose = $true
  }
  else {
    Test-CommandPath -Path $postgresExe -Label "PostgreSQL executable"
    Test-CommandPath -Path $pgIsReadyExe -Label "pg_isready"

    Remove-StalePostmasterPid -DataDir $postgresDataDir
    Remove-Item $postgresStdout,$postgresStderr,$nextStdout,$nextStderr -Force -ErrorAction SilentlyContinue

    $postgresArgs = "-D `"$postgresDataDir`" -p $postgresPort"
    $postgresProcess = Start-Process `
      -FilePath $postgresExe `
      -ArgumentList $postgresArgs `
      -RedirectStandardOutput $postgresStdout `
      -RedirectStandardError $postgresStderr `
      -PassThru

    if (-not (Wait-ForPostgres)) {
      if (Test-Path $postgresStderr) {
        Get-Content $postgresStderr | Write-Output
      }

      throw "PostgreSQL did not become ready on $postgresHost`:$postgresPort"
    }
  }

  $nextProcess = Start-Process `
    -FilePath $npmCmd `
    -ArgumentList "run dev -- --port 3004" `
    -WorkingDirectory $webDir `
    -RedirectStandardOutput $nextStdout `
    -RedirectStandardError $nextStderr `
    -PassThru

  if (-not (Wait-ForWeb)) {
    if (Test-Path $nextStdout) {
      Get-Content $nextStdout | Write-Output
    }

    if (Test-Path $nextStderr) {
      Get-Content $nextStderr | Write-Output
    }

    throw "apps/web did not become ready at $webUrl"
  }

  Push-Location $root
  & $npmCmd run test:e2e
}
finally {
  Pop-Location -ErrorAction SilentlyContinue

  if ($nextProcess -and -not $nextProcess.HasExited) {
    Stop-Process -Id $nextProcess.Id -Force -ErrorAction SilentlyContinue
  }

  if (-not $usingDockerCompose) {
    Get-Process postgres -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

    if (Test-Path (Join-Path $postgresDataDir "postmaster.pid")) {
      Remove-Item -LiteralPath (Join-Path $postgresDataDir "postmaster.pid") -Force -ErrorAction SilentlyContinue
    }
  }
}
