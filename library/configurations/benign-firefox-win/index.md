---
title: benign-firefox-win
description: Installs Firefox on Windows
config: benign-firefox-win
os: Windows
category: Cross-platform & decoy
draft: false
sourceUrl: https://github.com/cradle-lang/cradle-lib/tree/4a54c498b9854c972607584df8146aeb4ae386ac/configs/benign-firefox-win
---

Installs Firefox on Windows

## Implementation

- Downloads the Windows 64-bit Firefox installer to the provisioning account's temporary directory, installs it silently and removes that installer.
- Skips installation when `C:\Program Files\Mozilla Firefox\firefox.exe` already exists. The download URL selects the current Firefox release rather than a fixed version.

Source: [Ansible task template](<https://github.com/cradle-lang/cradle-lib/blob/4a54c498b9854c972607584df8146aeb4ae386ac/configs/benign-firefox-win/ansible/benign-firefox-win.j2>).

The module is resolved from `configs/benign-firefox-win/` in the configured `config_dir`.

## Requirements

- A Windows guest with PowerShell, installation privileges and HTTPS access to the Mozilla download endpoint.
- The creates check expects the default Program Files installation location.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("benign-firefox-win").
```

## Example and verification

After provisioning, run these checks inside the guest:

```powershell
(Get-Item "C:\Program Files\Mozilla Firefox\firefox.exe").VersionInfo | Select-Object ProductVersion
```

The executable exists and reports a product version.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](<https://github.com/cradle-lang/cradle-lib/tree/4a54c498b9854c972607584df8146aeb4ae386ac/configs/benign-firefox-win>). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
