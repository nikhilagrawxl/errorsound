#!/usr/bin/env bash
# uninstall.sh - remove errorsound from bash + zsh and delete its files.
set -euo pipefail

DEST="$HOME/.errorsound"
MARK_BEGIN="# >>> errorsound >>>"
MARK_END="# <<< errorsound <<<"

remove_from_rc() {
    local rc="$1"
    [ -f "$rc" ] || return 0
    if grep -q "$MARK_BEGIN" "$rc"; then
        # Delete the block between the markers (inclusive).
        sed -i.errorsound.bak "/$MARK_BEGIN/,/$MARK_END/d" "$rc"
        rm -f "$rc.errorsound.bak"
        echo "Removed errorsound from $rc"
    else
        echo "Not found in $rc (skipping)."
    fi
}

remove_from_rc "$HOME/.bashrc"
remove_from_rc "$HOME/.zshrc"

if [ -d "$DEST" ]; then
    rm -rf "$DEST"
    echo "Deleted $DEST"
fi

echo "Uninstalled. Open a new terminal for it to take full effect."
