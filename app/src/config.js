// config.js - read/write the shared ~/.errorsound/config file.
// Format matches the shell hooks exactly: simple key=value lines.
//   enabled=1            1 = on, 0 = off
//   sound=/abs/path      audio file to play on failure
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");

const HOME = process.env.ERROR_SOUND_HOME
  ? process.env.ERROR_SOUND_HOME
  : path.join(os.homedir(), ".errorsound");
const CONFIG_PATH = path.join(HOME, "config");

function defaultSound() {
  const bundled = path.join(HOME, "sound.mp3");
  if (fs.existsSync(bundled)) return bundled;
  if (process.platform === "darwin") return "/System/Library/Sounds/Basso.aiff";
  return ""; // empty => hook falls back to a beep
}

function read() {
  const cfg = { enabled: "1", sound: defaultSound() };
  try {
    const text = fs.readFileSync(CONFIG_PATH, "utf8");
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith("#") || !line.includes("=")) continue;
      const idx = line.indexOf("=");
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim();
      cfg[key] = value; // last line wins
    }
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  return cfg;
}

function write(cfg) {
  fs.mkdirSync(HOME, { recursive: true });
  const body = Object.entries(cfg)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n") + "\n";
  const tmp = CONFIG_PATH + ".tmp";
  fs.writeFileSync(tmp, body);
  fs.renameSync(tmp, CONFIG_PATH);
}

function setKey(key, value) {
  const cfg = read();
  cfg[key] = String(value);
  write(cfg);
  return cfg;
}

module.exports = {
  HOME,
  CONFIG_PATH,
  defaultSound,
  read,
  write,
  setKey,
  isEnabled: () => read().enabled === "1",
  setEnabled: (on) => setKey("enabled", on ? "1" : "0"),
  getSound: () => read().sound,
  setSound: (p) => setKey("sound", p),
};
