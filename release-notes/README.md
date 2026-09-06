# CRADLE release notes

This directory contains CRADLE release notes.

Published file names must match the release tag:

- `v0.18.1.md`
- `v0.19.0.md`
- `v1.0.0-rc.1.md`

`v0.18.1` is the first public release. Files with earlier versions are omitted from the website release index and never create GitHub Releases.

Merging a release-note file for `v0.18.1` or later into `main` creates or updates
the corresponding GitHub Release.

## Automatic upstream polling

The `Poll for new CradleXC releases` workflow checks
`cradle-lang/CradleXC` every 30 minutes. When it finds a release whose tag does
not match `.last-processed-release` and has no open release-note pull request,
it dispatches the `Generate CradleXC release notes with Copilot` workflow.
Copilot examines the source changes and relevant documentation, follows
`v0.18.1.md` as its editorial reference, writes in American English, and opens a
draft pull request for human review. It does not merge or publish the release.

The polling workflow can also be run manually with an optional existing release
tag. The Copilot workflow accepts that same tag when a maintainer needs to
invoke it directly.

Set the repository secret `CRADLE_RELEASES_TOKEN` to a fine-grained token with
read access to CradleXC releases when the upstream repository is private. The
workflow falls back to `github.token` when the upstream repository is public.

Release tags are not translated. An upstream tag such as `v0.18.1` produces
`release-notes/v0.18.1.md`, a `release-notes/v0.18.1` branch, and a release-note
pull request for `v0.18.1`. The `.last-processed-release` marker stores that same
tag for comparison with the CradleXC API response.
