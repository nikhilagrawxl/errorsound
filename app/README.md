# 🔊 errorsound (app)

Play a sound whenever a terminal command fails — cross-platform tray / menu bar GUI app + CLI for **macOS, Windows, and Linux**.

---

## ⚡ Installation

### 🍏 macOS / Linux

#### Homebrew (Recommended)
```bash
brew install nikhilagrawxl/tap/errorsound
errorsound install
```

#### npm
```bash
npm install -g errorsound
errorsound install
```

#### Curl One-Liner
```bash
curl -fsSL https://raw.githubusercontent.com/nikhilagrawxl/errorsound/main/install.sh | bash
```

---

### 🪟 Windows (PowerShell)

#### npm
```powershell
npm install -g errorsound
errorsound install
```

#### PowerShell One-Liner
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force
iwr -useb https://raw.githubusercontent.com/nikhilagrawxl/errorsound/main/install.ps1 | iex
```

---

## 🖥️ Standalone Desktop App (Releases)

Download prebuilt binaries for **macOS**, **Windows**, and **Linux** from [GitHub Releases](https://github.com/nikhilagrawxl/errorsound/releases):

- **macOS**: `errorsound-1.0.3.dmg`
- **Windows**: `errorsound Setup 1.0.3.exe` (or Portable `.exe`)
- **Linux**: `errorsound-1.0.3.AppImage`

> 🛡️ **macOS Gatekeeper Notice:**  
> On macOS, if you see *"Electron.app was not opened because it contains malware"* or *"cannot verify developer"*:  
> 1. Go to **System Settings** → **Privacy & Security**.  
> 2. Scroll to **Security** and click **Open Anyway**.  
>  
> *Or run in Terminal:* `xattr -cr /Applications/errorsound.app`

---

## 🎮 CLI Usage

```
errorsound              launch the tray/menu-bar GUI
errorsound install      install the shell hook
errorsound uninstall    remove the shell hook
errorsound on           enable the error sound
errorsound off          disable the error sound
errorsound status       show state + current sound file
errorsound sound <file> set custom sound file
errorsound test         play the current sound
```

---

## 💻 Developer Setup

```bash
npm install       # install dependencies
npm start         # launch local Electron GUI
npm test          # run CLI and config test suite
```

### Build Installers Locally

```bash
npm run dist:mac  # -> dist/*.dmg, *.zip   (run on macOS)
npm run dist:win  # -> dist/*.exe          (run on Windows)
npm run dist      # current platform
```
