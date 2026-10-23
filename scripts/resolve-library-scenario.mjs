import path from 'node:path';
import {readLibrary} from './generate-library.mjs';

const [id, root] = process.argv.slice(2);
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id || '') || !root) throw new Error('A valid scenario folder ID and source checkout are required');
const library = await readLibrary(path.resolve(root));
const scenario = library.scenarios.find((entry) => entry.id === id);
if (!scenario) throw new Error(`Published scenario not found: ${id}`);
console.log(path.resolve(root, scenario.sourcePath));
