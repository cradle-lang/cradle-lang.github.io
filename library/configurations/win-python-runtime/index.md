---
title: win-python-runtime
description: Extracts a shared Python 3.10 runtime under C:\ProgramData\cxc
config: win-python-runtime
os: Windows
category: Windows — tooling
draft: false
sourceUrl: https://github.com/cradle-lang/cradle-lib/tree/4a54c498b9854c972607584df8146aeb4ae386ac/configs/win-python-runtime
---

## Use in a specification

```cradle
config("win-python-runtime").
```

Installs one shared Python 3.10 runtime at:

```text
C:\ProgramData\cxc\python\python.exe
```

The archive is derived from WinPython 3.10.11. Documentation, headers, import
libraries, and developer tools are removed; the Python runtime, standard
library, pip, DLLs, and Tcl/Tk runtime are retained for Railway GUI and
automation workloads.

The companion `.sha256` file is verified in the guest before extraction.
Python package dependencies are installed by separate platform-specific configs.
