// test/run.js - headless tests for config + installer (no GUI needed).
"use strict";
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

// Use an isolated ERROR_SOUND_HOME so we never touch the real config.
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "es-test-"));
process.env.ERROR_SOUND_HOME = path.join(sandbox, ".errorsound");

// Require after setting env so config picks it up.
const config = require("../src/config");

let passed = 0;
function ok(name) { console.log("  ok - " + name); passed++; }

// 1. defaults
assert.strictEqual(config.isEnabled(), true);
ok("default enabled is true");

// 2. toggle off/on persists
config.setEnabled(false);
assert.strictEqual(config.isEnabled(), false);
config.setEnabled(true);
assert.strictEqual(config.isEnabled(), true);
ok("toggle persists to config file");

// 3. set sound
config.setSound("/tmp/whatever.wav");
assert.strictEqual(config.getSound(), "/tmp/whatever.wav");
ok("set/get sound");

// 4. file format is shell-compatible (key=value lines)
const raw = fs.readFileSync(config.CONFIG_PATH, "utf8");
assert.ok(/^enabled=1$/m.test(raw), "enabled line present");
assert.ok(/^sound=\/tmp\/whatever\.wav$/m.test(raw), "sound line present");
ok("config file is shell-compatible key=value");

// 5. interop: the real shell hook must read what JS wrote (macOS/Linux only)
if (process.platform !== "win32") {
  const hook = path.join(__dirname, "..", "shell", "errorsound.sh");
  const out = execFileSync(
    "bash",
    ["-c", `export ERROR_SOUND_HOME="${process.env.ERROR_SOUND_HOME}"; . "${hook}"; soundstatus`],
    { encoding: "utf8" }
  );
  assert.ok(/error sound: ON/.test(out), "hook reports ON");
  assert.ok(/whatever\.wav/.test(out), "hook reads JS-written sound path");
  ok("shell hook reads JS-written config (interop)");
}

// 6. CLI status command works end-to-end
const cli = path.join(__dirname, "..", "src", "cli.js");
const cliOut = execFileSync("node", [cli, "status"], {
  encoding: "utf8",
  env: Object.assign({}, process.env),
});
assert.ok(/error sound: ON/.test(cliOut), "cli status ON");
ok("cli status reflects config");

// cleanup
fs.rmSync(sandbox, { recursive: true, force: true });
console.log(`\nAll ${passed} checks passed.`);
