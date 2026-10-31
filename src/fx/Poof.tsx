import React from 'react';
import {interpolate, random} from 'remotion';
import {C, LINEA} from '../estilo';
import {clamp} from '../anim';

/** Nube "poof" de partículas. t = frames desde que empezó. Coordenadas de pantalla. */
export const Poof: React.FC<{x: number; y: number; t: number; escala?: number; seed?: number}> = ({x, y, t, escala = 1, seed = 1}) => {
  if (t < 0 || t > 26) return null;
  const n = 14;
  const prog = interpolate(t, [0, 22], [0, 1], {...clamp, easing: (v) => 1 - Math.pow(1 - v, 3)});
  const alpha = interpolate(t, [14, 26], [1, 0], clamp);
  return (
    <g transform={`translate(${x},${y}) scale(${escala})`} opacity={alpha}>
      {Array.from({length: n}).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + random(`pa${seed}-${i}`) * 0.5;
        const dist = 70 + random(`pd${seed}-${i}`) * 110;
        const r = (34 + random(`pr${seed}-${i}`) * 34) * interpolate(t, [0, 6, 26], [0.3, 1.1, 0.5], clamp);
        return (
          <circle
            key={i}
            cx={Math.cos(a) * dist * prog}
            cy={Math.sin(a) * dist * prog * 0.8 - prog * 40}
            r={r}
            fill={i % 3 === 0 ? '#FFF3E0' : '#FFFFFF'}
            stroke={C.linea}
            strokeWidth={LINEA * 0.8}
          />
        );
      })}
      <circle cx={0} cy={-prog * 30} r={70 * interpolate(t, [0, 5, 20], [0.2, 1.2, 0.6], clamp)} fill="#fff" stroke={C.linea} strokeWidth={LINEA} />
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + 0.6;
        const d = 180 * prog;
        return (
          <path
            key={`s${i}`}
            d="M0,-18 L5,-5 L18,0 L5,5 L0,18 L-5,5 L-18,0 L-5,-5 Z"
            fill={C.brillo}
            stroke={C.linea}
            strokeWidth={3}
            transform={`translate(${Math.cos(a) * d},${Math.sin(a) * d}) scale(${1.5 - prog})`}
          />
        );
      })}
    </g>
  );
};
