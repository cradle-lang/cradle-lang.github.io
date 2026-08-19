# Command reference

This page summarizes the public commands used to prepare, generate, deploy,
inspect, and clean up CRADLE environments.

## CRADLE commands

| Command | Purpose | Important side effects |
| --- | --- | --- |
| `./deployment/deploy.sh --provider <provider>` | Prepare a supported local host. | Uses `sudo` and installs or configures host software. |
| `./cradle.sh <scenario> [provider]` | Compile a scenario and generate deployment files. | Writes compiler and provider-specific output. Does not start VMs. |
| `./odyssey.sh <scenario> [provider]` | Generate, provision, execute, and extract a local scenario. | Attempts to destroy the previous environment for the same scenario and replaces its generated output. |

Run CRADLE commands from the project root.

## Prepare a host

```console
$ ./deployment/deploy.sh --provider libvirt
$ ./deployment/deploy.sh --provider virtualbox
$ ./deployment/deploy.sh --provider both
```

See [Prepare a deployment host](../getting-started/prepare-host.md).

## Generate deployment files

```console
$ ./cradle.sh <scenario> [libvirt|virtualbox|sphere]
```

Provider aliases:

| Input | Effective provider |
| --- | --- |
| omitted, `libvirt`, or `local` | libvirt |
| `virtualbox` or `vbox` | VirtualBox |
| `sphere` | SPHERE artifact generation |

Pass the scenario filename without `.cradle`.

## Run a local environment

```console
$ ./odyssey.sh <scenario> [libvirt|virtualbox]
```

`local` and `vbox` are accepted aliases. The public `odyssey.sh` workflow does
not operate SPHERE deployments.

## Inspect generated Vagrant files

Run these commands from the exact generated deployment directory:

```console
$ vagrant validate
$ vagrant status
```

`vagrant validate` checks the generated Vagrant configuration without starting
the VMs. `vagrant status` reports the current state of the environment.

## Destroy an environment

From the exact generated deployment directory:

```console
$ vagrant destroy -f
```

This destroys the Vagrant-managed VMs. It does not remove the separately
stored runtime dataset.

## Default output locations

| Output | Path |
| --- | --- |
| Compiler output | `files/output/<scenario>.yml` |
| libvirt deployment | `assembler/bin/output/<scenario>/Deployment_For_local/<scenario>-experiment/localhost/` |
| VirtualBox deployment | `assembler/bin/output/<scenario>/Deployment_For_virtualbox/<scenario>-experiment/localhost/` |
| SPHERE generation | `assembler/bin/output/<scenario>/Deployment_For_sphere/<scenario>-experiment/localhost/` |
| Runtime dataset | `/mnt/hdd/cradle/dataset/<scenario>/<date>/<time>/` |
| Host preparation report | `/var/log/cradle/deployment-report.yml` |

Deployment profiles can change managed-host paths.

## Related guides

- [Generate deployment files](../user-guide/generate-deployment.md)
- [Deploy an environment](../user-guide/deploy-environment.md)
- [Clean up an environment](../user-guide/clean-up.md)
- [Troubleshooting](../user-guide/troubleshooting.md)
