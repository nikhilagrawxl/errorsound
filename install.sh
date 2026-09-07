#!/usr/bin/env bash
# install.sh - install errorsound for the current user (bash + zsh).
set -euo pipefail

SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
DEST="$HOME/.errorsound"
MARK_BEGIN="# >>> errorsound >>>"
MARK_END="# <<< errorsound <<<"

echo "Installing errorsound to $DEST ..."
mkdir -p "$DEST"
cp "$SRC_DIR/errorsound.sh" "$DEST/errorsound.sh"

# Copy a bundled sound if one is provided alongside the installer.
if [ -f "$SRC_DIR/sound.mp3" ]; then
    cp "$SRC_DIR/sound.mp3" "$DEST/sound.mp3"
    echo "Bundled sound installed."
else
    echo "No sound.mp3 bundled; will use macOS Basso.aiff by default."
fi

# The snippet we add to each rc file.
snippet="$MARK_BEGIN
export ERROR_SOUND_HOME=\"\$HOME/.errorsound\"
[ -f \"\$ERROR_SOUND_HOME/errorsound.sh\" ] && . \"\$ERROR_SOUND_HOME/errorsound.sh\"
$MARK_END"

add_to_rc() {
    local rc="$1"
    [ -e "$rc" ] || touch "$rc"
    if grep -q "$MARK_BEGIN" "$rc" 2>/dev/null; then
        echo "Already present in $rc (skipping)."
    else
        printf '\n%s\n' "$snippet" >> "$rc"
        echo "Added errorsound to $rc"
    fi
}

add_to_rc "$HOME/.bashrc"
add_to_rc "$HOME/.zshrc"

echo ""
echo "Done. Open a new terminal, or run:  source ~/.bashrc   (or ~/.zshrc)"
echo "Commands: soundon | soundoff | soundstatus | soundfile <path>"
