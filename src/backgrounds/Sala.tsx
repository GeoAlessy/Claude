import React from 'react';
import {C, LINEA} from '../estilo';

const S = {stroke: C.linea, strokeWidth: LINEA, strokeLinejoin: 'round' as const};
export const SALA_PISO = 1310;

/** Sala (mundo 1080×1920). La puerta de la cocina está a la izquierda (x 110–340). */
export const Sala: React.FC<{frame: number; telarana?: number}> = ({frame, telarana = 0}) => {
  const nube = (frame * 0.4) % 500;
  return (
    <g>
      <rect x={-400} y={-200} width={1880} height={SALA_PISO + 200} fill={C.pared} />
      {Array.from({length: 18}).map((_, i) => (
        <rect key={i} x={-400 + i * 120} y={-200} width={50} height={SALA_PISO + 200} fill="#F9D0A0" opacity={0.55} />
      ))}
      <rect x={-400} y={-200} width={1880} height={250} fill="#EDB57C" />
      <rect x={-400} y={40} width={1880} height={18} fill="#E09F63" />
      {/* piso de madera */}
      <rect x={-400} y={SALA_PISO} width={1880} height={900} fill={C.piso} />
      {Array.from({length: 7}).map((_, i) => (
        <g key={i}>
          <line x1={-400} x2={1480} y1={SALA_PISO + 60 + i * 95} y2={SALA_PISO + 60 + i * 95} stroke="#B36F3C" strokeWidth={5} />
          {Array.from({length: 6}).map((__, j) => (
            <line key={j} x1={-300 + j * 330 + (i % 2) * 160} x2={-300 + j * 330 + (i % 2) * 160} y1={SALA_PISO + i * 95 + 60} y2={SALA_PISO + i * 95 + 155} stroke="#B36F3C" strokeWidth={5} />
          ))}
        </g>
      ))}
      <rect x={-400} y={SALA_PISO - 26} width={1880} height={30} fill="#E8A86A" {...S} />
      {/* puerta a la cocina (interior) */}
      <rect x={110} y={630} width={230} height={SALA_PISO - 630} fill="#9FD3C7" />
      {Array.from({length: 6}).map((_, i) => (
        <line key={i} x1={110} x2={340} y1={680 + i * 100} y2={680 + i * 100} stroke="#C7EAE1" strokeWidth={5} />
      ))}
      <rect x={110} y={630} width={230} height={140} fill="#FFF6D6" opacity={0.55} />
      {/* ventana */}
      <g>
        <rect x={520} y={330} width={350} height={420} rx={10} fill="#9ED8F5" {...S} />
        <g opacity={0.95}>
          <ellipse cx={560 + nube} cy={430} rx={60} ry={26} fill="#fff" />
          <ellipse cx={600 + nube} cy={414} rx={44} ry={26} fill="#fff" />
          <ellipse cx={360 + nube} cy={560} rx={50} ry={22} fill="#fff" />
        </g>
        <rect x={520} y={330} width={350} height={420} rx={10} fill="none" stroke="#FFF3E0" strokeWidth={22} />
        <rect x={520} y={330} width={350} height={420} rx={10} fill="none" {...S} />
        <line x1={695} x2={695} y1={330} y2={750} stroke="#FFF3E0" strokeWidth={14} />
        <line x1={520} x2={870} y1={540} y2={540} stroke="#FFF3E0" strokeWidth={14} />
        <rect x={500} y={750} width={390} height={26} rx={8} fill="#FFF3E0" {...S} />
        {/* cortinas */}
        <path d="M490,300 Q470,560 500,800 L560,800 Q530,560 560,300 Z" fill="#D7263D" {...S} />
        <path d="M900,300 Q920,560 890,800 L830,800 Q860,560 830,300 Z" fill="#D7263D" {...S} />
        <rect x={460} y={286} width={470} height={22} rx={11} fill="#7A4A2A" {...S} />
      </g>
      {/* cuadro */}
      <g transform="translate(400,470) rotate(-3)">
        <rect x={-48} y={-60} width={96} height={120} fill="#FFF3E0" {...S} />
        <rect x={-34} y={-46} width={68} height={92} fill="#9ED8F5" />
        <path d="M-34,46 L-8,0 L10,24 L22,8 L34,30 L34,46 Z" fill="#6A994E" />
        <circle cx={18} cy={-22} r={10} fill={C.brillo} />
      </g>
      {/* lámpara de pie */}
      <g>
        <line x1={980} x2={980} y1={760} y2={SALA_PISO} stroke={C.linea} strokeWidth={14} />
        <path d="M910,760 L1050,760 L1020,640 L940,640 Z" fill="#FFF3E0" {...S} />
        <ellipse cx={980} cy={SALA_PISO} rx={50} ry={12} fill={C.linea} />
      </g>
      {/* planta */}
      <g transform="translate(420,1300)">
        <path d="M-40,-90 L40,-90 L30,0 L-30,0 Z" fill="#C8553D" {...S} />
        {[-50, -20, 10, 40].map((a, i) => (
          <ellipse key={i} cx={Math.sin((a * Math.PI) / 180) * 70} cy={-150 - (i % 2) * 30} rx={22} ry={60} fill="#6A994E" {...S} transform={`rotate(${a},${Math.sin((a * Math.PI) / 180) * 70},${-150 - (i % 2) * 30})`} />
        ))}
      </g>
      {/* alfombra */}
      <ellipse cx={600} cy={1560} rx={420} ry={110} fill="#E07A5F" {...S} />
      <ellipse cx={600} cy={1560} rx={340} ry={80} fill="none" stroke="#FFE8C7" strokeWidth={8} strokeDasharray="22 16" />
      {/* telaraña (paso del tiempo) */}
      {telarana > 0 && (
        <g opacity={telarana} stroke="#fff" strokeWidth={3} fill="none">
          {[0, 20, 40, 60, 80].map((a) => (
            <line key={a} x1={1080} y1={60} x2={1080 - Math.cos((a * Math.PI) / 180) * 260} y2={60 + Math.sin((a * Math.PI) / 180) * 260} />
          ))}
          {[80, 150, 220].map((r) => (
            <path key={r} d={`M${1080 - r},60 Q${1080 - r * 0.8},${60 + r * 0.45} ${1080 - r * 0.7},${60 + r * 0.7} Q${1080 - r * 0.35},${60 + r * 0.85} 1080,${60 + r}`} />
          ))}
        </g>
      )}
    </g>
  );
};

/** Pared izquierda de la puerta, para tapar a la Mamá mientras se asoma. */
export const SalaMarcoPuerta: React.FC = () => (
  <g>
    <rect x={-400} y={50} width={510} height={SALA_PISO - 76} fill={C.pared} />
    {[-400, -280, -160, -40].map((x) => (
      <rect key={x} x={x} y={50} width={50} height={SALA_PISO - 76} fill="#F9D0A0" opacity={0.55} />
    ))}
    <rect x={88} y={612} width={30} height={SALA_PISO - 612} fill="#FFF3E0" stroke={C.linea} strokeWidth={LINEA} />
    <rect x={88} y={606} width={274} height={30} fill="#FFF3E0" stroke={C.linea} strokeWidth={LINEA} />
    <rect x={332} y={612} width={30} height={SALA_PISO - 612} fill="#FFF3E0" stroke={C.linea} strokeWidth={LINEA} />
  </g>
);
