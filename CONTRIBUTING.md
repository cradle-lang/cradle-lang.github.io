# Contributing to the CRADLE Documentation Website

Thank you for improving CRADLE's documentation, website or browser Workbench. This guide contains the steps and checks needed to submit a change. For the project's architecture, design choices and HCI rationale, see [`README.rst`](README.rst).

This repository documents CRADLE and CradleXC; it does not contain the compiler or deployment backends. Changes to product behavior may need to be made in their owning repository first.

## Before You Begin

- Associate substantial work with a GitHub issue describing the user need and expected outcome.
- Use synthetic examples. Never commit credentials, private infrastructure details or sensitive scenarios.
- Check `git status --short` and preserve unrelated work already in the tree.
- Use Node.js 20 or newer. CI currently uses Node.js 22.

## Local Setup

```bash
npm ci
npm run start
```

The development site is normally available at `http://localhost:3000/`.

Before submitting a pull request, run:

```bash
npm run build
```

The build regenerates `src/data/release-notes.json`, validates internal links and writes the static site to `build/`. Use `npm run serve` when you need to inspect that production output locally.

## Branches and Scope

Create a dedicated branch, including the issue number where practical:

```text
42-update-installation-guide
57-fix-broken-navigation
63-improve-workbench-feedback
```

Avoid direct changes to `main`. Keep commits focused and do not combine unrelated content, design or formatting changes.

Use the appropriate source location:

| Change | Location |
| --- | --- |
| Current documentation | `docs/` |
| Published snapshot correction | `versioned_docs/version-*/` |
| Current or versioned navigation | `config/sidebars.ts` or `versioned_sidebars/` |
| Homepage or Workbench | `src/components/` |
| Homepage terminal transcript | `src/data/homepage-terminal.json` |
| Standalone route | `src/pages/` |
| Shared theme rules | `src/css/custom.css` |
| Component styles | Colocated `*.module.css` |
| Release note | `release-notes/v<semver>.md` |
| Static asset | `static/` |

Search for related content before changing terminology or commands:

```bash
rg "term-or-command" docs src README.rst CONTRIBUTING.md
```

## Documentation Changes

- Use **CRADLE** for the language and project, **CradleXC** for the compiler and `cxc` for its CLI.
- Write for the reader's task: outcome, prerequisites, steps, expected result and recovery guidance.
- Distinguish validation, compilation, backend generation and deployment. CradleXC does not automatically deploy generated files.
- State privileges, side effects, output locations, platform assumptions and backend-dependent limitations.
- Prefer repository-relative links with descriptive link text.
- Keep examples minimal, internally consistent and safe to copy.
- Qualify behavior that cannot be verified instead of presenting assumptions as facts.
- Use MDX only when ordinary Markdown cannot express the required result.

When adding, moving or deleting a current page, update the sidebar and incoming links. Do not copy current changes into every published snapshot automatically; edit a historical version only when the issue explicitly applies to it.

The animated homepage terminal is curated data rather than captured output from
one maintainer's machine. Verify its current transcript against the tagged
CradleXC package version, doctor formatting, configuration display, tests and
available plugin manifests. Normalize user-specific paths, avoid duplicate
dependency rows and do not add fields that the tagged command does not print.
Entries under `versions` are immutable release snapshots.

## Automated Documentation Maintenance

Parts of the documentation are maintained through GitHub Actions to reduce repetitive manual updates and keep the website aligned with CradleXC.

When relevant changes or releases are detected in CradleXC, the automation prepares the corresponding documentation updates and opens a pull request in this repository for review.

Production release automation begins at `v0.18.1`; earlier tags and prereleases
are excluded by `config/release-policy.json`. Older valid tags may be exercised
only by manually running the preparation workflow with `historical_test`
enabled. The resulting `test-release/<tag>` pull request is a test-only draft
and must not be merged or published.

The general workflow is:

```text
CradleXC change or release
        ↓
Automation reconciles all eligible tags against release notes on main
        ↓
Oldest outstanding release is selected
        ↓
Queue state is derived from repository and pull-request state
        ↓
Single production-generation slot becomes available
        ↓
Documentation updates are generated and validated
        ↓
A pull request is opened
        ↓
Maintainer reviews the changes
        ↓
Pull request is merged
        ↓
Website is updated
```

Release-note files merged into `main` are the authoritative completion state.
The reconciler orders all outstanding production releases by semantic version
and does not skip an older release while its documentation pull request is open.
Production preparation runs are serialized, while historical tests use separate
tag-specific concurrency groups.

Every poll records all eligible releases as `QUEUED`, `PRECOMPUTING`, `READY`,
`PROCESSING`, `PR_OPEN`, `COMPLETED` or `BLOCKED`. It publishes the table in the
workflow summary and retains the JSON snapshot for 14 days. These are derived
states based on upstream tags, merged notes, verified evidence, active
preparation runs and open pull requests rather than manually maintained status
fields. The oldest unfinished release remains selected when it is waiting or
blocked, preserving FIFO order.

For production runs, the reconciler passes the selected tag together with its
full upstream commit SHA. The preparation workflow independently resolves the
checked-out tag and requires the resolved, checked-out and supplied SHAs to
match before invoking Copilot. When manually invoking production preparation,
supply both `tag` and `expected_sha`. Historical tests may omit `expected_sha`
but still verify that the checkout matches the requested tag.

New production release pull requests include a deterministic provenance sidecar
at `release-notes/provenance/<tag>.json`. It binds the release and predecessor
tags to their verified commit SHAs. The `v0.18.1` baseline is explicitly exempt
because this information was not recorded when that note was created. Do not
edit provenance to work around a mismatch: moved tags, missing required records,
and contradictory upstream state are blocking integrity failures whose source
must be corrected before reconciliation resumes.

