// main.js - Electron tray / menu-bar app for errorsound.
// Shows a tray icon with a clickable menu to toggle the error sound, test it,
// choose a sound file, and install/uninstall the shell hook. State is stored in
// ~/.errorsound/config, shared with the shell hook.
"use strict";

const { app, Tray, Menu, dialog, nativeImage } = require("electron");
const path = require("path");
const config = require("./config");
const installer = require("./installer");
const player = require("./player");

let tray = null;

// Tray icons. On macOS a template image adapts to light/dark menu bar.
function iconFor(enabled) {
  const name = enabled ? "on" : "off";
  const p = path.join(__dirname, "..", "assets", `tray-${name}.png`);
  const img = nativeImage.createFromPath(p);
  if (process.platform === "darwin" && !img.isEmpty()) img.setTemplateImage(true);
  return img;
}

function buildMenu() {
  const enabled = config.isEnabled();
  const sound = config.getSound();
  return Menu.buildFromTemplate([
    { label: enabled ? "errorsound: ON" : "errorsound: OFF", enabled: false },
    { type: "separator" },
    {
      label: "Enabled",
      type: "checkbox",
      checked: enabled,
      click: () => {
        config.setEnabled(!config.isEnabled());
        refresh();
      },
    },
    { label: "Test sound", click: () => player.play(config.getSound()) },
    {
      label: "Choose sound file…",
      click: async () => {
        const res = await dialog.showOpenDialog({
          properties: ["openFile"],
          filters: [{ name: "Audio", extensions: ["mp3", "wav", "aiff", "aif", "m4a"] }],
        });
        if (!res.canceled && res.filePaths[0]) {
          config.setSound(res.filePaths[0]);
          refresh();
        }
      },
    },
    { label: "Sound: " + path.basename(sound || "(none)"), enabled: false },
    { type: "separator" },
    {
      label: "Install shell hook",
      click: () => {
        const files = installer.install();
        dialog.showMessageBox({
          message: "Installed shell hook.",
          detail: "Updated:\n" + files.join("\n") + "\n\nOpen a new terminal to activate.",
        });
      },
    },
    {
      label: "Uninstall shell hook",
      click: () => {
        const files = installer.uninstall();
        dialog.showMessageBox({
          message: "Removed shell hook.",
          detail: "Updated:\n" + files.join("\n"),
        });
      },
    },
    { type: "separator" },
    { label: "Quit", click: () => app.quit() },
  ]);
}

function refresh() {
  if (!tray) return;
  tray.setImage(iconFor(config.isEnabled()));
  tray.setToolTip("errorsound: " + (config.isEnabled() ? "ON" : "OFF"));
  tray.setContextMenu(buildMenu());
}

app.whenReady().then(() => {
  tray = new Tray(iconFor(config.isEnabled()));
  refresh();
  // On macOS, keep it as a menu bar accessory (no Dock icon).
  if (process.platform === "darwin" && app.dock) app.dock.hide();
});

// Don't quit when all windows close - it's a tray app with no windows.
app.on("window-all-closed", (e) => {});
