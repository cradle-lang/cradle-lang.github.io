---
orphan: true
---

# CRADLE Schema Reference

The CRADLE JSON Schema describes the structured JSON representation of scenario metadata, instances, networks, and events, including the rules applied by JSON Schema validators. It is written for **JSON Schema Draft 7**. This page does not define the human-authored CRADLE block syntax; for that syntax and the properties recognized by the compiler, see the [CRADLE language overview](../language/overview).

```{important}
The current schema is a preview reference. It is not yet fully aligned with the CRADLE grammar and active compiler output, so it should not be treated as the sole validation authority for a product release.
```

## Schema conventions

| Convention | Current behavior |
| --- | --- |
| Schema version | JSON Schema Draft 7 |
| Root type | `object` |
| Required root properties | `metadata`, `instances`, `networks`, `events` |
| Declared defaults | None |
| Unknown properties | Allowed unless a nested rule states otherwise |
| Reference validation | Cross-references between names are not enforced |
| Format validation | Depends on the selected JSON Schema validator |

“Required” in the tables below means required by the current JSON Schema. It does not necessarily mean that the compiler rejects the corresponding CRADLE source when the property is absent.

## Document structure

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `metadata` | Object | Yes | Identifies the scenario and its artifact repository. |
| `instances` | Object map | Yes | Maps instance names to instance definitions. |
| `networks` | Object map | Yes | Maps network names to network definitions. |
| `events` | Object | Yes | Groups events into pre-event, main-event, and post-event phases. |

The schema does not declare `additionalProperties: false`. As a result, standards-compliant validators may accept properties that are not listed on this page.

## Metadata schema

Path: `metadata`

| Property | Type | Required | Allowed value or format | Description |
| --- | --- | --- | --- | --- |
| `name` | String | Yes | Any string | Scenario name. |
| `eventType` | String | Yes | `sequence` or `DAG` | Event organization model. |
| `repositoryRemote` | String | Yes | URI | Remote base location for scenario artifacts. |
| `object` | Array of strings | Yes | Object names | Artifacts declared by the scenario. |

The schema does not define minimum lengths for these strings or the object array. It therefore permits empty strings and an empty array unless another validation layer rejects them.

```{important}
Repository fields should contain locations only. Do not embed usernames, passwords, access tokens, or other credentials in a scenario or schema document.
```

## Instance schema

Path: `instances.<instance-name>`

Each property under `instances` acts as the name of one instance.

| Property | Type | Required | Allowed value or format | Description |
| --- | --- | --- | --- | --- |
| `os` | Object | Yes | See operating-system properties | Operating-system definition. |
| `object` | Array of strings | Yes | Object names | Artifacts associated with the instance. |
| `network` | String | No | Network name | Network associated with the instance. |
| `role` | Object | No | See role properties | Predefined role associated with the instance. |

### Operating-system properties

Path: `instances.<instance-name>.os`

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `name` | String | Yes | None | Operating-system name or platform. |
| `version` | String | Yes | None | Operating-system version. |

### Role properties

Path: `instances.<instance-name>.role`

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `name` | String | Yes, when `role` is present | None | Role name. |
| `vars` | String | No | None | Role-specific variables represented as a string. |

The schema does not validate whether referenced objects, networks, roles, operating systems, or versions are available for a deployment platform.

## Network schema

Path: `networks.<network-name>`

Each property under `networks` acts as the name of one network.

| Property | Type | Required | Allowed value or format | Description |
| --- | --- | --- | --- | --- |
| `subnet` | String | Yes | `ipv4-cidr` format | IPv4 address range for the network. |
| `endpoint` | Object | Yes | See endpoint properties | Instance connected to the network. |

### Endpoint properties

Path: `networks.<network-name>.endpoint`

| Property | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `instance` | String | Yes | None | Name of the connected instance. |
| `config` | String | No | None | Endpoint configuration value. |

`ipv4-cidr` is not one of the standard Draft-07 format names. A validator will enforce it only if that validator supplies a compatible custom format checker.

The schema also models `endpoint` as one object. Current CRADLE examples commonly connect multiple endpoints to a network, which requires reconciliation between the schema and compiler representation.

## Events schema

Path: `events`

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `preEvent` | Object | No | Events associated with the preparation phase. |
| `mainEvent` | Object | No | Events associated with the primary scenario phase. |
| `postEvent` | Object | No | Events associated with the follow-up phase. |

