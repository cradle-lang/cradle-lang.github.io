---
orphan: true
---

# Intermediary Language Example

This example shows how the documented Intermediary Language (IL) notation corresponds conceptually to formal CRADLE syntax. It describes two instances connected to one network and one event associated with an external object.

```{important}
The IL document below is illustrative. The current reference branch does not provide a production IL parser or converter, so the CRADLE version is a reviewed manual mapping rather than generated output.
```

## Scenario summary

| Component | Name | Purpose |
| --- | --- | --- |
| Environment | `ExampleEnvironment` | Identifies the scenario. |
| Client instance | `Client` | Associates the initialization object with a system. |
| Router instance | `Router` | Represents a configured router on the same network. |
| Network | `lan_0` | Connects the client and router. |
| Object | `InitializationScript` | References an external artifact. |
| Event | `1` | Associates the object with the client in the main-event phase. |

## IL document

```text
environment has name ExampleEnvironment
environment has event type sequence
environment has repository remote https://example.com/repository

instance Client has os ubuntu 20.04
instance Client has object InitializationScript

instance Router has os ubuntu 20.04
instance Router has config linux-router
instance Router has role example.collection router "lan=lan_0"

network lan_0 has subnet 192.168.10.0/24
network lan_0 has endpoint Client DHCP
network lan_0 has endpoint Router 192.168.10.1

mainEvent has event 1

event 1 has instance Client
event 1 need root false
event 1 has subject bash ""
event 1 run object InitializationScript ""
event 1 pause before run 0
event 1 pause after run 0
event 1 wait for false
event 1 has schedule execution 2026-01-15T10:00:00Z
event 1 has description "Initialize the example client"

object InitializationScript has location ${uriRemote}/scripts/initialize.sh
```

## Corresponding CRADLE specification

```CRADLE
metadata() >
    name("ExampleEnvironment"),
    eventType("sequence"),
    repositoryRemote("https://example.com/repository"),
    object("InitializationScript").

instances() >
    instance("Client"),
    instance("Router").

instance("Client") >
    os("ubuntu", "20.04"),
    object("InitializationScript").

instance("Router") >
    os("ubuntu", "20.04"),
    config("linux-router"),
    role("example.collection", "router", "lan=lan_0").

networks() >
    network("lan_0").

network("lan_0") >
    subnet("192.168.10.0/24"),
    endpoint("Client", "DHCP"),
    endpoint("Router", "192.168.10.1").

events() >
    preEvent(),
    mainEvent(),
    postEvent().

mainEvent() >
    event("1").

event("1") >
    instance("Client"),
    needRoot("false"),
    subject("bash", ""),
    runObject("InitializationScript", ""),
    pauseBeforeRun("0"),
    pauseAfterRun("0"),
    waitfor("false"),
    scheduleExecution("2026-01-15T10:00:00Z"),
    description("Initialize the example client").

object("InitializationScript") >
    location("${uriRemote}/scripts/initialize.sh").
```

## Mapping explanation

| IL statements | CRADLE representation |
| --- | --- |
| `environment has ...` | Properties collected inside `metadata()` |
| Repeated `instance Name has ...` lines | One declaration in `instances()` and one named instance block |
| Repeated `network Name has ...` lines | One declaration in `networks()` and one named network block |
| `mainEvent has event 1` | Event reference inside `mainEvent()` |
| Repeated `event 1 ...` lines | Properties collected inside `event("1")` |
| `object ... has location ...` | Named object block containing `location` |

Formal CRADLE also requires declarations that the IL notation only implies. In this example:

- both instance names are collected into `instances()`;
- `lan_0` is collected into `networks()`;
- `InitializationScript` is added to metadata;
- all three event-phase blocks are declared; and
- each set of repeated IL statements becomes one named CRADLE block.

## What is preserved

The manual mapping preserves:

- scenario and component names;
- operating-system names and versions;
- object associations and locations;
- network topology and addresses;
- event-phase membership;
- event properties, parameters, timing, and description; and
- the three-part role definition used by the current compiler.

## What requires review

Even a direct-looking mapping requires human review because:

- IL has no implemented grammar defining quotation or escaping behavior;
- declarations must be inferred and added to formal CRADLE;
- some CRADLE extensions have no IL form;
- role, parameter, and free-text boundaries may be ambiguous; and
- compiler, schema, and platform constraints apply only after formal CRADLE is produced.

## Related documentation

- [Intermediary Language](index.md)
- [IL Syntax and Structure](syntax.md)
- [CRADLE Language Structure](../introduction/sections.md)
- [Hello World Example](../introduction/helloworld.md)
- [CRADLE Schema Reference](../schema/cradle-schema.md)
