import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import {readLibrary} from './generate-library.mjs';

const [id, sourceRoot, output] = process.argv.slice(2);
const {scenarios} = await readLibrary(sourceRoot);
const scenario = scenarios.find((entry) => entry.id === id);
if (!scenario) throw new Error('Select a published scenario ID.');
const parser = await readFile(new URL('../src/components/workbench/utils/cradleParser.ts', import.meta.url), 'utf8');
const {outputText} = ts.transpileModule(parser, {compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022}});
const {parseCradleForWorkbench} = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const parsed = parseCradleForWorkbench(scenario.spec);
// Treat contributor text as report data, including Markdown/HTML delimiters.
const text = (value) => String(value || 'Not specified').replace(/[&<>|`\r\n]/g, (character) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '|': '&#124;', '`': '&#96;', '\r': ' ', '\n': ' '}[character]));
const table = (headers, rows) => [
  `| ${headers.join(' | ')} |`,
  `| ${headers.map(() => '---').join(' | ')} |`,
  ...rows.map((row) => `| ${row.map(text).join(' | ')} |`),
].join('\n');
const revision = (await readFile(path.join(output, 'revision.txt'), 'utf8')).trim();
const compiler = (await readFile(path.join(output, 'compiler-version.txt'), 'utf8')).trim();
const report = [
  '## Scenario validation report',
  `Scenario: ${text(scenario.name)} (${text(id)})`,
  'Syntax and structure validation: **Passed**. This checks syntax and structure only.',
  `Source revision: ${text(revision)}  \nCompiler: ${text(compiler)}`,
  `${parsed.instances.length} instances · ${parsed.networks.length} networks · ${parsed.events.length} events · ${parsed.objects.length} objects`,
  'The following static relationships are read from the source using the Workbench parser. They do not certify runtime availability. No infrastructure was provisioned and no events were executed.',
  '### Instances',
  table(['Instance', 'Operating system', 'Networks and addresses', 'Objects'], parsed.instances.map((instance) => [instance.id, [instance.os?.name, instance.os?.version].filter(Boolean).join(' '), instance.networks.map((network) => `${network.network}: ${network.address || 'Not specified'}`).join('; '), instance.objects.join(', ')])),
  '### Networks',
  table(['Network', 'Subnet', 'Connected endpoints'], parsed.networks.map((network) => [network.id, network.subnet, network.endpoints.map((endpoint) => `${endpoint.instance}: ${endpoint.address || 'Not specified'}`).join('; ')])),
  '### Events',
  table(['Event', 'Instance', 'Action or description', 'Depends on'], parsed.events.map((event) => [event.id, event.instance, event.runObject?.name ? `Run object ${event.runObject.name}` : event.subject?.cmd ? `Run ${event.subject.cmd}` : event.description, event.dependencies.join(', ') || 'No dependency'])),
  '### Objects',
  parsed.objects.map((object) => text(object.id)).join(', ') || 'No objects declared.',
  'Download the published specification using Download .cradle at the top of its collection page. This workflow publishes a report only; source bundles are not uploaded.',
].join('\n\n');
await writeFile(path.join(output, 'report.md'), `${report}\n`);
