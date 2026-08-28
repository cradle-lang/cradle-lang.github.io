import type {
  CradleEvent,
  CradleInstance,
  CradleNetwork,
  CradleObject,
  CradleValue,
  ParsedCradle,
} from '../types/workbench';

type ParsedCall = {
  name: string;
  args: CradleValue[];
  argumentSources: string[];
  raw: string;
};

type BlockHeader = {
  kind: string;
  args: CradleValue[];
  arg: string | null;
};

type Statement = {
  source: string;
  line: number;
};

type NamedDependency = {
  eventId: string;
  dependency: string;
  line: number;
  sourceLine: string;
};

class RetryParseError extends Error {}

export class WorkbenchParseError extends Error {
  line: number;
  sourceLine: string;
  suggestion: string;

  constructor(
    line: number,
    sourceLine: string,
    reason: string,
    suggestion: string,
  ) {
    super(reason);
    this.name = 'WorkbenchParseError';
    this.line = line;
    this.sourceLine = sourceLine;
    this.suggestion = suggestion;
  }
}

function stripComments(source: string): string {
  let output = '';
  let quoted = false;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (character === '\n') {
        lineComment = false;
        output += character;
      } else {
        output += ' ';
      }
      continue;
    }

    if (blockComment) {
      if (character === '*' && next === '/') {
        output += '  ';
        blockComment = false;
        index += 1;
      } else {
        output += character === '\n' ? '\n' : ' ';
      }
      continue;
    }

    if (escaped) {
      output += character;
      escaped = false;
      continue;
    }

    if (quoted && character === '\\') {
      output += character;
      escaped = true;
      continue;
    }

    if (character === '"') {
      quoted = !quoted;
      output += character;
      continue;
    }

    if (!quoted && character === '/' && next === '/') {
      output += '  ';
      lineComment = true;
      index += 1;
      continue;
    }

    if (!quoted && character === '/' && next === '*') {
      output += '  ';
      blockComment = true;
      index += 1;
      continue;
    }

    if (!quoted && character === '#') {
      output += ' ';
      lineComment = true;
      continue;
    }

    output += character;
  }

  return output;
}

function collectStatements(source: string): Statement[] {
  const output: Statement[] = [];
  let buffer = '';
  let line = 0;
  let startLine = 0;
  let quoted = false;
  let escaped = false;
  let parentheses = 0;
  let braces = 0;
  let brackets = 0;

  function flush(): void {
    const statement = buffer.trim();
    if (statement) {
      output.push({ source: statement, line: startLine });
    }
    buffer = '';
    startLine = line;
  }

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (!buffer && !/\s/.test(character)) {
      startLine = line;
    }
    buffer += character;

    if (escaped) {
      escaped = false;
    } else if (quoted && character === '\\') {
      escaped = true;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (!quoted) {
      if (character === '(') parentheses += 1;
      else if (character === ')') parentheses = Math.max(0, parentheses - 1);
      else if (character === '{') braces += 1;
      else if (character === '}') braces = Math.max(0, braces - 1);
      else if (character === '[') brackets += 1;
      else if (character === ']') brackets = Math.max(0, brackets - 1);
    }

    const atTopLevel =
      !quoted && parentheses === 0 && braces === 0 && brackets === 0;

    if (
      atTopLevel &&
      (character === '>' || character === ',' || character === '.')
    ) {
      flush();
    } else if (character === '\n') {
      if (atTopLevel) flush();
      line += 1;
      if (!buffer.trim()) startLine = line;
    }
  }

  flush();
  return output;
}

function splitTopLevel(
  source: string,
  separators: ReadonlySet<string>,
): string[] {
  const output: string[] = [];
  let buffer = '';
  let quoted = false;
  let escaped = false;
  let parentheses = 0;
  let braces = 0;
  let brackets = 0;

  for (const character of source) {
    if (escaped) {
      buffer += character;
      escaped = false;
      continue;
    }
    if (quoted && character === '\\') {
      buffer += character;
      escaped = true;
      continue;
    }
    if (character === '"') {
      quoted = !quoted;
      buffer += character;
      continue;
    }
    if (!quoted) {
      if (character === '(') parentheses += 1;
      else if (character === ')') parentheses -= 1;
      else if (character === '{') braces += 1;
      else if (character === '}') braces -= 1;
      else if (character === '[') brackets += 1;
      else if (character === ']') brackets -= 1;
    }

    if (
      !quoted && parentheses === 0 && braces === 0 && brackets === 0 &&
      separators.has(character)
    ) {
      if (buffer.trim()) output.push(buffer.trim());
      buffer = '';
      continue;
    }
    buffer += character;
  }

  if (buffer.trim()) output.push(buffer.trim());
  return output;
}

