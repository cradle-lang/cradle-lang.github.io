---
title: Cron heuristic
description: Compare cron persistence against a baseline in a four-host Linux lab with separate training and management networks.
source: CRADLE
artwork: monitoring
category: Training
tags: [Linux, Heuristics, Scheduled tasks, Networking, Monitoring]
requirements: A compatible backend and Linux 20.04 image with cron installed and running, privileged Ansible provisioning, package repository access, and cradle-lib configurations and heuristic content.
draft: false
---

This lab compares a host using `ttp/T1053.003` with a baseline host that has
the same OS and audit configuration. An observation host connects the training
and management networks, and an analyst workstation sits on the management side.
No scenario objects, private artifact repository or event scripts are needed.

## Topology and roles

| Host | Training address | Management address | Role |
| --- | --- | --- | --- |
| `cron-host` | `192.168.70.10` | — | Cron heuristic and audit logging |
| `baseline-host` | `192.168.70.20` | — | Same OS and audit logging, without the heuristic |
| `observer` | `192.168.70.30` | `192.168.71.10` | Audit logging and packet capture tooling |
| `analyst` | — | `192.168.71.20` | Workstation for reviewing collected observations |

The networks are `192.168.70.0/24` and `192.168.71.0/24`. The dual-homed observer
is not configured as a router; cross-network forwarding is not required for this
exercise. Use testbed consoles or your configured management access to inspect
each host. This sample does not configure SSH credentials or automatic evidence
transfer to the analyst.

## Heuristic declaration

```cradle
instance("cron-host") >
    os("linux", "20.04"),
    config("linux-auditd"),
    heuristic("ttp", "T1053.003").
```

The inspected manifest has no implied OS or configurations, so the sample
specifies its OS explicitly. Configure CradleXC's `heuristics_dir` to use
`https://github.com/cradle-lang/cradle-lib`, and set `config_dir` to the same
repository for `linux-auditd` and `linux-tcpdump`. Package repositories must be
reachable during provisioning. A local checkout is also supported;
follow your compiler version's library-root convention.
The target image must already have a running cron service: the heuristic creates
the script and schedule but does not install or start cron.

## Expected provisioning result

The upstream implementation creates `/usr/local/bin/cxc-cron-beacon.sh` and a
root cron entry named `cxc-t1053-003`. Every five minutes it appends a UTC timestamp
to `/var/log/cxc-cron-beacon.log`. The script writes locally; it does not send a
network beacon. This sample has no CRADLE events because it demonstrates
provisioning-time heuristic behavior.

After an operator provisions the scenario, verify on the target host:

```bash
sudo crontab -l -u root
sudo test -x /usr/local/bin/cxc-cron-beacon.sh
# After the next five-minute cron boundary:
sudo tail /var/log/cxc-cron-beacon.log
```

## Compare the hosts

1. On `cron-host`, check the root crontab and timestamp log using the commands above. Allow at least one five-minute schedule boundary.
2. On a freshly provisioned `baseline-host`, check that there is no `cxc-t1053-003` entry, no `/usr/local/bin/cxc-cron-beacon.sh` and no `/var/log/cxc-cron-beacon.log` from this heuristic.
3. On both hosts, use `sudo auditctl -l` to inspect the installed audit rules and review available records with `sudo ausearch -ts recent`. Exact records depend on those rules; this sample does not add a dedicated cron detection rule.
4. On `observer`, use `ip -br address` to identify its interfaces and `sudo tcpdump -D` to check capture availability. Packet capture is manual. The cron script writes locally, so its execution should not be inferred from network traffic.
5. Review the observed differences from the analyst workstation using your testbed's console or evidence-transfer facilities. Automated collection is outside this example.

## Inspect and validate

[Explore the scenario](/collection/?scenario=cron-heuristic) to inspect its
heuristic, topology and static report, or open it in Workbench.
[Download the complete specification](./scenario.cradle).

Use the validation workflow with scenario ID `cron-heuristic` and a committed
revision for a compiler check. Website parser and build checks do not establish
runtime success. Compiler validation and testbed execution have not been
performed in the environment that authored this sample.

## Source and attribution

This original sample references the CRADLE project's
[T1053.003 heuristic](https://github.com/cradle-lang/cradle-lib/tree/f5b9efe98ae4cfb1eb0e1874fb08a3ae5b58ac8c/heuristics/ttp/T1053.003),
inspected at commit `f5b9efe98ae4cfb1eb0e1874fb08a3ae5b58ac8c`.
The upstream manifest and Ansible implementation are referenced, not copied;
their use and redistribution remain subject to the upstream project's terms.
This example CRADLE source and article are provided under CC0-1.0.
