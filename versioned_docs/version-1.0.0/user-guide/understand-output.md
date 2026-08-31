---
draft: true
---

# Understand the output

CRADLE produces different outputs during compilation, generation, and runtime
execution. Checking each layer helps identify where a workflow succeeded or
failed.

## Output locations

| Stage | Default output | What it contains |
| --- | --- | --- |
| Compilation | `files/output/<scenario>.yml` | The compiler's structured interpretation of the scenario. |
| Generation | `assembler/bin/output/<scenario>/Deployment_For_<testbed>/<scenario>-experiment/localhost/` | Provider-specific deployment files. |
| Execution | `/mnt/hdd/cradle/dataset/<scenario>/<date>/<time>/` | Extracted evidence and timing information. |
| Host setup | `/var/log/cradle/deployment-report.yml` | Managed-host installation and smoke-test results. |

Deployment profiles can override runtime and dataset paths.

## Check compiler output

For `MyScenario`:

```console
$ ls files/output/MyScenario.yml
$ sed -n '1,220p' files/output/MyScenario.yml
```

Confirm that the compiled instances, networks, objects, event phases, and
references match the authored `.cradle` file.

## Check generated deployment files

For libvirt:

```console
$ cd assembler/bin/output/MyScenario/Deployment_For_local/MyScenario-experiment/localhost
$ ls
$ vagrant validate
```

The generated file set depends on the provider and scenario. It commonly
contains a Vagrant configuration, inventory, bootstrap scripts, and Ansible
material.

## Find the runtime dataset

List run directories without guessing their timestamps:

```console
$ find /mnt/hdd/cradle/dataset/MyScenario \
    -mindepth 2 -maxdepth 2 -type d \
    | sort
```

A dataset can include:

- packet captures below instance-specific network directories;
- Linux system or audit log archives;
- Windows event log archives; and
- a `timing-<scenario>-<timestamp>.yml` record.

Exact contents depend on the scenario's configurations and whether extraction
completed successfully.

## Verification checklist

A complete run should satisfy the checks that apply to the scenario:

- the intermediary YAML exists and matches the source scenario;
- provider-specific deployment files exist;
- `vagrant status` lists the expected instances;
- the terminal reports successful provisioning;
- the terminal reports successful extraction;
- the dataset contains expected log archives and packet captures; and
- the timing YAML exists in the run directory.

An existing directory alone does not prove success. Review command messages
and validate the expected contents.

## Handle evidence safely

Logs and packet captures can contain sensitive data. Restrict access, follow
the experiment's retention policy, and remove secrets before sharing evidence
with support. Record the CRADLE version, scenario revision, provider, and host
profile with any retained dataset.

## Next step

After verification, [clean up the environment](clean-up.md).
