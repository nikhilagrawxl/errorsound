# 🔊 errorsound

Play a sound whenever a terminal command fails (non-zero exit code).

Available for **macOS**, **Windows (PowerShell)**, and **Linux**. Includes both a lightweight **CLI tool** and a **Menu Bar / System Tray GUI app**.

---

## ⚡ Installation

### 🍏 macOS / Linux

#### Option 1: Homebrew (Recommended for macOS)
```bash
brew install nikhilagrawxl/tap/errorsound
errorsound install
```

#### Option 2: npm
```bash
npm install -g errorsound
errorsound install
```

#### Option 3: One-Line Curl Install
```bash
curl -fsSL https://raw.githubusercontent.com/nikhilagrawxl/errorsound/main/install.sh | bash
```
*(After installing, reload your shell or open a new terminal: `source ~/.zshrc` or `source ~/.bashrc`)*

---

### 🪟 Windows (PowerShell)

#### Option 1: npm
```powershell
npm install -g errorsound
errorsound install
```

#### Option 2: One-Line PowerShell Install
Open **PowerShell** and run:
```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force
iwr -useb https://raw.githubusercontent.com/nikhilagrawxl/errorsound/main/install.ps1 | iex
```

---

## 🖥️ Desktop GUI App (Menu Bar / System Tray)

Prefer a desktop app? Download prebuilt installers from [GitHub Releases](https://github.com/nikhilagrawxl/errorsound/releases):

- **macOS**: Download `errorsound-1.0.3.dmg`
- **Windows**: Download `errorsound Setup 1.0.3.exe` (or Portable `.exe`)
- **Linux**: Download `errorsound-1.0.3.AppImage`

> 🛡️ **Note for macOS Users (Gatekeeper Notice):**  
> macOS may show a prompt: *"Electron.app was not opened because it contains malware"* or *"cannot verify developer"*.  
> **To allow it:**  
> 1. Open **System Settings** → **Privacy & Security**.  
> 2. Scroll down to **Security** and click **Open Anyway**.  
>  
> *Or run this command in Terminal:*  
> ```bash
> xattr -cr /Applications/errorsound.app
> ```

> 🛡️ **Note for Windows Users (Execution Policy Notice):**  
> If PowerShell blocks running scripts, enable local script execution once:  
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
> ```

---

## 🎮 CLI Commands

Use the `errorsound` CLI to manage settings across any platform:

| Command | Description |
|---|---|
| `errorsound` / `errorsound gui` | Launch the Menu Bar / System Tray GUI |
| `errorsound install` | Enable the error sound shell hook |
| `errorsound uninstall` | Remove the error sound shell hook |
| `errorsound on` | Turn error sound ON |
| `errorsound off` | Turn error sound OFF |
| `errorsound status` | Show current state and active sound file path |
| `errorsound test` | Play the error sound immediately |
| `errorsound sound <path>` | Set a custom audio file path |

---

## 🎵 Customizing Sound Files

- **macOS / Linux**: Supports `.mp3`, `.wav`, `.aiff`, `.m4a`.
  ```bash
  errorsound sound /path/to/custom_sound.mp3
  ```
- **Windows**: Supports `.wav` audio files.
  ```powershell
  errorsound sound C:\path\to\custom_sound.wav
  ```

---

## ⚙️ How It Works

- **macOS / Linux**: Registers a lightweight `precmd` hook in `~/.zshrc` or `~/.bashrc`. Plays audio asynchronously using macOS native `afplay` or Linux `paplay`/`aplay`. Exit code `130` (Ctrl+C) is automatically ignored.
- **Windows**: Registers a prompt wrapper in your PowerShell `$PROFILE`. Plays `.wav` audio natively using `System.Media.SoundPlayer`.
- Preferences are stored in `~/.errorsound/config` so the CLI, shell hooks, and GUI stay in sync automatically.

---

## 🗑️ Uninstall

- **macOS / Linux**:
  ```bash
  errorsound uninstall
  # Or via Homebrew: brew uninstall nikhilagrawxl/tap/errorsound
  ```
- **Windows**:
  ```powershell
  errorsound uninstall
  # Or via npm: npm uninstall -g errorsound
  ```

---

## 📄 License
MIT License © [Nikhil Agrawal](https://github.com/nikhilagrawxl)
