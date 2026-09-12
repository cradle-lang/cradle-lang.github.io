import fs from 'node:fs/promises';
import path from 'node:path';

import {verifyReleaseEvidenceIntegrity} from './release-evidence.mjs';
import {verifyReleaseDoctorIntegrity} from './release-doctor.mjs';
import {isCommitSha} from './release-identity.mjs';
import {verifyReleasePreworkIntegrity} from './release-prework.mjs';

export function verifyReleaseJitReadiness({
  tag,
  previousTag,
  currentMainSha,
  latestMainSha,
  blockingPullRequestCount,
  historicalTest,
  predecessorCompleted,
  targetCompleted,
  evidence,
  prework,
  doctorCapture,
}) {
  if (!isCommitSha(currentMainSha) || !isCommitSha(latestMainSha)) {
    throw new TypeError('JIT readiness requires full main-branch commit SHAs');
  }
  if (currentMainSha.toLowerCase() !== latestMainSha.toLowerCase()) {
    throw new Error('Documentation checkout is stale relative to the latest main branch');
  }
  if (!Number.isInteger(blockingPullRequestCount) || blockingPullRequestCount < 0) {
    throw new TypeError('Blocking pull-request count must be a non-negative integer');
  }
  if (!historicalTest && blockingPullRequestCount > 0) {
    throw new Error('A production release documentation pull request is already open');
  }
  if (!predecessorCompleted) {
    throw new Error(`Predecessor release note is not completed: ${previousTag}`);
  }
  if (targetCompleted) {
    throw new Error(`Target release note is already completed: ${tag}`);
  }

  verifyReleaseEvidenceIntegrity(evidence);
  verifyReleasePreworkIntegrity(prework);
  verifyReleaseDoctorIntegrity(doctorCapture);
  if (
    evidence.from.tag !== previousTag ||
    evidence.to.tag !== tag ||
    prework.previous.tag !== previousTag ||
    prework.release.tag !== tag
  ) {
    throw new Error('JIT release identity does not match evidence and prework');
  }
  if (prework.evidenceSha256 !== evidence.sha256) {
    throw new Error('JIT prework is not derived from the verified evidence');
  }
  if (
    doctorCapture.release.tag !== tag ||
    doctorCapture.release.sha !== evidence.to.sha
  ) {
    throw new Error('JIT doctor capture does not match the verified release');
  }

  return {
    state: 'READY',
    tag,
    previousTag,
    classification: prework.classification.level,
    requiresUserDocumentation:
      prework.classification.requiresUserDocumentation,
  };
}

export async function checkReleaseJitReadiness({
  releaseNotesDirectory,
  tag,
  previousTag,
  evidencePath,
  preworkPath,
  doctorCapturePath,
  currentMainSha,
  latestMainSha,
  blockingPullRequestCount,
  historicalTest = false,
}) {
  const [evidence, prework, doctorCapture] = await Promise.all([
    fs.readFile(evidencePath, 'utf8').then(JSON.parse),
    fs.readFile(preworkPath, 'utf8').then(JSON.parse),
    fs.readFile(doctorCapturePath, 'utf8').then(JSON.parse),
  ]);

  return verifyReleaseJitReadiness({
    tag,
    previousTag,
    currentMainSha,
    latestMainSha,
    blockingPullRequestCount,
    historicalTest,
    predecessorCompleted: await fs.stat(
      path.join(releaseNotesDirectory, `${previousTag}.md`),
    ).then((entry) => entry.isFile()).catch(() => false),
    targetCompleted: await fs.stat(
      path.join(releaseNotesDirectory, `${tag}.md`),
    ).then((entry) => entry.isFile()).catch(() => false),
    evidence,
    prework,
    doctorCapture,
  });
}