Before Copilot runs, the workflow also generates
`release-notes/evidence/<tag>.json` directly from the verified predecessor and
target commits. It records the comparison SHAs, merge-base, commit subjects,
changed-file statuses, source areas, counts and a content checksum without
timestamps or AI-generated conclusions. Copilot uses this package as its source
inventory, and the package remains in the pull request for review and later
validation. Do not hand-edit release evidence; regenerate it from the
authoritative CradleXC Git history.

The preparation workflow independently reconstructs that Git comparison and
requires an exact match before Copilot starts. Tag/SHA, ordering and ancestry
conflicts are authoritative failures and block immediately. A missing, damaged
or mismatched evidence JSON file is derived data: the workflow regenerates it
once and repeats verification. If that retry fails, the workflow stops for
human investigation instead of weakening the integrity check.

### What is automated

Automation is used where information can be derived reliably from the source repository, such as:

- release information
- deterministic Git comparison evidence
- technical references that reflect the current CradleXC implementation
- selected user documentation affected by source changes
- generated documentation data used by the website

Generated files should not be edited manually unless the relevant workflow or generation process explicitly requires it.

Run the release policy, queue, filesystem, and command-line integration tests
before changing release automation:

```bash
npm run test:release-automation
```

### What remains manual

Content that requires contextual or product judgement should still be reviewed and updated manually. This includes:

- target audience
- product positioning
- product behavior and user-facing rationale
- higher-level explanations and examples
- major changes to how a feature should be presented to users

These areas generally remain unchanged unless there is a significant change in the product, intended users or overall use case.

### Reviewing automated pull requests

Before merging an automated documentation pull request, maintainers should verify that:

- the generated content accurately reflects the corresponding CradleXC changes
- existing documentation remains consistent with the new changes
- user-facing explanations remain clear and accurate
- manually maintained contextual or product information is still valid
- links, examples and referenced commands remain correct

Automated changes are reviewed in the same way as other documentation changes. Once approved and merged, the normal deployment workflow publishes the updated website.

## Release Notes

Author stable production release notes in `release-notes/` using names such as
`v1.2.0.md`. Prerelease filenames such as `v1.2.0-rc.1.md` are valid semantic
versions, but the current release policy excludes them from production indexing
and publication. Do not edit `src/data/release-notes.json` directly.

```bash
npm run generate-release-notes
```

`v0.18.1` is the first public release. Earlier versioned files are excluded
from the public release index and publication workflow.
The optional `npm run fetch-releases` command uses `CRADLE_RELEASES_TOKEN`;
never commit that token.

## UI, HCI and Accessibility

Follow the design rationale in the [Human-Computer Interaction Rationale](README.rst#human-computer-interaction-rationale) section of the README. Significant UI changes must explain the user problem, options considered, chosen design, trade-offs and how the result was evaluated.

For each visual or interactive change, verify:

- the task and system status remain clear, including loading, stale, warning and error states;
- destructive or replacement actions provide prevention and recovery;
- important information has a text or semantic alternative and is not conveyed by color alone;
- headings, labels, controls and reading order use semantic HTML where possible;
- every action works by keyboard with a visible focus indicator;
- light and dark themes retain sufficient contrast;
- the layout works at desktop and mobile widths and at 200% zoom;
- touch targets remain usable and non-essential motion respects `prefers-reduced-motion`; and
- screenshots or recordings contain no sensitive data.

The Workbench is an exploratory client-side visualizer, not the CradleXC compiler. Preserve these boundaries:

- source remains local to the browser and persists under `cradleWorkbenchSource`;
- import/export must not transmit source without an explicit privacy and security review;
- replacement of non-empty source requires confirmation;
- errors include a reason and recovery suggestion, and stale graphs must not appear current;
- topology, event flow, summary, inspector and diagnostics represent the same parsed model; and
- authoritative validation and deployment remain outside the Workbench.

## Validation

Run checks in proportion to the change:

| Change | Required checks |
| --- | --- |
| Documentation | Build; inspect rendered content and links |
| Navigation/versioning | Build; inspect sidebars, previous/next links and version menu |
| Release notes | Regenerate data; build; inspect selection and hash links |
| React/TypeScript | Build; exercise success, empty, warning and failure states |
| Layout or animation | Desktop/mobile, light/dark, keyboard, zoom and reduced motion |
| Workbench/parser | Both samples, valid/error input, persistence, import/export and all views |

CI runs the production build, Markdown/MDX linting and generated-site link checks. These are minimum gates; they do not establish that a technical claim is accurate or an interaction is usable.

## Pull Requests

The repository's default pull-request template is stored at `.github/pull_request_template.md`. Because it is on the default branch, GitHub displays its contents when a contributor opens a pull request on GitHub.

When creating a pull request with GitHub CLI, load the template explicitly:

```bash
gh pr create --template .github/pull_request_template.md
```

API integrations and coding agents that construct a pull request body themselves must read `.github/pull_request_template.md` and include the completed sections in that body.

Complete the template's existing sections:

- summarize what changed and why;
- link the related issue, or explain why there is none;
- select the applicable change type;
- mark only validation that was actually performed;
- add screenshots for significant UI changes; and
- use **Additional Notes** for relevant design decisions, HCI trade-offs, affected versions or limitations.

Do not submit the untouched template. Use `N/A` with a short explanation when a section does not apply. Automated contributors must distinguish checks they executed from visual or accessibility checks that still require a person. Pull requests should not contain unrelated edits or merge with a failing production build.

## Deployment

GitHub Actions deploys the site after changes reach `main`. Contributors should not deploy manually or edit generated `build/` output unless explicitly instructed by a maintainer.
