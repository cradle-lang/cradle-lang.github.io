# Deploy an environment

Use `odyssey.sh` for the complete local workflow: generate the environment,
provision its virtual machines, execute scenario events, and extract runtime
evidence.

```{warning}
Deployment executes scenario objects and changes local virtualization
resources. At startup, the workflow attempts to destroy a previous environment
for the same scenario and replaces that scenario's generated deployment files.
Run only reviewed scenarios on authorized infrastructure.
```

## Before you begin

You need:

- a prepared Ubuntu 24.04 x86-64 CRADLE host
- Vagrant and either libvirt or VirtualBox
- sufficient CPU, memory, disk, and network capacity
- Vagrant box identifiers that resolve to valid Vagrant Cloud boxes for the
  selected provider
- all required binaries, scripts, roles, and configuration files
- separate licences and access for proprietary software
- authorized access to every scenario object
- the forensic files used by the extraction workflow

The scenario should already generate successfully with `cradle.sh`.

## Prepare a host

Follow [Prepare a deployment host](../getting-started/prepare-host.md) when the
local provider and runtime account have not already been configured. The host
smoke test validates generation but does not boot the scenario VMs or verify
external boxes, binaries, and configuration files.

## Run a scenario

Log in as the configured runtime user, open the CRADLE project root, and
activate its Python environment. With the default managed-host configuration:

```console
$ sudo --login --user cdl
$ cd /home/cdl/cradle-main
$ source venv/bin/activate
$ ./odyssey.sh MyScenario libvirt
```

`odyssey.sh` accepts `libvirt` or `virtualbox`; `local` and `vbox` are their
aliases. It does not provide the integrated SPHERE execution workflow.

## Follow the deployment stages

| Terminal message | Stage |
| --- | --- |
| `Remove previous environment, if any` | Clean up the previous run for this scenario. |
| `Create CRADLE environment` | Compile and generate fresh deployment files. |
| `Start provisioning process` | Start the generated Vagrant and Ansible workflow. |
| `Provision succeeded` | Provisioning and scenario execution returned success. |
| `Extraction succeeded` | Runtime evidence extraction returned success. |

Provisioning failure stops the workflow. Extraction failure is reported, but
the script continues to timing handling; therefore, always verify the
extraction message and dataset contents.

## Check the environment

For a libvirt deployment:

```console
$ cd assembler/bin/output/MyScenario/Deployment_For_local/MyScenario-experiment/localhost
$ vagrant status
```

Use `Deployment_For_virtualbox` for VirtualBox. The current workflow leaves the
new environment running after extraction.

## Verify and finish

Use [Understand the output](understand-output.md) to verify the generated files
and dataset. When verification is complete, follow
[Clean up an environment](clean-up.md). Review [Known limitations](known-limitations.md)
before adopting the workflow for an operational scenario.
