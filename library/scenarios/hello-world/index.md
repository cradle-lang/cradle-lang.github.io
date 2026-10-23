---
title: Hello World
description: Explore a Windows host and a Linux router, connected on one network with an initialization event.
source: CRADLE
artwork: network
category: Getting started
tags: [Introductory, Networking]
requirements: Run on a CRADLE testbed with access to the scenario's artifact repository, Windows and Linux images, and named configurations.
---

The smallest published CRADLE example in this library connects a Windows host to
a Linux router. Use it to get familiar with specifications, network topology and
validation and compilation before adapting a larger range.

## What is included

- `scenario.cradle`: the complete specification used by Workbench and compilation.
- Two instances, one network and one initialization event.
- Named system configurations and a HelloWorld object from the artifact repository.

## Validate and compile

[Explore the scenario](/collection/?scenario=hello-world) to open Workbench,
download the specification or open the GitHub validation and compilation workflow. Choose
`hello-world` and the desired Git revision in **Run workflow**.

## Testbed dependencies

The target must have the Windows and Linux images, named configuration library
and access to the artifact repository declared in the specification. Credentials
belong in the testbed environment, outside this folder.

## Adapt the range

Open the specification in Workbench, change the topology or events, then export
and commit the result. Use a full Git commit when compiling a particular revision. The workflow does not run the exercise.

## Source download

[Download the CRADLE specification](./scenario.cradle).
