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

## Release Notes

Author release notes in `release-notes/` using names such as `v1.2.0.md` or `v1.2.0-rc.1.md`. Do not edit `src/data/release-notes.json` directly.

```bash
npm run generate-release-notes
```

Files beginning with `v0.` are currently excluded from the public release-note index. The optional `npm run fetch-releases` command uses `CRADLE_RELEASES_TOKEN`; never commit that token.

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
