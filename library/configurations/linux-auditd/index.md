---
title: linux-auditd
description: Installs auditd with a bundled custom audit rules file
config: linux-auditd
os: Linux
category: Linux — observability
draft: false
sourceUrl: https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/linux-auditd
---

Installs auditd with a bundled custom audit rules file

## Implementation

- Installs auditd, copies the bundled rules to `/etc/audit/rules.d/audit.rules`, then enables and restarts auditd.
- The bundled rules begin with `-D`, clearing previously loaded rules when applied, and include watches for audit configuration and audit tooling. Review them alongside existing host audit policy.

Source: [Ansible task template](<https://github.com/cradle-lang/cradle-lib/blob/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/linux-auditd/ansible/linux-auditd.j2>). Supporting [assets](<https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/linux-auditd/files>) are required by the tasks described above.

The module is resolved from `configs/linux-auditd/` in the configured `config_dir`.

## Requirements

- A Debian/Ubuntu-style guest with APT, administrator access and Linux audit support.
- The backend must expose the bundled `files/audit.rules` through `config_asset_dir`.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("linux-auditd").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
sudo auditctl -s
sudo auditctl -l
systemctl is-active auditd
```

The audit subsystem responds, the intended rules appear and auditd reports active.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](<https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/linux-auditd>). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
