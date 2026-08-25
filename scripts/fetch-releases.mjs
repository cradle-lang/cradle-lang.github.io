import fs from 'node:fs/promises';
import path from 'node:path';

const OWNER = 'cradle-lang';
const REPO = 'CradleXC';

const API_URL =
  `https://api.github.com/repos/${OWNER}/${REPO}/releases`;

const TOKEN = process.env.CRADLE_RELEASES_TOKEN;

if (!TOKEN) {
  throw new Error('TOKEN is not set.');
}

async function fetchReleases() {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2026-03-10',
    'User-Agent': 'cradle-lang',
  };

  if (TOKEN) {
    headers.Authorization = `Bearer ${TOKEN}`;
  }

  const url = new URL(API_URL);
  url.searchParams.set('per_page', '100');

  console.log(`Fetching releases from ${url}`);

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const body = await response.text();

    console.error(`GitHub API returned ${response.status}`);
    console.error(body);

    if (response.status === 404 && !TOKEN) {
      throw new Error(
        'The release repository is private and no GitHub token was provided.',
      );
    }

    throw new Error(
      `Unable to fetch releases: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
}

async function main() {
  const releases = await fetchReleases();

  const data = releases
    .filter((release) => !release.draft)
    .map((release) => ({
      id: release.id,
      tagName: release.tag_name,
      name: release.name || release.tag_name,
      body: release.body || '',
      publishedAt: release.published_at,
      htmlUrl: release.html_url,
      prerelease: release.prerelease,

      assets: release.assets.map((asset) => ({
        id: asset.id,
        name: asset.name,
        size: asset.size,
        downloadCount: asset.download_count,
        downloadUrl: asset.browser_download_url,
      })),
    }));

  const outputPath = path.resolve(
    'src/data/releases.json',
  );

  await fs.mkdir(path.dirname(outputPath), {
    recursive: true,
  });

  await fs.writeFile(
    outputPath,
    `${JSON.stringify(data, null, 2)}\n`,
    'utf8',
  );

  console.log(
    `Fetched ${data.length} GitHub release(s).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});