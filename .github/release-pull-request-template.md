<!--
This automation-specific template follows the repository's default pull-request
template and adds verified release-review evidence. Runtime placeholders are
filled deterministically before the pull request is created or updated.
-->

## Summary

Prepares release notes and user documentation for CradleXC `{{TAG}}` at
verified commit `{{EXPECTED_SHA}}`. This keeps the current documentation aligned
with the tagged compiler behaviour while preserving relevant release history.

{{TEST_NOTICE}}

{{VALIDATION_NOTICE}}

## Related issue

N/A - automated maintenance triggered by a verified CradleXC release tag.

## Change type

- [x] Documentation/content
- [ ] UI/UX or visual design
- [ ] Workbench/playground functionality
{{WEBSITE_CHECKBOX}}
{{VERSIONING_CHECKBOX}}
- [ ] Build/CI/CD
- [ ] Dependency/configuration
- [ ] Bug fix
- [ ] Refactor/maintenance
- [ ] Other:

## Changes made

<!-- Review the generated-file list below for the complete scope. -->

- Added `release-notes/{{TAG}}.md` from verified upstream evidence.
- Updated the current animated `cxc doctor` transcript.
- {{ARCHIVE_SUMMARY}}

## Structured review packet

### Verified source delta

| Field | Verified value |
| --- | --- |
| Release | `{{TAG}}` |
| Release SHA | `{{EXPECTED_SHA}}` |
| Previous release | `{{PREVIOUS_TAG}}` |
| Previous SHA | `{{PREVIOUS_SHA}}` |
| Comparison | `{{SOURCE_RANGE}}` |
| Commits | {{COMMIT_COUNT}} |
| Changed upstream files | {{SOURCE_FILE_COUNT}} |

Source areas:

{{SOURCE_AREAS}}

### Affected components and impact

Classification: `{{IMPACT_CLASSIFICATION}}`

{{AFFECTED_COMPONENTS}}

Classification reasons:

{{CLASSIFICATION_REASONS}}

### Generated documentation files

{{GENERATED_FILES}}

### Regression results

| Control | Attempt 1 | Attempt 2 |
| --- | --- | --- |
<!-- markdownlint-disable MD055 MD056 -->
{{REGRESSION_ROWS}}
<!-- markdownlint-enable MD055 MD056 -->

### High-risk areas

{{RISK_INDICATORS}}

Likely documentation requiring particular attention:

{{LIKELY_DOCUMENTATION}}

### Automatic recovery performed

{{AUTOMATIC_REPAIRS}}

### AI usage

{{AI_CALLS}}

### Supporting deterministic evidence

- Controlled `cxc doctor` capture: {{DOCTOR_SUMMARY}}
- Bounded AI context: {{CONTEXT_SUMMARY}}

### Changes requiring human judgement

{{HUMAN_VERIFICATION}}

## Testing and verification

- Automated checks:
  - See the regression-results table above.
  - The workflow checked the upstream tag, full commit SHA, ancestry, evidence
    checksum, allowed edit scope, terminal structure, source coverage,
    Markdown/MDX, production build, and generated-site links.
- Manual verification: pending for every item under “Changes requiring human
  judgement.”

## User-facing evidence

{{USER_FACING_EVIDENCE}}

## Documentation and compatibility impact

Current documentation and release notes now describe CradleXC `{{TAG}}`.
Review the release note and changed documentation for migration or compatibility
guidance, especially where a high-risk indicator appears above.

## Contributor checklist

- [x] I reviewed my own changes and kept this PR focused.
- [ ] I verified relevant documentation, navigation, and links.
- [x] I ran the relevant repository checks and recorded the results above.
- [x] I updated related documentation where behavior changed.
- [x] I have not included unrelated changes.

{{REVIEW_NOTICE}}
