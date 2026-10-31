---
title: win-audit
description: Configures the Windows advanced audit policy (logon/logoff, ...)
config: win-audit
os: Windows
category: Windows — observability
draft: false
sourceUrl: https://github.com/cradle-lang/cradle-lib/tree/4a54c498b9854c972607584df8146aeb4ae386ac/configs/win-audit
---

Configures the Windows advanced audit policy (logon/logoff, ...)

## Implementation

- Uses auditpol to enable success and failure auditing for all audit categories.
- Explicitly configures Logon success/failure and Logoff/Process Creation success auditing. The module does not configure log forwarding or retention.

Source: [Ansible task template](<https://github.com/cradle-lang/cradle-lib/blob/4a54c498b9854c972607584df8146aeb4ae386ac/configs/win-audit/ansible/win-audit.j2>).

The module is resolved from `configs/win-audit/` in the configured `config_dir`.

## Requirements

- A Windows guest with administrator privileges and auditpol.
- The template uses English subcategory names. Domain policy may override local audit settings.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("win-audit").
```

## Example and verification

After provisioning, run these checks inside the guest:

```powershell
auditpol /get /category:*
Get-WinEvent -LogName Security -MaxEvents 5
```

The intended categories show enabled auditing. After a matching activity occurs, inspect Security events with an account allowed to read that log.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](<https://github.com/cradle-lang/cradle-lib/tree/4a54c498b9854c972607584df8146aeb4ae386ac/configs/win-audit>). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
