import React from 'react';
import {C, LINEA} from '../estilo';

const S = {stroke: C.linea, strokeWidth: LINEA, strokeLinejoin: 'round' as const};
export const CALLE_VEREDA = 1400;

const Casa: React.FC<{x: number; w: number; h: number; color: string; techo: string; puerta?: string}> = ({x, w, h, color, techo, puerta = '#7A4A2A'}) => (
  <g>
    <rect x={x} y={CALLE_VEREDA - h} width={w} height={h} fill={color} {...S} />
    <rect x={x - 12} y={CALLE_VEREDA - h - 24} width={w + 24} height={30} fill={techo} {...S} />
    <rect x={x + w * 0.38} y={CALLE_VEREDA - 220} width={w * 0.24} height={220} rx={8} fill={puerta} {...S} />
    {[0.12, 0.66].map((p) => (
      <g key={p}>
        <rect x={x + w * p} y={CALLE_VEREDA - h + 70} width={w * 0.22} height={110} rx={8} fill="#BFE7FA" {...S} />
        <rect x={x + w * p - 8} y={CALLE_VEREDA - h + 180} width={w * 0.22 + 16} height={16} rx={6} fill="#FFF3E0" {...S} />
        {h > 520 && <rect x={x + w * p} y={CALLE_VEREDA - h + 260} width={w * 0.22} height={110} rx={8} fill="#BFE7FA" {...S} />}
      </g>
    ))}
  </g>
);

/** Calle de barrio (mundo 1080×1920). */
export const Calle: React.FC<{frame: number}> = ({frame}) => (
  <g>
    <rect x={-400} y={-200} width={1880} height={CALLE_VEREDA + 200} fill="#8FD3F7" />
    <rect x={-400} y={500} width={1880} height={500} fill="#BDE8FB" />
    <circle cx={800} cy={300} r={90} fill={C.brillo} opacity={0.9} />
    <circle cx={800} cy={300} r={130} fill={C.brillo} opacity={0.2} />
    <ellipse cx={200 + ((frame * 0.6) % 300)} cy={260} rx={80} ry={30} fill="#fff" />
    <ellipse cx={250 + ((frame * 0.6) % 300)} cy={240} rx={50} ry={30} fill="#fff" />
    <Casa x={-180} w={360} h={620} color="#F28DA6" techo="#B5485F" />
    <Casa x={200} w={330} h={500} color="#7FC8A9" techo="#3E8E6E" puerta="#2E5EAA" />
    <Casa x={550} w={380} h={680} color="#FFC857" techo="#C98B4F" />
    <Casa x={950} w={360} h={540} color="#8EC5FF" techo="#2E5EAA" />
    {/* cables */}
    <path d="M-400,420 Q300,520 1480,400" stroke={C.linea} strokeWidth={4} fill="none" />
    <path d="M-400,460 Q300,560 1480,440" stroke={C.linea} strokeWidth={4} fill="none" />
    <rect x={160} y={300} width={22} height={CALLE_VEREDA - 300} fill="#9C8F80" {...S} />
    {/* vereda y pista */}
    <rect x={-400} y={CALLE_VEREDA} width={1880} height={120} fill="#D9CFC0" {...S} />
    {Array.from({length: 14}).map((_, i) => (
      <line key={i} x1={-400 + i * 140} x2={-400 + i * 140} y1={CALLE_VEREDA} y2={CALLE_VEREDA + 120} stroke="#BFB3A3" strokeWidth={5} />
    ))}
    <rect x={-400} y={CALLE_VEREDA + 120} width={1880} height={500} fill="#6C6C78" />
    {Array.from({length: 8}).map((_, i) => (
      <rect key={i} x={-380 + i * 260} y={CALLE_VEREDA + 300} width={140} height={20} rx={10} fill="#FFF3E0" />
    ))}
  </g>
);
