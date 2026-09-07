$ProjectRoot = Split-Path -Parent $PSScriptRoot
$NodePath = "C:\Users\David\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
$DashboardScript = Join-Path $ProjectRoot "scripts\analytics-dashboard.mjs"
$LogDirectory = Join-Path $ProjectRoot "logs"
$WatchdogLog = Join-Path $LogDirectory "analytics-watchdog.log"

if (-not (Test-Path $LogDirectory)) {
  New-Item -ItemType Directory -Path $LogDirectory | Out-Null
}

if (-not (Test-Path $NodePath)) {
  $NodeCommand = Get-Command node -ErrorAction SilentlyContinue
  if ($NodeCommand) {
    $NodePath = $NodeCommand.Source
  }
}

function Write-WatchdogLog($Message) {
  $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  "$Timestamp $Message" | Out-File -FilePath $WatchdogLog -Append
}

Write-WatchdogLog "Watchdog started."

while ($true) {
  $running = Get-NetTCPConnection -LocalPort 4310 -ErrorAction SilentlyContinue

  if (-not $running) {
    if (Test-Path $NodePath) {
      $ProcessInfo = New-Object System.Diagnostics.ProcessStartInfo
      $ProcessInfo.FileName = $NodePath
      $ProcessInfo.Arguments = "`"$DashboardScript`""
      $ProcessInfo.WorkingDirectory = $ProjectRoot
      $ProcessInfo.CreateNoWindow = $true
      $ProcessInfo.UseShellExecute = $false

      [System.Diagnostics.Process]::Start($ProcessInfo) | Out-Null
      Write-WatchdogLog "Started analytics dashboard."
    } else {
      Write-WatchdogLog "Node.js was not found."
    }
  }

  Start-Sleep -Seconds 60
}
