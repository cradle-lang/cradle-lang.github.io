---
title: linux-tcpdump
description: Installs tcpdump plus a bundled capture script and service
config: linux-tcpdump
os: Linux
category: Linux — observability
draft: false
sourceUrl: https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/linux-tcpdump
---

Installs tcpdump plus a bundled capture script and service

## Implementation

- Installs the bundled capture script and systemd unit, then starts/enables tcpdump.service.
- Replaces `/home/<user>` paths in the script with the backend's `linux_guest_home_dir` value.
- The script captures all interfaces into 30-second pcap segments under the selected home directory's `network/` folder. It does not install the tcpdump executable.

Source: [Ansible task template](<https://github.com/cradle-lang/cradle-lib/blob/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/linux-tcpdump/ansible/linux-tcpdump.j2>). Supporting [assets](<https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/linux-tcpdump/files>) are required by the tasks described above.

The module is resolved from `configs/linux-tcpdump/` in the configured `config_dir`.

## Requirements

- A Linux guest with systemd, bash, tcpdump, GNU timeout and administrator privileges.
- The backend must supply `linux_guest_home_dir` and expose the bundled script and service through `config_asset_dir`. Ensure the capture path has space available.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("linux-tcpdump").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
command -v tcpdump timeout
systemctl is-active tcpdump
sudo systemctl cat tcpdump
sudo grep -n network /etc/systemd/system/linux_tcpdump.sh
```

The tools exist and the service is active. After at least 30 seconds, check the resolved home directory's network folder for capture_<timestamp>.pcap segments.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](<https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/linux-tcpdump>). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
