import type {
  CradleEvent,
  CradleInstance,
  CradleNetwork,
  CradleObject,
  ParsedCradle,
} from '../types/workbench';

type ParsedCall = {
  name: string;
  args: string[];
  raw: string;
};

type BlockHeader = {
  kind: string;
  args: string[];
  arg: string | null;
};

function stripComment(line: string): string {
  let quoted = false;
  let escaped = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (character === '\\') {
      escaped = true;
      continue;
    }

    if (character === '"') {
      quoted = !quoted;
    }

    if (character === '#' && !quoted) {
      return line.slice(0, index);
    }
  }

  return line;
}

function parseArguments(source: string): string[] {
  const output: string[] = [];

  const expression = /"((?:\\.|[^"\\])*)"/g;

  let match: RegExpExecArray | null;

  while ((match = expression.exec(source)) !== null) {
    output.push(match[1].replace(/\\"/g, '"'));
  }

  return output;
}

function parseCall(line: string): ParsedCall | null {
  const source = stripComment(line)
    .trim()
    .replace(/[,.]\s*$/, '');

  const match = source.match(
    /^([A-Za-z_][\w-]*)\s*\((.*)\)$/,
  );

  if (!match) {
    return null;
  }

  return {
    name: match[1],
    args: parseArguments(match[2]),
    raw: source,
  };
}

function parseHeader(line: string): BlockHeader | null {
  const source = stripComment(line).trim();

  const match = source.match(
    /^([A-Za-z_][\w-]*)\s*\((.*?)\)\s*>\s*$/,
  );

  if (!match) {
    return null;
  }

  const args = parseArguments(match[2]);

  return {
    kind: match[1],
    args,
    arg: args[0] ?? null,
  };
}

function roleOf(
  name: string,
  instance?: CradleInstance,
): string {
  const loweredName = name.toLowerCase();

  const configs = (instance?.configs ?? [])
    .join(' ')
    .toLowerCase();

  if (
    loweredName.includes('firewall') ||
    configs.includes('ufw')
  ) {
    return 'firewall';
  }

  if (
    loweredName.includes('router') ||
    configs.includes('router')
  ) {
    return 'router';
  }

  if (loweredName.includes('attacker')) {
    return 'attacker';
  }

  if (
    loweredName.includes('host') ||
    loweredName.includes('user')
  ) {
    return 'host';
  }

  if (
    loweredName.includes('server') ||
    loweredName === 'siem' ||
    configs.includes('server') ||
    configs.includes('smb') ||
    configs.includes('postgres') ||
    configs.includes('mail') ||
    configs.includes('dns') ||
    configs.includes('ntp')
  ) {
    return 'server';
  }

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
    network = {
      id,
      type: 'network',
      line,
      subnet: null,
      endpoints: [],
    };

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
    event = {
      id,
      type: 'event',
      line,
      heuristics: [],
    };

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
    };

    objects.set(id, object);
  }

  return object;
}

