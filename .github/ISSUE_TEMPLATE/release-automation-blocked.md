---
name: Blocked CradleXC release documentation
about: Track a CradleXC release that cannot pass automated documentation controls
title: "[Release automation blocked] CradleXC vX.Y.Z"
labels: release-automation, blocked
assignees: ""
---

{{MARKER}}

# CradleXC {{TAG}} release documentation is blocked

## Summary

The automated release-documentation workflow could not complete for `{{TAG}}`.
The failure remained after all safe recovery available in this run, so
processing stopped without bypassing the failed control.

> [!IMPORTANT]
> This issue requires maintainer review before the release is retried. Do not
> close it merely by rerunning an unchanged workflow.

## Impact

{{IMPACT}}

## Failure context

| Field | Value |
| --- | --- |
| Release | `{{TAG}}` |
| Expected upstream SHA | `{{EXPECTED_SHA}}` |
| Category | `{{CATEGORY}}` |
| Repository | `{{REPOSITORY}}` |
| Workflow | {{WORKFLOW_NAME}} |
| Run | [{{RUN_ID}}, attempt {{RUN_ATTEMPT}}]({{RUN_URL}}) |
| State | `BLOCKED` |

### Failed controls

| Job | Failed step |
| --- | --- |
{{FAILURE_ROWS}}

## Expected behavior

{{EXPECTED_BEHAVIOR}}

## Observed behavior

{{OBSERVED_BEHAVIOR}}

## Automated recovery performed

{{RECOVERY_ATTEMPTS}}

## Where to investigate first

{{INVESTIGATION_LOCATIONS}}

## Required maintainer decision

{{REQUIRED_DECISION}}

## Suggested actions

{{SUGGESTED_ACTIONS}}

## Evidence and diagnostics

- [Workflow run and step logs]({{RUN_URL}})
- Download retained exception, contract, validation or doctor artifacts before
  they expire.
- Logs and artifacts may describe private upstream implementation details. Do
  not paste sensitive content into this public issue.

Responsible owner: **{{RESPONSIBLE_OWNER}}**

_This issue is maintained automatically. A later successful production run for
the same tag will close it._
