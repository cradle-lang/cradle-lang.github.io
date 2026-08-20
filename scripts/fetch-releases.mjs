import fs from 'node:fs/promises';
import path from 'node:path';

const OWNER = 'cradle-lang';
const REPO = 'cradle-release';

const API_URL =
  `https://api.github.com/repos/${OWNER}/${REPO}/releases`;

async function main() {
    const headers = {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2026-03-10',
        'User-Agent': 'cradle-lang',
    };

    console.log(`Fetching releases from ${API_URL}`);

    const response = await fetch(API_URL, {
        method: 'GET',
        headers,
    });

    if (!response.ok) {
        const body = await response.text();

        console.error(`GitHub API returned ${response.status}`);
        console.error(body);

        throw new Error(
            `Unable to fetch releases: ${response.status} ${response.statusText}`,
        );
    }

    const releases = await response.json();

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

    await fs.mkdir(
        path.dirname(outputPath),
        {
            recursive: true,
        },
    );

    await fs.writeFile(
        outputPath,
        JSON.stringify(data, null, 2),
    );

    console.log(
        `Fetched ${data.length} GitHub release(s).`,
    );
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});