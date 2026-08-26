# Contributing to the CRADLE Documentation

Thank you for contributing to the CRADLE documentation.

## Development Setup

Install the project dependencies:

```bash
npm ci
```

Start the local development server:

```bash
npm run start
```

Before submitting changes, verify that the production build succeeds:

```bash
npm run build
```

## Branches

Changes should normally be associated with a GitHub issue before development begins.

Create a dedicated branch for the issue using a clear and traceable branch name, for example:

```text
42-update-installation-guide
57-fix-broken-navigation
63-improve-homepage-layout
```

The branch should reference the relevant issue number where practical.

Direct changes to `main` should be avoided. Changes should be submitted through a pull request.

Automated changes may create their own branches and submit pull requests without a pre-existing issue where appropriate.

All pull requests are subject to the same validation and review requirements.

## Documentation Changes

When updating documentation:

* Keep content accurate and concise.
* Follow the existing documentation structure.
* Preserve terminology used throughout the CRADLE documentation.
* Check that internal links and navigation continue to work.
* Avoid changing historical versioned documentation unless the change is intentionally intended for that version.
* Update related documentation when a change affects more than one page.

## Website Changes

For changes to Docusaurus components, styling or layout:

* Check the affected pages locally.
* Test both light and dark themes where applicable.
* Check common desktop and mobile layouts.
* Include screenshots in the pull request when the visual change is significant.

## Pull Requests

Submit changes through a pull request.

A pull request should:

* Clearly describe what was changed.
* Explain why the change is needed.
* Link the relevant issue where applicable.
* Keep unrelated changes separate.
* Pass all required repository checks.
* Include screenshots for relevant UI changes.

Pull requests should be reviewed before merging.

## Versioned Documentation

The `docs/` directory contains the current documentation.

Published documentation snapshots are stored in `versioned_docs/` with their corresponding sidebar definitions in `versioned_sidebars/`.

Do not modify published versions unless the change is specifically intended to correct or update that version.

## Validation

Before submitting a pull request, run:

```bash
npm run build
```

The pull request should not be merged if the production build fails.
