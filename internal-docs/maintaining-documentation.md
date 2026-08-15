# Maintaining the documentation

This internal guide explains how to update the CRADLE documentation without
making the site harder to navigate or maintain.

## Preview changes locally

Create and activate a Python virtual environment, then install the documentation
dependencies:

```console
python -m venv .venv
source .venv/bin/activate
python -m pip install -r docs/requirements.txt
```

Build the site from the repository root:

```console
make -C docs html
```

The generated site is written to `docs/build/html`. Open `index.html` to review
the result before submitting a change.

Run `make -C docs clean html` when navigation or theme changes do not appear in
an incremental build.

## Where content belongs

| Content | Location |
| --- | --- |
| CRADLE concepts and tutorials | `docs/source/introduction/` |
| Intermediary Language guides | `docs/source/il-language/` |
| Schema reference | `docs/source/schema/` |
| Public project information | `docs/source/project/` |
| Theme styles and interactions | `docs/source/_static/` |
| Sphinx page templates | `docs/source/_templates/` |
| Internal documentation | `internal-docs/` |
| Navigation and theme configuration | `docs/source/conf.py` and `docs/source/index.rst` |

## Writing conventions

- Start pages with a single, descriptive level-one heading.
- Lead with the task or concept the reader will complete or understand.
- Prefer short sections and concrete examples over long introductory prose.
- Use sentence case for headings and navigation labels.
- Mark file names, properties, and language symbols as inline code.
- Add code fences with a language identifier so examples are highlighted.
- Link to the canonical reference instead of duplicating reference material.
- Keep internal implementation and release details out of the public Sphinx source.

## Add or move a public page

Sphinx navigation is defined by the hidden `toctree` blocks in
`docs/source/index.rst`. When adding or moving a page:

1. Put it in the directory that matches its audience and purpose.
2. Add it to the appropriate `toctree` in the intended reading order.
3. Check the previous and next links at the bottom of nearby pages.
4. Search for links to the old path if a page was moved.
5. Build the complete site and resolve warnings introduced by the change.

## Review checklist

- The page is appropriate for its intended public, customer, or internal audience.
- The page is reachable from the sidebar in two clicks or fewer.
- Link text describes the destination without relying on “click here.”
- Examples can be copied and understood without missing context.
- Tables and code blocks remain usable on a narrow screen.
- Light and dark themes both preserve readable contrast.
- The build completes without new warnings.
