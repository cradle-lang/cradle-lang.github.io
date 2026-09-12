import fs from 'node:fs/promises';

import {validateTerminalAgainstDoctor} from './release-doctor.mjs';

const [capturePath, terminalPath, tag] = process.argv.slice(2);

async function main() {
  if (!capturePath || !terminalPath || !tag) {
    throw new Error(
      'Usage: node scripts/validate-release-doctor-transcript.mjs ' +
        '<capture-path> <terminal-path> <tag>',
    );
  }
  const [capture, terminalData] = await Promise.all([
    fs.readFile(capturePath, 'utf8').then(JSON.parse),
    fs.readFile(terminalPath, 'utf8').then(JSON.parse),
  ]);
  validateTerminalAgainstDoctor({terminal: terminalData.current, capture, tag});
  console.log(`Validated the ${tag} terminal transcript against cxc doctor.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
