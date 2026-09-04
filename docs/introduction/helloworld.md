---
draft: true
---

# Hello World example

This example reproduces the canonical `HelloWorld.cradle` scenario: one
Windows instance, one Linux router, one network, one remote object, and one
main event.

## What the scenario contains

| Component | Name | Purpose |
| --- | --- | --- |
| Scenario | `HelloWorld` | Names the environment and generated output. |
| Instances | `win7`, `router` | Defines a Windows system and a Linux router. |
| Network | `lan_0` | Connects both instances with fixed addresses. |
| Object | `HelloWorld` | References the remote `HelloWorld.sh` artifact. |
| Main event | `initialize_client` | Runs on `router` with root privileges. |

## Scenario definition

```cradle
metadata() >
    name("HelloWorld"),
    eventType("sequence"),
    repositoryRemote("https://172.18.178.10:4443"),
    object("HelloWorld").

instances() >
    instance("win7"),
    instance("router").

instance("win7") >
    os("windows", "2019"),
    config("win-icmpv4"),
    config("win-pktmon"),
    config("win-winrm"),
    config("win-routing").

instance("router") >
    os("linux", "20.04"),
    object("HelloWorld"),
    config("linux-vsftpd"),
    config("linux-auditd"),
    config("linux-mail"),
    config("linux-python3"),
    config("python3-pip"),
    config("linux-router").

networks() >
    network("lan_0").

network("lan_0") >
    subnet("192.168.56.0/24"),
    endpoint("win7", "192.168.56.121"),
    endpoint("router", "192.168.56.122").

events() >
    preEvent(),
    mainEvent(),
    postEvent().

mainEvent() >
    event("initialize_client").

event("initialize_client") >
    instance("router"),
    needRoot(true),
    pauseBeforeRun(0),
    pauseAfterRun(0),
    scheduleExecution("2018-11-13T20:20:39+00:00"),
    description("HelloWorld Event").

object("HelloWorld") >
    location("${uriRemote}/TTP/HelloWorld/artifact/HelloWorld.sh").
```

## How the sections connect

- `metadata()` declares the scenario, repository, and `HelloWorld` object.
- `instances()` declares `win7` and `router`; the router associates itself
  with the object.
- `network("lan_0")` connects both instances using the declared subnet and
  fixed addresses.
- `mainEvent()` schedules `initialize_client` on the router.
- `object("HelloWorld")` appends the artifact path to `${uriRemote}`.

The resolved artifact URL is
`https://172.18.178.10:4443/TTP/HelloWorld/artifact/HelloWorld.sh`.

:::important
Confirm that the repository is authorized, reachable, and hosts the required
artifact before deploying the scenario.
:::
