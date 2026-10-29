export const sourceRepository = 'cradle-lang/scenario-lib';
export const sourceWorkflow = '.github/workflows/validate.yml';

export function sourceRunId(value) {
  if (!/^[1-9]\d*$/.test(String(value ?? '')) || !Number.isSafeInteger(Number(value))) throw new Error('Provide a positive source validation run ID.');
  return Number(value);
}

export function verifySourceRun(run, {requestedRepository = sourceRepository, requestedSha} = {}) {
  if (requestedRepository !== sourceRepository || run.repository?.full_name !== sourceRepository || run.head_repository?.full_name !== sourceRepository) throw new Error('Only cradle-lang/scenario-lib validation runs are trusted.');
  if (run.path !== sourceWorkflow || run.head_branch !== 'main' || run.event !== 'push') throw new Error('Source must be the validate.yml push workflow on main.');
  if (run.status !== 'completed' || run.conclusion !== 'success') throw new Error('Source validation has not completed successfully.');
  if (!/^[a-f0-9]{40}$/.test(run.head_sha) || (requestedSha !== undefined && requestedSha !== run.head_sha)) throw new Error('Source commit does not match the validated run.');
  return run.head_sha;
}

export function selectBundleArtifact(artifacts) {
  const matches = artifacts.filter(item => item.name === 'website-scenarios' && !item.expired);
  if (matches.length !== 1) throw new Error('Source run must have exactly one unexpired website-scenarios artifact.');
  const artifact = matches[0];
  if (!Number.isSafeInteger(artifact.id) || artifact.id <= 0 || !Number.isSafeInteger(artifact.size_in_bytes) || artifact.size_in_bytes <= 0 || artifact.size_in_bytes > 20 * 1024 * 1024) throw new Error('Invalid or oversized scenario bundle artifact.');
  return artifact;
}
