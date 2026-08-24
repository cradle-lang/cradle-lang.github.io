# Content migration audit

Legacy content remains in place until the migration is reviewed and approved.

| Legacy content | New destination | Status |
| --- | --- | --- |
| `introduction/sections.md` | `language/*` | Review required |
| `introduction/heuristic.md` | `language/heuristics.mdx` | Review required |
| `introduction/helloworld.md` | `examples/hello-world.mdx` | Migrated |
| `reference/command-reference.md` | `cli/command-reference.mdx` | Review required |
| `user-guide/write-scenario.md` | `guides/write-a-scenario.mdx` | Review required |
| `user-guide/understand-output.md` | `getting-started/inspect-output.mdx`, `cli/outputs.mdx` | Review required |
| `user-guide/troubleshooting.md` | `guides/troubleshooting.mdx` | Review required |
| `user-guide/generate-deployment.md` | `guides/backends/generate-target-files.mdx` | Review required |
| `user-guide/deploy-environment.md` | Retire | Pending review |
| `user-guide/clean-up.md` | Retire | Pending review |
| `deployment/supported-platforms.md` | `guides/backends/overview.mdx` | Review required |
| `il-language/*` | Developer documentation | Pending review |
| `getting-started/prepare-host.md` | Install or backend documentation, or retire | Pending review |

No legacy source should be deleted until this table is fully reviewed. Deploy and destroy commands are deliberately excluded from the replacement public documentation.
