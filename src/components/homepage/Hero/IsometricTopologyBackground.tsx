import type {CSSProperties, ReactNode} from 'react';

import styles from './Hero.module.css';

type CubeProps = {
  centerX: number;
  centerY: number;
  className?: string;
  depth: number;
  size: number;
};

function polygonPoints(points: Array<[number, number]>) {
  return points.map(([x, y]) => `${x},${y}`).join(' ');
}

function Cube({centerX, centerY, size, depth, className = ''}: CubeProps): ReactNode {
  const halfWidth = size / 2;
  const halfHeight = size * 0.285;
  const top: [number, number] = [centerX, centerY - halfHeight];
  const right: [number, number] = [centerX + halfWidth, centerY];
  const front: [number, number] = [centerX, centerY + halfHeight];
  const left: [number, number] = [centerX - halfWidth, centerY];
  const frontBottom: [number, number] = [front[0], front[1] + depth];
  const leftBottom: [number, number] = [left[0], left[1] + depth];
  const rightBottom: [number, number] = [right[0], right[1] + depth];

  return (
    <g className={`${styles.topologyCube} ${className}`}>
      <polygon className={styles.cubeLeft} points={polygonPoints([left, front, frontBottom, leftBottom])} />
      <polygon className={styles.cubeRight} points={polygonPoints([front, right, rightBottom, frontBottom])} />
      <polygon className={styles.cubeTop} points={polygonPoints([top, right, front, left])} />
    </g>
  );
}

const nodes = [
  {centerX: 98, centerY: 198, size: 64, depth: 38, groundX: 210, groundY: 322},
  {centerX: 500, centerY: 126, size: 64, depth: 38, groundX: 500, groundY: 290},
  {centerX: 646, centerY: 198, size: 64, depth: 38, groundX: 566, groundY: 322},
  {centerX: 584, centerY: 401, size: 64, depth: 38, groundX: 584, groundY: 466},
  {centerX: 148, centerY: 350, size: 64, depth: 38, groundX: 148, groundY: 414},
];

