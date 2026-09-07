#!/usr/bin/env node
// cli.js - command line interface for errorsound.
//   errorsound            launch the tray/menu-bar GUI
//   errorsound install    install the shell hook (bash/zsh/PowerShell)
//   errorsound uninstall  remove the shell hook
//   errorsound on|off     enable/disable the error sound
//   errorsound status     show current state
//   errorsound sound <f>  set the sound file
"use strict";

const path = require("path");
const { spawn } = require("child_process");
const config = require("./config");
const installer = require("./installer");
const player = require("./player");

const cmd = process.argv[2];
const arg = process.argv[3];

function launchGui() {
  // Launch electron with this app directory.
  let electron;
  try {
    electron = require("electron"); // resolves to the electron binary path
  } catch (e) {
    console.error("Electron is not installed. Run `npm install` first, or use the CLI commands.");
    process.exit(1);
  }
  const appDir = path.join(__dirname, "..");
  const child = spawn(electron, [appDir], { stdio: "inherit", detached: true });
  child.unref();
}

switch (cmd) {
  case undefined:
  case "gui":
    launchGui();
    break;
  case "install": {
    const files = installer.install();
    console.log("Installed errorsound hook. Updated:");
    files.forEach((f) => console.log("  " + f));
    console.log("Open a new terminal (or reload your shell) to activate.");
    break;
  }
  case "uninstall": {
    const files = installer.uninstall();
    console.log("Removed errorsound hook from:");
    files.forEach((f) => console.log("  " + f));
    break;
  }
  case "on":
    config.setEnabled(true);
    console.log("error sound ON");
    break;
  case "off":
    config.setEnabled(false);
    console.log("error sound OFF");
    break;
  case "status": {
    const c = config.read();
    console.log("error sound: " + (c.enabled === "1" ? "ON" : "OFF"));
    console.log("sound file: " + c.sound);
    break;
  }
  case "sound":
    if (!arg) {
      console.error("usage: errorsound sound <path-to-audio>");
      process.exit(1);
    }
    config.setSound(path.resolve(arg));
    console.log("sound file set to: " + config.getSound());
    break;
  case "test":
    player.play(config.getSound());
    console.log("playing: " + config.getSound());
    break;
  default:
    console.log("usage: errorsound [gui|install|uninstall|on|off|status|sound <f>|test]");
    process.exit(1);
}
