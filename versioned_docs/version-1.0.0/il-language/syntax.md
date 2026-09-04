---
draft: true
---

# IL Syntax and Structure

The documented Intermediary Language (IL) expresses one property or relationship per line. It uses predictable phrases to make a CRADLE scenario easier to read during design and review.

:::note

This page defines a documentation convention, not a production parser grammar. The current reference branch does not provide an IL parser or automated converter.
:::

## General patterns

Most statements follow one of these forms:

```text
component has property value
named-component Name has property value
named-component Name action object value
```

Examples:

```text
environment has name ExampleEnvironment
instance Client has os ubuntu 20.04
event initialize_client run object InitializationScript
```

## Value conventions

Because no parser contract currently exists, use these conventions to reduce ambiguity:

| Value | Convention | Example |
| --- | --- | --- |
| Name | Use a stable name without spaces | `TargetServer` |
| Boolean | Use lowercase `true` or `false` | `false` |
| Duration | Use whole seconds | `10` |
| Date-time | Use ISO 8601 with a time-zone designator | `2026-01-15T10:00:00Z` |
| Address | Use an IPv4 address, CIDR range, or `DHCP` as appropriate | `192.168.10.0/24` |
| Free text | Quote text containing spaces | `"Initialize the client"` |
| Parameters | Use a structured map | `{ mode = "safe", count = 1 }` |

:::important

Names are cross-references. Use the same spelling and capitalization everywhere an instance, network, object, or event is referenced.
:::

## Environment statements

The environment statements correspond conceptually to CRADLE metadata.

| Purpose | IL form | CRADLE concept |
| --- | --- | --- |
| Scenario name | `environment has name \{Name\}` | `name("...")` |
| Event model | `environment has event type sequence` | `eventType("sequence")` |
| Remote repository | `environment has repository remote \{URI\}` | `repositoryRemote("...")` |

Example:

```text
environment has name ExampleEnvironment
environment has event type sequence
environment has repository remote https://172.18.178.10:4443
```

The documented IL notation does not contain a separate object-declaration statement for metadata. A manual translation must collect object names from instance, event, and object-location statements and declare them in CRADLE metadata.

## Instance statements

| Purpose | IL form | CRADLE concept |
| --- | --- | --- |
| Operating system | `instance \{Name\} has os \{Platform\} \{Version\}` | `os("...", "...")` |
| Object association | `instance \{Name\} has object \{Object\}` | `object("...")` |
| Configuration | `instance \{Name\} has config \{Configuration\}` | `config("...")` |
| Role | `instance \{Name\} has role \{Collection\} \{Role\} \{Variables\}` | `role("...", "...", { key = value })` |

Example:

```text
instance Client has os ubuntu 20.04
instance Client has object InitializationScript
instance Router has os ubuntu 20.04
instance Router has config linux-router
instance Router has role example.collection router { lan = "lan_0" }
```

The current compiler’s role form distinguishes a collection name from a role name. Older IL documentation represented only a role and variables, which is not sufficient for a lossless mapping to the current compiler form.

## Network statements

| Purpose | IL form | CRADLE concept |
| --- | --- | --- |
| Subnet | `network \{Name\} has subnet \{CIDR\}` | `subnet("...")` |
| Endpoint | `network \{Name\} has endpoint \{Instance\} \{Address\}` | `endpoint("...", "...")` |

Example:

```text
network lan_0 has subnet 192.168.10.0/24
network lan_0 has endpoint Client DHCP
network lan_0 has endpoint Router 192.168.10.1
```

Network and instance declarations are inferred during manual translation. Each network and endpoint name must be declared explicitly in formal CRADLE.

## Event-phase statements

| Purpose | IL form | CRADLE concept |
| --- | --- | --- |
| Pre-event membership | `preEvent has event \{Event\}` | Event listed in `preEvent()` |
| Main-event membership | `mainEvent has event \{Event\}` | Event listed in `mainEvent()` |
| Post-event membership | `postEvent has event \{Event\}` | Event listed in `postEvent()` |

Example:

```text
mainEvent has event initialize_client
```

:::important

Every event should belong to one phase. Semantic event names should be unique within a scenario.
:::

## Event statements

| Purpose | IL form | CRADLE concept |
| --- | --- | --- |
| Instance | `event \{Event\} has instance \{Instance\}` | `instance("...")` |
| Elevated privileges | `event \{Event\} need root \{true\|false\}` | `needRoot(false)` |
| Subject | `event \{Event\} has subject \{Subject\} \{Parameters\}` | `subject("...", "...")` |
| Object | `event \{Event\} run object \{Object\} \{Parameters\}` | `runObject("...", { key = value })` |
| Delay before | `event \{Event\} pause before run \{Seconds\}` | `pauseBeforeRun(0)` |
| Delay after | `event \{Event\} pause after run \{Seconds\}` | `pauseAfterRun(5s)` |
| Dependency | `event \{Event\} depends on \{Event\}` | `dependsOn("event_name")` |
| Schedule | `event \{Event\} has schedule execution \{DateTime\}` | `scheduleExecution("...")` |
| Description | `event \{Event\} has description \{Text\}` | `description("...")` |

Example:

```text
event initialize_client has instance Client
event initialize_client need root false
event initialize_client has subject bash ""
event initialize_client run object InitializationScript ""
event initialize_client pause before run 0
event initialize_client pause after run 0
event initialize_client has schedule execution 2026-01-15T10:00:00Z
event initialize_client has description "Initialize the client"
```

:::important

An event without an explicit dependency omits the `depends on` statement.
:::

## Object statements

| Purpose | IL form | CRADLE concept |
| --- | --- | --- |
| Artifact location | `object \{Name\} has location \{Location\}` | `location("...")` |

Example:

```text
object InitializationScript has location ${uriRemote}/scripts/initialize.sh
```

:::important

Object names must be added to CRADLE metadata and must match instance and event references.
:::

## Mapping coverage

| CRADLE area | IL coverage | Limitation |
| --- | --- | --- |
| Basic metadata | Partial | Local repositories and some metadata extensions are not represented. |
| Instances | Partial | Architecture, I/O, descriptions, and heuristics are not defined. |
| Roles | Partial | The current three-part role form supersedes older two-part IL examples. |
| Networks | Basic | Platform-specific network behavior is not represented. |
| Event phases | Basic | Phase membership is represented one event at a time. |
| Events | Partial | Advanced waits and heuristics are not defined. |
| Objects | Basic | Location is represented; heuristic annotations are not defined. |

## Translation checks

When translating an IL document into formal CRADLE, verify that:

- all required top-level CRADLE sections are present
- instances, networks, events, and objects are declared before use
- every named reference resolves exactly
- free-text and parameter boundaries remain intact
- IL values use the types and allowed values expected by the target CRADLE release
- unsupported compiler properties have not been omitted
- the resulting CRADLE specification is reviewed independently of the IL text

## Related documentation

- [Intermediary Language](index.md)
- [Intermediary Language Example](example.md)
- [CRADLE Language Overview](../language/overview)
- [CRADLE Schema Reference](../schema/cradle-schema.md)
