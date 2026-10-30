# Contribute to the CRADLE Library

## Automatic CVE documentation imports

`Sync validated CVE library` receives `cve-library-updated` from
`cradle-lang/cradle-lib-cve`, which is the CVE authoring source. Its old mirror
job from cradle-lib is removed by the companion source change. Configurations,
TTPs and scenario synchronization retain their existing workflows.

The receiver accepts only successful `.github/workflows/validate-cves.yml` runs
on source main, triggered by push or manual dispatch. Both validate/export every
CVE, including drafts. PR/fork/non-main runs cannot provide content. It checks
the exact artifact/run/SHA and source freshness before import and again before PR
creation. The artifact is named `website-cves` and expires after 14 days.

Each entry supplies `index.md` and the module folder URL, with internal CVE identity
and provenance metadata for automation. No module implementation files are copied.
Imported
articles go to `library/heuristics/cve-cve-YYYY-NNNN/index.md`; provenance and the
catalogue go to `library/cve-library.json`. Runtime templates/assets remain in
cradle-lib-cve, with article links pinned to its source commit. `draft: true`
entries stay out of the public collection. Missing previously managed CVEs are
drafted to retire them while retaining assets; manual articles and TTPs are not
retired. Existing matching CVE articles migrate on first sync.

The receiver runs `test:cve-sync`, TypeScript, collection tests, the production
build and library-output checks, then opens/updates a review PR from the plain
branch `cve-library-sync`. Merge it to publish through the Pages workflow.
CI checks documentation/module structure, not provisioning/runtime behavior.

Merge this receiver before the companion source workflows. Configure
`CRADLE_LANG_TOKEN` here with Actions/Contents read on cradle-lib-cve and
Contents/Pull requests write on this repository. The source repository needs the
same secret with Contents write here to dispatch the update. The code does not
create secrets or repository rules; require source validation and website build
checks in repository settings.

To retry, manually run this receiver with `source_run_id` set to the latest
successful full main validation. If its artifact expired, manually run
`Validate CVE library` on source main, then use that run ID. Its successful run
also sends the notification automatically.

For local verification with an exported bundle:

```powershell
$env:CVE_BUNDLE = '/path/to/bundle.json'
$env:SOURCE_SHA = '<full-source-sha>'
$env:SOURCE_RUN_ID = '<validated-run-id>'
npm run library:sync-cves
npm run test:cve-sync
npm run typecheck
npm run build
```

