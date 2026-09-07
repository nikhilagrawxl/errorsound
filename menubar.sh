#!/usr/bin/env bash
# menubar.sh - helper to run or build the errorsound menu bar app.
#
#   ./menubar.sh run     # install deps into a venv and run the app (dev mode)
#   ./menubar.sh build   # build a standalone .app into ./dist with py2app
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
cd "$DIR"
VENV="$DIR/.venv"

ensure_venv() {
    if [ ! -d "$VENV" ]; then
        echo "Creating virtualenv at $VENV ..."
        python3 -m venv "$VENV"
    fi
    # shellcheck disable=SC1091
    . "$VENV/bin/activate"
    pip install --quiet --upgrade pip
    pip install --quiet -r requirements.txt
}

case "${1:-run}" in
    run)
        ensure_venv
        echo "Running errorsound menu bar app (Ctrl+C to quit)..."
        python3 menubar_app.py
        ;;
    build)
        ensure_venv
        pip install --quiet py2app
        rm -rf build dist
        python3 setup.py py2app
        echo ""
        echo "Built: $DIR/dist/errorsound.app"
        echo "Move it to /Applications and add to Login Items to autostart."
        ;;
    *)
        echo "usage: ./menubar.sh [run|build]"; exit 1;;
esac
