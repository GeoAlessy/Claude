import React from 'react';
import {C, LINEA} from '../estilo';

export const Pelota: React.FC<{x: number; y: number; r?: number; rot?: number}> = ({x, y, r = 46, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <circle r={r} fill="#fff" stroke={C.linea} strokeWidth={LINEA} />
    <path d={`M0,${-r * 0.32} L${r * 0.3},${-r * 0.1} L${r * 0.19},${r * 0.26} L${-r * 0.19},${r * 0.26} L${-r * 0.3},${-r * 0.1} Z`} fill={C.linea} />
    {[0, 72, 144, 216, 288].map((a) => (
      <line key={a} x1={0} y1={-r * 0.32} x2={0} y2={-r * 0.95} stroke={C.linea} strokeWidth={4} transform={`rotate(${a})`} />
    ))}
  </g>
);

export const Entradas: React.FC<{x: number; y: number; rot?: number}> = ({x, y, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    {[-14, 10].map((r, i) => (
      <g key={i} transform={`rotate(${r}) translate(${i * 18},${-i * 6})`}>
        <path d="M-60,-30 L60,-30 L60,-10 A10,10 0 0 0 60,10 L60,30 L-60,30 L-60,10 A10,10 0 0 0 -60,-10 Z" fill={i ? '#FFD60A' : '#FF8FA3'} stroke={C.linea} strokeWidth={5} />
        <line x1={24} y1={-24} x2={24} y2={24} stroke={C.linea} strokeWidth={3} strokeDasharray="6 5" />
        <path d="M-40,-8 l14,8 l-14,8 Z" fill={C.linea} />
        <rect x={-18} y={-6} width={32} height={5} rx={2} fill={C.linea} />
        <rect x={-18} y={4} width={22} height={5} rx={2} fill={C.linea} />
      </g>
    ))}
  </g>
);
