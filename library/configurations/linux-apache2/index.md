---
title: linux-apache2
description: Installs and starts Apache HTTP Server
config: linux-apache2
os: Linux
category: Linux — services & network
draft: false
sourceUrl: https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/linux-apache2
---

Installs and starts Apache HTTP Server

## Implementation

- Installs the APT package `apache2` with `state: present`. Starts and enables the `apache2` service.

Source: [Ansible task template](<https://github.com/cradle-lang/cradle-lib/blob/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/linux-apache2/ansible/linux-apache2.j2>).

The module is resolved from `configs/linux-apache2/` in the configured `config_dir`.

## Requirements

- A Debian/Ubuntu-style guest with APT, administrator privileges and access to its configured package repositories.
- The package must be available for the guest distribution. The module does not pin a package version.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("linux-apache2").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
apache2ctl configtest
systemctl is-active apache2
```

The configuration check reports syntax OK and the service reports active.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](<https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/linux-apache2>). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
