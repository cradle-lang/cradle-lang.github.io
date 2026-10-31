---
title: agent-entry
description: Prepare an agent entry instance with discovery, remote access,
  testing and scripting tools before sealing the range.
config: agent-entry
os: Linux
category: Attacker / offensive
draft: false
sourceUrl: https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/agent-entry
---

Prepares the instance from which an autonomous agent starts, with discovery, access, testing and scripting tools installed before the range is sealed.

## Implementation

- Refreshes APT metadata and installs network discovery, diagnostics, remote access, tunnelling, web testing, authentication testing and scripting tools.
- The package list includes nmap, arp-scan, tcpdump, OpenSSH client, sshpass, socat, proxychains4, tmux, gobuster, DIRB, sqlmap, hydra, john, SMB/LDAP clients, python3-impacket, Python, jq and Git.
- Installs tools before the range is sealed. It does not configure a proxy, tunnel, listener or target credentials.

Source: [Ansible task template](<https://github.com/cradle-lang/cradle-lib/blob/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/agent-entry/ansible/agent-entry.j2>).

The module is resolved from `configs/agent-entry/` in the configured `config_dir`.

## Requirements

- A Debian/Ubuntu-style guest with administrator access and working APT repositories. Ubuntu needs Universe enabled for the packages used here.
- Provision before isolating the range. Tools and DIRB wordlists come from the guest distribution; versions are not pinned.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("agent-entry").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
command -v nmap sshpass socat tmux gobuster dirb sqlmap hydra jq
python3 --version
dpkg-query -W python3-impacket
ls /usr/share/dirb/wordlists
```

The commands resolve, the Impacket package is installed and the DIRB wordlist directory exists. Check any additional tools required by the exercise.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](<https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/agent-entry>). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
