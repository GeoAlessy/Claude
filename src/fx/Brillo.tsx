import React from 'react';
import {interpolate} from 'remotion';
import {C} from '../estilo';
import {clamp} from '../anim';

const estrella = 'M0,-60 C6,-14 14,-6 60,0 C14,6 6,14 0,60 C-6,14 -14,6 -60,0 C-14,-6 -6,-14 0,-60 Z';

/** Destello ✨ dibujado con código. t = frames desde el inicio. */
export const Brillo: React.FC<{x: number; y: number; t: number; escala?: number}> = ({x, y, t, escala = 1}) => {
  if (t < 0 || t > 40) return null;
  const s = interpolate(t, [0, 6, 14, 40], [0, 1.4, 1, 0], clamp);
  return (
    <g transform={`translate(${x},${y}) scale(${escala})`}>
      <circle r={110 * s} fill={C.brillo} opacity={0.25 * s} />
      <path d={estrella} fill="#fff" stroke={C.brillo} strokeWidth={6} transform={`rotate(${t * 4}) scale(${s})`} />
      <path d={estrella} fill={C.brillo} transform={`translate(80,-70) rotate(${-t * 6}) scale(${s * 0.45})`} />
      <path d={estrella} fill="#fff" transform={`translate(-70,60) rotate(${t * 5}) scale(${s * 0.3})`} />
    </g>
  );
};
