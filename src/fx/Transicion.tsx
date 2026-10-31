import React from 'react';
import {interpolate} from 'remotion';
import {C} from '../estilo';
import {clamp} from '../anim';

/** Barrido diagonal entre escenas (centrado en el corte). t = frames relativos al corte (−5..+5). */
export const Barrido: React.FC<{t: number; color?: string}> = ({t, color = C.polo}) => {
  if (t < -6 || t > 6) return null;
  const x = interpolate(t, [-6, 6], [-1700, 1700], clamp);
  return (
    <g transform={`translate(${x},0) skewX(-18)`}>
      <rect x={-700} y={-200} width={1400} height={2400} fill={color} />
      <rect x={-760} y={-200} width={40} height={2400} fill="#fff" opacity={0.7} />
      <rect x={720} y={-200} width={60} height={2400} fill={C.linea} opacity={0.5} />
    </g>
  );
};

/** Iris circular que revela la escena (para el loop). p 0..1 */
export const Iris: React.FC<{p: number; color: string}> = ({p, color}) => {
  const r = interpolate(p, [0, 1], [0, 1250], clamp);
  return (
    <path
      d={`M-10,-10 H1090 V1930 H-10 Z M${540 - r},960 a${r},${r} 0 1,0 ${2 * r},0 a${r},${r} 0 1,0 ${-2 * r},0 Z`}
      fill={color}
      fillRule="evenodd"
    />
  );
};
