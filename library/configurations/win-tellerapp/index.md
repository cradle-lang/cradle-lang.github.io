---
title: win-tellerApp
description: Deploys a fake "FinCore Systems" banking decoy app as
  social-engineering/EDR bait
config: win-tellerApp
os: Windows
category: Cross-platform & decoy
draft: false
sourceUrl: https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/win-tellerApp
---

Deploys a fake "FinCore Systems" banking decoy app as social-engineering/EDR bait

## Implementation

- Creates `C:\Program Files\FinCore_Systems` and copies the guest's Notepad executable to `TellerClient_v4.exe` inside it.
- The copied executable is a banking-application decoy. It is not a functioning banking service.

Source: [Ansible task template](<https://github.com/cradle-lang/cradle-lib/blob/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/win-tellerApp/ansible/win-tellerApp.j2>).

The module is resolved from `configs/win-tellerApp/` in the configured `config_dir`.

## Requirements

- A Windows guest with administrator privileges and `C:\Windows\System32\notepad.exe` available.
- No external application archive is required; the copy uses `remote_src: yes` within the guest.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("win-tellerApp").
```

## Example and verification

After provisioning, run these checks inside the guest:

```powershell
Get-Item "C:\Program Files\FinCore_Systems\TellerClient_v4.exe"
Get-FileHash "C:\Windows\System32\notepad.exe","C:\Program Files\FinCore_Systems\TellerClient_v4.exe"
```

The decoy executable exists and its hash matches the source Notepad executable used by the task.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](<https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/win-tellerApp>). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
