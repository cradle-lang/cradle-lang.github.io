---
draft: true
---

# Known limitations

This page summarizes the current boundaries of the public CRADLE workflow.
Review the limitations that apply to your scenario and provider before
deployment.

## Language and validation

CRADLE currently has several related sources of validation behavior: the
language grammar, compiler, and JSON Schema. They are not fully aligned.

- The grammar checks the general structure of a `.cradle` file but does not
  enforce every property name, argument count, allowed value, or semantic
  relationship.
- The compiler supports some properties and defaults that are not represented
  by the current schema.
- The schema and compiler represent some networks, endpoints, events, and
  optional values differently.
- Successful compilation does not prove that every named image, role,
  configuration, object, or provider capability is available.

Generate the scenario for every intended provider and inspect both the
intermediary YAML and provider-specific files. Tool developers can consult the
[developer schema reference](../schema/cradle-schema.md) for detailed
differences.

## Provider differences

Providers do not offer identical capabilities or infrastructure.

- libvirt is the default local provider and retains the historical output name
  `Deployment_For_local`.
- VirtualBox requires its own installation, permissions, boxes, and generated
  output.
- CRADLE can generate SPHERE artifacts, but the public `odyssey.sh` workflow
  does not operate them.
- A scenario that generates for one provider is not guaranteed to generate or
  run successfully on another.

See the [backend overview](../guides/backends/overview) for the current
capability matrix.

## Host and dependency requirements

The managed local-host baseline is Ubuntu 24.04 x86-64. A complete deployment
also depends on resources that CRADLE does not provide automatically in every
environment:

- hardware virtualization and sufficient host capacity;
- provider permissions and network availability;
- the forensic files used during extraction.

The managed-host smoke test validates generation and generated-file syntax. It
does not boot the scenario VMs or prove that a complete scenario will run.

## External boxes, binaries, and configuration files

CRADLE describes and generates references to external deployment resources. It
does not guarantee that those resources exist, are publicly downloadable, or
are licensed for the user.

### Vagrant boxes

Every generated Vagrant box identifier must resolve to a valid box in Vagrant
Cloud that supports the selected provider. A box can be unavailable because:

- the identifier is incorrect;
- the box has been removed or made private;
- the required version is unavailable;
- the box does not support libvirt or VirtualBox; or
- the deployment host cannot access Vagrant Cloud.

CRADLE does not confirm Vagrant Cloud availability during scenario compilation
or deployment-file generation. A scenario can therefore generate successfully
and later fail during Vagrant startup because a box name does not exist, is no
longer available, or does not provide a build for the selected provider.

### Binaries and configuration files

Binaries, scripts, software packages, roles, and configuration files referenced
by a scenario must be supplied separately when they are not included in the
authorized CRADLE distribution.

This especially applies to proprietary software and code. CRADLE does not grant
a software licence, download entitlement, or redistribution right for an
external dependency.

Before deployment, confirm that:

- every required file exists;
- the deployment host or guest can retrieve it;
- the file supports the target operating system and architecture;
- required licences and permissions are available;
- integrity and provenance have been verified; and
- configuration files contain valid environment-specific values.

Missing or inaccessible dependencies may not be detected until provisioning or
event execution.

## Runtime behavior

The integrated `odyssey.sh` workflow has side effects that users must account
for:

- it attempts to destroy a previous Vagrant environment for the same scenario;
- it replaces that scenario's generated deployment directory;
- it can remove managed orphaned CRADLE libvirt domains and networks;
- it provisions VMs, configures networks, and executes scenario objects; and
- it currently leaves the newly provisioned environment running after
  extraction.

Review generated files before execution and follow
[Clean up an environment](clean-up.md) after verification.

## Extraction and outputs

Provisioning and evidence extraction are separate stages.

- Provisioning failure stops the integrated workflow.
- Extraction failure is reported, but the script continues to timing handling.
- A generated output directory does not prove that provisioning succeeded.
- A dataset directory does not prove that every expected log or packet capture
  was collected.
- Dataset contents depend on the logging and capture configurations attached
  to each instance.
- Destroying a Vagrant environment does not remove its extracted dataset.

Use the checklist in [Understand the output](understand-output.md) to verify
each run.

## Heuristic annotations

Heuristic annotations add classification metadata only. The current compiler
does not:

- verify framework names;
- validate identifier formats or existence;
- retrieve external framework records;
- prove that a vulnerability or behavior is present; or
- calculate risk from FAIR-style values.

Scenario authors are responsible for checking external identifiers and their
applicability. See [Heuristic annotations](../language/heuristics).

## Example repositories

The Hello World examples reproduce the repository location from the canonical
scenario. Confirm that every configured location is authorized, reachable, and
hosts the required artifact before deployment.

Configurations, images, roles, and artifacts shown in an example can also
depend on the selected CRADLE distribution. Treat examples as starting points
and confirm availability in the target environment.

## Security and authorization

CRADLE describes and executes cyber-environment scenarios; it does not provide
authorization to operate them. Users remain responsible for:

- reviewing every scenario and external object;
- using approved infrastructure and network isolation;
- protecting credentials and sensitive evidence;
- verifying artifact provenance; and
- following organizational data-retention and acceptable-use policies.

Do not embed credentials, private keys, or access tokens in `.cradle` files.

## If a limitation affects your workflow

Check [Troubleshooting](troubleshooting.md) for stage-specific diagnostics and
[Support](../project/support.md) for the information to include in a sanitized
support request.
