# install.ps1 - install errorsound for Windows PowerShell.
# Run from the project folder:  .\install.ps1

$ErrorActionPreference = "Stop"
$src  = $PSScriptRoot
$dest = Join-Path $HOME ".errorsound"
$markBegin = "# >>> errorsound >>>"
$markEnd   = "# <<< errorsound <<<"

Write-Host "Installing errorsound to $dest ..."
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Copy-Item (Join-Path $src "errorsound.ps1") (Join-Path $dest "errorsound.ps1") -Force

# Bundle the .wav sound if present.
$wav = Join-Path $src "sound.wav"
if (Test-Path $wav) {
    Copy-Item $wav (Join-Path $dest "sound.wav") -Force
    Write-Host "Bundled sound installed."
} else {
    Write-Host "No sound.wav bundled; will use system beep."
}

# Ensure the PowerShell profile exists.
if (-not (Test-Path $PROFILE)) {
    New-Item -ItemType File -Force -Path $PROFILE | Out-Null
}

$snippet = @"
$markBegin
`$env:ERROR_SOUND_HOME = Join-Path `$HOME ".errorsound"
. (Join-Path `$env:ERROR_SOUND_HOME "errorsound.ps1")
$markEnd
"@

$profileContent = Get-Content $PROFILE -Raw -ErrorAction SilentlyContinue
if ($profileContent -and $profileContent.Contains($markBegin)) {
    Write-Host "Already present in profile (skipping)."
} else {
    Add-Content -Path $PROFILE -Value "`n$snippet"
    Write-Host "Added errorsound to $PROFILE"
}

Write-Host ""
Write-Host "Done. Open a new PowerShell window, or run:  . `$PROFILE"
Write-Host "Commands: soundon | soundoff | soundstatus | soundfile <path>"
Write-Host ""
Write-Host "If you get a script execution error, run once (as your user):"
Write-Host "  Set-ExecutionPolicy -Scope CurrentUser RemoteSigned"
