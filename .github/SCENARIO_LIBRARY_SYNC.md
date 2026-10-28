# Review updates from the scenario library

`Review scenario library updates` receives the `scenario-library-updated`
repository dispatch from `mashmllo/scenario_library` after a validated push to
its `main` branch. It verifies the source run, downloads its `website-scenarios`
artifact, imports the snapshot, checks the website, and opens or updates a PR
on branch `sync-scenario-library`. Merge that PR to publish through the existing
Pages deployment workflow. The receiver never merges it automatically.

## Required setup

1. Merge this receiver workflow into the website's default `main` branch first.
2. In the **source library**, add Actions secret `WEBSITE_SYNC_TOKEN`: a
   fine-grained GitHub token (or App token) with **Contents: write** on this
   website repository. It authorizes the repository-dispatch API call.
3. In this **website**, add Actions secret `SCENARIO_LIBRARY_READ_TOKEN`: a token
   with **Actions: read** and **Contents: read** on the private source repository.
   The receiver uses it to verify source runs, read the source main revision and
   download the artifact. It does not need source write access.
4. Permit GitHub Actions to create pull requests in this repository's Actions
   settings. The receiver uses `GITHUB_TOKEN` with contents/pull-requests write
   permission for the review branch/PR. If you want ordinary PR checks to start
   automatically, optionally add `WEBSITE_PR_TOKEN` with **Contents: write** and
   **Pull requests: write** on this website. GitHub can require approval for
   workflow runs caused by a PR created using `GITHUB_TOKEN`.
5. Merge the source exporter/notification workflow into source `main`. Its
   validation workflow must pass before it sends a dispatch.

Store tokens under **Settings → Secrets and variables → Actions** in the named
repositories. Local LLM API keys are unrelated and are never used for this sync.

## Imported content

Each scenario folder ID maps directly to `library/scenarios/<id>/`. A synced
folder contains exactly `scenario.cradle` and `index.md`; prior supporting files
inside that same folder are removed in the review PR. Unrelated website entries
are preserved. A source deletion does not automatically remove an already merged
website entry. The source's draft flag is preserved.

Article links to files omitted from the website copy point to the immutable
source commit. Source image embeds become ordinary GitHub links, and custom
thumbnail metadata is omitted so the website uses built-in artwork. Supporting
files in the private source repository require GitHub access. The source export
currently requires `index.md`; MDX-only scenarios must be converted first.

The receiver accepts only a successful `push` validation run from source `main`,
requires the dispatched SHA and bundle SHA to match that run, and checks that it
is still the latest source main commit. PR validation artifacts and stale runs
are rejected/skipped. Downloaded source scripts and configs are not executed.
Only the two fixed filenames are written under validated scenario folder IDs.

The PR contains `.github/scenario-library-source.json`, recording the source
repository, commit and scenario IDs for review. Website TypeScript, collection,
production build and downloadable-source checks run before PR creation.

## Retry and local verification

Use **Actions → Review scenario library updates → Run workflow** and enter a
successful source main validation run ID. It must still match source `main`,
and its bundle artifact must not have expired (source retention is 14 days).
Revalidate source main if its bundle expired. Manual runs use the same validation
and review-PR behavior as dispatched runs.

With a locally exported bundle:

```sh
node --test scripts/sync-scenario-library.test.mjs
node scripts/sync-scenario-library.mjs /path/to/bundle.json SOURCE_COMMIT_SHA
npm run typecheck
npm run test:collection
npm run build
npm run test:library-build
```

GitHub's token/event behavior is documented under
[Triggering a workflow](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow#triggering-a-workflow-from-a-workflow).
