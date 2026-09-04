---
draft: true
---

# Intermediary Language

The Intermediary Language (IL) is a documented, human-readable notation for expressing CRADLE scenario concepts as short declarative statements. It is intended to help people review and discuss an environment before working with the formal CRADLE block syntax.

## Why IL exists

Formal CRADLE syntax is precise, but it can be unfamiliar to non-developers. IL represents many of the same relationships using statements such as:

```text
instance Client has os ubuntu 20.04
network lan_0 has endpoint Client DHCP
```

This format can make an early scenario review easier for researchers, exercise designers, domain specialists, and developers collaborating on the same environment.

## Relationship to CRADLE

| IL | CRADLE |
| --- | --- |
| Human-readable design notation | Formal domain-specific language |
| One statement per property or relationship | Named blocks containing comma-separated properties |
| Useful for review and conceptual mapping | Consumed by the CRADLE compiler |
| No production parser in the current reference branch | Active grammar and compiler implementation exist |

Conceptually, an IL statement maps to a CRADLE declaration or property. That conceptual mapping does not guarantee automatic conversion, semantic equivalence, or lossless round trips.

## Appropriate uses

IL is useful for:

- explaining a scenario to readers who are new to CRADLE
- reviewing systems, networks, events, and artifacts in a concise form
- drafting a scenario before translating it into formal CRADLE syntax
- documenting intended mappings for a future conversion component

## When to use formal CRADLE instead

Use formal CRADLE syntax when:

- the scenario will be processed by the current compiler;
- exact property names, argument boundaries, or quoting matter;
- compiler-supported extensions are required;
- validation against the grammar or structured model is required; or
- the scenario forms part of a supported product workflow.

## Current coverage

The documented IL notation covers:

- environment name, event type, and remote repository
- instances, operating systems, objects, configurations, and roles
- networks, subnets, and endpoints
- pre-event, main-event, and post-event membership
- common event properties
- object locations

```{important}
The current notation does not define a complete mapping for all compiler features, including heuristic annotations, I/O definitions, local repositories, advanced wait conditions, and some role details.
```

## Conversion boundaries

Until an IL implementation is supplied and tested:

- whitespace and quotation rules remain documentation conventions rather than a parser contract;
- free-text values can be ambiguous;
- unsupported CRADLE properties may be lost during manual translation;
- names and references must be checked manually;
- IL-to-CRADLE and CRADLE-to-IL equivalence is not guaranteed; and
- IL should not be advertised as an accepted product input format.

## Continue exploring

- Review the documented forms in [IL Syntax and Structure](syntax.md).
- Compare both representations in the [Intermediary Language Example](example.md).
- Consult the [CRADLE Language Overview](../language/overview) for the formal language.
- Review the [CRADLE Schema Reference](../schema/cradle-schema.md) for the structured model and current limitations.
