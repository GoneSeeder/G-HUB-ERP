# G-HUB Thai ID Setup

This folder contains the Windows installer source for registering the Native
Messaging Host.

Build flow:

```powershell
cd C:\Users\User\Desktop\G-HUB\tools\thai-id-native-host
py -m pip install -r requirements.txt
py -m PyInstaller --onefile --noconsole --name thai-id-host main.py

Copy-Item .\dist\thai-id-host.exe ..\thai-id-setup\thai-id-host.exe -Force

cd ..\thai-id-setup
# Edit EXTENSION_ID in setup.py first.
py -m PyInstaller --onefile --windowed --add-data "thai-id-host.exe;." --name thai-id-setup setup.py

Copy-Item .\dist\thai-id-setup.exe ..\..\apps\frontend\public\downloads\thai-id-setup.exe -Force
```

Production notes:
- `EXTENSION_ID` is known only after publishing or loading a stable extension package.
- The installer writes HKLM registry keys, so Windows UAC admin approval is required.
- The web app cannot silently run this installer; the user must open it once.
