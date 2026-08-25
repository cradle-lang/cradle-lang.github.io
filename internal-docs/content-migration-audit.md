# Content migration audit

Legacy content remains in place until the migration is reviewed and approved.
Confirmed legacy pages are marked as drafts so they remain available during
development but are excluded from production builds.

| Legacy content | New destination | Status |
| --- | --- | --- |
| `introduction/sections.md` | `language/*` | Draft; current links migrated |
| `introduction/heuristic.md` | `language/heuristics.mdx` | Draft; current links migrated |
| `introduction/helloworld.md` | `examples/hello-world.mdx` | Draft; migrated |
| `reference/command-reference.md` | `cli/command-reference.mdx` | Draft; current links migrated |
| `user-guide/write-scenario.md` | `guides/write-a-scenario.mdx` | Draft; current links migrated |
| `user-guide/understand-output.md` | `getting-started/inspect-output.mdx`, `cli/outputs.mdx` | Draft; current links migrated |
| `user-guide/troubleshooting.md` | `guides/troubleshooting.mdx` | Draft; current links migrated |
| `user-guide/generate-deployment.md` | `guides/backends/generate-target-files.mdx` | Draft; current links migrated |
| `user-guide/deploy-environment.md` | Retire | Draft pending final removal review |
| `user-guide/clean-up.md` | Retire | Draft pending final removal review |
| `user-guide/known-limitations.md` | Current topic pages | Draft pending content review |
| `deployment/supported-platforms.md` | `guides/backends/overview.mdx` | Draft; current links migrated |
| `il-language/*` | Developer documentation | Draft pending final destination |
| `getting-started/prepare-host.md` | Install or backend documentation, or retire | Draft pending final destination |

No legacy source should be deleted until this table is fully reviewed. Deploy and destroy commands are deliberately excluded from the replacement public documentation.
