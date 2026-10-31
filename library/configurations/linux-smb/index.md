---
title: linux-smb
description: Installs and configures Samba (SMB file sharing)
config: linux-smb
os: Linux
category: Linux — services & network
draft: false
sourceUrl: https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/linux-smb
---

Installs and configures Samba (SMB file sharing)

## Implementation

- Installs Samba and replaces `/etc/samba/smb.conf` with a WORKGROUP/user-security configuration.
- Creates a browsable, writable, guest-enabled `shared` share at `/srv/smb/shared`, creates that directory with mode 0777 and enables/restarts smbd.

Source: [Ansible task template](<https://github.com/cradle-lang/cradle-lib/blob/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/linux-smb/ansible/linux-smb.j2>).

The module is resolved from `configs/linux-smb/` in the configured `config_dir`.

## Requirements

- A Debian/Ubuntu-style guest with APT, administrator access and package repositories.
- The intended client must have network access to SMB. Guest access also depends on Samba's effective user-mapping behavior; the module does not create users or passwords.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("linux-smb").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
sudo testparm -s
systemctl is-active smbd
stat -c "%a %n" /srv/smb/shared
```

The configuration contains the shared path, smbd is active and the directory mode is 777. Verify actual access from the intended SMB client.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](<https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/linux-smb>). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
