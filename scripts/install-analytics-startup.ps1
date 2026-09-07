$ProjectRoot = Split-Path -Parent $PSScriptRoot
$VbsLauncher = Join-Path $ProjectRoot "scripts\run-analytics-watchdog.vbs"
$StartupFolder = [Environment]::GetFolderPath("Startup")
$ShortcutPath = Join-Path $StartupFolder "Bergen Volunteer Connect Analytics.lnk"
$WScriptPath = "$env:SystemRoot\System32\wscript.exe"

$Shell = New-Object -ComObject WScript.Shell
$Shortcut = $Shell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $WScriptPath
$Shortcut.Arguments = "`"$VbsLauncher`""
$Shortcut.WorkingDirectory = $ProjectRoot
$Shortcut.Description = "Starts the private Bergen Volunteer Connect analytics dashboard."
$Shortcut.Save()

& $WScriptPath $VbsLauncher

Write-Output "Installed startup shortcut: $ShortcutPath"
Write-Output "Dashboard URL: http://localhost:4310"
