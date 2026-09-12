import fs from 'node:fs/promises';
import path from 'node:path';

export async function writeJsonFile(outputPath, value) {
  await fs.mkdir(path.dirname(outputPath), {recursive: true});
  await fs.writeFile(outputPath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  return outputPath;
}
