# Hello World Example

This example introduces the main concepts in a CRADLE scenario through a small environment named `HelloWorld`. It contains two instances, one network, one reusable object, and one scheduled event.

The example is intentionally compact. Its purpose is to show how CRADLE connects environment structure with scenario behavior, not to describe an operational deployment procedure.

## Learning objectives

After reading this page, you should be able to:

- identify the main sections of a CRADLE scenario
- follow references between instances, networks, events, and objects
- understand how an event associates behavior with a specific instance
- distinguish the scenario definition from provider-specific deployment details

For definitions of individual properties, refer to [CRADLE Language Structure](sections.md) and the [CRADLE Schema Reference](../schema/cradle-schema.md).

## Scenario at a glance

| Component | Definition | Purpose |
| --- | --- | --- |
| Environment | `HelloWorld` | Identifies the scenario in its metadata. |
| Application instance | `HelloWorld` | Represents the system associated with the example object and event. |
| Router instance | `router` | Represents the routing component connected to the same network. |
| Network | `lan_0` | Connects both instances using DHCP addressing. |
| Object | `HelloWorld` | References the external script associated with the scenario. |
| Main event | `1` | Associates the object with the `HelloWorld` instance at a scheduled time. |

## CRADLE specification

```CRADLE
instances() >
    instance("HelloWorld"),
    instance("router").

instance("HelloWorld") >
    os("ubuntu", "20.04"),
    object("HelloWorld").

instance("router") >
    os("ubuntu", "20.04"),
    config("linux-router"),
    role("example.collection", "router", "var1=val1;var2=val2;var3=val3").

networks() >
    network("lan_0").

network("lan_0") >
    endpoint("HelloWorld", "DHCP"),
    endpoint("router", "DHCP").

metadata() >
    name("HelloWorld"),
    eventType("sequence"),
    repositoryRemote("https://my-repo-url:4443"),
    object("HelloWorld").

events() >
    preEvent(),
    mainEvent(),
    postEvent().

mainEvent() >
    event("1").

event("1") >
    instance("HelloWorld"),
    needRoot("true"),
    subject("bash", ""),
    runObject("HelloWorld", ""),
    pauseBeforeRun("0"),
    pauseAfterRun("0"),
    waitfor("false"),
    scheduleExecution("2018-11-13T20:20:39+00:00"),
    description("HelloWorld Event").

object("HelloWorld") >
    location("${uriRemote}/TTP/HelloWorld/artifacts/HelloWorld.sh").
```

## Reading the scenario

### 1. Define the systems

The `instances()` section declares two systems: `HelloWorld` and `router`. Their individual definitions then describe their operating systems and scenario-specific associations.

The `HelloWorld` instance references the object with the same name. The `router` instance instead references a predefined configuration and role. The role variables in this introductory example are placeholders rather than production settings.

### 2. Connect the systems

The `networks()` section declares `lan_0`. Its definition connects both instances as endpoints and assigns their addresses through DHCP.

This relationship is expressed separately from the instance definitions. As a result, the systems and their network topology remain visible as distinct parts of the scenario model.

### 3. Describe the scenario

The `metadata()` section names the environment and declares that its events follow a sequence. It also identifies the remote repository and the object used by the scenario.

`repositoryRemote` is a placeholder in this example. A CRADLE product delivery may manage the corresponding artifacts and access details separately from the scenario author.

### 4. Define the timeline

The `events()` section divides the timeline into pre-event, main-event, and post-event phases. This example defines one event in the main phase and leaves the other phases empty.

Event `1` associates the `HelloWorld` object with the `HelloWorld` instance. Its properties describe the execution subject, privilege requirement, timing, pauses, dependency behavior, and human-readable purpose.

### 5. Locate the object

The final definition maps the `HelloWorld` object to an external artifact location. The event refers to the object by name instead of embedding the artifact within the event definition.

This separation lets the scenario describe **what** participates in an event while the object definition describes **where** the corresponding artifact is located.

## How the references connect

The scenario forms a small chain of named relationships:

1. Metadata includes the `HelloWorld` object.
2. The `HelloWorld` instance associates itself with that object.
3. Event `1` selects the `HelloWorld` instance.
4. The same event references the `HelloWorld` object through `runObject`.
5. The object definition provides the artifact location.

Names must remain consistent across these references. A mismatch can leave a scenario referring to an instance, event, network, or object that has not been defined.

## Scope of this example

This example focuses on the CRADLE language model. It does not demonstrate:

- semantic annotations using external framework identifiers;
- multiple dependent events or DAG-based timelines;
- provider-specific capabilities and limitations;
- artifact packaging or distribution; or
- environment provisioning and operation.

These concerns belong in their respective language, product-delivery, and deployment documentation.

## Continue exploring

- Review every language section in [CRADLE Language Structure](sections.md).
- Learn how external classification metadata is represented in [Heuristic Annotations](heuristic.md).
- Consult the [CRADLE Schema Reference](../schema/cradle-schema.md) for the current structured model.
- Compare the higher-level language with the [Intermediary Language](../il-language/index.md).
