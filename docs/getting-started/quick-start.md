# Quick start

Generate the included `HelloWorld` scenario, inspect its deployment files, and
optionally run it on a prepared CRADLE host.

## Choose your path

| Goal | Complete | Result |
| --- | --- | --- |
| Generate and inspect CRADLE files | Part 1 | Intermediary YAML and provider files; no VMs are started. |
| Run the complete environment | Parts 1 and 2 | VMs, scenario events, runtime evidence, and cleanup. |

Part 2 requires an authorized environment and external dependencies that are
not validated during compilation. If your host is not ready, complete
[Prepare a deployment host](prepare-host.md) first.

## Part 1 — Generate Hello World

### 1. Prepare Python

From the CRADLE project root, create and activate a virtual environment:

```console
$ python3 --version
$ python3 -m venv venv
$ source venv/bin/activate
$ python -m pip install --upgrade pip
$ python -m pip install -r requirements.txt
```

Use the environment supplied by the administrator when CRADLE is centrally
managed.

### 2. Inspect the scenario

Read the scenario before generating or running it:

```console
$ sed -n '1,220p' files/input/HelloWorld.cradle
```

It describes two instances, one network, an external object, and events across
the pre, main, and post phases.

### 3. Generate deployment files

Generate files for the default libvirt provider:

```console
$ ./cradle.sh HelloWorld libvirt
```

Pass the scenario filename without `.cradle`.

### 4. Check generated files

The compiler writes:

```text
files/output/HelloWorld.yml
```

The assembler writes the libvirt deployment under:

```text
assembler/bin/output/HelloWorld/
└── Deployment_For_local/
    └── HelloWorld-experiment/
        └── localhost/
```

`Deployment_For_local` is the historical name retained for libvirt
compatibility.

List both outputs:

```console
$ ls files/output/HelloWorld.yml
$ ls assembler/bin/output/HelloWorld/Deployment_For_local/HelloWorld-experiment/localhost
```

If both commands display their contents and `cradle.sh` reported no failure,
generation succeeded. No virtual machines have been started.

## Part 2 — Deploy Hello World

### 5. Confirm deployment dependencies

Continue only when:

- the Ubuntu 24.04 x86-64 host is prepared for libvirt;
- hardware virtualization and sufficient host capacity are available;
- every generated Vagrant box identifier resolves to a valid Vagrant Cloud box
  that supports libvirt;
- required binaries, scripts, roles, and configuration files are available;
- proprietary software is separately licensed and supplied;
- scenario artifact locations are authorized and reachable; and
- the forensic files required for extraction are installed.

Compilation and generation do not prove that these dependencies are available.

```{warning}
Deployment creates VMs, configures networks, and executes scenario objects. It
also attempts to destroy a previous `HelloWorld` environment and replaces its
generated deployment files.
```

### 6. Deploy and execute

Log in as the configured runtime user. With the default managed-host setup:

```console
$ sudo --login --user cdl
$ cd /home/cdl/cradle-main
$ source venv/bin/activate
$ ./odyssey.sh HelloWorld libvirt
```

The workflow regenerates the environment, provisions its VMs, executes the
events, extracts evidence, and records timing information.

Watch for:

```text
Provision succeeded
Extraction succeeded
```

Provisioning failure stops the workflow. Extraction failure is reported, but
the workflow continues to timing handling, so verify the dataset explicitly.

### 7. Verify the environment and dataset

Check the VM state:

```console
$ cd assembler/bin/output/HelloWorld/Deployment_For_local/HelloWorld-experiment/localhost
$ vagrant status
```

List the runtime directories:

```console
$ find /mnt/hdd/cradle/dataset/HelloWorld -mindepth 2 -maxdepth 2 -type d | sort
```

A completed run can contain system or audit logs, packet captures, and timing
YAML. Exact contents depend on the scenario configuration. Use
[Understand the output](../user-guide/understand-output.md) for the verification
checklist.

### 8. Clean up

The current workflow leaves the new environment running. From its generated
directory:

```console
$ vagrant destroy -f
```

This destroys the Vagrant-managed VMs but does not remove the extracted
dataset. See [Clean up an environment](../user-guide/clean-up.md) for details.

## Generate for another provider

After completing the primary libvirt path, generate VirtualBox files with:

```console
$ ./cradle.sh HelloWorld virtualbox
```

CRADLE accepts:

| Argument | Result |
| --- | --- |
| omitted, `libvirt`, or `local` | Generate libvirt files under `Deployment_For_local`. |
| `virtualbox` or `vbox` | Generate VirtualBox files. |
| `sphere` | Generate SPHERE artifacts; the public `odyssey.sh` workflow does not operate them. |

See [Supported platforms](../deployment/supported-platforms.md) before changing
the deployment target.

## If a step fails

Use [Troubleshooting](../user-guide/troubleshooting.md) to identify whether the
failure occurred during Python setup, compilation, generation, provider setup,
provisioning, artifact retrieval, extraction, or cleanup.

## Next step

Read the [Hello World example](../introduction/helloworld.md), then create your
own environment with [Write a scenario](../user-guide/write-scenario.md).
