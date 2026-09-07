# errorsound

Play a sound whenever a terminal command fails (non-zero exit code).

- **macOS / Linux** — bash & zsh (`errorsound.sh`)
- **Windows** — PowerShell (`errorsound.ps1`)

---

## macOS / Linux (bash & zsh)

### Install

```bash
./install.sh
```

Then open a new terminal, or reload your shell:

```bash
source ~/.bashrc     # or: source ~/.zshrc
```

### Try it

```bash
somebadcommand    # plays the sound
ls                # silent (success)
```

### Uninstall

```bash
./uninstall.sh
```

Note: on Linux, `paplay`/`aplay` play `.wav` reliably but usually not `.mp3` —
use the bundled `sound.wav` (run `soundfile ~/.errorsound/sound.wav`) or supply
your own `.wav`.

---

## Windows (PowerShell)

### Install — the easy way

1. Download / clone the project, then open **PowerShell** in the project folder
   (Shift + right-click the folder → "Open PowerShell window here").
2. If this is your first time running scripts, allow it once:
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
   ```
3. Run the installer:
   ```powershell
   .\install.ps1
   ```
4. Open a new PowerShell window (or reload with `. $PROFILE`).

### Try it

```powershell
somebadcommand    # plays the sound
Get-ChildItem     # silent (success)
```

### Uninstall

```powershell
.\uninstall.ps1
```

Windows uses `sound.wav` (PowerShell's audio player only supports `.wav`).
If no sound is bundled, it falls back to a system beep.

---

## macOS menu bar app (optional GUI)

A small menu bar app lets you toggle the error sound, pick a sound file, and
test it — without touching the terminal. It reads and writes the same
`~/.errorsound/config` file the shell hook uses, so changes take effect on your
next terminal prompt automatically.

> The shell hook (`errorsound.sh`) is still what detects failed commands and
> plays the sound. The menu bar app is just a control panel for it, so install
> the hook first (`./install.sh`).

### Run it (dev mode)

```bash
./menubar.sh run
```

This creates a virtualenv, installs `rumps`, and launches the app. A 🔔 icon
appears in your menu bar (🔕 when disabled). Menu options:

- **Enabled** — toggle the error sound on/off
- **Test sound** — play the current sound
- **Choose sound file…** — pick a new `.mp3`/`.wav`/`.aiff`/`.m4a`
- **Quit**

### Build a standalone .app

```bash
./menubar.sh build
```

Produces `dist/errorsound.app`. Move it to `/Applications`, then add it to
**System Settings → General → Login Items** to launch it at startup. It runs as
a menu-bar-only app (no Dock icon).

### Files

| File            | Purpose                                    |
|-----------------|--------------------------------------------|
| `menubar_app.py`| The rumps menu bar UI                      |
| `esconfig.py`   | Reads/writes `~/.errorsound/config`        |
| `menubar.sh`    | `run` (dev) / `build` (py2app) helper      |
| `setup.py`      | py2app build config                        |
| `requirements.txt` | Python deps (`rumps`)                   |

---

## Commands (all platforms)

| Command             | What it does                              |
|---------------------|-------------------------------------------|
| `soundon`           | Enable error sounds                       |
| `soundoff`          | Disable error sounds                      |
| `soundstatus`       | Show on/off state and current sound file  |
| `soundfile <path>`  | Use a different sound file (this session) |

## Use your own sound

- **macOS/Linux**: drop a `sound.mp3` (or `.wav`) next to the installer before
  running it, or run `soundfile <path>` at runtime.
- **Windows**: use a `.wav` file — drop `sound.wav` next to `install.ps1`, or run
  `soundfile C:\path\to\your.wav`.

## How it works

The installer copies the hook script to `~/.errorsound/` and adds a small
sourcing snippet (between `# >>> errorsound >>>` markers) to your shell's config
(`~/.bashrc` + `~/.zshrc`, or the PowerShell `$PROFILE`). A pre-prompt hook
checks the last command's exit code and plays the sound on failure. On
macOS/Linux, exit code 130 (Ctrl+C) is ignored.

On macOS/Linux the on/off state and sound file are stored in
`~/.errorsound/config` (simple `key=value` lines). The `soundon`/`soundoff`/
`soundfile` commands and the optional menu bar app all read and write this file,
so they stay in sync and changes persist across terminal sessions.

Audio backend by platform:
- macOS: `afplay`
- Linux: `paplay` → `aplay` → terminal bell
- Windows: `System.Media.SoundPlayer` → `[console]::beep()` fallback

## Files

| File             | Platform        |
|------------------|-----------------|
| `errorsound.sh`  | macOS / Linux   |
| `install.sh`     | macOS / Linux   |
| `uninstall.sh`   | macOS / Linux   |
| `errorsound.ps1` | Windows         |
| `install.ps1`    | Windows         |
| `uninstall.ps1`  | Windows         |
| `sound.mp3`      | bundled sound (macOS/Linux) |
| `sound.wav`      | bundled sound (Windows)     |
