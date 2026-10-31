import React from 'react';
import {interpolate, spring} from 'remotion';
import {C} from '../estilo';
import {clamp} from '../anim';
import {FUENTE} from '../fuentes';

/** Contador rojo brillante "−1 AÑO" que rebota y sube. t = frames desde el "ya voy". */
export const MenosUnAno: React.FC<{x: number; y: number; t: number; fps: number; escala?: number}> = ({x, y, t, fps, escala = 1}) => {
  if (t < 0 || t > 44) return null;
  const pop = spring({frame: t, fps, config: {damping: 7, stiffness: 180, mass: 0.6}});
  const sube = interpolate(t, [6, 44], [0, -170], clamp);
  const alpha = interpolate(t, [32, 44], [1, 0], clamp);
  const rot = Math.sin(t * 0.5) * 5 * (1 - t / 44);
  return (
    <g transform={`translate(${x},${y + sube}) rotate(${rot}) scale(${pop * escala})`} opacity={alpha}>
      <rect x={-200} y={-78} width={400} height={146} rx={44} fill={C.brillo} opacity={0.35} />
      <rect x={-178} y={-66} width={356} height={122} rx={34} fill={C.rojo} stroke={C.linea} strokeWidth={8} />
      <rect x={-160} y={-56} width={320} height={28} rx={14} fill="#fff" opacity={0.25} />
      <text x={0} y={30} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={94} fill="#fff" stroke={C.linea} strokeWidth={14} paintOrder="stroke" strokeLinejoin="round">
        −1 AÑO
      </text>
      {[[-200, -70], [200, -60], [-170, 70], [190, 60]].map(([sx, sy], i) => (
        <path key={i} d="M0,-16 L4,-4 L16,0 L4,4 L0,16 L-4,4 L-16,0 L-4,-4 Z" fill={C.brillo} transform={`translate(${sx},${sy}) scale(${1 + 0.4 * Math.sin(t * 0.8 + i)})`} />
      ))}
    </g>
  );
};

/** Marcador de edad "EDAD 25" con número que gira (tipo tragamonedas). */
export const MarcadorEdad: React.FC<{x: number; y: number; edad: number; escala?: number; etiqueta?: string}> = ({x, y, edad, escala = 1, etiqueta = 'EDAD'}) => {
  const n = Math.floor(edad);
  const frac = edad - n;
  const h = 120;
  return (
    <g transform={`translate(${x},${y}) scale(${escala})`}>
      <rect x={-230} y={-80} width={460} height={160} rx={40} fill={C.linea} />
      <rect x={-222} y={-72} width={444} height={144} rx={34} fill="#FFF3E0" />
      <text x={-110} y={22} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={62} fill={C.linea}>
        {etiqueta}
      </text>
      <defs>
        <clipPath id={`edad-clip-${etiqueta}`}>
          <rect x={-10} y={-62} width={210} height={124} rx={20} />
        </clipPath>
      </defs>
      <rect x={-10} y={-62} width={210} height={124} rx={20} fill={C.rojo} />
      <g clipPath={`url(#edad-clip-${etiqueta})`}>
        {[n, n + 1].map((v, i) => (
          <text
            key={v}
            x={95}
            y={40 + (i - frac) * h}
            textAnchor="middle"
            fontFamily={FUENTE}
            fontWeight={800}
            fontSize={110}
            fill="#fff"
            stroke={C.linea}
            strokeWidth={10}
            paintOrder="stroke"
          >
            {v}
          </text>
        ))}
      </g>
      <rect x={-10} y={-62} width={210} height={124} rx={20} fill="none" stroke={C.linea} strokeWidth={8} />
    </g>
  );
};
