import React from 'react';
import {C, LINEA} from '../estilo';

/** Reloj de pared; `vueltas` controla las agujas (el tiempo vuela). */
export const Reloj: React.FC<{x: number; y: number; r?: number; minutos: number}> = ({x, y, r = 110, minutos}) => {
  const aMin = (minutos % 60) * 6;
  const aHor = ((minutos / 60) % 12) * 30;
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r={r + 14} fill="#2E5EAA" stroke={C.linea} strokeWidth={LINEA} />
      <circle r={r} fill="#FFF8EC" stroke={C.linea} strokeWidth={LINEA * 0.7} />
      {Array.from({length: 12}).map((_, i) => (
        <line key={i} x1={0} y1={-r + 12} x2={0} y2={-r + (i % 3 === 0 ? 34 : 22)} stroke={C.linea} strokeWidth={i % 3 === 0 ? 8 : 5} strokeLinecap="round" transform={`rotate(${i * 30})`} />
      ))}
      <line x1={0} y1={10} x2={0} y2={-r * 0.5} stroke={C.linea} strokeWidth={12} strokeLinecap="round" transform={`rotate(${aHor})`} />
      <line x1={0} y1={14} x2={0} y2={-r * 0.78} stroke={C.rojo} strokeWidth={8} strokeLinecap="round" transform={`rotate(${aMin})`} />
      <circle r={10} fill={C.linea} />
    </g>
  );
};