Although `events` is required at the document root, the schema does not require any individual phase.

### Phase schema

Path: `events.<phase>`

| Property | Type | Required | Description |
| --- | --- | --- | --- |
| `event` | Array of objects | No | Event definitions belonging to the phase. |

The schema does not require at least one event and does not enforce unique event names or order values.

### Event properties

Path: `events.<phase>.event[]`

| Property | Type | Required | Allowed value or format | Description |
| --- | --- | --- | --- | --- |
| `instance` | String | Yes | Instance name | Instance associated with the event. |
| `needRoot` | String | Yes | `true` or `false` | Whether elevated privileges are requested. |
| `subject` | String | Yes | Any string | Execution subject. |
| `runObject` | String | Yes | Object name | Artifact associated with the event. |
| `pauseBeforeRun` | Integer | No | Integer | Delay before the event, represented in seconds. |
| `pauseAfterRun` | Integer | No | Integer | Delay after the event, represented in seconds. |
| `waitfor` | String | No | `true` or `false` | Whether the event waits before proceeding. |
| `scheduleExecution` | String | No | `date-time` format | Scheduled event time. |
| `description` | String | No | Any string | Human-readable purpose of the event. |

The schema does not declare defaults for optional event properties. Any defaults described by the compiler are implementation behavior rather than JSON Schema defaults.

## What the schema validates

When used with a validator that implements the declared formats, the schema can check:

- the presence of the four required top-level sections;
- basic object, array, string, and integer types;
- required properties within metadata, instances, networks, and events;
- allowed `eventType`, `needRoot`, and `waitfor` values; and
- URI and date-time formatting supported by the validator.

## What the schema does not validate

The current schema does not establish that:

- an instance, network, event, object, role, image, or configuration actually exists;
- a named reference resolves to another part of the scenario;
- an endpoint address belongs to its declared subnet;
- an event dependency resolves or is free of cycles;
- an artifact location is reachable or authorized;
- a target platform supports every requested capability;
- arrays contain unique values or a minimum number of entries; or
- unknown properties are rejected.

These checks require compiler validation, semantic validation, deployment-platform validation, or a future stricter schema.

## Known implementation differences

The schema and current reference implementation differ in several material areas:

| Area | JSON Schema | Current compiler or scenarios |
| --- | --- | --- |
| Metadata names | `name`, `repositoryRemote`, `object` | Compiler output uses a different metadata structure for the screenplay name, repositories, and objects. |
| Instances | Object map keyed by instance name | Compiler output represents instances as a list of named objects. |
| Objects | Metadata contains an array of strings | Compiler output includes object identifiers, locations, and optional heuristic data. |
| Networks | Object map with one endpoint object | Compiler output represents networks and endpoints as lists. |
| Endpoint fields | `instance` and optional `config` | Compiler output uses endpoint name and IP-related data. |
| Event phases | Phase object containing an `event` array | Compiler output represents each phase directly as an event list. |
| Event delays | Integers | CRADLE source examples pass quoted values, and the compiler may preserve them as strings. |
| `waitfor` | Only `true` or `false` | Existing scenarios also use event names or order identifiers. |
| Extensions | Limited to listed schema properties | The compiler recognizes additional properties such as configurations, descriptions, heuristics, I/O definitions, local repositories, and execution-flow settings. |

Because of these differences, successfully validating data against the current schema does not guarantee equivalent compiler behavior, and compiler output may not validate against the schema without transformation.

## Versioning and distribution

The current schema does not declare a versioned `$id`, product release, or compatibility range. Before it is distributed as a customer-facing validation contract, maintainers should:

1. select the canonical structured representation;
2. align the compiler, schema, examples, and tests;
3. assign a versioned schema identifier;
4. decide whether unknown properties should be rejected;
5. define and test custom formats such as `ipv4-cidr`;
6. document compatibility with each CRADLE release; and
7. confirm whether the raw JSON Schema is included in the proprietary product delivery.

Until that decision is approved, this documentation describes the schema but does not publish a downloadable copy as a supported customer artifact.

## Related documentation

- [CRADLE Language Overview](../language/overview)
- [Hello World Example](../examples/hello-world)
- [Heuristic Annotations](../language/heuristics)
- [Compiler Pipeline](../internals/compiler-pipeline)
- [Backend Overview](../guides/backends/overview)
