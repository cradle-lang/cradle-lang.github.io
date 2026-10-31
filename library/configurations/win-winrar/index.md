---
title: win-winrar
description: Installs WinRAR
config: win-winrar
os: Windows
category: Windows — tooling
draft: false
sourceUrl: https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/win-winrar
---

Installs WinRAR

## Implementation

- Installs the `winrar` Chocolatey package with `state: present`. The package version is not pinned.

Source: [Ansible task template](<https://github.com/cradle-lang/cradle-lib/blob/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/win-winrar/ansible/win-winrar.j2>).

The module is resolved from `configs/win-winrar/` in the configured `config_dir`.

## Requirements

- A Windows guest with administrator privileges, Chocolatey package-source access and the Ansible win_chocolatey module.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("win-winrar").
```

## Example and verification

After provisioning, run these checks inside the guest:

```powershell
(Get-Item "C:\Program Files\WinRAR\WinRAR.exe").VersionInfo | Select-Object ProductVersion
```

WinRAR exists at the package's installed path and reports a version; adjust the path if the package uses another location.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](<https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/win-winrar>). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
