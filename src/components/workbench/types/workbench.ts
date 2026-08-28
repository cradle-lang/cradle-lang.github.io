export type WorkbenchView =
  | 'topology'
  | 'events'
  | 'summary';

export type Point = {
  x: number;
  y: number;
};

export type ViewTransform = {
  scale: number;
  x: number;
  y: number;
};

export type Heuristic = {
  type: string;
  value: string;
};

export type CradleValue =
  | string
  | number
  | boolean
  | CradleValue[]
  | {
      [key: string]: CradleValue;
    };

export type InstanceNetwork = {
  network: string;
  address: string;
};

export type CradleInstance = {
  id: string;
  type: 'instance';

  line: number;

  configs: string[];
  heuristics: Heuristic[];
  objects: string[];
  networks: InstanceNetwork[];

  roleType?: string;

  os?: {
    name: string;
    version?: string;
  };

  role?: {
    name?: string;
    params?: CradleValue;
  };
};

export type NetworkEndpoint = {
  instance: string;
  address: string;
};

export type CradleNetwork = {
  id: string;
  type: 'network';

  line: number;

  subnet: string | null;
  endpoints: NetworkEndpoint[];
};

export type CradleObject = {
  id: string;
  type: 'object';
  line: number;

  location?: string;
  heuristics: Heuristic[];
};

export type CradleEvent = {
  id: string;
  type: 'event';

  line: number;

  heuristics: Heuristic[];

  dependencies: string[];

  instance?: string;
  needRoot?: boolean;
  pauseBeforeRun?: number | string;
  pauseAfterRun?: number | string;

  subject?: {
    cmd?: string;
    args?: string;
  };

  runObject?: {
    name?: string;
    args?: CradleValue;
  };

  description?: string;
};

export type CradleLink = {
  source: string;
  target: string;
  type: string;
  address?: string;
};

export type OutlineItem = {
  id: string;
  line: number;
};

export type CradleOutline = {
  instances: OutlineItem[];
  networks: OutlineItem[];
  events: OutlineItem[];
  objects: OutlineItem[];
};

export type ParsedCradle = {
  metadata: Record<string, CradleValue>;

  instances: CradleInstance[];
  networks: CradleNetwork[];
  objects: CradleObject[];
  events: CradleEvent[];

  links: CradleLink[];
  warnings: string[];

  outline: CradleOutline;

  raw: string;
};

export type Selection =
  | {
      type: 'instance';
      id: string;
    }
  | {
      type: 'network';
      id: string;
    }
  | {
      type: 'event';
      id: string;
    }
  | {
      type: 'object';
      id: string;
    }
  | null;

export type ConsoleMessageType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export type ConsoleMessage = {
  id: number;
  timestamp: Date;
  type: ConsoleMessageType;
  message: string;
};
