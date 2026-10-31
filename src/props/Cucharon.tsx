import React from 'react';
import {C, LINEA} from '../estilo';

/** Cucharón de madera. Origen = punto de agarre (mano). rot en grados, 0 = apuntando hacia arriba. */
export const Cucharon: React.FC<{x: number; y: number; rot?: number; escala?: number}> = ({x, y, rot = 0, escala = 1}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${escala})`}>
    <rect x={-10} y={-190} width={20} height={230} rx={10} fill={C.madera} stroke={C.linea} strokeWidth={LINEA} />
    <line x1={-2} y1={-170} x2={-2} y2={20} stroke={C.maderaSombra} strokeWidth={4} strokeLinecap="round" opacity={0.6} />
    <ellipse cx={0} cy={-225} rx={42} ry={52} fill={C.madera} stroke={C.linea} strokeWidth={LINEA} />
    <ellipse cx={0} cy={-228} rx={26} ry={34} fill={C.maderaSombra} opacity={0.55} />
    <ellipse cx={-12} cy={-245} rx={7} ry={12} fill="#fff" opacity={0.45} />
  </g>
);
