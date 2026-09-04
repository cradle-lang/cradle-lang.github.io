<!--
Thank you for contributing to the CRADLE documentation website.
Complete the applicable sections and use "N/A - <reason>" when a section does
not apply. Comments are guidance and will not appear in the pull request.
-->

## Summary

<!-- What changed, why was it needed, and what user, contributor, or maintainer
outcome does it improve? -->

## Related issue

<!-- Use "Closes #123", "Fixes #123", "Related to #123", or "N/A - <reason>". -->

## Change type

<!-- Select all that apply. -->

- [ ] Documentation/content
- [ ] UI/UX or visual design
- [ ] Workbench/playground functionality
- [ ] Website functionality
- [ ] Documentation versioning
- [ ] Build/CI/CD
- [ ] Dependency/configuration
- [ ] Bug fix
- [ ] Refactor/maintenance
- [ ] Other:

## Changes made

<!-- Describe the important implementation or documentation changes. Avoid
repeating the Summary. Mention affected pages, routes, components, versions, or
user workflows where useful. -->

## Testing and verification

<!-- Explain exactly what you verified, including commands, browsers, viewport
sizes, and manual scenarios. Use only checks relevant to this change. -->

- Automated checks:
- Manual verification:

<!-- Documentation/content: run `npm run build`; inspect rendered pages,
navigation, internal/external links, and any affected current or versioned docs.

UI/UX or website functionality: run `npm run build`; inspect the affected
flows in `npm run start` or the production output with `npm run serve`, including
responsive layout, keyboard access, themes, and zoom where relevant.

Workbench/playground: exercise representative valid and invalid input, relevant
success/warning/stale/error states, persistence or import/export, and all
affected views.

Documentation versioning: inspect the version menu, sidebars, routes, and
previous/next links; confirm whether historical snapshots were intentionally
changed.

Release notes: run `npm run generate-release-notes` (or `npm run build`) and
inspect the release page, selection, and links.

Build/CI/CD, dependency, or configuration changes: run the applicable build or
repository checks and explain any workflow/configuration validation performed.
The repository CI also runs Markdown/MDX linting, a production build, and
generated-site link checks.

If a check genuinely does not apply, write `N/A - <reason>` rather than leaving
the evidence blank. -->

## User-facing evidence

<!-- For UI, layout, responsive-design, animation, or Workbench changes, add
screenshots or recordings that show the relevant states and viewports. Do not
include credentials, private infrastructure, or sensitive scenarios. Use
"N/A - no visible impact" for changes without a user-visible effect. -->

## Documentation and compatibility impact

<!-- State whether this affects commands, configuration, public behavior,
documentation versions, URLs/routes, or existing user workflows. Describe
migration, compatibility, or release implications when relevant; otherwise use
"N/A - <reason>". -->

## Contributor checklist

- [ ] I reviewed my own changes and kept this PR focused.
- [ ] I verified relevant documentation, navigation, and links.
- [ ] I ran the relevant repository checks and recorded the results above.
- [ ] I updated related documentation where behavior changed.
- [ ] I have not included unrelated changes.
