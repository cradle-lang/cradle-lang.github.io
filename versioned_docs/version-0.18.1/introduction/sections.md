---
draft: true
---

# CRADLE Language Structure

A CRADLE scenario is composed of named blocks. The four principal sections describe scenario metadata, instances, networks, and events. Named object definitions connect external artifacts to the scenario.

This page documents the human-authored CRADLE source language: the block
syntax, declarations, references, and properties recognized by the current
reference implementation. Tool developers working with structured output can
consult the [Deployment IR contract](../backend-development/deployment-ir-contract).

## How to read this reference

CRADLE currently has three related sources of language behavior:

- the **grammar**, which defines valid block, identifier, string, separator, and comment syntax
- the **JSON Schema**, which describes the expected structured output and its required properties
- the **compiler**, which recognizes CRADLE properties and supplies some defaults

These sources are not yet completely aligned. Tables on this page use the following labels:

| Status | Meaning |
| --- | --- |
| Schema required | The current JSON Schema lists the property as required. |
| Schema optional | The schema recognizes the property but does not require it. |
| Compiler extension | The compiler recognizes the property, but the current schema does not document it. |
| Structural | The property declares or links a language block rather than becoming a direct schema field. |

Review the known language and schema differences at the end of this page before relying on validation alone.

## Core syntax

| Element | Form | Notes |
| --- | --- | --- |
| Simple block | `identifier() > ... .` | A period terminates the block. |
| Named block | `identifier("name") > ... .` | The quoted name identifies the definition. |
| Property | `identifier(value)` | Properties contain one or more comma-separated typed values. |
| Reference | `identifier()` or `identifier("name")` | A reference links declarations and definitions. |
| Map | `{ key = value }` | Supplies structured named parameters. |
| Separator | `,` | Separates entries inside a block. |
| Comment | `// comment text` | Continues to the end of the line. |
| Identifier | Letters, digits, `_`, and `-` | The first character must be an ASCII letter. |
| String | `"quoted value"` | String values are double-quoted; escaped characters are supported. |

The grammar validates the general shape of a file. It does not by itself restrict property names or the semantic meaning of their values.

## Scenario structure

| Section | Purpose |
| --- | --- |
| `metadata()` | Identifies the scenario, event model, repositories, and artifacts. |
| `instances()` | Declares the systems participating in the scenario. |
| `networks()` | Declares networks and connects instances to them. |
| `events()` | Organizes behavior into pre-event, main-event, and post-event phases. |
| `object("name")` | Defines the location and optional heuristic tags of an artifact. |

Names act as cross-references. An instance listed in `instances()` must have a matching `instance("name")` definition, for example. The same principle applies to networks, events, and objects.

## Metadata

The `metadata()` block identifies the scenario and the artifacts it uses.

| Property | Arguments | Status | Description |
| --- | --- | --- | --- |
| `name` | Scenario name | Schema required | Human-readable identifier for the scenario. |
| `eventType` | `sequence` | Schema required | Selects the supported sequential event model. The compiler defaults to `sequence` when omitted. |
| `repositoryRemote` | URI | Schema required | Base location for remotely stored artifacts. |
| `repositoryLocal` | Location | Compiler extension | Base location for locally available artifacts. |
| `object` | Object name | Schema required | Declares an artifact used by the scenario. Repeat for multiple objects. |

```CRADLE
metadata() >
    name("ExampleEnvironment"),
    eventType("sequence"),
    repositoryRemote("https://172.18.178.10:4443"),
    object("InitializationScript").
```

```{important}
Repository values identify artifact locations. They should not contain embedded credentials.
```

## Object definitions

Each object declared by metadata is defined in a matching named block.

| Property | Arguments | Status | Description |
| --- | --- | --- | --- |
| `location` | URI or repository-relative location | Structural | Locates the corresponding artifact. `${uriRemote}` can refer to the remote repository defined in metadata. |
| `heuristic` | Framework, identifier | Compiler extension | Associates the object with an external classification or framework identifier. Repeat for multiple tags. |

```CRADLE
object("InitializationScript") >
    location("${uriRemote}/scripts/initialize.sh"),
    heuristic("mbc", "F0002").
```

```{important}
Object names must match their declarations and references exactly.
```

## Instances

The `instances()` block declares the systems in the scenario. Each system is then described in a matching `instance("name")` block.

| Property | Arguments | Status | Description |
| --- | --- | --- | --- |
| `instance` | Instance name | Structural | Declares an instance. Repeat for multiple systems. |
| `os` | Platform, version, architecture | Schema required | Describes the operating system. |
| `object` | Object name | Schema required | Associates a declared object with the instance. Repeat for multiple objects. |
| `config` | Configuration name | Compiler extension | Associates a predefined configuration with the instance. Repeat for multiple configurations. |
| `io` | I/O definition name | Compiler extension | Associates a predefined input/output definition with the instance. |
| `role` | Collection, role, variable map | Schema optional | Associates a predefined role with optional typed variables. |
| `description` | Text | Compiler extension | Provides a human-readable explanation of the instance. |
| `heuristic` | Framework, identifier | Compiler extension | Associates an external classification or framework identifier. |

