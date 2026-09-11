import fs from 'node:fs/promises';

import {isCommitSha} from './release-identity.mjs';
import {
  compareReleaseTags,
  isProductionRelease,
  releaseNoteFileToTag,
} from './release-policy.mjs';

export const RELEASE_QUEUE_SCHEMA_VERSION = 1;

export const RELEASE_QUEUE_STATES = Object.freeze({
  QUEUED: 'QUEUED',
  PRECOMPUTING: 'PRECOMPUTING',
  READY: 'READY',
  PROCESSING: 'PROCESSING',
  PR_OPEN: 'PR_OPEN',
  COMPLETED: 'COMPLETED',
  BLOCKED: 'BLOCKED',
});

export function parseUpstreamReleaseInventory(content) {
  const releasesByTag = new Map();

  for (const line of content.split(/\r?\n/)) {
    if (line.trim().length === 0) {
      continue;
    }

    const [tag, sha, ...unexpected] = line.split('\t');
    if (!tag || !sha || unexpected.length > 0 || !isCommitSha(sha)) {
      throw new TypeError(`Invalid upstream release inventory line: ${line}`);
    }

    const normalizedSha = sha.toLowerCase();
    const previousSha = releasesByTag.get(tag);
    if (previousSha && previousSha !== normalizedSha) {
      throw new TypeError(`Conflicting commit SHAs for upstream tag ${tag}`);
    }

    releasesByTag.set(tag, normalizedSha);
  }

  return [...releasesByTag].map(([tag, sha]) => ({tag, sha}));
}

export async function readCompletedReleaseTags(releaseNoteDirectory) {
  const entries = await fs.readdir(
    releaseNoteDirectory,
    {
      withFileTypes: true,
    },
  );

  const releaseNotes = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);

  return completedTagsFromReleaseNotes(releaseNotes);
}

export function completedTagsFromReleaseNotes(releaseNotes) {
  const tags = releaseNotes
    .map((releaseNote) => releaseNoteFileToTag(releaseNote))
    .filter((tag) => tag != null && isProductionRelease(tag));

  return [...new Set(tags)].sort(compareReleaseTags);
}

export function reconcileReleases({
  upstreamTags,
  completedTags,
}) {
  const eligible = [
    ...new Set(upstreamTags.filter((tag) => isProductionRelease(tag))),
  ].sort(compareReleaseTags);

  const completed = [
    ...new Set(completedTags.filter((tag) => isProductionRelease(tag))),
  ].sort(compareReleaseTags);

  const completedSet = new Set(completed);

  const outstanding = eligible.filter(
    (tag) => !completedSet.has(tag),
  );

  return {
    eligible,
    completed,
    outstanding,
    selected: outstanding[0] ?? null,
  };
}

function productionTagSet(tags = []) {
  return new Set(tags.filter((tag) => isProductionRelease(tag)));
}

export function normalizeReleaseQueueSignals(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('Release queue signals must be a JSON object');
  }

  const names = [
    'precomputingTags',
    'processingTags',
    'openPullRequestTags',
    'blockedTags',
  ];
  return Object.fromEntries(names.map((name) => {
    const tags = value[name] ?? [];
    if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== 'string')) {
      throw new TypeError(`${name} must be an array of release tags`);
    }
    return [
      name,
      [...new Set(tags.filter((tag) => isProductionRelease(tag)))]
        .sort(compareReleaseTags),
    ];
  }));
}

export function deriveReleaseQueue({
  upstreamReleases,
  completedTags,
  evidenceTags = [],
  signals = {},
}) {
  const reconciliation = reconcileReleases({
    upstreamTags: upstreamReleases.map(({tag}) => tag),
    completedTags,
  });
  const upstreamByTag = new Map(
    upstreamReleases.map((release) => [release.tag, release]),
  );
  const completed = productionTagSet(reconciliation.completed);
  const evidence = productionTagSet(evidenceTags);
  const normalizedSignals = normalizeReleaseQueueSignals(signals);
  const precomputing = productionTagSet(normalizedSignals.precomputingTags);
  const processing = productionTagSet(normalizedSignals.processingTags);
  const openPullRequests = productionTagSet(
    normalizedSignals.openPullRequestTags,
  );
  const blocked = productionTagSet(normalizedSignals.blockedTags);

  const releases = reconciliation.eligible.map((tag) => {
    let state = RELEASE_QUEUE_STATES.QUEUED;
    if (completed.has(tag)) {
      state = RELEASE_QUEUE_STATES.COMPLETED;
    } else if (blocked.has(tag)) {
      state = RELEASE_QUEUE_STATES.BLOCKED;
    } else if (openPullRequests.has(tag)) {
      state = RELEASE_QUEUE_STATES.PR_OPEN;
    } else if (processing.has(tag)) {
      state = RELEASE_QUEUE_STATES.PROCESSING;
    } else if (precomputing.has(tag)) {
      state = RELEASE_QUEUE_STATES.PRECOMPUTING;
    } else if (evidence.has(tag)) {
      state = RELEASE_QUEUE_STATES.READY;
    }

    return {
      tag,
      sha: upstreamByTag.get(tag).sha,
      state,
    };
  });
  const selectedRelease = releases.find(
    ({state}) => state !== RELEASE_QUEUE_STATES.COMPLETED,
  ) ?? null;

  return {
    schemaVersion: RELEASE_QUEUE_SCHEMA_VERSION,
    eligible: reconciliation.eligible,
    completed: reconciliation.completed,
    outstanding: reconciliation.outstanding,
    releases,
    selected: selectedRelease,
    shouldDispatch: selectedRelease !== null && [
      RELEASE_QUEUE_STATES.QUEUED,
      RELEASE_QUEUE_STATES.READY,
    ].includes(selectedRelease.state),
  };
}
