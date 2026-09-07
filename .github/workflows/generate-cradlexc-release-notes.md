---
name: Generate CradleXC release notes with Copilot
description: Use Copilot to author a reviewed CradleXC release-note pull request
intent: Give CRADLE users accurate, useful release notes that explain the user-visible impact of each new CradleXC release in the documentation site's established editorial style.
engine:
  id: copilot
  env:
    COPILOT_GITHUB_TOKEN: ${{ secrets.COPILOT_CLI_TOKEN }}
on:
  roles: [admin, maintainer, write]
  workflow_dispatch:
    inputs:
      tag:
        description: Published CradleXC tag to analyze, for example v0.18.1
        required: true
        type: string
permissions:
  contents: read
  pull-requests: read
concurrency:
  job-discriminator: ${{ github.run_id }}
checkout:
  - path: .
    fetch-depth: 0
  - repository: cradle-lang/CradleXC
    ref: ${{ github.event.inputs.tag }}
    path: upstream-cradlexc
    fetch-depth: 0
    github-token: ${{ secrets.CRADLE_RELEASES_TOKEN || github.token }}
tools:
  github:
    mode: gh-proxy
    toolsets: [repos, pull_requests]
  bash: [cat, date, find, git, head, jq, npm, rg, sed, sort, tail, wc]
safe-outputs:
  create-pull-request:
    draft: true
    branch-prefix: "release-notes/"
    preserve-branch-name: true
    recreate-ref: true
    fallback-as-issue: false
    allowed-files:
      - "release-notes/**"
    max-patch-files: 2
network:
  allowed:
    - defaults
    - github
strict: true
---

# CradleXC Release-Note Author

Create one draft pull request containing polished release notes for CradleXC
`${{ github.event.inputs.tag }}`. Use that tag unchanged everywhere.

## Evidence to inspect

1. Read `release-notes/v0.18.1.md` completely. Treat it as the controlling
   reference for voice, organization, technical depth, Markdown conventions,
   command examples, and explanation of user impact.
2. Inspect the checked-out source in `upstream-cradlexc/` at the requested tag.
   Use its Git history and tags to identify the immediately preceding upstream
   release and review the complete diff between that tag and the requested tag.
3. Inspect relevant commits, source, tests, changelog files, README files, and
   documentation. Use an annotated upstream tag message as supporting evidence
   when present, but verify claims against the repository instead of merely
   copying it.
4. Read relevant current documentation in this repository so terminology,
   commands, paths, limitations, and links remain consistent.

Do not invent behavior or infer user-facing changes from a commit title alone.
Omit changes that cannot be supported by repository evidence. Do not expose
secrets, internal-only details, raw commit inventories, or implementation noise.

## Writing requirements

- Write entirely in American English. Use American spellings such as
  "behavior," "color," "organization," and "initialize."
- Match the professional, explanatory style of `release-notes/v0.18.1.md`.
  Address users directly only where it improves task clarity.
- Start with `# Announcing CradleXC X.Y.Z`, using the requested tag without the
  leading `v`.
- Follow with the publication date in the same italicized date format and
  Markdown-lint suppression convention used by the reference note.
- Open with two or three concise paragraphs explaining what the release is,
  who benefits, and why the changes matter.
- Include `## Highlights`, followed by concise user-facing bullets.
- Organize the remaining material under applicable sections such as `## Added`,
  `## Changed`, `## Fixed`, `## Installation and upgrade`, `## Documentation`,
  and `## Known limitations`. Omit empty sections.
- Within change sections, use descriptive `###` headings and prose that explains
  outcomes, usage, constraints, and operational implications—not a commit dump.
- Include verified, minimal command or configuration examples when they help a
  user adopt a change. Keep examples internally consistent and safe to copy.
- Preserve the CRADLE naming rules: **CRADLE** is the language/project,
  **CradleXC** is the compiler, and `cxc` is the CLI.
- Clearly distinguish validation, compilation, backend generation, and
  deployment. CradleXC does not automatically deploy generated files.
- Mention breaking changes, migrations, compatibility requirements, security
  implications, and known limitations when supported by evidence.
- Do not include conventional-commit prefixes, exhaustive commit lists,
  contributor marketing, vague praise, or claims such as "fully supported"
  unless the evidence establishes them.

## Required changes and validation

1. Write only `release-notes/${{ github.event.inputs.tag }}.md` and
   `release-notes/.last-processed-release`.
2. Put the tag `${{ github.event.inputs.tag }}` followed by a
   newline in `.last-processed-release`.
3. Do not overwrite an existing release-note file. If the target note already
   exists, call `noop` and explain that it requires human handling.
4. Run `npm run generate-release-notes`, Markdown linting where available, and
   any focused validation needed for links or commands. Fix failures caused by
   the two allowed files. Do not include generated `src/data/release-notes.json`
   in the commit.
5. Review the final note for factual accuracy, American English, readability,
   and close stylistic alignment with `v0.18.1.md`.

## Pull request

After validation, call the `create_pull_request` safe output exactly once with:

- branch `${{ github.event.inputs.tag }}` (the configured prefix will produce
  `release-notes/${{ github.event.inputs.tag }}`);
- title `Add release notes for ${{ github.event.inputs.tag }}`; and
- a body that identifies the release tag, summarizes the evidence reviewed,
  lists validation performed, and asks for human editorial and technical review
  before merging.

Never merge or publish the release. If evidence is insufficient, the upstream
checkout is unavailable, the target note exists, or no safe and accurate note
can be produced, call `noop` with a short reason and create no pull request.
