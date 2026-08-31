---
draft: true
---

# Clean up an environment

The integrated workflow leaves the newly provisioned Vagrant environment
running after extraction. Destroy it when interactive inspection and evidence
verification are complete.

## Identify the generated directory

For libvirt:

```text
assembler/bin/output/<scenario>/Deployment_For_local/<scenario>-experiment/localhost/
```

For VirtualBox:

```text
assembler/bin/output/<scenario>/Deployment_For_virtualbox/<scenario>-experiment/localhost/
```

Confirm that the directory belongs to the intended scenario before running a
cleanup command.

## Check the current state

For a libvirt scenario named `MyScenario`:

```console
$ cd assembler/bin/output/MyScenario/Deployment_For_local/MyScenario-experiment/localhost
$ vagrant status
```

## Destroy the Vagrant environment

From the same directory:

```console
$ vagrant destroy -f
```

This destroys the Vagrant-managed virtual machines associated with that
generated deployment. It does not remove the extracted dataset under
`/mnt/hdd/cradle/dataset`.

```{important}
Do not delete broad virtualization or output directories to clean up one
scenario. Use `vagrant destroy` from the scenario's exact generated directory.
```

## Before rerunning a scenario

`odyssey.sh` also attempts to destroy the previous Vagrant environment for the
same scenario and regenerates that scenario's output directory. Preserve any
generated files you need to investigate before starting another run.

For libvirt, the workflow additionally removes CRADLE domains associated with
the CRADLE output tree and CRADLE networks that match its managed naming
patterns. It does not remove the shared Vagrant box cache.

## If cleanup fails

Run `vagrant status` again and review the provider error. Check provider
permissions and whether the environment's Vagrant state is still present.
Avoid manually deleting provider resources until you have identified the exact
scenario resources.

See [Troubleshooting](troubleshooting.md) for additional checks.
