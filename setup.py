"""setup.py - build errorsound menu bar app into a standalone .app with py2app.

Build:
    pip install rumps py2app
    python3 setup.py py2app
    # result in ./dist/errorsound.app

The resulting .app runs as a menu bar (accessory) app with no Dock icon,
thanks to LSUIElement=True below.
"""
from setuptools import setup

APP = ["menubar_app.py"]
DATA_FILES = []
OPTIONS = {
    "argv_emulation": False,
    "plist": {
        "LSUIElement": True,           # menu bar only, no Dock icon
        "CFBundleName": "errorsound",
        "CFBundleDisplayName": "errorsound",
        "CFBundleIdentifier": "com.nikhil.errorsound",
        "CFBundleVersion": "1.0.0",
        "CFBundleShortVersionString": "1.0.0",
    },
    "packages": ["rumps"],
    "includes": ["esconfig"],
}

setup(
    app=APP,
    name="errorsound",
    data_files=DATA_FILES,
    options={"py2app": OPTIONS},
    setup_requires=["py2app"],
)
