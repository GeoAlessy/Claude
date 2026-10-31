import React from 'react';
import {C, LINEA} from '../estilo';

const S = {stroke: C.linea, strokeWidth: LINEA, strokeLinejoin: 'round' as const};
/** Sofá de 3 cuerpos. (x,y) = centro del borde inferior. */
export const Sofa: React.FC<{x: number; y: number; escala?: number; color?: string; sombra?: string}> = ({
  x,
  y,
  escala = 1,
  color = '#2A9D8F',
  sombra = '#1F7A6F',
}) => (
  <g transform={`translate(${x},${y}) scale(${escala})`}>
    <ellipse cx={0} cy={6} rx={300} ry={22} fill="#000" opacity={0.15} />
    {/* patas */}
    <rect x={-250} y={-20} width={26} height={26} rx={6} fill="#6B4226" {...S} />
    <rect x={224} y={-20} width={26} height={26} rx={6} fill="#6B4226" {...S} />
    {/* respaldo */}
    <path d="M-250,-200 Q-252,-372 -200,-380 L200,-380 Q252,-372 250,-200 Z" fill={color} {...S} />
    <path d="M-120,-360 Q-118,-260 -112,-215 M120,-360 Q118,-260 112,-215" stroke={sombra} strokeWidth={6} fill="none" />
    {/* asiento */}
    <path d="M-262,-210 L262,-210 Q276,-120 262,-20 L-262,-20 Q-276,-120 -262,-210 Z" fill={color} {...S} />
    <path d="M-250,-150 L250,-150" stroke={sombra} strokeWidth={6} />
    <path d="M-88,-210 L-88,-150 M88,-210 L88,-150" stroke={sombra} strokeWidth={6} />
    {/* brazos */}
    <path d="M-300,-260 Q-320,-280 -290,-300 Q-240,-310 -232,-270 L-232,-20 L-296,-20 Q-306,-140 -300,-260 Z" fill={color} {...S} />
    <path d="M300,-260 Q320,-280 290,-300 Q240,-310 232,-270 L232,-20 L296,-20 Q306,-140 300,-260 Z" fill={color} {...S} />
    {/* cojín */}
    <path d="M-220,-330 Q-150,-350 -140,-290 Q-150,-230 -220,-240 Q-236,-290 -220,-330 Z" fill="#F2B705" {...S} transform="rotate(-8,-180,-285)" />
    <circle cx={-182} cy={-288} r={6} fill={C.linea} />
  </g>
);