```CRADLE
instances() >
    instance("Client"),
    instance("Router").

instance("Client") >
    os("ubuntu", "20.04"),
    object("InitializationScript"),
    description("Example client system").

instance("Router") >
    os("ubuntu", "20.04"),
    config("linux-router"),
    role("example.collection", "router", {
        lan = "lan_0"
    }).
```

```{important}
Collection, role, configuration, and image availability can depend on the selected deployment platform and product delivery.
```

## Networks

The `networks()` block declares network names. Each network definition describes its address range and connected instances.

| Property | Arguments | Status | Description |
| --- | --- | --- | --- |
| `network` | Network name | Structural | Declares a network. Repeat for multiple networks. |
| `subnet` | IPv4 CIDR range | Schema required | Defines the network address range. The compiler currently permits omission and emits an empty value. |
| `endpoint` | Instance name, address | Schema required | Connects a declared instance. The address defaults to `DHCP` when omitted by the compiler. |

```CRADLE
networks() >
    network("lan_0").

network("lan_0") >
    subnet("192.168.10.0/24"),
    endpoint("Client", "DHCP"),
    endpoint("Router", "192.168.10.1").
```

```{important}
Endpoint names must match declared instance names. Address behavior can also depend on the selected platform.
```

## Events

The `events()` block divides the scenario timeline into three phases:

- `preEvent()` for preparation that occurs before the primary scenario
- `mainEvent()` for the primary scenario behavior
- `postEvent()` for follow-up or evidence-related activity

Each phase lists named events, and every event is described in a matching `event("name")` block.

| Property | Arguments | Status | Description |
| --- | --- | --- | --- |
| `event` | Semantic event name | Structural | Declares an event within a phase. |
| `instance` | Instance name | Schema required | Selects the instance associated with the event. |
| `needRoot` | `true` or `false` | Schema required | Indicates whether elevated privileges are requested. The compiler defaults to `false`. |
| `subject` | Subject, parameters | Schema required | Identifies the execution subject and optional parameters. |
| `runObject` | Object name, parameter map | Schema required | Selects a declared object and optional structured parameters. |
| `pauseBeforeRun` | Duration in seconds | Schema optional | Adds a delay before the event. The compiler defaults to `0`. |
| `pauseAfterRun` | Duration in seconds | Schema optional | Adds a delay after the event. The compiler defaults to `0`. |
| `dependsOn` | Event name | Schema optional | Adds an explicit dependency. Repeat for multiple dependencies. |
| `scheduleExecution` | ISO 8601 date-time | Schema optional | Associates the event with a scheduled time. |
| `description` | Text | Schema optional | Explains the purpose of the event. |
| `heuristic` | Framework, identifier | Compiler extension | Associates an external classification or framework identifier. |

```CRADLE
events() >
    preEvent(),
    mainEvent(),
    postEvent().

mainEvent() >
    event("initialize_client").

event("initialize_client") >
    instance("Client"),
    needRoot(false),
    subject("bash", ""),
    runObject("InitializationScript", ""),
    pauseBeforeRun(0),
    pauseAfterRun(0),
    scheduleExecution("2026-01-15T10:00:00+00:00"),
    description("Initialize the example client").
```

```{important}
Semantic event names should be unique within the scenario. Any `instance`, `runObject`, or dependency reference must resolve to a corresponding definition.
```

## Heuristic properties

`heuristic("framework", "identifier")` can appear on supported instances, objects, and events. It adds classification metadata without replacing the underlying CRADLE definition.

See [Heuristic Annotations](heuristic.md) for documented conventions and examples.

## Known language and schema differences

The current reference sources contain differences that maintainers should resolve before treating the JSON Schema as the sole validation authority:

- The grammar validates generic identifiers and typed arguments but does not enforce recognized property names, argument counts, or allowed values.
- The schema requires metadata properties, instance operating systems and objects, and network subnets and endpoints; the compiler supplies defaults or empty values for some of them.
- The compiler recognizes `repositoryLocal`, `config`, `io`, `description`, and `heuristic` in contexts not represented by the current schema.
- The language uses `dependsOn()` for event dependencies.
- The schema and compiler represent some values differently, including event delays and endpoint details.

Until these sources are aligned, validate both the language structure and its intended behavior against the CRADLE release being documented.

## Related documentation

- [What is CRADLE?](../overview/what-is-cradle)
- [Hello World Example](helloworld.md)
- [Write a scenario](../guides/write-a-scenario)
- [Heuristic Annotations](heuristic.md)
- [Deployment IR contract](../backend-development/deployment-ir-contract)
