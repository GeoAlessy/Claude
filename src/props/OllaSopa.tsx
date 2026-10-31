import React from 'react';
import {C, LINEA} from '../estilo';

/** Olla con vapor animado. (x,y) = centro de la base. */
export const OllaSopa: React.FC<{x: number; y: number; escala?: number; frame: number; vibra?: number}> = ({x, y, escala = 1, frame, vibra = 0}) => {
  const dx = Math.sin(frame * 2.3) * 6 * vibra;
  return (
    <g transform={`translate(${x + dx},${y}) scale(${escala})`}>
      {/* vapor */}
      {[0, 1, 2].map((i) => {
        const t = ((frame + i * 20) % 60) / 60;
        return (
          <path
            key={i}
            d={`M${-40 + i * 40},${-190 - t * 120} q20,-30 0,-60 q-20,-30 0,-60`}
            stroke="#fff"
            strokeWidth={14}
            fill="none"
            strokeLinecap="round"
            opacity={Math.sin(t * Math.PI) * 0.75}
          />
        );
      })}
      <path d="M-130,-170 L130,-170 L118,-10 Q0,6 -118,-10 Z" fill="#B8C4CC" stroke={C.linea} strokeWidth={LINEA} strokeLinejoin="round" />
      <path d="M-120,-120 Q0,-108 120,-120" stroke="#8D9AA3" strokeWidth={7} fill="none" />
      <path d="M-100,-150 L-96,-30" stroke="#fff" strokeWidth={10} strokeLinecap="round" opacity={0.5} />
      {/* asas */}
      <path d="M-130,-150 Q-172,-150 -168,-118 Q-164,-96 -126,-104" fill="none" stroke={C.linea} strokeWidth={16} strokeLinecap="round" />
      <path d="M130,-150 Q172,-150 168,-118 Q164,-96 126,-104" fill="none" stroke={C.linea} strokeWidth={16} strokeLinecap="round" />
      {/* borde y sopa */}
      <ellipse cx={0} cy={-170} rx={140} ry={28} fill="#D9E1E6" stroke={C.linea} strokeWidth={LINEA} />
      <ellipse cx={0} cy={-168} rx={118} ry={18} fill="#E9A23B" />
      <circle cx={-40} cy={-170} r={9} fill="#FF7A45" />
      <circle cx={30} cy={-166} r={8} fill="#7BC043" />
      <circle cx={60} cy={-172} r={6} fill="#FFF3E0" />
    </g>
  );
};
