# Prepare a deployment host

Prepare a local CRADLE host before running the complete deployment workflow.
This is normally a one-time administrator task.

```{warning}
Host preparation uses `sudo` and installs system software. Review the selected
deployment profile and run it only on an authorized host.
```

## Supported host

The current managed-host baseline is:

- Ubuntu 24.04;
- x86-64 architecture;
- hardware virtualization enabled; and
- an administrator account that can run `sudo`.

The host must also have sufficient CPU, memory, storage, and network capacity
for the intended scenarios.

## Select a provider

libvirt is the default local provider. VirtualBox is also supported by the
managed deployment.

| Choice | Intended use |
| --- | --- |
| `libvirt` | Install and validate libvirt only. |
| `virtualbox` | Install and validate VirtualBox only. |
| `both` | Install and validate both local providers. |

See [Supported platforms](../deployment/supported-platforms.md) before choosing
a provider.

## Run host preparation

From the CRADLE project root, install libvirt:

```console
$ ./deployment/deploy.sh --provider libvirt
```

For VirtualBox or both providers:

```console
$ ./deployment/deploy.sh --provider virtualbox
$ ./deployment/deploy.sh --provider both
```

The deployment prepares an isolated Ansible environment, configures the host,
creates the default runtime account, and runs a generation smoke test. It does
not replace the operating-system Python.

## Configure the runtime account

The default profile creates the `cdl` account without assigning a password.
Set its initial password from the administrator account when password-based
login or sudo access is required:

```console
$ sudo passwd cdl
```

Start a fresh login session so new provider-group memberships take effect:

```console
$ sudo --login --user cdl
$ id
```

For libvirt, the account should have the configured `libvirt` and `kvm`
memberships. For VirtualBox, confirm the configured `vboxusers` membership.

## Check the deployment key

The managed deployment creates the RSA key pair expected by generated
Vagrantfiles. Confirm that the public key exists:

```console
$ ls ~/.ssh/id_rsa.pub
```

If an administrator intentionally bypassed both managed setup and the generated
bootstrap fallback, follow the organization's approved SSH-key procedure before
deployment.

## Review the deployment report

The smoke-test report is written to:

```console
$ sudo cat /var/log/cradle/deployment-report.yml
```

The report covers provider regression checks, scenario compilation, deployment
generation, generated-file syntax, provider isolation, and Vagrant validation.

## What the smoke test does not verify

The managed-host smoke test does not boot the scenario VMs. It therefore does
not prove that:

- a generated Vagrant box exists in Vagrant Cloud;
- the box supports the selected provider;
- required binaries, scripts, roles, or configuration files are available;
- proprietary software is licensed for the user;
- remote artifact locations are reachable; or
- a complete scenario can provision, execute, and extract evidence.

Verify these dependencies before running `odyssey.sh`.

## Next step

Continue to the [Quick start](quick-start.md) to generate and, on the prepared
host, run Hello World.
