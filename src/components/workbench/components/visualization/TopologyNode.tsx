import {
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import type {
  Point,
} from '../../types/workbench';

type Props = {
  id: string;
  title: string;
  subtitle?: string;

  role: string;

  x: number;
  y: number;

  width: number;
  height?: number;

  scale: number;

  onMove: (
    id: string,
    position: Point,
  ) => void;

  onSelect: () => void;
};

const ROLE_COLOURS: Record<string, string> = {
  server: '#148ca4',
  router: '#b88316',
  firewall: '#c75353',
  attacker: '#a94f79',
  host: '#477faf',
  object: '#4f9362',
  event: '#7656ad',
};

export default function TopologyNode({
  id,
  title,
  subtitle,
  role,
  x,
  y,
  width,
  height = 46,
  scale,
  onMove,
  onSelect,
}: Props) {
  const [focused, setFocused] =
    useState(false);

  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    baseX: number;
    baseY: number;
    moved: boolean;
  } | null>(null);

  const colour =
    ROLE_COLOURS[role] ??
    ROLE_COLOURS.host;

  function handlePointerDown(
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
      baseX: x,
      baseY: y,
      moved: false,
    };

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );
  }

  function handlePointerMove(
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

    onMove(id, {
      x: drag.baseX + dx,
      y: drag.baseY + dy,
    });
  }

  function finishDrag(
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
      onSelect();
    }
  }

  function handleKeyDown(
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
    onSelect();
  }

  return (
    <g
      transform={`translate(${x} ${y})`}
      role="button"
      tabIndex={0}
      aria-label={
        subtitle
          ? `${title}, ${subtitle}`
          : title
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onKeyDown={handleKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        cursor: 'grab',
        touchAction: 'none',
      }}
    >
      <rect
        width={width}
        height={height}
        rx={8}
        fill="var(--workbench-node-bg)"
        stroke={
          focused
            ? 'var(--cradle-accent)'
            : colour
        }
        strokeWidth={
          focused ? 3 : 1.5
        }
      />

      <rect
        width={5}
        height={height}
        rx={3}
        fill={colour}
      />

      <text
        x={14}
        y={20}
        fill="var(--workbench-node-text)"
        fontSize={12}
        fontWeight={700}
      >
        {title}
      </text>

      {subtitle && (
        <text
          x={14}
          y={37}
          fill="var(--workbench-node-muted)"
          fontSize={10}
        >
          {subtitle}
        </text>
      )}
    </g>
  );
}
