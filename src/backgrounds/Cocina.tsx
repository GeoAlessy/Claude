import React from 'react';
import {C, LINEA} from '../estilo';

const S = {stroke: C.linea, strokeWidth: LINEA, strokeLinejoin: 'round' as const};
export const COCINA_PISO = 1560;

/** Cocina (mundo 1080×1920). Cocina/estufa en x 560–880, tope a y=1150. */
export const Cocina: React.FC<{frame: number}> = ({frame}) => (
  <g>
    <rect x={-400} y={-200} width={1880} height={COCINA_PISO + 200} fill={C.pared} />
    {/* azulejos */}
    <rect x={-400} y={700} width={1880} height={450} fill="#9FD3C7" />
    {Array.from({length: 10}).map((_, i) => (
      <line key={`h${i}`} x1={-400} x2={1480} y1={700 + i * 56} y2={700 + i * 56} stroke="#E4F5F0" strokeWidth={5} />
    ))}
    {Array.from({length: 34}).map((_, i) => (
      <line key={`v${i}`} x1={-400 + i * 56} x2={-400 + i * 56} y1={700} y2={1150} stroke="#E4F5F0" strokeWidth={5} />
    ))}
    {/* alacenas superiores */}
    <rect x={-60} y={150} width={500} height={380} rx={12} fill={C.madera} {...S} />
    <line x1={190} x2={190} y1={150} y2={530} stroke={C.linea} strokeWidth={LINEA} />
    <circle cx={170} cy={440} r={10} fill={C.linea} />
    <circle cx={210} cy={440} r={10} fill={C.linea} />
    {/* ventana con maceta */}
    <rect x={560} y={260} width={340} height={300} rx={10} fill="#BFE7FA" {...S} />
    <circle cx={820} cy={340} r={40} fill={C.brillo} opacity={0.9} />
    <line x1={730} x2={730} y1={260} y2={560} stroke="#FFF3E0" strokeWidth={14} />
    <rect x={560} y={260} width={340} height={300} rx={10} fill="none" stroke="#FFF3E0" strokeWidth={18} />
    <rect x={560} y={260} width={340} height={300} rx={10} fill="none" {...S} />
    <rect x={540} y={556} width={380} height={24} rx={8} fill="#FFF3E0" {...S} />
    <path d="M600,556 L640,556 L634,510 L606,510 Z" fill="#C8553D" {...S} />
    <circle cx={620} cy={490} r={26} fill="#6A994E" {...S} />
    {/* utensilios colgados */}
    <line x1={120} x2={480} y1={640} y2={640} stroke="#7A4A2A" strokeWidth={12} strokeLinecap="round" />
    <g transform="translate(180,640)">
      <line x1={0} y1={0} x2={0} y2={30} stroke={C.linea} strokeWidth={5} />
      <circle cx={0} cy={86} r={56} fill="#3A3F4B" {...S} />
      <rect x={-8} y={20} width={16} height={20} fill="#3A3F4B" />
    </g>
    <g transform="translate(330,640)">
      <line x1={0} y1={0} x2={0} y2={20} stroke={C.linea} strokeWidth={5} />
      <rect x={-8} y={20} width={16} height={110} rx={8} fill={C.madera} {...S} />
      <rect x={-26} y={120} width={52} height={50} rx={10} fill={C.madera} {...S} />
    </g>
    <g transform="translate(420,640)">
      <line x1={0} y1={0} x2={0} y2={20} stroke={C.linea} strokeWidth={5} />
      <rect x={-7} y={20} width={14} height={100} rx={7} fill="#B8C4CC" {...S} />
      <ellipse cx={0} cy={140} rx={24} ry={30} fill="#B8C4CC" {...S} />
    </g>
    {/* mueble bajo + mesada */}
    <rect x={-400} y={1150} width={960} height={COCINA_PISO - 1150} fill={C.madera} {...S} />
    {[-300, -60, 180, 420].map((x) => (
      <g key={x}>
        <rect x={x} y={1200} width={200} height={300} rx={10} fill="#D9A066" {...S} />
        <rect x={x + 80} y={1230} width={40} height={10} rx={5} fill={C.linea} />
      </g>
    ))}
    <rect x={-400} y={1126} width={960} height={36} rx={6} fill="#EDE6D6" {...S} />
    {/* estufa */}
    <rect x={560} y={1150} width={330} height={COCINA_PISO - 1150} rx={8} fill="#F4F1EA" {...S} />
    <rect x={590} y={1250} width={270} height={220} rx={14} fill="#3A3F4B" {...S} />
    <rect x={610} y={1270} width={230} height={70} rx={10} fill="#FFB347" opacity={0.4 + 0.1 * Math.sin(frame / 5)} />
    {[620, 680, 740, 800].map((x) => (
      <circle key={x} cx={x + 15} cy={1198} r={16} fill="#3A3F4B" {...S} />
    ))}
    <rect x={548} y={1126} width={354} height={36} rx={6} fill="#D7DCE0" {...S} />
    {/* piso */}
    <rect x={-400} y={COCINA_PISO} width={1880} height={600} fill="#E9D8B8" />
    {Array.from({length: 20}).map((_, i) =>
      Array.from({length: 6}).map((__, j) =>
        (i + j) % 2 === 0 ? <rect key={`${i}-${j}`} x={-400 + i * 100} y={COCINA_PISO + j * 100} width={100} height={100} fill="#D9BFA0" /> : null,
      ),
    )}
    <line x1={-400} x2={1480} y1={COCINA_PISO} y2={COCINA_PISO} stroke={C.linea} strokeWidth={LINEA} />
  </g>
);
