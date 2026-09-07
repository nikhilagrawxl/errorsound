#!/usr/bin/env bash
# errorsound.sh - play a sound when a shell command fails (non-zero exit).
# Works in both bash and zsh. Sourced from your shell rc file by the installer.
#
# State is read from a shared config file so a GUI (menu bar app) can control it:
#   $ERROR_SOUND_HOME/config   (default: ~/.errorsound/config)
#     enabled=1                 1 = on, 0 = off
#     sound=/absolute/path.mp3  audio file to play
#
# Runtime commands: soundon | soundoff | soundstatus | soundfile <path>
# These update the config file so the menu bar app stays in sync.

: "${ERROR_SOUND_HOME:=$HOME/.errorsound}"
export ERROR_SOUND_HOME
__ES_CONFIG="$ERROR_SOUND_HOME/config"

# Read a key from the config file. Usage: __es_cfg_get <key> <default>
__es_cfg_get() {
    local key="$1" def="$2" val=""
    if [ -f "$__ES_CONFIG" ]; then
        # last matching line wins; strip "key="
        val="$(grep -E "^$key=" "$__ES_CONFIG" 2>/dev/null | tail -n1 | cut -d= -f2-)"
    fi
    [ -n "$val" ] && printf '%s' "$val" || printf '%s' "$def"
}

# Set a key in the config file (create/replace). Usage: __es_cfg_set <key> <value>
__es_cfg_set() {
    local key="$1" value="$2" tmp
    mkdir -p "$ERROR_SOUND_HOME"
    touch "$__ES_CONFIG"
    tmp="$(mktemp)"
    grep -v -E "^$key=" "$__ES_CONFIG" > "$tmp" 2>/dev/null || true
    printf '%s=%s\n' "$key" "$value" >> "$tmp"
    mv "$tmp" "$__ES_CONFIG"
}

# Default sound: config value, else bundled sound, else macOS Basso.
__es_default_sound() {
    if [ -f "$ERROR_SOUND_HOME/sound.mp3" ]; then
        printf '%s' "$ERROR_SOUND_HOME/sound.mp3"
    else
        printf '%s' "/System/Library/Sounds/Basso.aiff"
    fi
}

# Ensure config exists with sane defaults on first load.
if [ ! -f "$__ES_CONFIG" ]; then
    mkdir -p "$ERROR_SOUND_HOME"
    {
        echo "enabled=1"
        echo "sound=$(__es_default_sound)"
    } > "$__ES_CONFIG"
fi

# Pick a player available on this system (macOS: afplay).
if command -v afplay >/dev/null 2>&1; then
    __es_run() { afplay "$1" >/dev/null 2>&1 & }
elif command -v paplay >/dev/null 2>&1; then
    __es_run() { paplay "$1" >/dev/null 2>&1 & }
elif command -v aplay >/dev/null 2>&1; then
    __es_run() { aplay "$1" >/dev/null 2>&1 & }
else
    __es_run() { printf '\a'; }   # terminal bell fallback
fi

# The hook: runs before each prompt, inspects last exit code, reads live config.
__error_sound() {
    local ec=$?
    local enabled sound
    enabled="$(__es_cfg_get enabled 1)"
    if [ "$enabled" = "1" ] && [ "$ec" -ne 0 ] && [ "$ec" -ne 130 ]; then
        sound="$(__es_cfg_get sound "$(__es_default_sound)")"
        [ -f "$sound" ] && __es_run "$sound"
    fi
    return $ec
}

# Runtime control commands (also update the shared config).
soundon()     { __es_cfg_set enabled 1; echo "error sound ON"; }
soundoff()    { __es_cfg_set enabled 0; echo "error sound OFF"; }
soundstatus() {
    local enabled sound
    enabled="$(__es_cfg_get enabled 1)"
    sound="$(__es_cfg_get sound "$(__es_default_sound)")"
    [ "$enabled" = "1" ] && echo "error sound: ON" || echo "error sound: OFF"
    echo "sound file: $sound"
}
soundfile()   {
    if [ -z "$1" ]; then echo "usage: soundfile <path-to-audio>"; return 1; fi
    if [ ! -f "$1" ]; then echo "file not found: $1"; return 1; fi
    __es_cfg_set sound "$1"; echo "sound file set to: $1"
}

# Register the hook for the current shell.
if [ -n "${ZSH_VERSION:-}" ]; then
    autoload -Uz add-zsh-hook 2>/dev/null
    add-zsh-hook precmd __error_sound 2>/dev/null
elif [ -n "${BASH_VERSION:-}" ]; then
    case "${PROMPT_COMMAND:-}" in
        *__error_sound*) ;;
        "") PROMPT_COMMAND="__error_sound" ;;
        *)  PROMPT_COMMAND="__error_sound; ${PROMPT_COMMAND}" ;;
    esac
fi
