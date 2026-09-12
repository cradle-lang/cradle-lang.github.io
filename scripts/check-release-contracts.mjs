import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';

import {evaluateReleaseContracts} from './release-contracts.mjs';
import {writeJsonFile} from './write-json-file.mjs';

const [tag, targetPath, preworkPath, doctorPath, terminalPath, outputPath] =
  process.argv.slice(2);

function git(...arguments_) {
  return execFileSync('git', arguments_, {encoding: 'utf8'});
}

async function main() {
  if (!tag || !targetPath || !preworkPath || !doctorPath || !terminalPath || !outputPath) {
    throw new Error(
      'Usage: node scripts/check-release-contracts.mjs <tag> <target-path> ' +
        '<prework-path> <doctor-path> <terminal-path> <output-path>',
    );
  }
  const [prework, doctorCapture, terminalData, targetContent] = await Promise.all([
    fs.readFile(preworkPath, 'utf8').then(JSON.parse),
    fs.readFile(doctorPath, 'utf8').then(JSON.parse),
    fs.readFile(terminalPath, 'utf8').then(JSON.parse),
    fs.readFile(targetPath, 'utf8').catch(() => null),
  ]);
  const tracked = git('diff', '--name-only').trim().split('\n').filter(Boolean);
  const untracked = git('ls-files', '--others', '--exclude-standard')
    .trim().split('\n').filter(Boolean);
  const counts = git('diff', '--numstat').trim().split('\n').filter(Boolean)
    .reduce((total, line) => {
      const [added, deleted] = line.split('\t');
      if (/^\d+$/u.test(added)) total.added += Number(added);
      if (/^\d+$/u.test(deleted)) total.deleted += Number(deleted);
      return total;
    }, {added: 0, deleted: 0});
  const stagedTerminal = JSON.parse(git('show', `:${terminalPath}`));
  const report = evaluateReleaseContracts({
    tag,
    targetPath,
    targetContent,
    changedPaths: unique([...tracked, ...untracked])
      .filter((path) => !path.startsWith('upstream-cradlexc')),
    addedLines: counts.added,
    deletedLines: counts.deleted,
    archivedTerminalUnchanged:
      JSON.stringify(stagedTerminal.versions) === JSON.stringify(terminalData.versions),
    terminal: terminalData.current,
    doctorCapture,
    prework,
  });
  await writeJsonFile(outputPath, report);
  for (const result of report.results) {
    console.log(`${result.passed ? 'PASS' : 'FAIL'} ${result.name}: ${result.details}`);
  }
  if (!report.passed) process.exitCode = 1;
}

function unique(values) {
  return [...new Set(values)].sort();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
