---
title: win-pyenv
description: Installs pyenv-win and a Python version through it
config: win-pyenv
os: Windows
category: Windows — tooling
draft: false
sourceUrl: https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/win-pyenv
---

Installs pyenv-win and a Python version through it

## Implementation

- Downloads and executes the pyenv-win installation script, using the provisioning account's home directory as the installation context.
- Uses pyenv to install Python 3.10.5 and selects it as that account's global version.

Source: [Ansible task template](<https://github.com/cradle-lang/cradle-lib/blob/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/win-pyenv/ansible/win-pyenv.j2>).

The module is resolved from `configs/win-pyenv/` in the configured `config_dir`.

## Requirements

- A Windows guest with PowerShell, permission to install pyenv-win, and access to the GitHub installer and Python download sources.
- The following task must be able to resolve pyenv on PATH. A new session or explicit PATH setup may be needed after installing pyenv-win.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("win-pyenv").
```

## Example and verification

After provisioning, run these checks inside the guest:

```powershell
pyenv --version
pyenv global
pyenv versions
```

pyenv is available, 3.10.5 is installed and selected globally for the provisioning account.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](<https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/win-pyenv>). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
