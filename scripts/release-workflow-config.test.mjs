import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

const WORKFLOW_PATH = '.github/workflows/prepare-cradlexc-release.yml';

test('production PR automation uses the dedicated token only', async () => {
  const workflow = await fs.readFile(WORKFLOW_PATH, 'utf8');
  const tokenSelections = workflow.match(
    /\$\{\{ inputs\.historical_test && github\.token \|\|\s+secrets\.CRADLE_LANG_TOKEN \}\}/gu,
  );

  assert.equal(tokenSelections?.length, 2);
  assert.match(workflow, /Verify production automation token/u);
  assert.match(
    workflow,
    /CRADLE_LANG_TOKEN is required for production release PRs/u,
  );
  assert.doesNotMatch(workflow, /GH_AW_CI_TRIGGER_TOKEN/u);
});

test('targeted repair has a valid credit budget and verified doctor context', async () => {
  const workflow = await fs.readFile(WORKFLOW_PATH, 'utf8');

  assert.match(workflow, /RELEASE_REPAIR_AI_CREDIT_LIMIT: '30'/u);
  assert.match(
    workflow,
    /DOCTOR_CAPTURE_PATH: \$\{\{ steps\.doctor\.outputs\.path \}\}/u,
  );
  assert.match(
    workflow,
    /\{release, command, exitCode, structure\}/u,
  );
  assert.match(
    workflow,
    /doctor-transcript control failed[\s\S]*match this captured structure exactly/u,
  );
});

test('historical escalation is explicit, labeled and independently resolved', async () => {
  const workflow = await fs.readFile(WORKFLOW_PATH, 'utf8');

  assert.match(workflow, /create_test_escalation:/u);
  assert.match(
    workflow,
    /inputs\.historical_test != true \|\| inputs\.create_test_escalation == true/u,
  );
  assert.match(workflow, /gh label create historical-test/u);
  assert.match(workflow, /cradlexc-release-test-escalation/u);
  assert.match(workflow, /Resolved by successful \$run_kind workflow run/u);
});
