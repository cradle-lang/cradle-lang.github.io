---
title: win-nodejs
description: Installs Node.js
config: win-nodejs
os: Windows
category: Windows — tooling
draft: false
sourceUrl: https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/win-nodejs
---

Installs Node.js

## Implementation

- Installs the `nodejs` Chocolatey package with `state: present`.

Source: [Ansible task template](<https://github.com/cradle-lang/cradle-lib/blob/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/win-nodejs/ansible/win-nodejs.j2>).

The module is resolved from `configs/win-nodejs/` in the configured `config_dir`.

## Requirements

- A Windows guest with administrator privileges, Chocolatey package-source access and the Ansible win_chocolatey module.
- Make Chocolatey available before this task, or use a module/controller setup that can bootstrap it.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("win-nodejs").
```

## Example and verification

After provisioning, run these checks inside the guest:

```powershell
node --version
npm --version
```

Both commands report versions after the installed paths are available in the verification session.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](<https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/win-nodejs>). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
