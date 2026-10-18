---
title: Introducing the CRADLE blog
description: A space for practical guides, project updates and perspectives on reproducible cyber experimentation.
slug: introducing-the-cradle-blog
authors: [cradle]
tags: [project]
---

Cyber experiments are easier to understand and repeat when their environments
are described explicitly. CRADLE brings that idea to scenario authoring through
a declarative language for systems, networks, artifacts and events.

This blog is a space to explore the ideas and practices behind that work.

<!-- truncate -->

## From scenario to experiment

A CRADLE scenario describes the environment and its intended behavior. CradleXC
validates and compiles that description, while independently distributed backend
plugins generate files for a selected target. Operators then use the target's
tooling to provision and run the environment.

Keeping those responsibilities explicit makes it easier to inspect a scenario,
review changes and understand which parts of an experiment depend on its target.

## Where to start

- Follow the [quick start](/docs/getting-started/quick-start) to write and validate a first scenario.
- Explore the [Workbench](/workbench/) to inspect scenario structure in your browser.
- Read the [release notes](/releases/) for version-specific changes and upgrade guidance.

The documentation remains the reference for supported commands and behavior.
The blog provides room for explanations, examples and the reasoning behind
design decisions.
