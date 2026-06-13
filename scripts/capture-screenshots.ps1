$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$outputDir = Join-Path $root "docs\screenshots"
$edgeExeCandidates = @(
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Google\Chrome\Application\chrome.exe"
)

$browserExe = $edgeExeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $browserExe) {
  throw "No Chromium-based browser executable found."
}

$debugPort = 9222
$browserProfileDir = Join-Path $root ".local\browser-capture"

function Ensure-Directory {
  param([string]$Path)

  if (-not (Test-Path $Path)) {
    New-Item -ItemType Directory -Path $Path | Out-Null
  }
}

function Wait-ForHttpJson {
  param(
    [string]$Url,
    [int]$Retries = 30
  )

  for ($i = 0; $i -lt $Retries; $i++) {
    try {
      return Invoke-WebRequest -UseBasicParsing $Url -TimeoutSec 2
    }
    catch {
      Start-Sleep -Milliseconds 500
    }
  }

  throw "Timed out waiting for $Url"
}

function Get-DevSessionToken {
  $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
  $csrfResponse = Invoke-WebRequest -UseBasicParsing -WebSession $session "http://localhost:3004/api/auth/csrf"
  $csrfToken = ($csrfResponse.Content | ConvertFrom-Json).csrfToken

  Invoke-WebRequest `
    -UseBasicParsing `
    -WebSession $session `
    -Method Post `
    -Uri "http://localhost:3004/api/auth/callback/dev" `
    -Body @{
      csrfToken = $csrfToken
      email = "architect@seventec.dev"
      name = "SevenTec Architect"
      callbackUrl = "http://localhost:3004/dashboard"
      json = "true"
    } `
    -MaximumRedirection 0 `
    -ErrorAction SilentlyContinue *> $null

  $cookie = $session.Cookies.GetCookies("http://localhost:3004")["authjs.session-token"]
  if (-not $cookie) {
    throw "Could not acquire authjs.session-token"
  }

  return $cookie.Value
}

function Get-LatestRoutes {
  param([string]$SessionToken)

  $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
  $session.Cookies.Add((New-Object System.Net.Cookie("authjs.session-token", $SessionToken, "/", "localhost")))

  $dashboardHtml = (Invoke-WebRequest -UseBasicParsing -WebSession $session "http://localhost:3004/dashboard").Content

  $reportMatch = [regex]::Matches($dashboardHtml, 'href="([^"]*/reports/[^"?]+)"') | Select-Object -First 1
  if (-not $reportMatch) {
    return @{
      report = $null
      share = $null
    }
  }

  $reportPath = $reportMatch.Groups[1].Value

  return @{
    report = $reportPath
    share = "$reportPath?view=share"
  }
}

function Start-HeadlessBrowser {
  Ensure-Directory -Path $browserProfileDir

  Start-Process `
    -FilePath $browserExe `
    -ArgumentList "--headless --disable-gpu --remote-debugging-port=$debugPort --user-data-dir=""$browserProfileDir"" --window-size=1440,1400 --no-first-run --no-default-browser-check about:blank" `
    -WindowStyle Hidden | Out-Null

  Wait-ForHttpJson -Url "http://127.0.0.1:$debugPort/json/version" | Out-Null
}

function Stop-HeadlessBrowser {
  Get-Process | Where-Object {
    $_.ProcessName -in @("msedge", "chrome")
  } | Stop-Process -Force -ErrorAction SilentlyContinue
}

function Get-DebugWebSocketUrl {
  $newTab = Invoke-WebRequest -UseBasicParsing -Method Put "http://127.0.0.1:$debugPort/json/new?about:blank"
  $tab = $newTab.Content | ConvertFrom-Json
  return $tab.webSocketDebuggerUrl
}

function New-CdpSocket {
  param([string]$WebSocketUrl)

  $socket = [System.Net.WebSockets.ClientWebSocket]::new()
  $uri = [Uri]$WebSocketUrl
  $socket.ConnectAsync($uri, [Threading.CancellationToken]::None).GetAwaiter().GetResult() | Out-Null
  return $socket
}

