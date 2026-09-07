$ProjectRoot = Split-Path -Parent $PSScriptRoot
$LogDirectory = Join-Path $ProjectRoot "logs"
$NodePath = "C:\Users\David\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$DashboardScript = Join-Path $ProjectRoot "scripts\analytics-dashboard.mjs"
$OutLog = Join-Path $LogDirectory "analytics-dashboard.out.log"
$ErrLog = Join-Path $LogDirectory "analytics-dashboard.err.log"

if (-not (Test-Path $LogDirectory)) {
  New-Item -ItemType Directory -Path $LogDirectory | Out-Null
}

$running = Get-NetTCPConnection -LocalPort 4310 -ErrorAction SilentlyContinue
if ($running) {
  exit 0
}

if (-not (Test-Path $NodePath)) {
  $NodeCommand = Get-Command node -ErrorAction SilentlyContinue
  if ($NodeCommand) {
    $NodePath = $NodeCommand.Source
  }
}

if (-not (Test-Path $NodePath)) {
  "Node.js was not found." | Out-File -FilePath $ErrLog -Append
  exit 1
}

Set-Location $ProjectRoot
& $NodePath $DashboardScript >> $OutLog 2>> $ErrLog
