---
title: attacker
description: Installs a baseline attacker toolkit (nmap, netcat, curl, wget,
  python3/pip, Flask)
config: attacker
os: Linux
category: Attacker / offensive
draft: false
sourceUrl: https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/attacker
---

Installs a baseline attacker toolkit (nmap, netcat, curl, wget, python3/pip, Flask)

## Implementation

- Refreshes APT metadata and installs nmap, netcat, curl, wget, Python 3 and python3-pip.
- Installs Flask using the Ansible pip module. No listener or attack workflow is started.

Source: [Ansible task template](<https://github.com/cradle-lang/cradle-lib/blob/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/attacker/ansible/attacker.j2>).

The module is resolved from `configs/attacker/` in the configured `config_dir`.

## Requirements

- A Debian/Ubuntu-style guest with administrator privileges and access to APT repositories.
- A working Python package index for Flask. The guest Python environment must permit the pip install performed by the module.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("attacker").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
command -v nmap nc curl wget
python3 -m pip show Flask
```

The tools resolve and pip reports an installed Flask package.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](<https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/attacker>). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