function findTopLevelAssignment(source: string): number {
  let quoted = false;
  let escaped = false;
  let parentheses = 0;
  let braces = 0;
  let brackets = 0;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (quoted && character === '\\') {
      escaped = true;
      continue;
    }
    if (character === '"') {
      quoted = !quoted;
      continue;
    }
    if (quoted) continue;

    if (character === '(') parentheses += 1;
    else if (character === ')') parentheses -= 1;
    else if (character === '{') braces += 1;
    else if (character === '}') braces -= 1;
    else if (character === '[') brackets += 1;
    else if (character === ']') brackets -= 1;
    else if (
      parentheses === 0 && braces === 0 && brackets === 0 &&
      (character === '=' || character === ':')
    ) {
      return index;
    }
  }
  return -1;
}

function parseString(source: string): string {
  try {
    return JSON.parse(source) as string;
  } catch {
    return source
      .slice(1, -1)
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
  }
}

function parseValue(source: string): CradleValue {
  const value = source.trim();

  if (value.startsWith('"') && value.endsWith('"')) return parseString(value);
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?(?:\d+\.?\d*|\.\d+)$/.test(value)) return Number(value);

  if (value.startsWith('{') && value.endsWith('}')) {
    const entries = splitTopLevel(value.slice(1, -1), new Set([',', ';']));
    return entries.reduce<Record<string, CradleValue>>((output, entry) => {
      const assignment = findTopLevelAssignment(entry);
      if (assignment < 0) {
        output[entry.trim()] = true;
        return output;
      }
      const rawKey = entry.slice(0, assignment).trim();
      const rawValue = entry.slice(assignment + 1).trim();
      const key = rawKey.startsWith('"') && rawKey.endsWith('"')
        ? parseString(rawKey)
        : rawKey;
      output[key] = parseValue(rawValue);
      return output;
    }, {});
  }

  if (value.startsWith('[') && value.endsWith(']')) {
    return splitTopLevel(value.slice(1, -1), new Set([','])).map(parseValue);
  }

  return value;
}

function parseArguments(source: string): {
  args: CradleValue[];
  argumentSources: string[];
} {
  const argumentSources = splitTopLevel(source, new Set([',']));
  return {
    args: argumentSources.map(parseValue),
    argumentSources,
  };
}

function asString(value: CradleValue | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

function asBoolean(value: CradleValue | undefined): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return undefined;
}

function asDelay(value: CradleValue | undefined): number | string | undefined {
  if (typeof value === 'number') return value;

  if (
    typeof value === 'string' &&
    /^-?(?:\d+\.?\d*|\.\d+)$/.test(value)
  ) {
    return Number(value);
  }

  return typeof value === 'string'
    ? value
    : undefined;
}

function parseCall(line: string): ParsedCall | null {
  const source = line.trim().replace(/[,.]\s*$/, '');
  const match = source.match(/^([A-Za-z_][\w-]*)\s*\(([\s\S]*)\)$/);
  if (!match) return null;
  const parsedArguments = parseArguments(match[2]);
  return {
    name: match[1],
    args: parsedArguments.args,
    argumentSources: parsedArguments.argumentSources,
    raw: source,
  };
}

function parseHeader(line: string): BlockHeader | null {
  const match = line.trim().match(
    /^([A-Za-z_][\w-]*)\s*\(([\s\S]*?)\)\s*>\s*$/,
  );
  if (!match) return null;
  const { args } = parseArguments(match[2]);
  return { kind: match[1], args, arg: asString(args[0]) ?? null };
}

function roleOf(name: string, instance?: CradleInstance): string {
  const loweredName = name.toLowerCase();
  const configs = (instance?.configs ?? []).join(' ').toLowerCase();

  if (loweredName.includes('firewall') || configs.includes('ufw')) return 'firewall';
  if (loweredName.includes('router') || configs.includes('router')) return 'router';
  if (loweredName.includes('attacker')) return 'attacker';
  if (loweredName.includes('host') || loweredName.includes('user')) return 'host';
  if (
    loweredName.includes('server') || loweredName === 'siem' ||
    configs.includes('server') || configs.includes('smb') ||
    configs.includes('postgres') || configs.includes('mail') ||
    configs.includes('dns') || configs.includes('ntp')
  ) return 'server';
  return 'host';
}

