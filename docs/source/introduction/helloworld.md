# Hello World example

Hello World introduces the main CRADLE concepts through two Ubuntu instances,
one network, one external object, and one event in each lifecycle phase.

The example below follows the structure of the current CRADLE source scenario.
Its artifact repository uses a public-safe placeholder; replace that value with
an authorized repository before deployment.

## What the scenario contains

| Component | Name | Purpose |
| --- | --- | --- |
| Scenario | `HelloWorld` | Names the environment and its generated outputs. |
| Application instance | `HelloWorld` | Runs the example object and requests monitoring configurations. |
| Router instance | `router` | Connects the environment and requests router and monitoring configurations. |
| Network | `lan_0` | Connects both instances through DHCP. |
| Object | `HelloWorld` | Locates the external `HelloWorld.sh` artifact. |
| Events | `1`, `2`, and `3` | Run the object in the pre, main, and post phases. |

## Scenario definition

```CRADLE
instances() >
    instance("HelloWorld"),
    instance("router").

instance("HelloWorld") >
    os("ubuntu", "20.04"),
    config("linux-tcpdump"),
    config("ubuntu-focal-auditd"),
    config("linux-sysdig"),
    object("HelloWorld").

instance("router") >
    os("ubuntu", "20.04"),
    config("linux-tcpdump"),
    config("ubuntu-focal-auditd"),
    config("linux-router").

networks() >
    network("lan_0").

network("lan_0") >
    endpoint("HelloWorld", "DHCP"),
    endpoint("router", "DHCP").

metadata() >
    name("HelloWorld"),
    eventType("sequence"),
    repositoryRemote("https://artifacts.example.org"),
    object("HelloWorld").

events() >
    preEvent(),
    mainEvent(),
    postEvent().

preEvent() >
    event("1").

event("1") >
    instance("HelloWorld"),
    needRoot("false"),
    subject("bash", ""),
    runObject("HelloWorld", ""),
    pauseBeforeRun("0"),
    pauseAfterRun("0"),
    waitfor("false"),
    scheduleExecution("2018-11-13T20:20:39+00:00"),
    description("HelloWorld pre-event").

mainEvent() >
    event("2").

event("2") >
    instance("HelloWorld"),
    needRoot("false"),
    subject("bash", ""),
    runObject("HelloWorld", ""),
    pauseBeforeRun("0"),
    pauseAfterRun("0"),
    waitfor("false"),
    scheduleExecution("2018-11-13T20:20:39+00:00"),
    description("HelloWorld main event").

postEvent() >
    event("3").

event("3") >
    instance("HelloWorld"),
    needRoot("false"),
    subject("bash", ""),
    runObject("HelloWorld", ""),
    pauseBeforeRun("0"),
    pauseAfterRun("0"),
    waitfor("false"),
    scheduleExecution("2018-11-13T20:20:39+00:00"),
    description("HelloWorld post-event").

object("HelloWorld") >
    location("${uriRemote}/HelloWorld/object/HelloWorld.sh").
```

## Read the scenario

### Instances

`instances()` declares `HelloWorld` and `router`. Their named blocks define the
operating system and requested configurations. The application instance also
associates itself with the `HelloWorld` object.

Configuration availability depends on the selected CRADLE distribution and
deployment provider.

### Network

`networks()` declares `lan_0`. Its definition connects both instances using
DHCP. This source scenario does not specify a subnet, so the provider-specific
generation path supplies or resolves the network details.

### Metadata and object

`metadata()` names the scenario, selects sequential event handling, identifies
the artifact repository, and declares the object. The object definition uses
`${uriRemote}` to build the complete artifact location.

The placeholder repository in this public example does not host the artifact.
Use the repository supplied for your authorized CRADLE environment.

### Event phases

The scenario defines one event in each phase:

1. event `1` runs during `preEvent`;
2. event `2` runs during `mainEvent`; and
3. event `3` runs during `postEvent`.

All three events run the same object through `bash` on the `HelloWorld`
instance without requesting root privileges.

## Follow the references

Names connect the scenario:

1. metadata declares the `HelloWorld` object;
2. the application instance associates itself with that object;
3. each event selects the `HelloWorld` instance;
4. each event selects the `HelloWorld` object through `runObject`; and
5. the object definition supplies the artifact path.

A spelling or capitalization mismatch can leave a reference unresolved.

## Generate or deploy the example

Follow the [Quick start](../getting-started/quick-start.md) to generate and
optionally deploy the example. Use the
[CRADLE language structure](sections.md) for property-level details, or
[Write a scenario](../user-guide/write-scenario.md) to create your own.

For structured-output and compiler integration details, see the
[developer schema reference](../schema/cradle-schema.md).
