# Why CRADLE?

CRADLE makes the intended structure and behavior of a cyber environment
explicit. It provides a shared starting point for people evaluating the
approach and a direct path into the technical guides for people ready to use
it.

This page uses capabilities and limitations documented by the current CRADLE
user guide. It does not claim measured cost savings, deployment-time
improvements, or equivalent behavior across platforms.

## The problem CRADLE addresses

Cybersecurity experiments, exercises, and test environments can be difficult
to reproduce. Their intended behavior is often distributed across
configuration files, scripts, infrastructure settings, and knowledge held by
individual team members.

As an environment evolves, it can become harder to understand what changed or
to recreate the same scenario elsewhere. CRADLE addresses this by representing
the important components and timeline in one structured model.

## CRADLE's approach

CRADLE—Cyber-testbed Reconstruction and Automation Description Language—is a
declarative and debuggable domain-specific language. It is categorized as Cyber
Experimentation As Code (CEaC).

CRADLE describes computing components as code to provide a high-level, static
description of computing infrastructure. A scenario can bring together:

- metadata identifying the environment;
- instances representing participating systems;
- networks and connections between systems;
- objects representing files and other artifacts;
- events describing actions and their sequence; and
- heuristic annotations associating elements with external classification
  metadata.

Supporting tools transform the scenario into lower-level and target-specific
artifacts. The resulting material can then be used within an authorized,
prepared environment.

## Why the approach matters

### Repeatability

A structured scenario provides a stable source of intent. Teams can preserve,
compare, and recreate cyber environments more consistently than when their
design exists only as manual instructions.

### Reviewability

Systems, relationships, and events are represented explicitly so researchers,
engineers, and reviewers can inspect and discuss them.

### Maintainability

Changes can be made to the scenario definition instead of being duplicated
across several platform-specific procedures. Scenario history can also be
tracked through version control.

### Supported target generation

CRADLE uses a common description for systems, networks, artifacts, and events.
Its supporting tools generate deployment material for libvirt, VirtualBox, and
SPHERE in the current reference implementation.

## From fragmented setup to an explicit scenario

| Documented environment problem | CRADLE approach |
| --- | --- |
| Information is distributed across configuration files and scripts | Components are represented in one structured scenario |
| Environment knowledge may remain with individual team members | The definition can be inspected and discussed by a wider team |
| Relationships can be difficult to understand from separate setup material | Systems, networks, objects, and events are represented explicitly |
| Changes can be difficult to identify | Text-based definitions can be reviewed and tracked through version control |
| Deployment procedures can be platform-specific | A common description can be transformed for supported targets |

This comparison describes CRADLE against the problem documented by the user
guide. It is not a comparison with named products or services.

## Who CRADLE is for

The current documentation identifies these intended users:

- **cybersecurity researchers** conducting controlled experiments;
- **educators and exercise designers** developing repeatable training
  scenarios;
- **security teams** modeling threat activity or validating defensive
  capabilities;
- **cyber-range and test-environment engineers** maintaining environment
  definitions; and
- **language and toolchain developers** maintaining or extending CRADLE.

The documentation does not currently rank these audiences or define a
commercial buyer profile.

## Documented differentiation

CRADLE's documented distinction is the combination of computing
infrastructure and cyber-scenario concepts in one declarative description. A
scenario represents systems and networks alongside artifacts, event sequences,
and optional classification metadata.

CRADLE also separates the common scenario definition from the target-specific
material generated for supported platforms. This does not guarantee identical
capabilities or behavior across those platforms.

## Suitable use cases

The documentation identifies CRADLE as suitable for:

- repeatable cybersecurity experiments;
- cyber-range and training scenario design;
- threat-emulation and defensive-validation scenarios;
- structured test environments with a defined sequence of events; and
- scenarios that need to be reviewed, versioned, or adapted for supported
  targets.

## Evidence available in the documentation

Prospective users can inspect the documented approach directly:

- the [Quick start](../getting-started/quick-start) walks through validation
  and compilation using the Hello World scenario;
- the [Hello World example](../examples/hello-world) explains the
  scenario's systems, network, object, and events;
- the [backend overview](../guides/backends/overview) explains the boundary
  between CradleXC and target-specific generation;
- the [language overview](../language/overview) documents the
  human-authored scenario format; and
- the [Deployment IR contract](../backend-development/deployment-ir-contract)
  records the structured model exchanged with backend plugins.

## Product boundaries

CRADLE describes and transforms cyber-environment scenarios. It does not
replace the underlying infrastructure or the governance required to operate
it.

A complete workflow can also depend on authorized access, compatible binaries
and artifacts, provider-specific configuration, compatible images, and a
prepared deployment environment. Target capabilities and behavior can differ,
so each intended provider must be generated and validated separately.

## Evaluate CRADLE

1. [Follow the Hello World Quick Start](../getting-started/quick-start).
2. [Write a scenario](../guides/write-a-scenario).
3. [Review the backend model](../guides/backends/overview).
4. [Review the generated output](../getting-started/inspect-output).
5. Consult the [troubleshooting guide](../guides/troubleshooting) when a
   workflow does not produce the expected result.
