---
draft: true
---

# Supported platforms

CRADLE can generate deployment files for libvirt, VirtualBox, and SPHERE. The
complete local execution workflow is available for libvirt and VirtualBox.

Platform support does not mean every scenario behaves identically on every
target. Images, networking, roles, capacity, and access controls remain
provider-specific.

## Capability matrix

| Capability | libvirt | VirtualBox | SPHERE |
| --- | --- | --- | --- |
| Generate with `cradle.sh` | Yes | Yes | Yes |
| Run with the public `odyssey.sh` workflow | Yes | Yes | No |
| Provider arguments | `libvirt`, `local` | `virtualbox`, `vbox` | `sphere` |
| Generated testbed directory | `Deployment_For_local` | `Deployment_For_virtualbox` | `Deployment_For_sphere` |
| Infrastructure model | Locally managed virtualization | Locally managed virtualization | Externally managed research testbed |
| Host preparation through `deployment/deploy.sh` | Yes | Yes | No |

The `Deployment_For_local` name is retained for compatibility even though its
effective provider is libvirt.

## libvirt

libvirt is CRADLE's default provider for local deployments. It is appropriate
for an Ubuntu host with KVM-backed hardware virtualization.

Generate deployment files:

```console
$ ./cradle.sh MyScenario libvirt
```

Run the complete workflow:

```console
$ ./odyssey.sh MyScenario libvirt
```

The deployment owner is responsible for virtualization support, provider
permissions, available capacity, compatible images, and network isolation.

## VirtualBox

VirtualBox is the alternative local VM provider. `VBoxManage` must be available
on the configured CRADLE host, and the runtime user must have the required
VirtualBox permissions.

Generate deployment files:

```console
$ ./cradle.sh MyScenario virtualbox
```

Run the complete workflow:

```console
$ ./odyssey.sh MyScenario virtualbox
```

Use `vbox` as a shorter provider alias when needed.

## SPHERE

CRADLE can generate artifacts for a SPHERE environment:

```console
$ ./cradle.sh MyScenario sphere
```

The public `odyssey.sh` entry point does not run SPHERE deployments. Operating
generated SPHERE material depends on authorized project membership, the
selected portal, available resources, compatible images, and
environment-specific procedures.

## Prepare a local host

The managed-host deployment supports libvirt, VirtualBox, or both:

```console
$ ./deployment/deploy.sh --provider libvirt
$ ./deployment/deploy.sh --provider virtualbox
$ ./deployment/deploy.sh --provider both
```

The current supported host baseline is Ubuntu 24.04 x86-64. Host preparation
uses `sudo`, installs provider software, prepares the configured runtime
account, and runs a generation smoke test. It does not boot the scenario VMs.

## Select a provider

Consider:

- infrastructure already approved and available to the team;
- hardware virtualization and host operating system;
- scenario CPU, memory, storage, and network requirements;
- compatible operating-system images and Vagrant boxes;
- artifact and role availability;
- required network isolation; and
- organizational access and security policies.

When a scenario must support multiple targets, generate and validate it for
each provider rather than assuming equivalent behavior.

## What support does not include

Provider support does not guarantee that:

- platform accounts, infrastructure, or capacity are included;
- every CRADLE feature behaves identically;
- all third-party versions are compatible;
- referenced Vagrant Cloud boxes or provider builds are available;
- proprietary binaries, licences, or download credentials are included;
- scenario-specific configuration files and commercial software packages are
  supplied;
- referenced images and artifacts are compatible with the provider; or
- generated material can be operated without further authorization.

## Related guides

- [Generate target files](../guides/backends/generate-target-files)
- [Use a backend](../getting-started/use-a-backend)
- [Inspect output](../getting-started/inspect-output)
- [Troubleshooting](../guides/troubleshooting)
- [Backend overview](../guides/backends/overview)
