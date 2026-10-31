import React from 'react';
import {C, LINEA} from '../estilo';

const S = {stroke: C.linea, strokeWidth: LINEA, strokeLinejoin: 'round' as const};
export const PARQUE_PISO = 1380;

const Arbol: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = '#6A994E'}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <rect x={-22} y={-260} width={44} height={260} fill="#7A4A2A" {...S} />
    <circle cx={0} cy={-330} r={130} fill={color} {...S} />
    <circle cx={-90} cy={-260} r={80} fill={color} {...S} />
    <circle cx={90} cy={-270} r={86} fill={color} {...S} />
    <circle cx={-40} cy={-380} r={30} fill="#fff" opacity={0.15} />
  </g>
);

/** Parque (mundo 1080×1920). */
export const Parque: React.FC<{frame: number}> = ({frame}) => (
  <g>
    <rect x={-400} y={-200} width={1880} height={PARQUE_PISO + 200} fill="#FFC9A8" />
    <rect x={-400} y={500} width={1880} height={600} fill="#FFDDBE" />
    <circle cx={250} cy={360} r={100} fill="#FF9F6B" opacity={0.85} />
    {/* edificios lejanos */}
    {[[-100, 780, 160], [100, 700, 130], [600, 740, 170], [820, 660, 140]].map(([x, y, w], i) => (
      <rect key={i} x={x} y={y} width={w} height={1100 - y} fill="#C9A6D8" opacity={0.7} />
    ))}
    <rect x={-400} y={1000} width={1880} height={PARQUE_PISO} fill="#8CC66B" />
    <Arbol x={-40} y={1180} s={1.1} />
    <Arbol x={900} y={1150} s={0.95} color="#5C8F45" />
    <Arbol x={480} y={1050} s={0.6} color="#7DB35C" />
    {/* farol */}
    <rect x={760} y={760} width={16} height={460} fill={C.linea} />
    <path d="M730,760 L806,760 L790,700 L746,700 Z" fill={C.brillo} {...S} />
    {/* banca */}
    <g transform="translate(160,1240)">
      <rect x={-140} y={-110} width={280} height={24} rx={8} fill="#C98B4F" {...S} />
      <rect x={-140} y={-70} width={280} height={24} rx={8} fill="#C98B4F" {...S} />
      <rect x={-120} y={-46} width={16} height={60} fill={C.linea} />
      <rect x={104} y={-46} width={16} height={60} fill={C.linea} />
    </g>
    {/* camino */}
    <path d="M-400,1500 Q540,1300 1480,1500 L1480,1920 L-400,1920 Z" fill="#E8D3A8" {...S} />
    {/* flores */}
    {Array.from({length: 12}).map((_, i) => (
      <circle key={i} cx={-300 + i * 150 + (i % 3) * 20} cy={1350 + (i % 2) * 40} r={12} fill={['#FF6B8A', '#FFD60A', '#FFF3E0'][i % 3]} stroke={C.linea} strokeWidth={3} />
    ))}
    {/* hojitas que caen */}
    {[0, 1, 2].map((i) => {
      const t = ((frame + i * 23) % 70) / 70;
      return <ellipse key={i} cx={300 + i * 220 + Math.sin(t * 6) * 30} cy={600 + t * 700} rx={12} ry={7} fill="#E9A23B" transform={`rotate(${t * 360},${300 + i * 220},${600 + t * 700})`} />;
    })}
  </g>
);
