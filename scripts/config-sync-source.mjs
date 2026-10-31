export const configRepository = 'cradle-lang/cradle-lib';
export function configRunId(value) {
  if (!/^[1-9]\d*$/.test(String(value ?? '')) || !Number.isSafeInteger(Number(value))) throw new Error('Provide a positive configuration validation run ID');
  return Number(value);
}
export function verifyConfigRun(run, {repository = configRepository, revision} = {}) {
  if (repository !== configRepository || run.repository?.full_name !== configRepository || run.head_repository?.full_name !== configRepository) throw new Error('Only cradle-lang/cradle-lib runs are trusted');
  // Both events validate/export ALL modules; manual main runs also support expired-artifact recovery.
  if (run.path !== '.github/workflows/validate-configs.yml' || run.head_branch !== 'main' || !['push', 'workflow_dispatch'].includes(run.event) || run.status !== 'completed' || run.conclusion !== 'success') throw new Error('Require a successful full configuration validation on main');
  if (!/^[a-f0-9]{40}$/.test(run.head_sha) || (revision !== undefined && revision !== run.head_sha)) throw new Error('configuration revision mismatch');
  return run.head_sha;
}
export function selectConfigArtifact(artifacts) {
  const matches = artifacts.filter(item => item.name === 'website-configurations' && !item.expired);
  if (matches.length !== 1 || !Number.isSafeInteger(matches[0].id) || matches[0].id <= 0 || !Number.isSafeInteger(matches[0].size_in_bytes) || matches[0].size_in_bytes <= 0 || matches[0].size_in_bytes > 20 * 1024 * 1024) throw new Error('Require one unexpired website-configurations artifact of at most 20 MiB');
  return matches[0];
}