export function IsometricTopologyBackground(): ReactNode {
  return (
    <div className={styles.topologyBackground} aria-hidden="true">
      <svg
        className={styles.topologyCanvas}
        viewBox="0 0 742 578"
        preserveAspectRatio="xMidYMid meet"
        focusable="false">
        <defs>
          <linearGradient id="topology-card" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--cradle-surface)" stopOpacity="0.9" />
            <stop offset="1" stopColor="var(--cradle-bg)" stopOpacity="0.72" />
          </linearGradient>
          <radialGradient id="topology-glow">
            <stop offset="0" stopColor="#e76922" stopOpacity="0.24" />
            <stop offset="1" stopColor="#e76922" stopOpacity="0" />
          </radialGradient>
          <pattern id="topology-speckle" width="31" height="27" patternUnits="userSpaceOnUse">
            <circle cx="6" cy="7" r="0.65" fill="var(--cradle-text-subtle)" opacity="0.13" />
            <circle cx="23" cy="18" r="0.45" fill="var(--cradle-border-strong)" opacity="0.12" />
          </pattern>
          <filter id="topology-soft-glow" x="-70%" y="-70%" width="240%" height="240%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>

        <rect className={styles.topologyTexture} width="742" height="578" fill="url(#topology-speckle)" />

        <g className={styles.topologyGrid}>
          {[-90, -10, 70, 150, 230, 310, 390, 470, 550, 630, 710].map((x) => (
            <line key={`down-${x}`} x1={x} y1="0" x2={x + 500} y2="289" />
          ))}
          {[-20, 60, 140, 220, 300, 380, 460, 540, 620].map((y) => (
            <line key={`up-${y}`} x1="0" y1={y + 230} x2="410" y2={y - 7} />
          ))}
        </g>

        <ellipse
          cx="398"
          cy="330"
          rx="124"
          ry="92"
          fill="url(#topology-glow)"
          filter="url(#topology-soft-glow)"
        />

        <g className={styles.topologyPlatform}>
          <path className={styles.platformDepth} d="M398 151 L706 329 Q719 337 706 345 L416 514 Q400 524 384 514 L71 344 Q58 336 71 328 L381 150 Q398 140 415 150 Z" />
          <path d="M398 139 L706 317 Q719 325 706 333 L416 502 Q400 512 384 502 L71 332 Q58 324 71 316 L381 138 Q398 128 415 138 Z" />
          <path className={styles.platformDepth} d="M398 234 L568 332 Q580 340 568 348 L414 438 Q399 447 384 438 L213 346 Q201 338 213 330 L382 233 Q398 224 414 233 Z" />
          <path d="M398 222 L568 320 Q580 328 568 336 L414 426 Q399 435 384 426 L213 334 Q201 326 213 318 L382 221 Q398 212 414 221 Z" />
          <path d="M398 268 L520 338 L398 409 L275 338 Z" />
        </g>

        <g className={styles.topologyConnections}>
          <path className={styles.topologyRoute} d="M210 322 L398 338" />
          <path className={styles.topologyRoute} d="M500 290 L398 338" style={{animationDelay: '-1.2s'} as CSSProperties} />
          <path className={styles.topologyRoute} d="M566 322 L398 338" style={{animationDelay: '-2.4s'} as CSSProperties} />
          <path className={styles.topologyRoute} d="M584 466 L398 338" style={{animationDelay: '-3.6s'} as CSSProperties} />
          <path className={styles.topologyRoute} d="M148 414 L398 338" style={{animationDelay: '-4.8s'} as CSSProperties} />

          {nodes.map((node, index) => {
            const cubeBottom = node.centerY + node.size * 0.285 + node.depth;
            const duration = 5.8 + index * 0.6;
            const begin = index * -1.1;
            return (
              <g key={`${node.centerX}-${node.centerY}`}>
                <line
                  className={styles.topologyDrop}
                  x1={node.centerX}
                  y1={cubeBottom}
                  x2={node.groundX}
                  y2={node.groundY}
                />
                <circle className={styles.topologyJunction} cx={node.groundX} cy={node.groundY} r="3" />
                <circle className={styles.networkPacket} r="3.2">
                  <animateMotion
                    path={`M 398 338 L ${node.groundX} ${node.groundY} L ${node.centerX} ${cubeBottom}`}
                    dur={`${duration}s`}
                    begin={`${begin}s`}
                    keyPoints="0;0.78;1"
                    keyTimes="0;0.8;1"
                    calcMode="spline"
                    keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    keyTimes="0;0.08;0.88;1"
                    dur={`${duration}s`}
                    begin={`${begin}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}

          <circle className={styles.topologyJunction} cx="210" cy="242" r="4" />
          <line className={styles.topologyDrop} x1="210" y1="242" x2="210" y2="322" />
          <circle className={styles.topologyJunction} cx="566" cy="242" r="4" />
          <line className={styles.topologyDrop} x1="566" y1="242" x2="566" y2="322" />
        </g>

        <g className={styles.topologyCard} transform="translate(54 14)">
          <g
            className={styles.topologyCardPlane}
            transform="translate(286 137) scale(1.32) translate(-286 -137) rotate(-1.6 286 143) skewX(-1.5)">
            <rect x="160" y="24" width="252" height="226" rx="10" fill="url(#topology-card)" />
            <line className={styles.topologyCardDivider} x1="160" y1="58" x2="412" y2="58" />
            <line x1="160" y1="250" x2="160" y2="285" />
            <line x1="412" y1="250" x2="412" y2="187" />

            <text className={styles.topologyCodeHeader} x="180" y="47">
              scenario.cradle
            </text>
            <text className={styles.topologyCode} x="180" y="78">
              <tspan className={styles.topologyCodeKey} x="180">{'metadata() >'}</tspan>
              <tspan x="180" dy="11">{'  name("HelloWorld-Win"),'}</tspan>
              <tspan x="180" dy="11">{'  eventType("sequence"),'}</tspan>
              <tspan x="180" dy="11">{'  object("HelloWorld").'}</tspan>
              <tspan className={styles.topologyCodeKey} x="180" dy="15">{'instances() >'}</tspan>
              <tspan x="180" dy="11">{'  instance("win7"),'}</tspan>
              <tspan x="180" dy="11">{'  instance("router").'}</tspan>
              <tspan className={styles.topologyCodeKey} x="180" dy="15">{'network("lan_0") >'}</tspan>
              <tspan x="180" dy="11">{'  subnet("192.168.56.0/24"),'}</tspan>
              <tspan x="180" dy="11">{'  endpoint("win7", "192.168.56.121"),'}</tspan>
              <tspan x="180" dy="11">{'  endpoint("router", "192.168.56.122").'}</tspan>
            </text>
          </g>
        </g>

        <g className={styles.satelliteNodes}>
          {nodes.map((node) => (
            <Cube
              key={`${node.centerX}-${node.centerY}-cube`}
              centerX={node.centerX}
              centerY={node.centerY}
              size={node.size}
              depth={node.depth}
              className={styles.satelliteCube}
            />
          ))}
        </g>

        <g className={styles.centralNode}>
          <circle cx="398" cy="326" r="76" />
          <Cube centerX={398} centerY={271} size={128} depth={73} className={styles.centralCube} />
        </g>
      </svg>
    </div>
  );
}
