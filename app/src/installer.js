// installer.js - install/uninstall the shell hook across platforms.
// - macOS/Linux: copy errorsound.sh to ~/.errorsound and source it from
//   ~/.bashrc and ~/.zshrc (and ensure ~/.bash_profile sources ~/.bashrc).
// - Windows: copy errorsound.ps1 to ~/.errorsound and source it from $PROFILE.
// Uses marker comments so uninstall removes exactly our block.
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const config = require("./config");

const HOME = config.HOME;
const MARK_BEGIN = "# >>> errorsound >>>";
const MARK_END = "# <<< errorsound <<<";

// Where the hook scripts live inside the app bundle / package.
function shellDir() {
  // In a packaged app, extraResources puts shell/ under process.resourcesPath.
  const packaged = process.resourcesPath
    ? path.join(process.resourcesPath, "shell")
    : null;
  if (packaged && fs.existsSync(packaged)) return packaged;
  return path.join(__dirname, "..", "shell");
}

function ensureLine(file, line) {
  let content = "";
  try {
    content = fs.readFileSync(file, "utf8");
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  if (content.includes(line.trim())) return false;
  fs.appendFileSync(file, `\n${line}\n`);
  return true;
}

function addBlock(rcFile, snippet) {
  let content = "";
  try {
    content = fs.readFileSync(rcFile, "utf8");
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  if (content.includes(MARK_BEGIN)) return false;
  fs.appendFileSync(rcFile, `\n${snippet}\n`);
  return true;
}

function removeBlock(rcFile) {
  let content;
  try {
    content = fs.readFileSync(rcFile, "utf8");
  } catch (e) {
    return false;
  }
  const lines = content.split(/\r?\n/);
  const out = [];
  let skip = false;
  for (const line of lines) {
    if (line.includes(MARK_BEGIN)) { skip = true; continue; }
    if (line.includes(MARK_END)) { skip = false; continue; }
    if (!skip) out.push(line);
  }
  fs.writeFileSync(rcFile, out.join("\n"));
  return true;
}

function installUnix() {
  fs.mkdirSync(HOME, { recursive: true });
  const src = path.join(shellDir(), "errorsound.sh");
  fs.copyFileSync(src, path.join(HOME, "errorsound.sh"));

  // Bundle a default sound if present next to the hook.
  const sound = path.join(shellDir(), "sound.mp3");
  if (fs.existsSync(sound)) fs.copyFileSync(sound, path.join(HOME, "sound.mp3"));

  const snippet = `${MARK_BEGIN}
export ERROR_SOUND_HOME="$HOME/.errorsound"
[ -f "$ERROR_SOUND_HOME/errorsound.sh" ] && . "$ERROR_SOUND_HOME/errorsound.sh"
${MARK_END}`;

  const home = os.homedir();
  const bashrc = path.join(home, ".bashrc");
  const zshrc = path.join(home, ".zshrc");
  const bashProfile = path.join(home, ".bash_profile");

  addBlock(bashrc, snippet);
  addBlock(zshrc, snippet);
  // macOS bash opens login shells that read .bash_profile, not .bashrc.
  ensureLine(bashProfile, '[ -f "$HOME/.bashrc" ] && . "$HOME/.bashrc"');
  return [bashrc, zshrc];
}

function installWindows() {
  fs.mkdirSync(HOME, { recursive: true });
  const src = path.join(shellDir(), "errorsound.ps1");
  fs.copyFileSync(src, path.join(HOME, "errorsound.ps1"));
  const wav = path.join(shellDir(), "sound.wav");
  if (fs.existsSync(wav)) fs.copyFileSync(wav, path.join(HOME, "sound.wav"));

  // PowerShell profile path.
  const profile = path.join(
    os.homedir(),
    "Documents",
    "WindowsPowerShell",
    "Microsoft.PowerShell_profile.ps1"
  );
  fs.mkdirSync(path.dirname(profile), { recursive: true });
  const snippet = `${MARK_BEGIN}
$env:ERROR_SOUND_HOME = Join-Path $HOME ".errorsound"
. (Join-Path $env:ERROR_SOUND_HOME "errorsound.ps1")
${MARK_END}`;
  addBlock(profile, snippet);
  return [profile];
}

function install() {
  // Ensure a config exists so GUI + hook agree from the start.
  if (!fs.existsSync(config.CONFIG_PATH)) {
    config.write({ enabled: "1", sound: config.defaultSound() });
  }
  return process.platform === "win32" ? installWindows() : installUnix();
}

function uninstall() {
  const home = os.homedir();
  const files =
    process.platform === "win32"
      ? [path.join(home, "Documents", "WindowsPowerShell", "Microsoft.PowerShell_profile.ps1")]
      : [path.join(home, ".bashrc"), path.join(home, ".zshrc")];
  files.forEach(removeBlock);
  return files;
}

module.exports = { install, uninstall, shellDir };
