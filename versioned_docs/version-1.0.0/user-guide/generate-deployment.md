# Generate deployment files

Use `cradle.sh` to compile a scenario and create provider-specific deployment
files without starting virtual machines.

## Command

Run the command from the CRADLE project root:

```console
$ ./cradle.sh <scenario> [provider]
```

The scenario argument is the filename without `.cradle`. For example:

```console
$ ./cradle.sh MyScenario libvirt
```

This reads `files/input/MyScenario.cradle`.

## Provider names

| Argument | Effective provider | Generated directory name |
| --- | --- | --- |
| omitted, `libvirt`, or `local` | libvirt | `Deployment_For_local` |
| `virtualbox` or `vbox` | VirtualBox | `Deployment_For_virtualbox` |
| `sphere` | SPHERE | `Deployment_For_sphere` |

The `local` directory name is retained for compatibility with existing
libvirt workflows.

## What CRADLE generates

The compiler first writes:

```text
files/output/<scenario>.yml
```

The assembler then writes:

```text
assembler/bin/output/<scenario>/
└── Deployment_For_<testbed>/
    └── <scenario>-experiment/
        └── localhost/
```

Local deployment directories commonly contain a `Vagrantfile`, inventory,
bootstrap scripts, and Ansible material. The exact files depend on the scenario
and provider.

## Review the result

For a libvirt scenario named `MyScenario`:

```console
$ ls files/output/MyScenario.yml
$ cd assembler/bin/output/MyScenario/Deployment_For_local/MyScenario-experiment/localhost
$ ls
$ vagrant validate
```

`vagrant validate` requires Vagrant and the selected provider to be installed.
It checks the generated Vagrant configuration but does not start the VMs.

Generated files are build output. Make durable changes in the source scenario
or supported configuration rather than editing generated files that can be
replaced during the next generation.

## Generation failure messages

| Message | Check |
| --- | --- |
| `A scenario name is required` | Pass the basename without `.cradle`. |
| `Unsupported provider` | Use `libvirt`, `virtualbox`, or `sphere`. |
| `Python executable not found` | Activate the Python environment. |
| `CRADLE compilation failed` | Review syntax, block terminators, values, and references. |
| `Deployment generation failed` | Review intermediary YAML and provider compatibility. |

## Next step

When generation succeeds and the files have been reviewed, continue to
[Deploy an environment](deploy-environment.md).
