import {
  isHistoricalTestRelease,
  isProductionRelease,
  parseReleaseTag,
  releasePolicy,
} from './release-policy.mjs';

const [mode, tag] = process.argv.slice(2);

if (!['production', 'historical-test'].includes(mode) || !tag) {
  console.error(
    'Usage: node scripts/check-release-policy.mjs <production|historical-test> <tag>',
  );
  process.exit(1);
}

if (!parseReleaseTag(tag)) {
  console.error(`Invalid semantic-version release tag: ${tag}`);
  process.exit(1);
}

if (mode === 'historical-test') {
  console.log(`Historical test tag accepted: ${tag}`);
  process.exit(0);
}

if (!isProductionRelease(tag)) {
  console.error(
    `${tag} is not an eligible production release. The minimum is ` +
      `${releasePolicy.minimumProductionTag}, and prerelease inclusion is ` +
      `${releasePolicy.includePrereleases}.`,
  );
  process.exit(2);
}

console.log(`Production release tag accepted: ${tag}`);
