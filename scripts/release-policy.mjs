import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

const POLICY_PATH = fileURLToPath(
  new URL('../config/release-policy.json', import.meta.url),
);

export const releasePolicy = JSON.parse(
  fs.readFileSync(POLICY_PATH, 'utf8'),
);

const RELEASE_TAG =
  /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;

export function parseReleaseTag(tag) {
  if (typeof tag !== 'string') {
    return null;
  }

  const match = tag.match(RELEASE_TAG);
  if (!match) {
    return null;
  }

  const prerelease = match[4]?.split('.') ?? [];
  if (prerelease.some((part) => /^\d+$/.test(part) && part.length > 1 && part.startsWith('0'))) {
    return null;
  }

  return {
    tag,
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease,
    build: match[5]?.split('.') ?? [],
  };
}

function comparePrerelease(left, right) {
  if (left.length === 0 || right.length === 0) {
    return left.length === right.length ? 0 : left.length === 0 ? 1 : -1;
  }

  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const leftPart = left[index];
    const rightPart = right[index];

    if (leftPart === undefined || rightPart === undefined) {
      return leftPart === rightPart ? 0 : leftPart === undefined ? -1 : 1;
    }

    const leftIsNumber = /^\d+$/.test(leftPart);
    const rightIsNumber = /^\d+$/.test(rightPart);

    if (leftIsNumber && rightIsNumber) {
      const difference = Number(leftPart) - Number(rightPart);
      if (difference !== 0) {
        return difference;
      }
    } else if (leftIsNumber !== rightIsNumber) {
      return leftIsNumber ? -1 : 1;
    } else if (leftPart !== rightPart) {
      return leftPart < rightPart ? -1 : 1;
    }
  }

  return 0;
}

export function compareReleaseTags(leftTag, rightTag) {
  const left = parseReleaseTag(leftTag);
  const right = parseReleaseTag(rightTag);

  if (!left || !right) {
    throw new TypeError(`Cannot compare invalid release tags: ${leftTag}, ${rightTag}`);
  }

  for (const field of ['major', 'minor', 'patch']) {
    const difference = left[field] - right[field];
    if (difference !== 0) {
      return difference;
    }
  }

  return comparePrerelease(left.prerelease, right.prerelease);
}

export function isHistoricalTestRelease(tag) {
  return parseReleaseTag(tag) !== null;
}

export function isProductionRelease(tag, policy = releasePolicy) {
  const parsed = parseReleaseTag(tag);
  const minimum = parseReleaseTag(policy.minimumProductionTag);

  if (!minimum) {
    throw new TypeError(
      `Invalid minimumProductionTag in ${POLICY_PATH}: ${policy.minimumProductionTag}`,
    );
  }

  if (!parsed || compareReleaseTags(tag, policy.minimumProductionTag) < 0) {
    return false;
  }

  return policy.includePrereleases === true || parsed.prerelease.length === 0;
}

export function releaseNoteFileToTag(fileName) {
  const match = fileName.match(/^(v.+)\.md$/);
  return match?.[1] ?? null;
}
