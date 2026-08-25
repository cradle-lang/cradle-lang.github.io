import {
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import TopologyNode from './TopologyNode';

import type {
  CradleInstance,
  CradleNetwork,
  Point,
  Selection,
} from '../../types/workbench';

type Props = {
  network: CradleNetwork;

  instances: CradleInstance[];

  position: Point;

  nodePositions: Record<string, Point>;

  width: number;

  showLabels: boolean;

  scale: number;

  onNetworkMove: (
    networkId: string,
    position: Point,
  ) => void;

  onNodeMove: (
    nodeKey: string,
    position: Point,
  ) => void;

  onSelect: (
    selection: Selection,
  ) => void;
};

export default function NetworkGroup({
  network,
  instances,
  position,
  nodePositions,
  width,
  showLabels,
  scale,
  onNetworkMove,
  onNodeMove,
  onSelect,
}: Props) {
  const [headerFocused, setHeaderFocused] =
    useState(false);

  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
    moved: boolean;
  } | null>(null);

  const columnWidth =
    (width - 42) / 2;

  const height = Math.max(
    170,
    80 +
      Math.ceil(
        network.endpoints.length / 2,
      ) *
        58,
  );

  const endpointPositions = useMemo(() => {
    return network.endpoints.map(
      (endpoint, index) => {
        const key =
          `endpoint:${network.id}:${endpoint.instance}`;

        const defaultPosition = {
          x:
            16 +
            (index % 2) *
              (columnWidth + 10),
          y:
            62 +
            Math.floor(index / 2) *
              54,
        };

        return {
          endpoint,
          key,
          position:
            nodePositions[key] ??
            defaultPosition,
        };
      },
    );
  }, [
    network,
    columnWidth,
    nodePositions,
  ]);

  function handleHeaderPointerDown(
    event: ReactPointerEvent<SVGGElement>,
  ): void {
    if (event.button !== 0) {
      return;
    }

    event.stopPropagation();

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      baseX: position.x,
      baseY: position.y,
      moved: false,
    };

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );
  }

  function handleHeaderPointerMove(
    event: ReactPointerEvent<SVGGElement>,
  ): void {
    const drag = dragRef.current;

    if (
      !drag ||
      drag.pointerId !== event.pointerId
    ) {
      return;
    }

    const dx =
      (event.clientX - drag.startX) /
      Math.max(scale, 0.01);

    const dy =
      (event.clientY - drag.startY) /
      Math.max(scale, 0.01);

    if (
      Math.abs(dx) > 2 ||
      Math.abs(dy) > 2
    ) {
      drag.moved = true;
    }

    onNetworkMove(network.id, {
      x: drag.baseX + dx,
      y: drag.baseY + dy,
    });
  }

  function finishNetworkDrag(
    event: ReactPointerEvent<SVGGElement>,
  ): void {
    const drag = dragRef.current;

    if (
      !drag ||
      drag.pointerId !== event.pointerId
    ) {
      return;
    }

    event.currentTarget.releasePointerCapture(
      event.pointerId,
    );

    dragRef.current = null;

    if (!drag.moved) {
      onSelect({
        type: 'network',
        id: network.id,
      });
    }
  }

  function selectNetworkFromKeyboard(
    event: ReactKeyboardEvent<SVGGElement>,
  ): void {
    if (
      event.key !== 'Enter' &&
      event.key !== ' '
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onSelect({
      type: 'network',
      id: network.id,
    });
  }

  return (
    <g
      transform={`
        translate(
          ${position.x}
          ${position.y}
        )
      `}
    >
      <rect
        width={width}
        height={height}
        rx={16}
        fill="var(--workbench-network-bg)"
        stroke={
          headerFocused
            ? 'var(--cradle-accent)'
            : 'var(--workbench-network)'
        }
        strokeWidth={
          headerFocused ? 3 : 1.5
        }
      />

      {/* Network drag handle */}
      <g
        role="button"
        tabIndex={0}
        aria-label={
          network.subnet
            ? `Network ${network.id}, subnet ${network.subnet}`
            : `Network ${network.id}`
        }
        onPointerDown={
          handleHeaderPointerDown
        }
        onPointerMove={
          handleHeaderPointerMove
        }
        onPointerUp={finishNetworkDrag}
        onPointerCancel={
          finishNetworkDrag
        }
        onKeyDown={
          selectNetworkFromKeyboard
        }
        onFocus={() =>
          setHeaderFocused(true)
        }
        onBlur={() =>
          setHeaderFocused(false)
        }
        style={{
          cursor: 'grab',
          touchAction: 'none',
        }}
      >
        <rect
          width={width}
          height={54}
          rx={16}
          fill="transparent"
        />

        <text
          x={16}
          y={24}
          fill="var(--workbench-network-title)"
          fontSize={15}
          fontWeight={800}
        >
          {network.id}
        </text>

        {showLabels &&
          network.subnet && (
            <text
              x={16}
              y={43}
              fill="var(--workbench-network-muted)"
              fontSize={11}
            >
              {network.subnet}
            </text>
          )}
      </g>

      {endpointPositions.map(
        ({
          endpoint,
          key,
          position: nodePosition,
        }) => {
          const instance =
            instances.find(
              (candidate) =>
                candidate.id ===
                endpoint.instance,
            );

          return (
            <TopologyNode
              key={key}
              id={key}
              title={endpoint.instance}
              subtitle={
                showLabels
                  ? endpoint.address
                  : instance?.os
                    ? `${instance.os.name} ${instance.os.version ?? ''}`
                    : undefined
              }
              role={
                instance?.roleType ??
                'host'
              }
              x={nodePosition.x}
              y={nodePosition.y}
              width={columnWidth}
              scale={scale}
              onMove={onNodeMove}
              onSelect={() =>
                onSelect({
                  type: 'instance',
                  id: endpoint.instance,
                })
              }
            />
          );
        },
      )}
    </g>
  );
}