function Send-CdpCommand {
  param(
    [System.Net.WebSockets.ClientWebSocket]$Socket,
    [int]$Id,
    [string]$Method,
    [hashtable]$Params = @{}
  )

  $payload = @{
    id = $Id
    method = $Method
    params = $Params
  } | ConvertTo-Json -Compress -Depth 10

  $bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
  $segment = [ArraySegment[byte]]::new($bytes)
  $Socket.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None).GetAwaiter().GetResult()

  while ($true) {
    $buffer = New-Object byte[] 262144
    $builder = New-Object System.Text.StringBuilder

    do {
      $receiveSegment = [ArraySegment[byte]]::new($buffer)
      $result = $Socket.ReceiveAsync($receiveSegment, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
      if ($result.Count -gt 0) {
        [void]$builder.Append([System.Text.Encoding]::UTF8.GetString($buffer, 0, $result.Count))
      }
    } until ($result.EndOfMessage)

    $message = $builder.ToString()
    if ([string]::IsNullOrWhiteSpace($message)) {
      continue
    }

    $parsed = $message | ConvertFrom-Json
    if ($parsed.id -eq $Id) {
      return $parsed
    }
  }
}

function Capture-Page {
  param(
    [System.Net.WebSockets.ClientWebSocket]$Socket,
    [string]$Url,
    [string]$OutputPath,
    [int]$StartId
  )

  $null = Send-CdpCommand -Socket $Socket -Id $StartId -Method "Page.navigate" -Params @{ url = $Url }
  Start-Sleep -Seconds 3

  $shot = Send-CdpCommand -Socket $Socket -Id ($StartId + 1) -Method "Page.captureScreenshot" -Params @{
    format = "png"
    captureBeyondViewport = $true
  }

  [System.IO.File]::WriteAllBytes($OutputPath, [Convert]::FromBase64String($shot.result.data))
}

Ensure-Directory -Path $outputDir

$sessionToken = Get-DevSessionToken
$routes = Get-LatestRoutes -SessionToken $sessionToken

try {
  Start-HeadlessBrowser
  $webSocketUrl = Get-DebugWebSocketUrl
  $socket = New-CdpSocket -WebSocketUrl $webSocketUrl

  $null = Send-CdpCommand -Socket $socket -Id 1 -Method "Page.enable"
  $null = Send-CdpCommand -Socket $socket -Id 2 -Method "Network.enable"
  $null = Send-CdpCommand -Socket $socket -Id 3 -Method "Emulation.setDeviceMetricsOverride" -Params @{
    width = 1440
    height = 1400
    deviceScaleFactor = 1
    mobile = $false
  }
  $null = Send-CdpCommand -Socket $socket -Id 4 -Method "Network.setCookie" -Params @{
    name = "authjs.session-token"
    value = $sessionToken
    domain = "localhost"
    path = "/"
    httpOnly = $true
    secure = $false
    sameSite = "Lax"
  }

  Capture-Page -Socket $socket -Url "http://localhost:3004/" -OutputPath (Join-Path $outputDir "marketing-home.png") -StartId 10
  Capture-Page -Socket $socket -Url "http://localhost:3004/sign-in" -OutputPath (Join-Path $outputDir "sign-in.png") -StartId 20
  Capture-Page -Socket $socket -Url "http://localhost:3004/dashboard" -OutputPath (Join-Path $outputDir "dashboard.png") -StartId 30

  if ($routes.report) {
    Capture-Page -Socket $socket -Url ("http://localhost:3004" + $routes.report) -OutputPath (Join-Path $outputDir "report-premium.png") -StartId 40
  }

  if ($routes.share) {
    Capture-Page -Socket $socket -Url ("http://localhost:3004" + $routes.share) -OutputPath (Join-Path $outputDir "report-share.png") -StartId 50
  }

  $socket.Dispose()
}
finally {
  Stop-HeadlessBrowser
}

Write-Host "Screenshots saved to $outputDir" -ForegroundColor Green
