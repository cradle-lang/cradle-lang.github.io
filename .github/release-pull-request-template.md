<!--
This automation-specific template follows the repository's default pull-request
template and adds verified release-review evidence. Runtime placeholders are
filled deterministically before the pull request is created or updated.
-->

## Summary

Prepares release notes and user documentation for CradleXC `{{TAG}}` at
verified commit `{{EXPECTED_SHA}}`. This keeps the current documentation aligned
with the tagged compiler behavior while preserving relevant release history.

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

### Review at a glance

<!-- markdownlint-disable MD055 MD056 -->
| Review item | Result |
| --- | --- |
{{REVIEW_SUMMARY_ROWS}}
<!-- markdownlint-enable MD055 MD056 -->

### Required human review

Complete these checks before approving the pull request:

{{HUMAN_VERIFICATION}}

### Regression results

<!-- markdownlint-disable MD055 MD056 -->
| Control | Attempt 1 | Attempt 2 |
| --- | --- | --- |
{{REGRESSION_ROWS}}
<!-- markdownlint-enable MD055 MD056 -->

An initial failure followed by a successful second attempt means the bounded
repair ran and the complete validation suite passed afterward.

### Risk and impact

Impact classification: `{{IMPACT_CLASSIFICATION}}`

Affected components:

{{AFFECTED_COMPONENTS}}

Risk signals:

{{RISK_INDICATORS}}

Classification basis:

{{CLASSIFICATION_REASONS}}

### Verified source

<!-- markdownlint-disable MD055 MD056 -->
| Field | Verified value |
| --- | --- |
| Release | `{{TAG}}` |
| Release SHA | `{{EXPECTED_SHA}}` |
| Previous release | `{{PREVIOUS_TAG}}` |
| Previous SHA | `{{PREVIOUS_SHA}}` |
| Comparison | `{{SOURCE_RANGE}}` |
| Commits | {{COMMIT_COUNT}} |
| Changed upstream files | {{SOURCE_FILE_COUNT}} |
<!-- markdownlint-enable MD055 MD056 -->

<details>
<summary>Show affected upstream source areas</summary>

{{SOURCE_AREAS}}

</details>

### Changed files

<details>
<summary>{{GENERATED_FILE_SUMMARY}}</summary>

{{GENERATED_FILES}}

</details>

### Additional investigation context

<details>
<summary>{{LIKELY_DOCUMENTATION_SUMMARY}}</summary>

{{LIKELY_DOCUMENTATION}}

</details>

### Automation details

#### Recovery performed

{{AUTOMATIC_REPAIRS}}

#### Deterministic evidence

- Controlled `cxc doctor` capture: {{DOCTOR_SUMMARY}}
- Bounded AI context: {{CONTEXT_SUMMARY}}

#### AI usage

{{AI_CALLS}}

### Specialist review routing

{{REVIEW_ROUTING}}

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
