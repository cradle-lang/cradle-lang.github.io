---
title: linux-docker
description: Installs Docker and its dependencies
config: linux-docker
os: Linux
category: Linux — services & network
draft: false
sourceUrl: https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/linux-docker
---

Installs Docker and its dependencies

## Implementation

- Installs Docker repository prerequisites and python3-debian.
- Configures the Docker Ubuntu APT repository for the guest distribution release and amd64, then installs docker-ce, docker-ce-cli and containerd.io.
- Adds the existing `vagrant` user to the docker group and enables and starts Docker.

Source: [Ansible task template](<https://github.com/cradle-lang/cradle-lib/blob/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/linux-docker/ansible/linux-docker.j2>).

The module is resolved from `configs/linux-docker/` in the configured `config_dir`.

## Requirements

- An amd64 Ubuntu guest with administrator access, APT, and a distribution release supported by the configured Docker repository.
- The `vagrant` user must already exist. The controller needs an Ansible version providing `ansible.builtin.deb822_repository`.
- Access to Ubuntu repositories, download.docker.com and its signing key.

## Use in a specification

Add this configuration to an instance whose operating system and network are defined by your scenario:

```cradle
instance("host") >
    config("linux-docker").
```

## Example and verification

After provisioning, run these checks inside the guest:

```bash
docker --version
systemctl is-active docker
id vagrant
sudo docker info
```

Docker reports its version and daemon information, the service is active and vagrant belongs to the docker group.

## Attribution and licensing

Implementation: [cradle-lang/cradle-lib](<https://github.com/cradle-lang/cradle-lib/tree/7bd5d625461879dbecb51b284d91f85fa8475be9/configs/linux-docker>). A module-specific license is not declared in the inspected source. Bundled and installed third-party software retains its own license terms.
