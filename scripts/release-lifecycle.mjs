export const RELEASE_LIFECYCLE_STATES = Object.freeze({
  PROCESSING: 'PROCESSING',
  PR_OPEN: 'PR_OPEN',
  BLOCKED: 'BLOCKED',
  COMPLETED: 'COMPLETED',
  PUBLICATION_BLOCKED: 'PUBLICATION_BLOCKED',
});

export function preparationLifecycleState({
  exceptionRequired,
  pullRequestCreated,
}) {
  if (exceptionRequired) return RELEASE_LIFECYCLE_STATES.BLOCKED;
  if (pullRequestCreated) return RELEASE_LIFECYCLE_STATES.PR_OPEN;
  return RELEASE_LIFECYCLE_STATES.PROCESSING;
}

export function publicationLifecycleState({publishOutcome}) {
  return publishOutcome === 'success'
    ? RELEASE_LIFECYCLE_STATES.COMPLETED
    : RELEASE_LIFECYCLE_STATES.PUBLICATION_BLOCKED;
}
