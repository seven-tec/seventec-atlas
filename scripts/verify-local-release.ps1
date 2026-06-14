$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$npmCmd = "C:\Program Files\nodejs\npm.cmd"
$landingUrl = "http://localhost:3004/"
$signInUrl = "http://localhost:3004/sign-in"
$reportImageEnUrl = "http://localhost:3004/images/marketing/report-proof-en.png"
$reportImageEsUrl = "http://localhost:3004/images/marketing/report-proof-es.png"
$smokeSpec = "tests/e2e/local-release-smoke.spec.ts"

function Test-CommandPath {
  param([string]$Path, [string]$Label)

  if (-not (Test-Path $Path)) {
    throw "$Label not found at $Path"
  }
}

function Invoke-RequiredPage {
  param(
    [string]$Url,
    [string]$ExpectedText
  )

  $response = Invoke-WebRequest -UseBasicParsing $Url -TimeoutSec 10

  if ($response.StatusCode -lt 200 -or $response.StatusCode -ge 400) {
    throw "Unexpected HTTP status $($response.StatusCode) for $Url"
  }

  if (-not [string]::IsNullOrWhiteSpace($ExpectedText) -and $response.Content -notmatch [regex]::Escape($ExpectedText)) {
    throw "Expected text '$ExpectedText' was not found in $Url"
  }

  return $response.StatusCode
}

function Invoke-RequiredAsset {
  param([string]$Url)

  $response = Invoke-WebRequest -UseBasicParsing $Url -TimeoutSec 10

  if ($response.StatusCode -lt 200 -or $response.StatusCode -ge 400) {
    throw "Unexpected HTTP status $($response.StatusCode) for $Url"
  }

  return $response.StatusCode
}

$checks = @(
  @{ Name = "Landing responds"; Action = { Invoke-RequiredPage -Url $landingUrl -ExpectedText "SevenTec Atlas" } },
  @{ Name = "Sign-in responds"; Action = { Invoke-RequiredPage -Url $signInUrl -ExpectedText "Sign in" } },
  @{ Name = "Marketing report proof EN asset responds"; Action = { Invoke-RequiredAsset -Url $reportImageEnUrl } },
  @{ Name = "Marketing report proof ES asset responds"; Action = { Invoke-RequiredAsset -Url $reportImageEsUrl } }
)

foreach ($check in $checks) {
  try {
    $status = & $check.Action
    Write-Host "[OK] $($check.Name) - HTTP $status" -ForegroundColor Green
  }
  catch {
    Write-Host "[FAIL] $($check.Name) - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
  }
}

Write-Host ""
Write-Host "Running Playwright local release smoke..." -ForegroundColor Cyan

try {
  Test-CommandPath -Path $npmCmd -Label "npm"

  Push-Location $root
  & $npmCmd run test:e2e -- $smokeSpec --project=edge
}
finally {
  Pop-Location -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Local release verification passed." -ForegroundColor Green
