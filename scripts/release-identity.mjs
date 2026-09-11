const COMMIT_SHA = /^[0-9a-f]{40}$/i;

export function isCommitSha(value) {
  return typeof value === 'string' && COMMIT_SHA.test(value);
}

function normalizeCommitSha(value, label, {required = true} = {}) {
  if (!value && !required) {
    return null;
  }

  if (!isCommitSha(value)) {
    throw new TypeError(`${label} must be a full 40-character commit SHA`);
  }

  return value.toLowerCase();
}

export function verifyReleaseIdentity({
  tag,
  expectedSha,
  resolvedSha,
  checkedOutSha,
  historicalTest = false,
}) {
  const expected = normalizeCommitSha(expectedSha, 'Expected SHA', {
    required: !historicalTest,
  });
  const resolved = normalizeCommitSha(resolvedSha, 'Tag-resolved SHA');
  const checkedOut = normalizeCommitSha(checkedOutSha, 'Checked-out SHA');

  if (resolved !== checkedOut) {
    throw new Error(
      `Upstream tag ${tag} resolved to ${resolved}, but ${checkedOut} was checked out`,
    );
  }

  if (expected && expected !== checkedOut) {
    throw new Error(
      `Upstream tag ${tag} resolved to ${checkedOut} instead of supplied SHA ${expected}`,
    );
  }

  return {
    tag,
    commitSha: checkedOut,
  };
}
