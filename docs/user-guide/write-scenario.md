# Write a scenario

A CRADLE scenario is a text file that describes the systems, networks,
artifacts, and events in a cyber environment. This guide creates a small
scenario and checks that CRADLE can generate deployment files from it.

## Before you begin

- Complete the [Quick start](../getting-started/quick-start).
- Open a terminal in the CRADLE project root.
- Choose an authorized artifact repository and a test artifact.

## 1. Choose a scenario name

This guide uses `MyScenario`. Create the file at:

```text
files/input/MyScenario.cradle
```

Use the same name for the filename, the `metadata().name` value, and the
command-line argument. Consistent names make generated paths predictable.

## 2. Add a complete scenario

Start with this public-safe example:

```CRADLE
metadata() >
    name("MyScenario"),
    eventType("sequence"),
    repositoryRemote("https://artifacts.example.org"),
    object("SetupScript").

instances() >
    instance("Target").

instance("Target") >
    os("ubuntu", "20.04"),
    object("SetupScript").

networks() >
    network("lan_0").

network("lan_0") >
    subnet("192.168.56.0/24"),
    endpoint("Target", "192.168.56.10").

events() >
    preEvent(),
    mainEvent(),
    postEvent().

mainEvent() >
    event("1").

event("1") >
    instance("Target"),
    needRoot("false"),
    subject("bash", ""),
    runObject("SetupScript", ""),
    pauseBeforeRun("0"),
    pauseAfterRun("0"),
    waitfor("false"),
    scheduleExecution("2026-01-15T10:00:00+00:00"),
    description("Run the setup script").

object("SetupScript") >
    location("${uriRemote}/MyScenario/SetupScript.sh").
```

Replace `https://artifacts.example.org` and the object path with an authorized,
reachable location before deployment. Do not put passwords, tokens, or private
keys in a `.cradle` file.

## 3. Understand the sections

| Section | Purpose |
| --- | --- |
| `metadata()` | Names the scenario and declares its objects and event model. |
| `instances()` | Lists the systems that participate. |
| `instance("Target")` | Describes one system and its associated objects. |
| `networks()` | Lists the networks in the environment. |
| `network("lan_0")` | Defines the subnet and connected instances. |
| `events()` | Declares the pre, main, and post event phases. |
| `mainEvent()` | Lists events in the main phase. |
| `event("1")` | Defines what runs, where it runs, and its timing behavior. |
| `object("SetupScript")` | Resolves the external artifact used by the event. |

For every supported property, see the
[CRADLE language structure](../introduction/sections.md).

## 4. Check named references

Names connect the scenario blocks. Before generation, confirm that:

- every instance listed in `instances()` has a matching `instance` block;
- every endpoint names a declared instance;
- every event listed in a phase has a matching `event` block;
- every event names a declared instance and object; and
- every object has a matching object definition.

Names should match exactly, including capitalization.

## 5. Generate deployment files

Generate a libvirt deployment:

```console
$ ./cradle.sh MyScenario libvirt
```

Then inspect the two output locations:

```console
$ ls files/output/MyScenario.yml
$ ls assembler/bin/output/MyScenario/Deployment_For_local/MyScenario-experiment/localhost
```

If compilation succeeds but provider generation fails, the intermediary YAML
may still exist. Review it before changing the scenario.

## Authoring checklist

Before deploying a scenario:

- review every instance, network, object, and event
- use a subnet that does not conflict with the deployment host
- confirm that every selected Vagrant box exists in Vagrant Cloud and supports
  the intended provider
- list all required binaries, scripts, roles, and configuration files
- confirm that proprietary dependencies are separately licensed and available
- verify artifact provenance and access
- request root execution only when required
- check that the selected provider supports the requested resources
- do not assume successful compilation proves dependency availability
- generate and inspect the provider-specific files
- run the scenario only in an authorized environment

## Next step

Learn how the generation pipeline works in
[Generate deployment files](generate-deployment.md), or continue to
[Deploy an environment](deploy-environment.md) when the scenario is ready.