function getOrCreateInstance(
  instances: Map<string, CradleInstance>,
  id: string,
  line: number,
): CradleInstance {
  let instance = instances.get(id);
  if (!instance) {
    instance = {
      id,
      type: 'instance',
      line,
      configs: [],
      heuristics: [],
      objects: [],
      networks: [],
    };
    instances.set(id, instance);
  }
  return instance;
}

function getOrCreateNetwork(
  networks: Map<string, CradleNetwork>,
  id: string,
  line: number,
): CradleNetwork {
  let network = networks.get(id);
  if (!network) {
    network = { id, type: 'network', line, subnet: null, endpoints: [] };
    networks.set(id, network);
  }
  return network;
}

function getOrCreateEvent(
  events: Map<string, CradleEvent>,
  id: string,
  line: number,
): CradleEvent {
  let event = events.get(id);
  if (!event) {
    event = { id, type: 'event', line, heuristics: [], dependencies: [] };
    events.set(id, event);
  }
  return event;
}

function getOrCreateObject(
  objects: Map<string, CradleObject>,
  id: string,
  line: number,
): CradleObject {
  let object = objects.get(id);
  if (!object) {
    object = {
      id,
      type: 'object',
      line,
      heuristics: [],
    };
    objects.set(id, object);
  }
  return object;
}

function requiresCompatibility(parsedCall: ParsedCall, index: number): boolean {
  return parsedCall.argumentSources[index]?.trim().startsWith('"') ?? false;
}

