# G-HUB Thai ID Native Host

This host is called by the Chrome/Edge extension through Native Messaging.
It reads Thai ID cards through Windows PC/SC using `pyscard`.

Build:

```powershell
py -m pip install -r requirements.txt
py -m PyInstaller --onefile --noconsole --name thai-id-host main.py
```

The generated `dist/thai-id-host.exe` is packaged by `tools/thai-id-setup/setup.py`.

Important:
- Test with the real reader/card before publishing.
- Native Messaging must write only protocol frames to stdout. Logs go to `C:\ProgramData\GHUB\thai-id-native-host.log`.
- Replace `REPLACE_WITH_EXTENSION_ID` in the manifest after the extension ID is known.
