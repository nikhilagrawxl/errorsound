# errorsound.ps1 - play a sound when a command fails, for Windows PowerShell.
# Sourced from your PowerShell profile by install.ps1.
#
# Config:
#   $env:ERROR_SOUND       "1" = enabled, "0" = disabled   (default "1")
#   $env:ERROR_SOUND_FILE  path to a .wav file to play      (default bundled sound)
#
# Runtime commands: soundon | soundoff | soundstatus | soundfile <path>

if (-not $env:ERROR_SOUND) { $env:ERROR_SOUND = "1" }

# Default sound: bundled sound.wav in the install dir, else Windows system beep.
if (-not $env:ERROR_SOUND_FILE) {
    $home_dir = if ($env:ERROR_SOUND_HOME) { $env:ERROR_SOUND_HOME } else { Join-Path $HOME ".errorsound" }
    $bundled  = Join-Path $home_dir "sound.wav"
    if (Test-Path $bundled) { $env:ERROR_SOUND_FILE = $bundled }
}

function global:__es_play {
    if ($env:ERROR_SOUND_FILE -and (Test-Path $env:ERROR_SOUND_FILE)) {
        try {
            $player = New-Object System.Media.SoundPlayer $env:ERROR_SOUND_FILE
            $player.Play()   # async; returns immediately
        } catch {
            [console]::beep(800, 300)
        }
    } else {
        [console]::beep(800, 300)   # fallback beep
    }
}

# The prompt hook: PowerShell calls prompt() before each input line.
# We wrap the existing prompt so we don't clobber a custom one.
if (-not (Test-Path Function:\__es_original_prompt)) {
    Copy-Item Function:\prompt Function:\__es_original_prompt -ErrorAction SilentlyContinue
}

function global:prompt {
    $ok = $?                      # success of the last command
    $code = $LASTEXITCODE         # exit code of last native command
    if ($env:ERROR_SOUND -eq "1") {
        if ((-not $ok) -or ($null -ne $code -and $code -ne 0)) {
            __es_play
        }
    }
    if (Test-Path Function:\__es_original_prompt) {
        __es_original_prompt
    } else {
        "PS $($executionContext.SessionState.Path.CurrentLocation)$('>' * ($nestedPromptLevel + 1)) "
    }
}

function global:soundon     { $env:ERROR_SOUND = "1"; Write-Host "error sound ON" }
function global:soundoff    { $env:ERROR_SOUND = "0"; Write-Host "error sound OFF" }
function global:soundstatus {
    if ($env:ERROR_SOUND -eq "1") { Write-Host "error sound: ON" } else { Write-Host "error sound: OFF" }
    Write-Host "sound file: $env:ERROR_SOUND_FILE"
}
function global:soundfile {
    param([string]$path)
    if (-not $path)            { Write-Host "usage: soundfile <path-to-.wav>"; return }
    if (-not (Test-Path $path)){ Write-Host "file not found: $path"; return }
    $env:ERROR_SOUND_FILE = (Resolve-Path $path).Path
    Write-Host "sound file set to: $env:ERROR_SOUND_FILE"
}
