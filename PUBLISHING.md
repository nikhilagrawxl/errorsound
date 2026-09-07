# Publishing errorsound

A step-by-step guide to publish errorsound so anyone can install and use it.
There are three distribution channels; you can do one or all:

1. **GitHub (source)** — anyone with Node can clone and run.
2. **npm** — `npm install -g errorsound`.
3. **GitHub Releases (prebuilt apps)** — download a `.dmg` / `.exe` / `.AppImage`.

The hard part on macOS is **code signing** (so users don't get "cannot verify
developer"). That section is called out explicitly below.

---

## 0. One-time prep

1. Create a **public GitHub repo** (e.g. `github.com/<you>/errorsound`).
2. In `app/package.json`, set:
   - `"author"` to your name
   - `"repository.url"` to `https://github.com/<you>/errorsound.git`
   - `"version"` — bump this for every release (semver: `1.0.0` -> `1.0.1`).
3. Add a `LICENSE` file (MIT is already declared in package.json — add the text).

---

## 1. Publish the source to GitHub

```bash
# from the project root
git remote add github https://github.com/<you>/errorsound.git
git push github main
```

Anyone can now use it from source (cross-platform, needs Node 18+):

```bash
git clone https://github.com/<you>/errorsound.git
cd errorsound/app
npm install
npm start                 # launches the tray app
node src/cli.js install   # or install the shell hook via CLI
```

This is the simplest path and has **no signing issues** (nothing is a
downloaded .app), so it's the best channel for early testers.

---

## 2. Publish to npm

Gives users `npm install -g errorsound`.

```bash
cd app
npm login                 # need a free npmjs.com account
npm publish               # publishes the package
```

Notes:
- The package name `errorsound` must be free on npm. Check with
  `npm view errorsound`. If taken, scope it: rename `"name"` in package.json to
  `"@<you>/errorsound"` and run `npm publish --access public`.
- The `files` field in package.json keeps the published tarball small (~400 KB)
  — it excludes `node_modules` and build output. Verify before publishing:
  ```bash
  npm pack --dry-run        # lists exactly what will be published
  ```
- Users then run:
  ```bash
  npm install -g errorsound
  errorsound install
  errorsound
  ```
- Electron is a dependency, so the global install pulls it in on their machine.

### Bumping versions

```bash
npm version patch          # 1.0.0 -> 1.0.1, also creates a git tag
git push && git push --tags
npm publish
```

---

## 3. Publish prebuilt apps to GitHub Releases

So non-developers can just download and run.

### Build the installers (on each OS)

electron-builder builds for the OS you run it on:

```bash
cd app
npm run dist:mac    # on a Mac  -> dist/errorsound-x.y.z.dmg, .zip
npm run dist:win    # on Windows-> dist/errorsound Setup x.y.z.exe, portable .exe
npm run dist        # Linux     -> dist/errorsound-x.y.z.AppImage
```

You need access to each OS (or use CI in section 4 to build all three).

### Create the release

1. On GitHub: **Releases -> Draft a new release**.
2. Create a tag matching your version, e.g. `v1.0.0`.
3. Upload the files from `app/dist/` (the `.dmg`, `.exe`, `.AppImage`).
4. Publish the release.

Users download the file for their OS from the Releases page.

---

## 4. Automate builds for all 3 OSes with GitHub Actions (recommended)

Instead of building on three machines, let GitHub build them. Create
`.github/workflows/release.yml`:

```yaml
name: Build & Release
on:
  push:
    tags:
      - "v*"

jobs:
  build:
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]
    runs-on: ${{ matrix.os }}
    defaults:
      run:
        working-directory: app
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
      - run: npx electron-builder --publish always
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Then release by pushing a tag:

```bash
npm version patch          # in app/, bumps version + tags
git push --follow-tags
```

GitHub Actions builds mac/windows/linux installers and attaches them to the
release automatically. `GITHUB_TOKEN` is provided by Actions — no setup needed
for uploading to your own repo's releases.

> `npm ci` in the workflow needs `app/package-lock.json` committed (it is).

---

## 5. macOS code signing & notarization (removes "cannot verify developer")

This is the one thing that costs money. Without it, macOS users must
right-click -> Open, use "Open Anyway" in Privacy & Security, or run
`xattr -dr com.apple.quarantine /Applications/errorsound.app`.

To make it open cleanly like any App Store app:

1. Enroll in the **Apple Developer Program** ($99/year).
2. Create a **Developer ID Application** certificate in your Apple account and
   install it in your Mac's Keychain.
3. electron-builder will auto-detect the certificate when building on your Mac,
   or in CI provide these env vars:
   - `CSC_LINK` — base64 of your `.p12` cert (store as a GitHub secret)
   - `CSC_KEY_PASSWORD` — the cert password
4. **Notarize** (Apple scans the app). Add to the `build.mac` section of
   package.json:
   ```json
   "mac": {
     "hardenedRuntime": true,
     "gatekeeperAssess": false,
     "notarize": { "teamId": "YOUR_TEAM_ID" }
   }
   ```
   and provide in CI:
   - `APPLE_ID` — your Apple ID email
   - `APPLE_APP_SPECIFIC_PASSWORD` — an app-specific password from appleid.apple.com
   - `APPLE_TEAM_ID` — your team ID

After signing + notarizing, the `.dmg` opens with no warnings on any Mac.

### Windows signing (optional)

Windows shows a SmartScreen warning for unsigned apps. To remove it you need a
**code-signing certificate** (~$100-300/yr from a CA like Sectigo/DigiCert),
then set `CSC_LINK` / `CSC_KEY_PASSWORD` for the Windows build too. Optional —
users can still run it via "More info -> Run anyway".

---

## Recommended path

- **Now / testers:** Section 1 (GitHub source) + Section 3 (attach an unsigned
  `.dmg`/`.exe` to a Release, with a note to right-click -> Open on Mac).
- **Wider release:** Section 2 (npm) + Section 4 (CI auto-builds) + Section 6 (Homebrew Tap).
- **Polished, no warnings:** add Section 5 (Apple Developer signing).

---

## 6. Publish to Homebrew (Personal Tap)

Give users `brew install nikhilagrawxl/tap/errorsound`.

1. Create a public GitHub repository named **`homebrew-tap`** under your account (`nikhilagrawxl/homebrew-tap`).
2. Inside `homebrew-tap`, create `Formula/errorsound.rb`:

```ruby
class Errorsound < Formula
  desc "Play a sound when a terminal command fails"
  homepage "https://github.com/nikhilagrawxl/errorsound"
  url "https://github.com/nikhilagrawxl/errorsound/archive/refs/tags/v1.0.0.tar.gz"
  sha256 "f843bb713738df47db9d072855c0b1f0882ae1852a4769c8f2ca7695db127fc7"
  license "MIT"

  depends_on "node"

  def install
    cd "app" do
      system "npm", "install", *std_npm_args
      bin.install_symlink Dir["#{libexec}/bin/*"]
    end
  end

  test do
    system "#{bin}/errorsound", "--help"
  end
end
```

3. Users can now install with:
   ```bash
   brew install nikhilagrawxl/tap/errorsound
   ```

---

## Quick checklist per release

- [ ] Bump version (`npm version patch` in `app/`)
- [ ] `npm test` passes
- [ ] `npm pack --dry-run` shows only source (no node_modules)
- [ ] Push tag -> CI builds installers (or build locally)
- [ ] `npm publish` (if using npm)
- [ ] Update `sha256` in `homebrew-tap/Formula/errorsound.rb`
- [ ] Verify the GitHub Release has all 3 OS artifacts

