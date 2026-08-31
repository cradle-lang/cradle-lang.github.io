---
draft: true
---

# Troubleshooting

Identify the workflow stage that failed, then begin with the first relevant
error. Later messages are often consequences of the original failure.

## Quick checks

Run these commands from the CRADLE project root as the configured runtime user:

```console
$ python3 --version
$ id
$ vagrant --version
$ ./cradle.sh -h
```

For libvirt, check `virsh --version`. For VirtualBox, check
`VBoxManage --version`.

## Python setup

### Symptom

`Python executable not found` or a Python import error.

### Check

```console
$ source venv/bin/activate
$ python3 --version
$ python -m pip install -r requirements.txt
```

Use the Python environment supplied by the administrator when the host is
centrally managed.

## Compilation

### Symptom

`CRADLE compilation failed for <scenario>`.

### Check

- `files/input/<scenario>.cradle` exists;
- the command uses the filename without `.cradle`;
- blocks end with a period;
- entries inside a block are comma-separated;
- values use double quotes; and
- declared instance, network, event, and object names match their definitions.

Compare the scenario with [Write a scenario](write-scenario.md).

## Deployment generation

### Symptom

`Deployment generation failed` after compilation.

### Check

Inspect `files/output/<scenario>.yml`. Confirm that the selected provider and
requested operating-system images, configurations, roles, and objects are
available in the authorized CRADLE distribution.

## Provider setup

### libvirt

Confirm that the runtime user has a fresh login session and belongs to the
required virtualization groups:

```console
$ id
$ virsh --version
```

### VirtualBox

Confirm that `VBoxManage` is available and the runtime user has the configured
VirtualBox permissions:

```console
$ id
$ VBoxManage --version
```

Review `/var/log/cradle/deployment-report.yml` after managed-host setup.

## Vagrant validation or startup

From the exact generated deployment directory:

```console
$ vagrant validate
$ vagrant status
```

Check hardware virtualization, available CPU and memory, disk space, provider
installation, Vagrant boxes, and network conflicts.

Confirm that every box identifier in the generated `Vagrantfile` resolves to a
valid Vagrant Cloud box with a build for the selected provider. CRADLE can
generate the `Vagrantfile` without detecting a missing, renamed, or
provider-incompatible box; the failure then occurs during Vagrant startup.

## Artifact retrieval

Confirm that every object location resolves against the configured repository
and is reachable from the system that retrieves it. Check routing, DNS,
certificates, authorization, and artifact presence. Do not resolve access
failures by embedding credentials in the scenario.

## Missing binary or configuration

### Symptom

Provisioning or event execution reports that a file, executable, role, package,
or configuration cannot be found.

### Check

- confirm that the dependency was supplied with the authorized distribution or
  placed in the configured repository;
- confirm that its object location is correct and reachable;
- check file permissions and target paths;
- confirm operating-system and architecture compatibility; and
- verify any required proprietary licence or access entitlement.

CRADLE does not supply or license an external proprietary dependency merely
because the scenario references it.

## Provisioning

### Symptom

`Provision failed with exit code ...`.

### Check

Review the first failed task in the generated bootstrap or Ansible output.
Common causes include unavailable boxes, unreachable guests, missing roles or
objects, provider network conflicts, and insufficient privileges.

The failed environment can remain on the host. Use `vagrant status` and follow
[Clean up an environment](clean-up.md) when it is no longer needed.

## Extraction

### Symptom

`Extraction failed` or an incomplete dataset.

### Check

- the configured forensic directory contains the required extraction files;
- provisioned guests remain reachable;
- the dataset root exists and is writable by the workflow;
- the configured Ansible connection works; and
- expected logging or capture configurations are attached to each instance.

Extraction failure does not necessarily mean provisioning failed. Check the
dataset contents explicitly.

## Cleanup

If `vagrant destroy -f` fails, confirm that you are in the correct generated
directory and that its Vagrant state still exists. Inspect before removing any
provider resource manually.

## Request support

Include:

- CRADLE version or revision;
- host operating system;
- provider and version;
- scenario name;
- exact command;
- failed workflow stage;
- first relevant error; and
- sanitized logs or deployment report.

Never include passwords, tokens, private keys, or confidential scenario data.
See [Support](../project/support.md) for the available support channel.
