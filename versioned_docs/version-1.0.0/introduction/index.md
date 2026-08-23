# What is CRADLE?

CRADLE—**Cyber-testbed Reconstruction and Automation Description Language**—is
a declarative and debuggable domain-specific language. It is categorized as
Cyber Experimentation As Code (CEaC), describing computing components as code
to provide a high-level, static description of computing infrastructure.

The authored scenario is static: it records the intended environment and event
timeline as source. Supporting tools later transform and execute that
description on supported infrastructure.

In this documentation, **debuggable** means users can inspect the authored
scenario, intermediary YAML, generated provider files, stage-specific command
messages, deployment report, and runtime outputs when diagnosing a workflow.

CRADLE brings systems, networks, artifacts, and event sequences into a single
scenario definition that can be reviewed, maintained, and transformed for
supported deployment environments. This gives teams a shared description of
what a cyber-environment should contain, independent of the implementation
details of any one platform.

## The challenge CRADLE addresses

Cybersecurity experiments, exercises, and test environments can be difficult to reproduce. Their intended behavior is often spread across configuration files, scripts, infrastructure settings, and knowledge held by individual team members. As the environment evolves, it becomes harder to understand what changed or recreate the same scenario elsewhere.

CRADLE addresses this by making the scenario itself explicit. Instead of treating the environment as a collection of disconnected setup steps, teams can describe its important components and timeline in one structured model.

## What a CRADLE scenario describes

A CRADLE scenario can capture:

- **Metadata** that identifies and describes the scenario.
- **Instances** representing the systems involved.
- **Networks** and the connections between those systems.
- **Events** describing actions and their sequence.
- **Objects** used by instances or events, such as files and other artifacts.
- **Heuristic annotations** that associate scenario elements with external classification metadata.

These concepts form the main [CRADLE language structure](sections.md).
Tool developers can also consult the
[developer schema reference](../schema/cradle-schema.md) for the current
structured model and its limitations.

## Why teams use CRADLE

### Repeatability

A structured scenario provides a stable source of intent. Teams can preserve, compare, and recreate cyber-environments more consistently than when the design exists only as manual instructions.

### Reviewability

Systems, relationships, and events are represented explicitly, making a scenario easier for researchers, engineers, and reviewers to inspect and discuss.

### Maintainability

Changes can be made to the scenario definition instead of being duplicated across several platform-specific procedures. This also makes the history of a scenario easier to track through version control.

### Define once, adapt for supported platforms

CRADLE provides a common way to describe the systems, networks, artifacts, and events in a cyber-environment. Its supporting tools translate that description into configuration artifacts for supported platforms such as libvirt, VirtualBox, and SPHERE.

## Conceptual lifecycle

A CRADLE scenario moves through four broad stages:

1. **Define** — describe the intended systems, networks, objects, and events.
2. **Validate** — check that the scenario follows the language structure and required constraints.
3. **Transform** — convert the high-level definition into lower-level and target-specific artifacts.
4. **Operate** — use those artifacts within an authorized, prepared environment and review the resulting evidence or datasets.

The compiler and assembly components support the transformation from scenario intent to deployment material. Exact operational responsibilities depend on how CRADLE is delivered and on the selected infrastructure, so they are documented separately from the language concepts.

## Who CRADLE is for

CRADLE is intended for teams that need cyber-environments to be understandable, repeatable, and maintainable, including:

- cybersecurity researchers conducting controlled experiments
- educators and exercise designers developing repeatable training scenarios
- security teams modeling threat activity or validating defensive capabilities
- engineers responsible for cyber-range and test-environment definitions
- developers maintaining or extending the CRADLE language and toolchain

## Suitable use cases

CRADLE is well suited to:

- repeatable cybersecurity experiments
- cyber-range and training scenario design
- threat-emulation and defensive-validation scenarios
- structured test environments with a defined sequence of events
- scenarios that need to be reviewed, versioned, or adapted for supported targets

## Product boundaries

CRADLE describes and transforms cyber-environment scenarios. It does not replace the underlying infrastructure or the governance required to operate it. A complete workflow may also depend on authorized access, compatible binaries and artifacts, provider-specific configuration, and a prepared deployment environment.

Capabilities can differ between deployment targets. A scenario being expressible in CRADLE does not guarantee that every target supports the same features or produces identical behavior. Target-specific support and limitations should therefore be confirmed before a scenario is adopted for operational use.

## Continue exploring

- Generate deployment files in the [Quick start](../getting-started/quick-start.md).
- See the problem, value, intended users, and documented boundaries in
  [Why CRADLE?](../project/business-case.md).
- Learn how a scenario is organized in [CRADLE Language Structure](sections.md).
- See a small conceptual example in [Hello World](helloworld.md).
- Learn how external classification metadata is represented in [Heuristic Annotations](heuristic.md).
- Write a complete environment in [Write a scenario](../user-guide/write-scenario.md).
- Tool developers can consult the [developer schema reference](../schema/cradle-schema.md).
