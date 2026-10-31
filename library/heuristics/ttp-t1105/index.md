---
title: "T1105: Ingress Tool Transfer"
description: Adversaries may transfer tools or other files from an external
  system (e.g., C2 infrastructure or public repositories) into a compromised
  host environment.
framework: ttp
identifier: T1105
draft: false
sourceUrl: https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/heuristics/ttp/T1105
---

# T1105: Ingress Tool Transfer

## Overview

Adversaries may transfer tools or other files from an external system (e.g., C2 infrastructure or public repositories) into a compromised host environment.

## Implementation Details

- **Simulated Tool Transfer**: Downloads an external binary onto the compromised host using HTTP/HTTPS.
- **Payload**: Microsoft AVML (Acquire Volatile Memory for Linux) binary release v0.14.0 from GitHub. AVML is a trusted memory-acquisition utility used safely here to simulate adversary tooling.
- **Staging Location**: `/usr/local/bin/cxc-ingress-tool` (permissions `0755`).

## Structure

- [ansible/](<https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/heuristics/ttp/T1105/ansible>): Contains the Ansible task list template (`T1105.j2`).

## Verification

Check that the ingress tool binary was retrieved and marked executable:

```bash
ls -la /usr/local/bin/cxc-ingress-tool
/usr/local/bin/cxc-ingress-tool --help
```

## Use in a specification

Attach this heuristic to an existing compatible instance. Consult the module's manifest and documented backend requirements for its operating system and configuration dependencies. This fragment is not a complete scenario:

```cradle
instance("host") >
    heuristic("ttp", "T1105").
```
