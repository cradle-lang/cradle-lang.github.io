import {
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';

import NetworkGroup from './NetworkGroup';

import type {
  ParsedCradle,
  Point,
  Selection,
  ViewTransform,
} from '../../types/workbench';

type Props = {
  parsed: ParsedCradle;

  showLabels: boolean;
  showObjects: boolean;

  nodePositions: Record<string, Point>;
  networkPositions: Record<string, Point>;

  onNodeMove: (
    key: string,
    position: Point,
  ) => void;

  onNetworkMove: (
    networkId: string,
    position: Point,
  ) => void;

  onSelect: (
    selection: Selection,
  ) => void;
};

const DEFAULT_WIDTH = 330;

export default function TopologyView({
  parsed,
  showLabels,
  nodePositions,
  networkPositions,
  onNodeMove,
  onNetworkMove,
  onSelect,
}: Props) {
  const svgRef =
    useRef<SVGSVGElement>(null);

  const panRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
  } | null>(null);

  const [transform, setTransform] =
    useState<ViewTransform>({
      scale: 1,
      x: 0,
      y: 0,
    });

  const defaultNetworkPositions =
    useMemo<Record<string, Point>>(
      () => ({
        outside: {
          x: 40,
          y: 45,
        },

        dmz: {
          x: 40,
          y: 300,
        },

        inside: {
          x: 470,
          y: 230,
        },

        productivity: {
          x: 40,
          y: 520,
        },

        admin: {
          x: 820,
          y: 430,
        },
      }),
      [],
    );

  const resolvedNetworkPositions =
    useMemo(() => {
      const output: Record<
        string,
        Point
      > = {};

      let autoIndex = 0;

      parsed.networks.forEach(
        (network) => {
          output[network.id] =
            networkPositions[network.id] ??
            defaultNetworkPositions[
              network.id
            ] ?? {
              x:
                60 +
                (autoIndex % 3) *
                  360,

              y:
                60 +
                Math.floor(
                  autoIndex / 3,
                ) *
                  230,
            };

          autoIndex += 1;
        },
      );

      return output;
    }, [
      parsed.networks,
      networkPositions,
      defaultNetworkPositions,
    ]);

  const networkConnections =
    useMemo(() => {
      const connections: {
        id: string;
        label: string;
        from: Point;
        to: Point;
      }[] = [];

      const seen = new Set<string>();

      parsed.instances.forEach(
        (instance) => {
          const networks =
            instance.networks.map(
              (entry) => entry.network,
            );

          for (
            let first = 0;
            first < networks.length;
            first += 1
          ) {
            for (
              let second = first + 1;
              second < networks.length;
              second += 1
            ) {
              const firstNetwork =
                networks[first];

              const secondNetwork =
                networks[second];

              const key = [
                firstNetwork,
                secondNetwork,
                instance.id,
              ]
                .sort()
                .join('|');

              if (seen.has(key)) {
                continue;
              }

              seen.add(key);

              const firstPosition =
                resolvedNetworkPositions[
                  firstNetwork
                ];

              const secondPosition =
                resolvedNetworkPositions[
                  secondNetwork
                ];

              if (
                !firstPosition ||
                !secondPosition
              ) {
                continue;
              }

              connections.push({
                id: key,
                label: instance.id,

                from: {
                  x:
                    firstPosition.x +
                    DEFAULT_WIDTH / 2,
                  y:
                    firstPosition.y +
                    100,
                },

                to: {
                  x:
                    secondPosition.x +
                    DEFAULT_WIDTH / 2,
                  y:
                    secondPosition.y +
                    100,
                },
              });
            }
          }
        },
      );

      return connections;
    }, [
      parsed.instances,
      resolvedNetworkPositions,
    ]);

  function handleWheel(
    event: ReactWheelEvent<SVGSVGElement>,
  ): void {
    event.preventDefault();

    const svg =
      svgRef.current;

    if (!svg) {
      return;
    }

    const rect =
      svg.getBoundingClientRect();

    const mouseX =
      event.clientX - rect.left;

    const mouseY =
      event.clientY - rect.top;

    const factor =
      event.deltaY < 0
        ? 1.12
        : 0.89;

    const nextScale = Math.max(
      0.35,
      Math.min(
        4,
        transform.scale * factor,
      ),
    );

    const worldX =
      (mouseX - transform.x) /
      transform.scale;

    const worldY =
      (mouseY - transform.y) /
      transform.scale;

    setTransform({
      scale: nextScale,

      x:
        mouseX -
        worldX * nextScale,

      y:
        mouseY -
        worldY * nextScale,
    });
  }

  function handlePointerDown(
    event: ReactPointerEvent<SVGSVGElement>,
  ): void {
    if (
      event.button !== 0 ||
      event.target !==
        event.currentTarget
    ) {
      return;
    }

    panRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );
  }

  function handlePointerMove(
    event: ReactPointerEvent<SVGSVGElement>,
  ): void {
    const pan = panRef.current;

    if (
      !pan ||
      pan.pointerId !== event.pointerId
    ) {
      return;
    }

    const dx =
      event.clientX - pan.x;

    const dy =
      event.clientY - pan.y;

    pan.x = event.clientX;
    pan.y = event.clientY;

    setTransform((previous) => ({
      ...previous,
      x: previous.x + dx,
      y: previous.y + dy,
    }));
  }

  function finishPan(
    event: ReactPointerEvent<SVGSVGElement>,
  ): void {
    if (
      panRef.current?.pointerId !==
      event.pointerId
    ) {
      return;
    }

    panRef.current = null;

    event.currentTarget.releasePointerCapture(
      event.pointerId,
    );
  }

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid meet"
      onWheel={handleWheel}
      onPointerDown={
        handlePointerDown
      }
      onPointerMove={
        handlePointerMove
      }
      onPointerUp={finishPan}
      onPointerCancel={finishPan}
      style={{
        width: '100%',
        height: '100%',
        cursor: 'grab',
        touchAction: 'none',
      }}
    >
      <defs>
        <marker
          id="topology-arrow"
          markerWidth={10}
          markerHeight={10}
          refX={9}
          refY={3}
          orient="auto"
        >
          <path
            d="M0,0 L0,6 L9,3 z"
            fill="var(--workbench-edge)"
          />
        </marker>
      </defs>

      <g
        transform={`
          translate(
            ${transform.x}
            ${transform.y}
          )
          scale(${transform.scale})
        `}
      >
        {networkConnections.map(
          (connection) => {
            const midX =
              (connection.from.x +
                connection.to.x) /
              2;

            return (
              <g key={connection.id}>
                <path
                  d={`
                    M
                    ${connection.from.x}
                    ${connection.from.y}

                    C
                    ${midX}
                    ${connection.from.y}

                    ${midX}
                    ${connection.to.y}

                    ${connection.to.x}
                    ${connection.to.y}
                  `}
                  fill="none"
                  stroke="var(--workbench-edge)"
                  strokeWidth={2}
                  markerEnd="url(#topology-arrow)"
                />

                <text
                  x={midX}
                  y={
                    (connection.from.y +
                      connection.to.y) /
                      2 -
                    7
                  }
                  fill="var(--workbench-node-muted)"
                  fontSize={10}
                  textAnchor="middle"
                >
                  {connection.label}
                </text>
              </g>
            );
          },
        )}

        {parsed.networks.map(
          (network) => (
            <NetworkGroup
              key={network.id}
              network={network}
              instances={
                parsed.instances
              }
              position={
                resolvedNetworkPositions[
                  network.id
                ]
              }
              nodePositions={
                nodePositions
              }
              width={DEFAULT_WIDTH}
              showLabels={showLabels}
              scale={transform.scale}
              onNetworkMove={
                onNetworkMove
              }
              onNodeMove={onNodeMove}
              onSelect={onSelect}
            />
          ),
        )}
      </g>
    </svg>
  );
}