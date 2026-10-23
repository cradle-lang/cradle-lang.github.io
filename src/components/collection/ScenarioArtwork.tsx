import {useId, useState} from 'react';
import {scenarioThumbnails} from '../../data/library-assets.generated';
import type {LibraryScenario} from './library';

// Built-in illustrations are fallbacks; authors can supply a colocated image.
export default function ScenarioArtwork({scenario, className}: {scenario: LibraryScenario; className?: string}) {
  const id = useId().replaceAll(':', '');
  const [failedThumbnail, setFailedThumbnail] = useState<string>();
  const thumbnail = scenarioThumbnails[scenario.id];
  const variant = scenario.artwork === 'auto' ? (scenario.parsed.networks.length > 1 ? 'enterprise' : 'network') : scenario.artwork;
  const complex = variant === 'enterprise';
  const monitoring = variant === 'monitoring';
  if (thumbnail && failedThumbnail !== thumbnail) {
    return <img className={className} src={thumbnail} alt={scenario.thumbnailAlt || `${scenario.name} thumbnail`} width={440} height={250} loading="lazy" decoding="async" style={{objectFit: 'cover', objectPosition: 'center'}} onError={() => setFailedThumbnail(thumbnail)} />;
  }
  const nodes = monitoring ? [{x: 130, y: 85}, {x: 310, y: 85}, {x: 130, y: 170}, {x: 310, y: 170}] : complex ? [{x: 94, y: 103}, {x: 222, y: 63}, {x: 343, y: 103}, {x: 156, y: 180}, {x: 284, y: 180}] : [{x: 150, y: 145}, {x: 294, y: 145}];
  return <svg className={className} viewBox="0 0 440 250" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${scenario.name}: ${variant} illustration`}>
    <defs>
      <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={complex ? '#112b4d' : monitoring ? '#e0f5ef' : '#e7f1ff'} /><stop offset="1" stopColor={complex ? '#07182e' : monitoring ? '#f4fcf9' : '#f7fbff'} /></linearGradient>
      <pattern id={`${id}-grid`} width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill={complex ? '#466283' : monitoring ? '#8fc5b5' : '#afc6e4'} opacity=".4" /></pattern>
      <filter id={`${id}-glow`}><feGaussianBlur stdDeviation="12" /></filter>
    </defs>
    <rect width="440" height="250" fill={`url(#${id}-bg)`} />
    <rect width="440" height="250" fill={`url(#${id}-grid)`} />
    <ellipse cx="220" cy="133" rx="130" ry="70" fill={complex ? '#1379f0' : monitoring ? '#42b392' : '#77abf1'} opacity=".12" filter={`url(#${id}-glow)`} />
    {nodes.map((node, i) => <path key={`line-${i}`} d={`M220 116 L${node.x} ${node.y}`} stroke={complex ? '#4d98f2' : monitoring ? '#79b9a6' : '#8fb3e2'} strokeWidth="1.3" />)}
    <path d="m220 76 36 20v40l-36 20-36-20V96z" fill={complex ? '#112f52' : '#fff'} stroke={complex ? '#5babff' : monitoring ? '#58a991' : '#6fa6ec'} />
    <path d="m220 89 23 13v27l-23 13-23-13v-27z M197 102l23 13 23-13 M220 115v27" fill="none" stroke={complex ? '#83c2ff' : monitoring ? '#168366' : '#2c7bdd'} strokeWidth="1.4" />
    {nodes.map((node, i) => <g key={i} transform={`translate(${node.x},${node.y})`}>
      <rect x="-18" y="-16" width="36" height="31" rx="5" fill={complex ? '#153456' : '#fff'} stroke={complex ? '#568ec9' : monitoring ? '#89c3b2' : '#90b7e7'} />
      <rect x="-9" y="-8" width="18" height="12" rx="1" fill="none" stroke={complex ? '#91c6ff' : monitoring ? '#258e74' : '#4588dc'} />
      <path d="M-5 9h10 M0 4v5" stroke={complex ? '#91c6ff' : monitoring ? '#258e74' : '#4588dc'} />
      <circle cx="14" cy="-13" r="3" fill="#4ccda0" />
    </g>)}
    <circle cx="418" cy="22" r="3" fill="#4ccda0" />
  </svg>;
}
