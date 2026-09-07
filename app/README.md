# errorsound (cross-platform app + CLI)

Play a sound whenever a terminal command fails — with a clickable tray / menu
bar app that works the same on **macOS, Windows, and Linux**, plus a CLI.

The app is an Electron tray icon. It reads/writes `~/.errorsound/config`, the
same file the shell hook uses, so toggling in the GUI instantly affects your
terminal (the hook re-reads config before each prompt).

## For users

### Option A — install from npm (all platforms)

```bash
npm install -g errorsound
errorsound install     # sets up the shell hook (bash/zsh, or PowerShell on Windows)
errorsound             # launch the tray / menu bar app
```

Open a new terminal after `install`. Then a failed command plays a sound.

### Option B — download a prebuilt app

Grab the installer for your OS from the GitHub Releases page:
- **macOS**: `errorsound-x.y.z.dmg` — open it, drag to Applications.
  First launch: right-click the app -> **Open** (it's unsigned, so Gatekeeper
  asks once).
- **Windows**: `errorsound Setup x.y.z.exe` (installer) or the portable `.exe`.
- **Linux**: `errorsound-x.y.z.AppImage` — `chmod +x` then run.

In the app, use **Install shell hook** once so your terminal starts playing
sounds on failed commands.

### Using the app

Click the tray icon (on = filled bell, off = outline):

- **Enabled** — toggle the error sound
- **Test sound** — play the current sound now
- **Choose sound file...** — pick your own `.mp3`/`.wav`/`.aiff`/`.m4a`
- **Install / Uninstall shell hook**
- **Quit**

### CLI reference

```
errorsound              launch the tray/menu-bar GUI
errorsound install      install the shell hook
errorsound uninstall    remove the shell hook
errorsound on           enable the error sound
errorsound off          disable the error sound
errorsound status       show state + current sound file
errorsound sound <file> set the sound file
errorsound test         play the current sound
```

## For developers

```bash
npm install       # install deps (Electron + electron-builder)
npm start         # run the app locally (electron .)
npm test          # headless tests (config + hook interop + CLI)
npm run cli -- status   # run the CLI in dev
```

### Build installers

```bash
npm run dist:mac  # -> dist/*.dmg, *.zip   (run on macOS)
npm run dist:win  # -> dist/*.exe          (run on Windows)
npm run dist      # current platform
```

Note: cross-OS packaging is easiest when built on each OS (Windows `.exe` on
Windows, `.dmg` on macOS). GitHub Actions can build all three in CI.

### Project layout

```
app/
├── src/
│   ├── main.js        Electron tray app
│   ├── cli.js         CLI entry (bin: errorsound)
│   ├── config.js      read/write ~/.errorsound/config
│   ├── installer.js   install/uninstall shell hook (bash/zsh/PowerShell)
│   └── player.js      cross-platform "Test sound"
├── shell/             hook scripts bundled into the app (errorsound.sh/.ps1)
├── assets/            tray + app icons
└── test/run.js        headless tests
```

## Publishing to GitHub + npm

1. Create a public GitHub repo and push this project.
2. Update `repository.url` and `author` in `package.json`.
3. **npm**: `npm login` then `npm publish` (package name `errorsound` must be
   free; otherwise scope it as `@yourname/errorsound`).
4. **GitHub Releases**: run the `dist:*` builds on each OS (or via GitHub
   Actions) and upload the artifacts from `dist/` to a release tag.
5. Optional: a GitHub Actions workflow with a matrix (macos/windows/ubuntu) can
   auto-build and attach installers to each release.

## Notes / limitations

- The **shell hook** is what detects failed commands; the app is a control panel
  for it. Always run `errorsound install` (or the app's Install menu) once.
- macOS builds are **unsigned** unless you add an Apple Developer ID
  ($99/yr) — users right-click -> Open on first launch.
- Windows sounds use `.wav`; the app bundles a `.wav` for that platform.
