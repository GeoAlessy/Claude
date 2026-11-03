import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';

// Escena dibujada por código (atardecer en la playa con dos niños a contraluz).
// Sirve para probar el filtro de película antigua sin depender de clips descargados.
export const PlayaDibujada: React.FC = () => {
  const f = useCurrentFrame();
  const ola = (y: number, a: number, fase: number) =>
    `M0 ${y} ` + Array.from({length: 25}, (_, i) => `L${i * 80} ${y + Math.sin(i * 0.8 + f * 0.05 + fase) * a}`).join(' ') + ` L1920 1080 L0 1080 Z`;
  const salto = Math.abs(Math.sin(f * 0.09)) * 30;
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <defs>
          <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b4a7a" />
            <stop offset="55%" stopColor="#e7a46b" />
            <stop offset="100%" stopColor="#f6d39a" />
          </linearGradient>
          <radialGradient id="sol">
            <stop offset="0%" stopColor="#fff4d6" />
            <stop offset="100%" stopColor="#fff4d6" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#cielo)" />
        <circle cx={1180} cy={560} r={260} fill="url(#sol)" />
        <circle cx={1180} cy={560} r={80} fill="#fff1cf" />
        <path d={ola(600, 6, 0)} fill="#6f7fa8" />
        <path d={ola(650, 8, 1.5)} fill="#8a8fae" opacity={0.85} />
        <path d="M0 760 Q960 700 1920 770 L1920 1080 L0 1080 Z" fill="#d9b98a" />
        {/* dos niños a contraluz corriendo hacia el mar */}
        <g fill="#2a2230" transform={`translate(${700 + f * 1.6}, ${0})`}>
          <circle cx={0} cy={720 - salto} r={18} />
          <rect x={-14} y={738 - salto} width={28} height={60} rx={10} />
          <rect x={-12} y={796 - salto} width={9} height={42} rx={4} transform={`rotate(${Math.sin(f * 0.3) * 25} -8 ${796 - salto})`} />
          <rect x={3} y={796 - salto} width={9} height={42} rx={4} transform={`rotate(${-Math.sin(f * 0.3) * 25} 8 ${796 - salto})`} />
        </g>
        <g fill="#2a2230" transform={`translate(${560 + f * 1.4}, 0)`}>
          <circle cx={0} cy={740} r={15} />
          <rect x={-12} y={755} width={24} height={50} rx={9} />
          <rect x={-10} y={803} width={8} height={36} rx={4} transform={`rotate(${Math.sin(f * 0.33 + 1) * 25} -6 803)`} />
          <rect x={2} y={803} width={8} height={36} rx={4} transform={`rotate(${-Math.sin(f * 0.33 + 1) * 25} 6 803)`} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
