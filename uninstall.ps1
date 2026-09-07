# uninstall.ps1 - remove errorsound from Windows PowerShell.
# Run from the project folder:  .\uninstall.ps1

$ErrorActionPreference = "Stop"
$dest = Join-Path $HOME ".errorsound"
$markBegin = "# >>> errorsound >>>"
$markEnd   = "# <<< errorsound <<<"

if (Test-Path $PROFILE) {
    $lines = Get-Content $PROFILE
    $out = New-Object System.Collections.Generic.List[string]
    $skip = $false
    foreach ($line in $lines) {
        if ($line -match [regex]::Escape($markBegin)) { $skip = $true; continue }
        if ($line -match [regex]::Escape($markEnd))   { $skip = $false; continue }
        if (-not $skip) { $out.Add($line) }
    }
    Set-Content -Path $PROFILE -Value $out
    Write-Host "Removed errorsound from $PROFILE"
} else {
    Write-Host "No PowerShell profile found (skipping)."
}

if (Test-Path $dest) {
    Remove-Item -Recurse -Force $dest
    Write-Host "Deleted $dest"
}

Write-Host "Uninstalled. Open a new PowerShell window for it to take effect."
