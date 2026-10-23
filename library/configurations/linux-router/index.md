---
title: Linux routing
config: linux-router
description: Enable IP forwarding so a Linux instance can route traffic between attached networks.
os: Linux
category: Networking
---

The `linux-router` configuration gives a Linux instance its routing role. It is
referenced by both initial scenarios.

## Use in a specification

```cradle
instance("router") >
    os("linux", "20.04"),
    config("linux-router").
```

## Requirements

The deployment configuration library must supply `linux-router`. The backend
must provide the instance with the interfaces declared by the scenario. Routes,
firewall rules and external access remain part of the testbed's network design.

## Implementation files

When contributing or maintaining the configuration, place its implementation,
Ansible templates and supporting assets alongside this article. Reference those
files with relative Markdown links and document how the testbed installs them.