The single contributor command with `--generate-index` and the heuristic template
are documented in
[cradle-lib-cve/CONTRIBUTING.md](https://github.com/cradle-lang/cradle-lib-cve/blob/main/CONTRIBUTING.md).

## Automatic imports from scenario-lib

`Sync validated scenario library` receives the `scenario-library-updated`
repository dispatch emitted by `cradle-lang/scenario-lib`. It accepts only a
successful `.github/workflows/validate.yml` **push to source main**, checks that
the validated SHA is still current, and downloads that run's exact
`website-scenarios` artifact. PR validations and arbitrary repositories/workflows
cannot supply a snapshot. Expired bundles require a new source validation run.

The receiver imports the bundle into:

```text
library/
  scenario-library.json           # Source SHA/run ID and complete search catalog
  scenarios/<id>/
    index.md                     # Website article, including sourceUrl
    scenario.cradle              # Exact validated source text
```

The existing library generator populates `src/data/library.generated.json`
and static download assets from these folders. The sync catalog's `searchText`
feeds both the collection search and Workbench library browser, so metadata,
article terms, config names and CVE/TTP IDs in the specification are searchable.
GitHub links use the original scenario folder at the verified source commit.
The manifest keeps drafts; generated public entries exclude them. An all-draft
snapshot is valid and does not publish drafts automatically.

The receiver runs sync tests, TypeScript checks, collection tests, the production
build and library output checks, then rechecks source freshness and opens/updates
one PR from **`scenario-library-sync`** into **`main`**. Merge that review PR to
publish through the existing Pages workflow. Future source merges repeat this
process automatically. Other website scenarios and supporting files are kept;
source removals do not automatically delete previously imported website folders.
`validation-smoke-test` is rejected. Existing `index.mdx` conflicts require a
manual review. Artwork files are not in the source's two-file bundle, so imported
articles use built-in artwork rather than copying thumbnails.

Use one token stored as **`CRADLE_LANG_TOKEN` in both this website repository
and `cradle-lang/scenario-lib`**. Select both repositories when configuring the
token, with Contents: Read and write, Pull requests: Read and write,
Metadata: Read-only, and Actions: Read and write.

The source notifier uses it to send the repository dispatch. The receiver uses
it to verify source runs, download artifacts, push the sync branch and open the
review PR. No separate `SCENARIO_LIBRARY_READ_TOKEN`, `WEBSITE_PR_TOKEN` or
`WEBSITE_SYNC_TOKEN` secret is needed. An organization secret shared with both
repositories is also supported; a repository secret stored only in the website
is not available in scenario-lib. The PAT/App token allows PR CI to trigger.

To import the latest validated snapshot after first installing the receiver,
or to retry a missed notification, open **Actions → Sync validated scenario
library → Run workflow** and enter the successful source-main validation run ID.
It must still match source `main` and have an unexpired artifact.

To preview a previously downloaded, verified bundle locally:

```bash
SCENARIO_BUNDLE=/path/to/bundle.json SOURCE_SHA=<full-source-sha> SOURCE_RUN_ID=<run-id> npm run library:sync
npm run typecheck
npm run test:scenario-sync
npm run test:collection
npm run build
npm run test:library-build
```

The local importer verifies bundle identity against the supplied SHA; the Actions
receiver additionally verifies that SHA and run through the GitHub API. It never
executes CRADLE source or provisions a scenario.

## Manual contributions

Follow these steps to publish a scenario on the website. Create a folder, add
your complete CRADLE source and supporting files, and write `index.md` or
`index.mdx`. Docusaurus converts the article to HTML and discovers published
entries automatically. No catalog JSON, React imports, sidebar registration or
workflow choice lists need editing.

## 1. Prepare your checkout

You need Git, Node.js 20 or newer (Node.js 22 matches CI), npm and a GitHub
account to submit a pull request. The website build does not require a local
CradleXC installation, testbed credentials or a simulation backend.

Fork [the website repository](https://github.com/cradle-lang/cradle-lang.github.io)
on GitHub if you do not have write access. Clone your fork; replace
`YOUR-GITHUB-USERNAME` below with your account. Contributors with write access
can clone the upstream repository instead.

```bash
git clone https://github.com/YOUR-GITHUB-USERNAME/cradle-lang.github.io.git
cd cradle-lang.github.io
git switch -c add-my-range
npm ci
```

If you already have a checkout, start from an up-to-date `main` with a clean
working tree, create your contribution branch and run `npm ci`. Run all commands
below from the repository root. Read the general [contribution rules](../CONTRIBUTING.md).

## 2. Create a scenario folder

Replace `my-range` throughout this guide with a unique lowercase name using
letters, digits and hyphens. The folder name becomes the public URL and scenario
ID; choose it before publication.

```bash
npm run library:new -- scenario my-range
```

To import an existing scenario directory instead of the template specification:

```bash
npm run library:new -- scenario my-range --from "/path/to/my-range"
```

On Windows, quote the source path, for example:

```powershell
npm run library:new -- scenario my-range --from "C:\Users\bryan\Documents\my-range"
```

`my-range` is the new folder name, without `.cradle`; `--from` is a directory,
resolved from your current working directory. The command copies its complete
contents, including nested configs, artifacts, scripts and binary files. It skips
`.git`, `node_modules` and `__pycache__` directories and rejects symbolic links;
include actual supporting files inside your source folder.

The source must have a top-level `scenario.cradle`, or exactly one top-level
`.cradle` file, which is renamed to `scenario.cradle` in the copied entry. If
there are multiple specifications, name the main one `scenario.cradle` first.
The source folder is unchanged, and existing destination entries are rejected.

An existing `index.md` or `index.mdx` is preserved; having both is an error.
Otherwise, the command generates a draft article. Add `--mdx` to generate MDX
or convert an imported `index.md` to `index.mdx`. Review imported metadata and
links, especially links to a renamed specification. Link supporting files from
the article so readers can download them. Copying configs or artifacts does not
automatically install or register them with CradleXC or the target backend.

This creates `library/scenarios/my-range/index.md` and `scenario.cradle` without
overwriting an existing entry. To create MDX instead, use
`npm run library:new -- scenario my-range --mdx` as the initial command. Keep
exactly one `index.md` or `index.mdx` in the folder.

To import an existing specification, pass its file path instead of a folder name:

```bash
npm run library:new -- scenario ~/Downloads/Railway/Railway.cradle
```

This creates a draft in `library/scenarios/railway/`, deriving the lowercase folder
name from the filename and copying the source to `scenario.cradle`. The optional
`--mdx` flag works here too. Add supporting configs, artifacts and other assets
separately; only the specified source file is imported. Existing entries are
never overwritten.

Alternatively, copy `library/_templates/scenario/` to
`library/scenarios/my-range/`. Both approaches create a draft, excluded from the
catalog in development and production. Docusaurus allows direct draft article
previews in development only.

## 3. Complete the source and article

**Replace the comment-only `scenario.cradle` stub with your complete working
specification.** Changing the title and draft flag alone is not a complete
submission. The accepted [Hello World](scenarios/hello-world/index.md) and
[complex SME](scenarios/sme/index.mdx) entries show complete folder examples.

Fill in the article's YAML front matter. For example, replace the template's
opening `---` block with the following and adapt every value to your scenario:

```yaml
---
title: My Range
description: A small enterprise range for exploring network segmentation.
source: Your organization or original author
category: Enterprise
tags: [Networking, Training]
requirements: Requires the documented backend, images, named configurations and artifact repository.
draft: true
---
```

### Choose the specification filename

A scenario specification can have any filename ending in `.cradle`. Set
`entrypoint: HelloWorld.cradle` in the front matter of `index.md` or `index.mdx`
to select it. A relative path such as `entrypoint: specs/MyRange.cradle` is also
supported; it must point to a file inside the scenario folder.

The website selects the entrypoint in this order: the article's `entrypoint`,
the colocated `README.md` front matter's `entrypoint`, `scenario.cradle`, then
the only top-level `.cradle` file. If several files exist without a default,
set `entrypoint` explicitly. An explicit entrypoint that is missing or invalid
is an error; the website does not silently substitute another file.

Keep the article's download link pointed at the chosen file, for example
`[Download the specification](./HelloWorld.cradle)`. Catalogue downloads,
Workbench and compiler workflows use that same specification. Template and
import commands still supply `scenario.cradle` by default.

All six descriptive fields above are required. `tags` must be a non-empty list.
Quote YAML values containing a colon followed by a space. Do not add `id` or
`slug`: the folder determines both. Keep `draft: true` while preparing content;
change it to `draft: false` in step 4.

Write normal Markdown below the front matter, completing every template section:

- Explain the purpose, topology, learning objectives and events.
- Document backend/testbed requirements, images, named configurations, artifact access, setup steps and expected results.
- Record validation and compilation evidence, including compiler version and source revision when available. Distinguish recorded runtime tests from untested dependencies; do not claim checks you have not run.
- Credit original authors and state redistribution licenses for source and assets.

Use `##` headings; Docusaurus displays the title automatically. In MDX, use code
fences for CRADLE and shell code; escape literal `<` and `{` in prose when needed.

Keep all supporting files in the same entry folder, using subfolders as needed:

```text
library/scenarios/my-range/
  index.md
  scenario.cradle
  architecture.png
  scripts/
    setup.sh
  configurations/
    service.yml
```

Use relative Markdown links, such as `![Topology](./architecture.png)` and
`[Setup script](./scripts/setup.sh)`. Retain the template's
`[Download the specification](./scenario.cradle)` link: the production checks
verify that it points to the actual bundled source. Link every attachment that
readers need; merely placing an arbitrary file in the folder does not make it a
website download. Use filenames with extensions for attachments.

Only include files you can redistribute. Credentials belong outside the folder.
Implementation assets must also be installed in the target backend's libraries
as documented; publishing an article does not install them on a testbed.

### Choose artwork or add a custom thumbnail

Artwork is optional. With no image or artwork setting, `auto` chooses a built-in
illustration based on the number of networks. Add one of these to the article's
front matter to choose a default explicitly:

```yaml
artwork: network
```

| Choice | Appearance |
| --- | --- |
| `auto` | Network illustration for one network, enterprise illustration for multiple networks |
| `network` | Light blue network illustration |
| `enterprise` | Dark blue enterprise illustration |
| `monitoring` | Green monitoring illustration |

To use your own image:

1. Put it inside your scenario folder, for example `library/scenarios/my-range/images/thumbnail.webp`.
2. Add the following fields inside the existing YAML front matter, adapting the path and description:

   ```yaml
   artwork: monitoring
   thumbnail: ./images/thumbnail.webp
   thumbnailAlt: A diagram showing the training hosts and the management network.
   ```

3. Preview the scenario card, detail page and Workbench library browser. Commit the image with the article and specification.

The thumbnail does not automatically appear inside the written article. To show
it there too, add `![Training network diagram](./images/thumbnail.webp)` in the
Markdown body. Keep the image path consistent with your front matter.

Supported formats are PNG, JPEG, WebP, GIF and SVG. Use a path relative to the
scenario folder, such as `thumbnail: ./preview.svg`, rather than an absolute
filesystem path. Use a landscape image, preferably
1200 × 675 pixels (16:9), and keep important content near the centre because
containers crop to fit. Aim for a small optimized file, ideally under 500 KB.
Use images you have permission to publish and record attribution in your article.
`thumbnailAlt` is required for custom thumbnails; describe the image rather than
its filename. Images must be inside the scenario folder; external URLs and paths
outside that folder are rejected. No React imports, absolute website URLs or
manual catalog edits are needed. Thumbnail files are bundled with the static
site and work on both localhost and `cradle-lang.org`.

The custom image takes priority over `artwork`. If the browser cannot load it,
the selected built-in illustration appears. A missing file or missing alternative
text fails metadata generation with the entry path and field to fix. Remove
`thumbnail` and `thumbnailAlt` to return to the built-in artwork.

## 4. Publish locally and preview

When the article, specification and files are complete, set `draft: false` in the
front matter, then start the development server:

```bash
npm run start
```

Open these URLs (use the actual port printed by the server if 3000 is occupied):

- `http://localhost:3000/collection/?scenario=my-range` — the scenario detail view.
- `http://localhost:3000/library/scenarios/my-range` — the rendered article.

Confirm the scenario appears in the Library's scenario list, its topology and
components match the source, and **Open in Workbench** loads the right source.
Read the article and check images, attachment links and the specification
download. If using a custom thumbnail, confirm its crop and alternative text in
the card, detail page and Workbench library browser. Adding, editing and removing content refreshes the development catalog.

Stop the development server with Ctrl+C before the production checks.

## 5. Check the production build

Run each command in order and resolve failures before continuing:

```bash
npm run typecheck
npm run test:collection
npm run build
npm run test:library-build
npm run serve
```

The first command regenerates library metadata and checks TypeScript. Collection
tests check discovery and parsing; the build checks Markdown/MDX and internal
links. The final test verifies every published scenario's HTML and downloadable
source against its original file. None of these runs a simulation or replaces
CradleXC validation.

At the address printed by `serve`, repeat the collection, article, image,
Workbench and download checks from step 4. Check that the downloaded `.cradle`
contents match your source. Draft articles must not appear in this production
output. Stop the server with Ctrl+C when finished.

## 6. Submit and verify publication

Stage the complete folder, including source and linked assets, then review it:

```bash
git add library/scenarios/my-range/
git diff --cached --stat
git diff --cached
```

Check `git status --short` for forgotten attachments or unrelated edits. The
build may regenerate release-note data; do not include unrelated release changes.
Do not commit `build/`, `.docusaurus/` or ignored `library.generated.json` and
`library-assets.generated.ts` files; CI rebuilds them from your folder.

```bash
git commit -m "Add my-range library scenario"
git push -u origin add-my-range
```

Open a pull request on GitHub from your branch (or fork branch) into
`cradle-lang/cradle-lang.github.io`'s `main`. Complete the repository's PR
template, include the checks you ran and resolve failing CI checks. Maintainers
review and merge the contribution.

**A local folder or branch push alone does not publish to the live website.**
After merge, wait for **Deploy Docusaurus to GitHub Pages** in the upstream
repository's Actions tab to finish successfully for that commit. If it fails,
inspect the failed step and work with a maintainer to fix it. A successful PR
build is a preview check, not a completed Pages deployment.

Verify the published result:

- `https://cradle-lang.org/collection/?scenario=my-range` shows the scenario and its source in Workbench.
- `https://cradle-lang.org/library/scenarios/my-range` renders the article and attachments.
- **Download .cradle** downloads the matching source from the published site.

Website publication serves HTML and static assets. It does not deploy a cyber
range, provision infrastructure or execute events. To inspect compiler output,
use **Actions → Validate and compile collection scenario → Run workflow** after
the workflow exists on the upstream default branch. Enter the folder ID and
committed revision. Running Actions requires repository permission; otherwise
ask a maintainer. The run summary shows validation and compilation results,
the source revision, compiler version and a static report of instances, networks,
events and objects. Compiled YAML is temporary check output and is not uploaded;
use the collection page’s top **Download .cradle** button for the source.
Compilation does not verify runtime images, configuration availability or
artifact repositories.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Template command says the entry exists | Choose a new name or edit the existing folder; the command never overwrites it. |
| Scenario missing from the list | Set `draft: false`; use `library/scenarios/<name>/index.md` or `index.mdx`, with a complete `.cradle` specification selected by `entrypoint` or the filename defaults above. Restart the server if needed. |
| Metadata generation fails | Read the entry path and field in the error. Complete required fields, use valid YAML, remove `id`/`slug`, and use a lowercase folder name. |
| Guide crashes with a missing metadata or `id` error after a tooling update | Stop the development server, run `npm run clear`, then `npm run start`. Plugin/configuration changes require a fresh server; do not run a production build alongside the development server in the same checkout. |
| Article build fails | Check the reported Markdown/MDX line, code fences and relative attachment paths. Filenames are case-sensitive in CI. |
| Production download test fails | Keep a relative Markdown link to the selected specification in the article and rebuild before rerunning `test:library-build`. |
| Topology does not match | Inspect parser diagnostics in Workbench and validate the source with CradleXC; a website build alone does not prove compiler or runtime correctness. |
| Local preview works but live entry is missing | Confirm the entire folder was committed, merged to upstream `main`, and the Pages workflow for that commit succeeded. Refresh the page afterward. |

## Configuration and heuristic articles

Create these with the same template workflow:

```bash
npm run library:new -- configuration my-config
npm run library:new -- heuristic my-heuristic
```

Both commands also accept `--from "/path/to/module"` to copy the module's full
contents alongside the article. No `.cradle` file is required for these kinds.

To import an implementation file, pass its path instead of the folder name:

```bash
npm run library:new -- configuration ~/Downloads/LinuxRouter.yml
npm run library:new -- heuristic ~/Downloads/CWE-89.json
```

The folder name is derived from the filename (`linux-router` or `cwe-89`). The
file is copied unchanged into `assets/` inside the new entry, and the draft
article includes a download link. Only that file is imported; add dependencies
separately. Use `./filename` for a file without an extension. Both commands
support `--mdx` and refuse to overwrite existing entries. Review the configuration
key and OS, or the heuristic framework and identifier, before publishing; file
contents are not parsed to populate those fields.

Keep the article and assets together under `library/configurations/my-config/`
or `library/heuristics/my-heuristic/`. All entries require `title` and
`description`. Configuration metadata requires `config` (the exact
`config("name")` key) and `os`: `Linux`, `Windows`, `Cross-platform` or
`Unspecified`; set `category` to describe its purpose. Heuristics require
`framework` and `identifier` matching `heuristic("framework", "identifier")`;
framework matching ignores case. Fill in the template, link implementation
assets, set `draft: false` and follow the same preview, check and PR steps.

## Published resources and scenario usage

Configuration and heuristic cards come only from published articles under
`library/configurations/` and `library/heuristics/`. A `config()` or
`heuristic()` reference in a scenario does not create an entry. Article metadata
supplies the title, description, OS and framework information.

Usage counts and scenario links are computed from matching specification
references. Entries can be published before any scenario uses them. Removing an
article or setting `draft: true` removes its card even if references remain in
scenario files. Scenario details still display their own annotations.
Frameworks are derived from published heuristic articles.

See [Contribute a Configuration](../docs/guides/contribute-configuration.mdx) and
[Contribute a Heuristic](../docs/guides/contribute-heuristic.mdx) for full examples.

## Downloads

The collection's **Download .cradle** button uses the same browser-side export
helper as Workbench. It creates a file from the published scenario source already
loaded by the page. No GitHub link, login, API call or download server is needed,
and no hostname needs changing between local preview and `cradle-lang.org`.

Relative specification and attachment links in the authored Markdown article
remain static files bundled with the website. Both download paths use the same
colocated `scenario.cradle` source. GitHub Actions is used separately for optional
validation and its report, not to deliver the specification download.

Markdown links to `.cradle` files automatically download the specification rather
than opening raw source. Library articles do not display an editing link.
