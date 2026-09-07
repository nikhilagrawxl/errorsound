"""menubar_app.py - macOS menu bar app to control errorsound.

Shows an icon in the menu bar with a toggle for enabling/disabling the error
sound, a way to pick the sound file, and a test button. It reads and writes the
same ~/.errorsound/config file that the shell hook (errorsound.sh) uses, so the
terminal picks up changes on its next prompt automatically.

Run:   python3 menubar_app.py
Build: see build.sh / setup.py (py2app) to make a standalone .app.
"""
import os
import subprocess

import rumps

import esconfig


class ErrorSoundApp(rumps.App):
    def __init__(self):
        super().__init__("errorsound", title="🔔", quit_button=None)
        self.enabled_item = rumps.MenuItem("Enabled", callback=self.toggle_enabled)
        self.test_item = rumps.MenuItem("Test sound", callback=self.test_sound)
        self.choose_item = rumps.MenuItem("Choose sound file…", callback=self.choose_sound)
        self.sound_label = rumps.MenuItem("", callback=None)  # shows current file
        self.menu = [
            self.enabled_item,
            None,
            self.test_item,
            self.choose_item,
            self.sound_label,
            None,
            rumps.MenuItem("Quit", callback=rumps.quit_application),
        ]
        self.refresh()

    def refresh(self):
        """Sync menu UI from the config file."""
        enabled = esconfig.is_enabled()
        self.enabled_item.state = 1 if enabled else 0
        self.title = "🔔" if enabled else "🔕"
        sound = esconfig.get_sound()
        self.sound_label.title = "Sound: {}".format(os.path.basename(sound))

    def toggle_enabled(self, _):
        new_state = not esconfig.is_enabled()
        esconfig.set_enabled(new_state)
        self.refresh()

    def test_sound(self, _):
        sound = esconfig.get_sound()
        if os.path.isfile(sound):
            subprocess.Popen(["afplay", sound])
        else:
            rumps.alert("errorsound", "Sound file not found:\n{}".format(sound))

    def choose_sound(self, _):
        # Use AppleScript for a native file picker (no extra dependency).
        script = (
            'set f to choose file with prompt "Pick an error sound" '
            'of type {"mp3","wav","aiff","m4a","aif"}\n'
            'POSIX path of f'
        )
        try:
            out = subprocess.check_output(["osascript", "-e", script],
                                          stderr=subprocess.DEVNULL)
            path = out.decode().strip()
            if path:
                esconfig.set_sound(path)
                self.refresh()
        except subprocess.CalledProcessError:
            pass  # user cancelled the dialog


if __name__ == "__main__":
    ErrorSoundApp().run()
