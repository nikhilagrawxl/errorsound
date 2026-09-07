"""esconfig.py - read/write the shared errorsound config file.

The config lives at ~/.errorsound/config as simple key=value lines, the exact
format the shell hook (errorsound.sh) reads. Keeping this separate from the
rumps UI means it can be unit-tested without a GUI session.

    enabled=1                 # 1 = on, 0 = off
    sound=/absolute/path      # audio file to play on failure
"""
import os

HOME = os.path.expanduser(os.environ.get("ERROR_SOUND_HOME", "~/.errorsound"))
CONFIG_PATH = os.path.join(HOME, "config")

DEFAULT_SOUND_BUNDLED = os.path.join(HOME, "sound.mp3")
DEFAULT_SOUND_FALLBACK = "/System/Library/Sounds/Basso.aiff"


def default_sound():
    return DEFAULT_SOUND_BUNDLED if os.path.isfile(DEFAULT_SOUND_BUNDLED) else DEFAULT_SOUND_FALLBACK


def read_config():
    """Return dict of config values, applying defaults for missing keys."""
    cfg = {"enabled": "1", "sound": default_sound()}
    try:
        with open(CONFIG_PATH, "r") as f:
            for line in f:
                line = line.strip()
                if not line or "=" not in line or line.startswith("#"):
                    continue
                key, _, value = line.partition("=")
                cfg[key.strip()] = value.strip()  # last line wins
    except FileNotFoundError:
        pass
    return cfg


def write_config(cfg):
    """Write the given dict back to the config file atomically-ish."""
    os.makedirs(HOME, exist_ok=True)
    tmp = CONFIG_PATH + ".tmp"
    with open(tmp, "w") as f:
        for key, value in cfg.items():
            f.write("{}={}\n".format(key, value))
    os.replace(tmp, CONFIG_PATH)


def set_key(key, value):
    cfg = read_config()
    cfg[key] = str(value)
    write_config(cfg)
    return cfg


def is_enabled():
    return read_config().get("enabled", "1") == "1"


def set_enabled(enabled):
    return set_key("enabled", "1" if enabled else "0")


def get_sound():
    return read_config().get("sound", default_sound())


def set_sound(path):
    return set_key("sound", path)
