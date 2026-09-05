# CRADLE release notes

Each file in this directory describes one published CRADLE release.

File names must match the release tag:

- `v0.16.0.md`
- `v0.17.0.md`
- `v1.0.0-rc.1.md`

Merging a release-note file into `main` creates or updates the corresponding
GitHub Release.

## Automatic upstream polling

The `Poll for new CradleXC releases` workflow checks
`cradle-lang/CradleXC` every 30 minutes. When it finds a release whose tag does
not match `.last-processed-release` and has no open release-note pull request,
it dispatches the `Generate CradleXC release notes with Copilot` workflow.
Copilot examines the source changes and relevant documentation, follows
`v1.0.0.md` as its editorial reference, writes in American English, and opens a
draft pull request for human review. It does not merge or publish the release.

The polling workflow can also be run manually with an optional existing release
tag. The Copilot workflow accepts the upstream tag and mapped public tag when a
maintainer needs to invoke it directly.
Set the repository secret `CRADLE_RELEASES_TOKEN` to a fine-grained token with
read access to CradleXC releases when the upstream repository is private. The
workflow falls back to `github.token` when the upstream repository is public.

Public version numbers switch to the `v1.*` series at upstream tag `v0.18.1`:

- `v0.18.1` maps to `v1.0.0`.
- `v0.18.2` maps to `v1.0.1`.
- `v0.19.0` maps to `v1.1.0`.

Earlier upstream tags keep their original `v0.*` number. The
`.last-processed-release` marker always stores the upstream tag so polling can
compare it directly with the CradleXC API response.

The marker is initialized to `v0.18.1` because the existing `v1.0.0.md` note is
the public counterpart of that upstream release. The next expected mapping is
therefore `v0.18.2` to `v1.0.1`.
