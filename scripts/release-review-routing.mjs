import {verifyReleasePreworkIntegrity} from './release-prework.mjs';

export const RELEASE_REVIEW_ROUTING_SCHEMA_VERSION = 1;

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function validateLabel(label) {
  if (
    typeof label?.name !== 'string' ||
    !/^[0-9a-f]{6}$/iu.test(label?.color) ||
    typeof label?.description !== 'string'
  ) {
    throw new TypeError('Each review-routing label requires a name, six-digit color, and description.');
  }
  return label;
}

function validateRoute(route, name) {
  if (!route || !Array.isArray(route.lanes) || !Array.isArray(route.labels) ||
      !Array.isArray(route.reviewers)) {
    throw new TypeError(`Review route ${name} must define lanes, labels, and reviewers arrays.`);
  }
  if (!route.lanes.every((lane) => typeof lane === 'string' && lane.trim())) {
    throw new TypeError(`Review route ${name} contains an invalid lane.`);
  }
  route.labels.forEach(validateLabel);
  if (!route.reviewers.every((reviewer) =>
    /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\/[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)?$/u.test(reviewer),
  )) {
    throw new TypeError(`Review route ${name} contains an invalid GitHub reviewer or team.`);
  }
  return route;
}

export function validateReleaseReviewRoutingPolicy(policy) {
  if (policy?.schemaVersion !== RELEASE_REVIEW_ROUTING_SCHEMA_VERSION) {
    throw new Error(`Unsupported release review-routing schema: ${policy?.schemaVersion}`);
  }
  validateRoute(policy.base, 'base');
  for (const [name, route] of Object.entries(policy.domains ?? {})) {
    validateRoute(route, `domain:${name}`);
  }
  for (const [name, route] of Object.entries(policy.risks ?? {})) {
    validateRoute(route, `risk:${name}`);
  }
  return policy;
}

export function planReleaseReviewRouting({policy, prework, historicalTest = false}) {
  validateReleaseReviewRoutingPolicy(policy);
  verifyReleasePreworkIntegrity(prework);

  const matchedRoutes = [policy.base];
  for (const domain of prework.classification.domains) {
    if (policy.domains[domain]) matchedRoutes.push(policy.domains[domain]);
  }
  for (const risk of prework.riskIndicators) {
    if (policy.risks[risk]) matchedRoutes.push(policy.risks[risk]);
  }

  const labelsByName = new Map();
  for (const label of matchedRoutes.flatMap(({labels}) => labels)) {
    labelsByName.set(label.name, label);
  }
  const labels = [...labelsByName.values()]
    .sort((left, right) => compareText(left.name, right.name));
  const lanes = [...new Set(matchedRoutes.flatMap(({lanes}) => lanes))]
    .sort(compareText);
  const configuredReviewers = [...new Set(
    matchedRoutes.flatMap(({reviewers}) => reviewers),
  )].sort(compareText);

  return {
    schemaVersion: RELEASE_REVIEW_ROUTING_SCHEMA_VERSION,
    release: prework.release.tag,
    lanes,
    labels,
    reviewers: historicalTest ? [] : configuredReviewers,
    reviewerNotificationsSuppressed: historicalTest,
  };
}
