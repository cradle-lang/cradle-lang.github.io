# Supported Platforms

CRADLE can transform a common scenario definition into artifacts for multiple deployment platforms. The current reference implementation supports **libvirt**, **VirtualBox**, and **SPHERE** as target platforms.

Support does not imply that every platform provides identical capabilities. Local hypervisors and public research testbeds differ in infrastructure ownership, access controls, networking, available images, and operational responsibilities.

## Support summary

| Platform | Platform type | Artifact generation | Workflow coverage | Infrastructure responsibility |
| --- | --- | --- | --- | --- |
| libvirt | Local virtualization | Supported | Integrated local workflow | Authorized user or deployment owner |
| VirtualBox | Local virtualization | Supported | Integrated local workflow | Authorized user or deployment owner |
| SPHERE | Public research testbed | Supported | Environment-dependent | SPHERE project and environment administrators |

The table describes the capabilities represented in the current reference implementation. Product releases may package or restrict these capabilities differently. Release-specific documentation and the applicable product agreement take precedence.

## libvirt

libvirt is a virtualization management layer commonly used with KVM on Linux hosts. In CRADLE, it is a local deployment target for teams that manage a compatible virtualization host.

The reference implementation includes both target-specific artifact generation and an integrated local workflow for libvirt. The deployment owner remains responsible for the host, virtualization permissions, available capacity, compatible images, and network configuration.

### Best suited to

- Linux-based development or research environments
- teams that manage their own virtualization infrastructure
- scenarios that benefit from KVM-backed local virtualization

## VirtualBox

VirtualBox is a host-based virtualization platform available on several desktop operating systems. CRADLE can generate target-specific artifacts and represents an integrated local workflow for this platform.

The deployment owner remains responsible for providing a compatible VirtualBox installation, suitable host resources, required images, and network access. Platform behavior can vary with host operating system and VirtualBox version.

### Best suited to

- workstation-based development and evaluation
- teams already using VirtualBox-compatible environments
- local scenarios where cross-platform host support is important

## SPHERE

[SPHERE](https://www.isi.edu/proxy-sphere/) stands for **Security and Privacy Heterogeneous Environment for Reproducible Experimentation**. It is a public research testbed funded by the US National Science Foundation and constructed by the USC Information Sciences Institute, Northeastern University, and the University of Utah.

SPHERE supports reproducible cybersecurity and privacy research by providing configurable computing, software, and networking resources through specialized research portals. CRADLE can generate artifacts intended for a SPHERE-based environment, but operational availability depends on the participating project, selected portal, and configured infrastructure.

Unlike a locally managed hypervisor, SPHERE may require approved project membership, authenticated access, environment-specific tooling, available capacity, compatible images, and administrator-managed network services. These external dependencies mean that SPHERE workflow coverage is described as **environment-dependent**.

### Best suited to

- authorized research teams using SPHERE infrastructure
- reproducible cybersecurity and privacy experiments using heterogeneous resources
- scenarios requiring capabilities provided by an approved SPHERE project

## What “supported” means

On this page, a supported platform is one for which CRADLE can produce target-specific deployment artifacts. It does not guarantee that:

- infrastructure or platform accounts are included with CRADLE
- every CRADLE language feature behaves identically across targets
- all third-party platform versions are compatible
- external images, binaries, datasets, or network services are available
- a generated scenario can be operated without additional authorization and environment preparation

These boundaries keep the portable scenario definition separate from infrastructure that is owned or governed by another party.

## Selecting a platform

Platform selection should consider:

- the infrastructure already available to the authorized team
- host operating system and virtualization support
- scenario scale and resource requirements
- required network topology and isolation
- image and artifact availability
- organizational access and security policies
- platform-specific capabilities documented for the applicable CRADLE release

When portability matters, validate the scenario against each intended target instead of assuming equivalent behavior.

## Related documentation

- [What is CRADLE?](../introduction/index.md)
- [CRADLE Language Structure](../introduction/sections.md)
- [Release Notes](../project/release-notes.md)
- [Support](../project/support.md)
