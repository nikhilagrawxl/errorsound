// player.js - play a sound file cross-platform for the "Test sound" action.
// macOS: afplay, Windows: PowerShell SoundPlayer, Linux: paplay/aplay.
"use strict";

const { spawn } = require("child_process");
const fs = require("fs");

function play(file) {
  if (!file || !fs.existsSync(file)) return false;
  try {
    if (process.platform === "darwin") {
      spawn("afplay", [file], { detached: true, stdio: "ignore" }).unref();
    } else if (process.platform === "win32") {
      const ps = `(New-Object System.Media.SoundPlayer '${file}').PlaySync();`;
      spawn("powershell", ["-NoProfile", "-Command", ps], {
        detached: true,
        stdio: "ignore",
      }).unref();
    } else {
      // Linux: try paplay then aplay.
      const cmd = "paplay";
      spawn(cmd, [file], { detached: true, stdio: "ignore" }).unref();
    }
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = { play };