export function parseCradleForWorkbench(
  code: string,
): ParsedCradle {
  const lines = code.split(/\r?\n/);

  const instances = new Map<string, CradleInstance>();
  const networks = new Map<string, CradleNetwork>();
  const objects = new Map<string, CradleObject>();
  const events = new Map<string, CradleEvent>();

  const metadata: ParsedCradle['metadata'] = {};

  const warnings: string[] = [];

  const outline: ParsedCradle['outline'] = {
    instances: [],
    networks: [],
    events: [],
    objects: [],
  };

  let currentBlock: BlockHeader | null = null;

  lines.forEach((line, lineIndex) => {
    const block = parseHeader(line);

    if (block) {
      currentBlock = block;

      if (block.kind === 'instance' && block.arg) {
        const instance = getOrCreateInstance(
          instances,
          block.arg,
          lineIndex,
        );

        instance.line = lineIndex;

        outline.instances.push({
          id: block.arg,
          line: lineIndex,
        });
      }

      if (block.kind === 'network' && block.arg) {
        const network = getOrCreateNetwork(
          networks,
          block.arg,
          lineIndex,
        );

        network.line = lineIndex;

        outline.networks.push({
          id: block.arg,
          line: lineIndex,
        });
      }

      if (block.kind === 'event' && block.arg) {
        const event = getOrCreateEvent(
          events,
          block.arg,
          lineIndex,
        );

        event.line = lineIndex;

        outline.events.push({
          id: block.arg,
          line: lineIndex,
        });
      }

      if (block.kind === 'object' && block.arg) {
        const object = getOrCreateObject(
          objects,
          block.arg,
          lineIndex,
        );

        object.line = lineIndex;

        outline.objects.push({
          id: block.arg,
          line: lineIndex,
        });
      }

      return;
    }

    const parsedCall = parseCall(line);

    if (!parsedCall) {
      return;
    }

    if (currentBlock?.kind === 'metadata') {
      metadata[parsedCall.name] =
        parsedCall.args.length > 1
          ? parsedCall.args
          : parsedCall.args[0] ?? true;

      return;
    }

    if (
      currentBlock?.kind === 'instances' &&
      parsedCall.name === 'instance'
    ) {
      const id = parsedCall.args[0];

      if (id) {
        getOrCreateInstance(
          instances,
          id,
          lineIndex,
        );
      }

      return;
    }

    if (
      currentBlock?.kind === 'networks' &&
      parsedCall.name === 'network'
    ) {
      const id = parsedCall.args[0];

      if (id) {
        getOrCreateNetwork(
          networks,
          id,
          lineIndex,
        );
      }

      return;
    }

    if (
      currentBlock?.kind === 'mainEvent' &&
      parsedCall.name === 'event'
    ) {
      const id = parsedCall.args[0];

      if (id) {
        getOrCreateEvent(
          events,
          id,
          lineIndex,
        );
      }

      return;
    }

    if (
      currentBlock?.kind === 'instance' &&
      currentBlock.arg
    ) {
      const instance = getOrCreateInstance(
        instances,
        currentBlock.arg,
        lineIndex,
      );

      switch (parsedCall.name) {
        case 'os':
          instance.os = {
            name: parsedCall.args[0],
            version: parsedCall.args[1],
          };
          break;

        case 'config':
          if (parsedCall.args[0]) {
            instance.configs.push(
              parsedCall.args[0],
            );
          }
          break;

        case 'role':
          instance.role = {
            name: parsedCall.args[0],
            params: parsedCall.args[1],
          };
          break;

        case 'heuristic':
          instance.heuristics.push({
            type: parsedCall.args[0],
            value: parsedCall.args[1],
          });
          break;

        case 'object': {
          const objectId = parsedCall.args[0];

          if (objectId) {
            instance.objects.push(objectId);

            getOrCreateObject(
              objects,
              objectId,
              lineIndex,
            );
          }

          break;
        }
      }

      return;
    }

    if (
      currentBlock?.kind === 'network' &&
      currentBlock.arg
    ) {
      const network = getOrCreateNetwork(
        networks,
        currentBlock.arg,
        lineIndex,
      );

      if (parsedCall.name === 'subnet') {
        network.subnet =
          parsedCall.args[0] ?? null;
      }

      if (parsedCall.name === 'endpoint') {
        const instanceId = parsedCall.args[0];
        const address = parsedCall.args[1];

        if (instanceId) {
          const instance = getOrCreateInstance(
            instances,
            instanceId,
            lineIndex,
          );

          network.endpoints.push({
            instance: instanceId,
            address,
          });

          instance.networks.push({
            network: currentBlock.arg,
            address,
          });
        }
      }

      return;
    }

    if (
      currentBlock?.kind === 'event' &&
      currentBlock.arg
    ) {
      const event = getOrCreateEvent(
        events,
        currentBlock.arg,
        lineIndex,
      );

      switch (parsedCall.name) {
        case 'instance':
          event.instance = parsedCall.args[0];
          break;

        case 'needRoot':
          event.needRoot = parsedCall.args[0];
          break;

        case 'subject':
          event.subject = {
            cmd: parsedCall.args[0],
            args: parsedCall.args[1],
          };
          break;

        case 'runObject': {
          event.runObject = {
            name: parsedCall.args[0],
            args: parsedCall.args[1],
          };

          if (parsedCall.args[0]) {
            getOrCreateObject(
              objects,
              parsedCall.args[0],
              lineIndex,
            );
          }

          break;
        }

        case 'waitfor':
          event.waitfor = parsedCall.args[0];
          break;

        case 'description':
          event.description =
            parsedCall.args[0];
          break;

        case 'heuristic':
          event.heuristics.push({
            type: parsedCall.args[0],
            value: parsedCall.args[1],
          });
          break;
      }

      return;
    }

    if (
      stripComment(line).trim() &&
      !['events', 'preEvent', 'postEvent'].includes(
        parsedCall.name,
      )
    ) {
      warnings.push(
        `Line ${lineIndex + 1}: parsed call outside a detailed block: ${parsedCall.raw}`,
      );
    }
  });

  instances.forEach((instance) => {
    instance.roleType = roleOf(
      instance.id,
      instance,
    );
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

    if (
      event.waitfor &&
      event.waitfor !== 'false'
    ) {
      links.push({
        source: `event:${event.waitfor}`,
        target: `event:${event.id}`,
        type: 'event-dependency',
      });
    }
  });

  return {
    metadata,
    instances: [...instances.values()],
    networks: [...networks.values()],
    objects: [...objects.values()],
    events: [...events.values()].sort(
      (first, second) =>
        String(first.id).localeCompare(
          String(second.id),
          undefined,
          {
            numeric: true,
          },
        ),
    ),
    links,
    warnings,
    outline,
    raw: code,
  };
}