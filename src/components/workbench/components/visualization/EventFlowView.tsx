import {
  useMemo,
  useState,
} from 'react';

import type {
  ParsedCradle,
  Point,
  Selection,
} from '../../types/workbench';

import TopologyNode from './TopologyNode';

type Props = {
  parsed: ParsedCradle;

  onSelect: (
    selection: Selection,
  ) => void;
};

export default function EventFlowView({
  parsed,
  onSelect,
}: Props) {
  const [positions, setPositions] =
    useState<Record<string, Point>>(
      {},
    );

  const defaultPositions =
    useMemo(() => {
      const output: Record<
        string,
        Point
      > = {};

      parsed.events.forEach(
        (event, index) => {
          let level = 0;

          let waitFor =
            event.waitfor;

          while (
            waitFor &&
            waitFor !== 'false'
          ) {
            level += 1;

            const parent =
              parsed.events.find(
                (candidate) =>
                  candidate.id ===
                  waitFor,
              );

            waitFor =
              parent?.waitfor;

            if (level > 10) {
              break;
            }
          }

          output[event.id] = {
            x: 70 + level * 280,
            y: 70 + index * 100,
          };
        },
      );

      return output;
    }, [parsed.events]);

  function resolvedPosition(
    eventId: string,
  ): Point {
    return (
      positions[eventId] ??
      defaultPositions[eventId]
    );
  }

  const canvasSize =
    useMemo(() => {
      const positionsToFit =
        parsed.events.map(
          (event) =>
            positions[event.id] ??
            defaultPositions[event.id],
        );

      return {
        width: Math.max(
          1200,
          ...positionsToFit.map(
            (position) =>
              position.x + 290,
          ),
        ),
        height: Math.max(
          800,
          ...positionsToFit.map(
            (position) =>
              position.y + 120,
          ),
        ),
      };
    }, [
      parsed.events,
      positions,
      defaultPositions,
    ]);

  const dependencies =
    parsed.links.filter(
      (link) =>
        link.type ===
        'event-dependency',
    );

  return (
    <svg
      viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
      role="group"
      aria-labelledby="workbench-event-flow-title workbench-event-flow-description"
      style={{
        position: 'relative',
        inset: 'auto',
        width: canvasSize.width,
        minWidth: '100%',
        height: canvasSize.height,
        minHeight: '100%',
      }}
    >
      <title id="workbench-event-flow-title">
        CRADLE event flow
      </title>

      <desc id="workbench-event-flow-description">
        Interactive event dependency diagram. Use Tab to move between events and Enter or Space to inspect one.
      </desc>

      <defs>
        <marker
          id="event-arrow"
          markerWidth={10}
          markerHeight={10}
          refX={9}
          refY={3}
          orient="auto"
        >
          <path
            d="M0,0 L0,6 L9,3 z"
            fill="var(--workbench-event)"
          />
        </marker>
      </defs>

      {dependencies.map(
        (dependency) => {
          const sourceId =
            dependency.source.replace(
              'event:',
              '',
            );

          const targetId =
            dependency.target.replace(
              'event:',
              '',
            );

          const source =
            resolvedPosition(
              sourceId,
            );

          const target =
            resolvedPosition(
              targetId,
            );

          if (!source || !target) {
            return null;
          }

          return (
            <path
              key={`${sourceId}-${targetId}`}
              d={`
                M
                ${source.x + 220}
                ${source.y + 35}

                C
                ${source.x + 260}
                ${source.y + 35}

                ${target.x - 40}
                ${target.y + 35}

                ${target.x}
                ${target.y + 35}
              `}
              fill="none"
              stroke="var(--workbench-event)"
              strokeWidth={2}
              markerEnd="url(#event-arrow)"
            />
          );
        },
      )}

      {parsed.events.map((event) => {
        const position =
          resolvedPosition(
            event.id,
          );

        const subtitle = [
          event.description,
          event.instance
            ? `instance: ${event.instance}`
            : undefined,
          event.waitfor &&
          event.waitfor !== 'false'
            ? `waitfor: ${event.waitfor}`
            : 'concurrent/root',
        ]
          .filter(Boolean)
          .join(' · ');

        return (
          <TopologyNode
            key={event.id}
            id={event.id}
            title={`event ${event.id}`}
            subtitle={subtitle}
            role="event"
            x={position.x}
            y={position.y}
            width={220}
            height={70}
            scale={1}
            onMove={(
              id,
              next,
            ) =>
              setPositions(
                (previous) => ({
                  ...previous,
                  [id]: next,
                }),
              )
            }
            onSelect={() =>
              onSelect({
                type: 'event',
                id: event.id,
              })
            }
          />
        );
      })}
    </svg>
  );
}
