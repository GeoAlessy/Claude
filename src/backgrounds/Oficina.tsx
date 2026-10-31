import React from 'react';
import {C, LINEA} from '../estilo';
import {Reloj} from '../props/Reloj';

const S = {stroke: C.linea, strokeWidth: LINEA, strokeLinejoin: 'round' as const};
export const OFICINA_PISO = 1420;

/** Oficina (mundo 1080×1920). Reloj de pared en (300,470). */
export const Oficina: React.FC<{frame: number; minutos: number}> = ({minutos}) => (
  <g>
    <rect x={-400} y={-200} width={1880} height={OFICINA_PISO + 200} fill="#CFDCE6" />
    <rect x={-400} y={900} width={1880} height={OFICINA_PISO - 900} fill="#B8C9D6" />
    <line x1={-400} x2={1480} y1={900} y2={900} stroke="#9FB2C2" strokeWidth={8} />
    {/* ventana con ciudad */}
    <rect x={560} y={260} width={420} height={480} rx={8} fill="#FFD9A8" {...S} />
    {[[580, 520, 70], [660, 440, 90], [760, 560, 60], [830, 400, 110], [920, 500, 60]].map(([x, y, w], i) => (
      <g key={i}>
        <rect x={x} y={y} width={w} height={740 - y} fill="#7E5BA6" opacity={0.75} />
        {Array.from({length: 4}).map((_, j) => (
          <rect key={j} x={x + 12} y={y + 20 + j * 50} width={w - 24} height={14} fill={C.brillo} opacity={0.7} />
        ))}
      </g>
    ))}
    <rect x={560} y={260} width={420} height={480} rx={8} fill="none" stroke="#FFFFFF" strokeWidth={18} />
    <rect x={560} y={260} width={420} height={480} rx={8} fill="none" {...S} />
    <line x1={770} x2={770} y1={260} y2={740} stroke="#fff" strokeWidth={12} />
    <Reloj x={300} y={470} r={120} minutos={minutos} />
    {/* tablero con gráfico */}
    <rect x={-120} y={620} width={260} height={200} rx={8} fill="#fff" {...S} />
    <path d="M-90,780 L-40,730 L10,760 L60,680 L110,700" stroke={C.rojo} strokeWidth={8} fill="none" strokeLinecap="round" />
    {/* piso */}
    <rect x={-400} y={OFICINA_PISO} width={1880} height={600} fill="#8E9AAF" />
    <line x1={-400} x2={1480} y1={OFICINA_PISO} y2={OFICINA_PISO} stroke={C.linea} strokeWidth={LINEA} />
    {/* escritorio */}
    <rect x={520} y={1120} width={520} height={34} rx={8} fill="#A0673A" {...S} />
    <rect x={560} y={1150} width={40} height={OFICINA_PISO - 1150} fill="#7A4A2A" {...S} />
    <rect x={960} y={1150} width={40} height={OFICINA_PISO - 1150} fill="#7A4A2A" {...S} />
    <rect x={640} y={940} width={240} height={160} rx={12} fill="#3A3F4B" {...S} />
    <rect x={656} y={956} width={208} height={128} rx={6} fill="#5FA8D3" />
    <rect x={740} y={1100} width={40} height={24} fill="#3A3F4B" {...S} />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={890} y={1090 - i * 22} width={110} height={22} fill="#FFF8EC" {...S} transform={`rotate(${(i % 2 ? 3 : -3)},945,${1100 - i * 22})`} />
    ))}
  </g>
);
