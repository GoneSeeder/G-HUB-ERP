"""G-HUB Thai ID Scanner setup helper.

Build:
  py -m PyInstaller --onefile --windowed --name thai-id-setup setup.py

Before production build:
  1. Build tools/thai-id-native-host/dist/thai-id-host.exe.
  2. Copy thai-id-host.exe next to this setup.py.
  3. Set EXTENSION_ID to the published Chrome/Edge extension ID.
"""

from __future__ import annotations

import ctypes
import json
import shutil
import sys
import threading
import tkinter as tk
import winreg
from pathlib import Path
from tkinter import messagebox, ttk

APP_NAME = "G-HUB Thai ID Scanner"
EXTENSION_ID = "REPLACE_WITH_EXTENSION_ID"
HOST_NAME = "com.ghub.thaiid"
HOST_FILENAME = "thai-id-host.exe"
INSTALL_DIR = Path("C:/Program Files/GHUB/thai-id-host")
LOG_DIR = Path("C:/ProgramData/GHUB")

CHROME_NATIVE_KEY = rf"SOFTWARE\Google\Chrome\NativeMessagingHosts\{HOST_NAME}"
EDGE_NATIVE_KEY = rf"SOFTWARE\Microsoft\Edge\NativeMessagingHosts\{HOST_NAME}"


def resource_path(filename: str) -> Path:
    if getattr(sys, "frozen", False):
        return Path(sys._MEIPASS) / filename  # type: ignore[attr-defined]
    return Path(__file__).parent / filename


def run_as_admin() -> None:
    if ctypes.windll.shell32.IsUserAnAdmin():
        return
    ctypes.windll.shell32.ShellExecuteW(
        None,
        "runas",
        sys.executable,
        " ".join(f'"{arg}"' for arg in sys.argv),
        None,
        1,
    )
    raise SystemExit


class Installer(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title(APP_NAME)
        self.geometry("520x330")
        self.resizable(False, False)
        self.configure(bg="#f8fafc")
        self.status_var = tk.StringVar(value="Ready to install")
        self.progress_var = tk.IntVar(value=0)
        self.install_button: tk.Button | None = None
        self.log: tk.Text | None = None
        self.build_ui()

    def build_ui(self) -> None:
        tk.Label(
            self,
            text="G-HUB Thai ID Scanner",
            font=("Segoe UI", 16, "bold"),
            bg="#f8fafc",
            fg="#0f172a",
        ).pack(pady=(24, 4))
        tk.Label(
            self,
            text="Installs the Native Messaging Host for Chrome/Edge.",
            font=("Segoe UI", 10),
            bg="#f8fafc",
            fg="#64748b",
        ).pack(pady=(0, 16))

        tk.Label(self, textvariable=self.status_var, bg="#f8fafc", fg="#334155").pack()
        ttk.Progressbar(self, length=430, maximum=100, variable=self.progress_var).pack(pady=10)

        self.log = tk.Text(self, height=7, width=62, font=("Consolas", 9), bg="#0f172a", fg="#cbd5e1")
        self.log.pack(pady=(0, 14))

        self.install_button = tk.Button(
            self,
            text="Install",
            command=self.start_install,
            bg="#0b63f6",
            fg="white",
            padx=28,
            pady=8,
            relief=tk.FLAT,
        )
        self.install_button.pack()

    def start_install(self) -> None:
        if self.install_button:
            self.install_button.config(state=tk.DISABLED)
        threading.Thread(target=self.install, daemon=True).start()

    def step(self, message: str, progress: int) -> None:
        self.status_var.set(message)
        self.progress_var.set(progress)
        if self.log:
            self.log.insert(tk.END, f"{message}\n")
            self.log.see(tk.END)
        self.update_idletasks()

    def install(self) -> None:
        try:
            if EXTENSION_ID.startswith("REPLACE_"):
                raise RuntimeError("Set EXTENSION_ID in setup.py before building the production installer.")

            self.step("Creating install folders...", 15)
            INSTALL_DIR.mkdir(parents=True, exist_ok=True)
            LOG_DIR.mkdir(parents=True, exist_ok=True)

            self.step("Copying native host executable...", 35)
            source_host = resource_path(HOST_FILENAME)
            if not source_host.exists():
                raise FileNotFoundError(f"Missing bundled {HOST_FILENAME}")
            host_path = INSTALL_DIR / HOST_FILENAME
            shutil.copy2(source_host, host_path)

            self.step("Writing Native Messaging manifest...", 55)
            manifest_path = INSTALL_DIR / f"{HOST_NAME}.json"
            manifest = {
                "name": HOST_NAME,
                "description": "Thai ID Card Reader for G-HUB ERP",
                "path": str(host_path),
                "type": "stdio",
                "allowed_origins": [f"chrome-extension://{EXTENSION_ID}/"],
            }
            manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

            self.step("Registering Chrome and Edge native host...", 78)
            for key_path in (CHROME_NATIVE_KEY, EDGE_NATIVE_KEY):
                with winreg.CreateKey(winreg.HKEY_LOCAL_MACHINE, key_path) as key:
                    winreg.SetValueEx(key, "", 0, winreg.REG_SZ, str(manifest_path))

            self.step("Installation complete.", 100)
            messagebox.showinfo(
                APP_NAME,
                "G-HUB Thai ID Scanner installed.\n\nRestart Chrome/Edge if the web app still cannot detect it.",
            )
            self.destroy()
        except Exception as exc:
            self.step(f"Install failed: {exc}", 0)
            messagebox.showerror(APP_NAME, str(exc))
            if self.install_button:
                self.install_button.config(state=tk.NORMAL)


if __name__ == "__main__":
    run_as_admin()
    Installer().mainloop()