function parseCradle(code: string, compatibility: boolean): ParsedCradle {
  if (!code.trim()) {
    throw new WorkbenchParseError(
      1,
      '',
      'The source is empty.',
      'Load a sample or add a metadata() block to begin.',
    );
  }

  const statements = collectStatements(stripComments(code));
  const instances = new Map<string, CradleInstance>();
  const networks = new Map<string, CradleNetwork>();
  const objects = new Map<string, CradleObject>();
  const events = new Map<string, CradleEvent>();
  const metadata: ParsedCradle['metadata'] = {};
  const warnings: string[] = [];
  const namedDependencies: NamedDependency[] = [];
  const outline: ParsedCradle['outline'] = {
    instances: [],
    networks: [],
    events: [],
    objects: [],
  };
  let currentBlock: BlockHeader | null = null;

  statements.forEach((statement) => {
    const sourceLine = statement.source.trim();
    const displayLine = sourceLine.replace(/\s+/g, ' ');
    const quoteCount = (sourceLine.match(/(?<!\\)"/g) ?? []).length;

    if (quoteCount % 2 !== 0) {
      throw new WorkbenchParseError(
        statement.line + 1,
        displayLine,
        'This statement contains an unmatched quotation mark.',
        'Close the quoted value and terminate the property.',
      );
    }

    const include = sourceLine.match(
      /^include\s+"((?:\\.|[^"\\])*)"\s*[.]?$/,
    );
    if (include) {
      warnings.push(
        `Line ${statement.line + 1}: include ${include[1]} was not loaded with this file.`,
      );
      return;
    }

    const block = parseHeader(sourceLine);
    if (block) {
      if (
        !compatibility && block.kind === 'event' && block.arg && /^\d+$/.test(block.arg)
      ) {
        throw new RetryParseError();
      }

      currentBlock = block;

      if (block.kind === 'instance' && block.arg) {
        const instance = getOrCreateInstance(instances, block.arg, statement.line);
        instance.line = statement.line;
        outline.instances.push({ id: block.arg, line: statement.line });
      }
      if (block.kind === 'network' && block.arg) {
        const network = getOrCreateNetwork(networks, block.arg, statement.line);
        network.line = statement.line;
        outline.networks.push({ id: block.arg, line: statement.line });
      }
      if (block.kind === 'event' && block.arg) {
        const event = getOrCreateEvent(events, block.arg, statement.line);
        event.line = statement.line;
        outline.events.push({ id: block.arg, line: statement.line });
      }
      if (block.kind === 'object' && block.arg) {
        const object = getOrCreateObject(objects, block.arg, statement.line);
        object.line = statement.line;
        outline.objects.push({ id: block.arg, line: statement.line });
      }
      return;
    }

    const parsedCall = parseCall(sourceLine);
    if (!parsedCall) {
      throw new WorkbenchParseError(
        statement.line + 1,
        displayLine,
        'The Workbench could not recognize this statement as a block, property or include.',
        'Use block() > for a section header and property(value) for its contents.',
      );
    }

    if (currentBlock?.kind === 'metadata') {
      metadata[parsedCall.name] = parsedCall.args.length > 1
        ? parsedCall.args
        : parsedCall.args[0] ?? true;
      return;
    }

    if (currentBlock?.kind === 'instances' && parsedCall.name === 'instance') {
      const id = asString(parsedCall.args[0]);
      if (id) getOrCreateInstance(instances, id, statement.line);
      return;
    }

    if (currentBlock?.kind === 'networks' && parsedCall.name === 'network') {
      const id = asString(parsedCall.args[0]);
      if (id) getOrCreateNetwork(networks, id, statement.line);
      return;
    }

    if (
      currentBlock &&
      ['preEvent', 'mainEvent', 'postEvent'].includes(currentBlock.kind) &&
      parsedCall.name === 'event'
    ) {
      const id = asString(parsedCall.args[0]);
      if (!compatibility && id && /^\d+$/.test(id)) {
        throw new RetryParseError();
      }
      if (id) getOrCreateEvent(events, id, statement.line);
      return;
    }

    if (currentBlock?.kind === 'instance' && currentBlock.arg) {
      const instance = getOrCreateInstance(instances, currentBlock.arg, statement.line);
      switch (parsedCall.name) {
        case 'os':
          instance.os = {
            name: asString(parsedCall.args[0]) ?? '',
            version: asString(parsedCall.args[1]),
          };
          break;
        case 'config': {
          const config = asString(parsedCall.args[0]);
          if (config) instance.configs.push(config);
          break;
        }
        case 'role':
          instance.role = {
            name: asString(parsedCall.args[0]),
            params: parsedCall.args.length > 2
              ? parsedCall.args[2]
              : parsedCall.args[1],
          };
          break;
        case 'heuristic':
          instance.heuristics.push({
            type: asString(parsedCall.args[0]) ?? '',
            value: asString(parsedCall.args[1]) ?? '',
          });
          break;
        case 'object': {
          const objectId = asString(parsedCall.args[0]);
          if (objectId) {
            instance.objects.push(objectId);
            getOrCreateObject(objects, objectId, statement.line);
          }
          break;
        }
      }
      return;
    }

    if (currentBlock?.kind === 'network' && currentBlock.arg) {
      const network = getOrCreateNetwork(networks, currentBlock.arg, statement.line);
      if (parsedCall.name === 'subnet') {
        network.subnet = asString(parsedCall.args[0]) ?? null;
      }
      if (parsedCall.name === 'endpoint') {
        const instanceId = asString(parsedCall.args[0]);
        const address = asString(parsedCall.args[1]);
        if (instanceId) {
          const instance = getOrCreateInstance(instances, instanceId, statement.line);
          network.endpoints.push({
            instance: instanceId,
            address: address ?? '',
          });
          instance.networks.push({
            network: currentBlock.arg,
            address: address ?? '',
          });
        }
      }
      return;
    }

    if (currentBlock?.kind === 'object' && currentBlock.arg) {
      const object = getOrCreateObject(
        objects,
        currentBlock.arg,
        statement.line,
      );

      switch (parsedCall.name) {
        case 'location':
          object.location = asString(parsedCall.args[0]);
          break;

        case 'heuristic':
          object.heuristics.push({
            type: asString(parsedCall.args[0]) ?? '',
            value: asString(parsedCall.args[1]) ?? '',
          });
          break;

        default:
          warnings.push(
            `Line ${statement.line + 1}: unrecognized object property: ${parsedCall.raw}`,
          );
      }

      return;
    }

    if (currentBlock?.kind === 'event' && currentBlock.arg) {
      const event = getOrCreateEvent(events, currentBlock.arg, statement.line);
      switch (parsedCall.name) {
        case 'instance':
          event.instance = asString(parsedCall.args[0]);
          break;
        case 'needRoot': {
          if (!compatibility && requiresCompatibility(parsedCall, 0)) {
            throw new RetryParseError();
          }
          const needRoot = asBoolean(parsedCall.args[0]);
          if (needRoot === undefined) {
            throw new WorkbenchParseError(
              statement.line + 1,
              displayLine,
              'needRoot expects true or false.',
              'Use needRoot(true) or needRoot(false).',
            );
          }
          event.needRoot = needRoot;
          break;
        }
        case 'subject':
          event.subject = {
            cmd: asString(parsedCall.args[0]),
            args: asString(parsedCall.args[1]),
          };
          break;
        case 'runObject': {
          const objectId = asString(parsedCall.args[0]);
          event.runObject = { name: objectId, args: parsedCall.args[1] };
          if (objectId) getOrCreateObject(objects, objectId, statement.line);
          break;
        }
        case 'pauseBeforeRun':
        case 'pauseAfterRun': {
          if (!compatibility && requiresCompatibility(parsedCall, 0)) {
            throw new RetryParseError();
          }
          const delay = asDelay(parsedCall.args[0]);
          if (parsedCall.name === 'pauseBeforeRun') event.pauseBeforeRun = delay;
          else event.pauseAfterRun = delay;
          break;
        }
        case 'dependsOn': {
          const dependency = parsedCall.args[0];
          const argumentSource =
            parsedCall.argumentSources[0]?.trim() ?? '';

          if (
            parsedCall.args.length !== 1 ||
            typeof dependency !== 'string' ||
            !argumentSource.startsWith('"') ||
            !argumentSource.endsWith('"') ||
            !/^[A-Za-z_][A-Za-z0-9_-]*$/.test(dependency)
          ) {
            throw new WorkbenchParseError(
              statement.line + 1,
              displayLine,
              'dependsOn expects one quoted semantic event name.',
              'Use a declared event name such as dependsOn("prepare_target").',
            );
          }

          if (!event.dependencies.includes(dependency)) {
            event.dependencies.push(dependency);
          }

          namedDependencies.push({
            eventId: event.id,
            dependency,
            line: statement.line + 1,
            sourceLine: displayLine,
          });
          break;
        }
        case 'waitfor': {
          if (!compatibility) {
            throw new RetryParseError();
          }
          const dependency = asString(parsedCall.args[0]);
          if (
            dependency && dependency.toLowerCase() !== 'false' &&
            !event.dependencies.includes(dependency)
          ) event.dependencies.push(dependency);
          break;
        }
        case 'description':
          event.description = asString(parsedCall.args[0]);
          break;
        case 'heuristic':
          event.heuristics.push({
            type: asString(parsedCall.args[0]) ?? '',
            value: asString(parsedCall.args[1]) ?? '',
          });
          break;
      }
      return;
    }

    if (!['events', 'preEvent', 'mainEvent', 'postEvent'].includes(parsedCall.name)) {
      warnings.push(
        `Line ${statement.line + 1}: parsed call outside a detailed block: ${parsedCall.raw}`,
      );
    }
  });

  instances.forEach((instance) => {
    instance.roleType = roleOf(instance.id, instance);
  });

  namedDependencies.forEach((reference) => {
    if (!events.has(reference.dependency)) {
      throw new WorkbenchParseError(
        reference.line,
        reference.sourceLine,
        `dependsOn references an undeclared event: ${reference.dependency}.`,
        `Declare event("${reference.dependency}") in an event phase or correct the reference in ${reference.eventId}.`,
      );
    }
  });

  const links: ParsedCradle['links'] = [];
  networks.forEach((network) => {
    network.endpoints.forEach((endpoint) => {
      links.push({
        source: endpoint.instance,
        target: network.id,
        type: 'endpoint',
        address: endpoint.address,
      });
    });
  });

  events.forEach((event) => {
    if (event.instance) {
      links.push({
        source: `event:${event.id}`,
        target: event.instance,
        type: 'event-instance',
      });
    }
    if (event.runObject?.name) {
      links.push({
        source: `event:${event.id}`,
        target: event.runObject.name,
        type: 'event-object',
      });
    }
    event.dependencies.forEach((dependency) => {
      links.push({
        source: `event:${dependency}`,
        target: `event:${event.id}`,
        type: 'event-dependency',
      });
    });
  });

  return {
    metadata,
    instances: [...instances.values()],
    networks: [...networks.values()],
    objects: [...objects.values()],
    events: [...events.values()].sort((first, second) =>
      String(first.id).localeCompare(String(second.id), undefined, { numeric: true }),
    ),
    links,
    warnings,
    outline,
    raw: code,
  };
}

export function parseCradleForWorkbench(code: string): ParsedCradle {
  let currentError: WorkbenchParseError | null = null;

  try {
    return parseCradle(code, false);
  } catch (error) {
    if (error instanceof WorkbenchParseError) {
      currentError = error;
    } else if (!(error instanceof RetryParseError)) {
      throw error;
    }
  }

  try {
    return parseCradle(code, true);
  } catch (error) {
    if (!(error instanceof WorkbenchParseError)) throw error;
    if (!currentError || error.line >= currentError.line) throw error;
    throw currentError;
  }
}
