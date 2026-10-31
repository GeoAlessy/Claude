import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, LINEA} from '../estilo';
import {bocaHablando, parpadeo, respiracion} from '../anim';
import {Boca, BocaSVG, Extremidad, Mano, Ojo, P, puntoQ} from './partes';
import {Pelota, Entradas} from '../props/Pelota';

/*
 * Personajes secundarios del montaje (Amigo, Jefe, Chica).
 * Mismo estilo que el Chato: contornos gruesos, cabeza grande, ojos con brillo.
 * Origen (0,0) = entre los pies.
 */
export type TipoPersona = 'amigo' | 'jefe' | 'chica';

const DEF: Record<TipoPersona, {piel: string; ropa: string; ropa2: string; pierna: string; zapato: string}> = {
  amigo: {piel: '#8D5A3B', ropa: '#3BAA5C', ropa2: '#FFFFFF', pierna: '#2B2B36', zapato: '#E9E2D0'},
  jefe: {piel: '#E0A97E', ropa: '#5C6677', ropa2: '#FFFFFF', pierna: '#4A5260', zapato: '#2B1B17'},
  chica: {piel: '#D69A6E', ropa: '#2BB3A3', ropa2: '#FFF3E0', pierna: '#D69A6E', zapato: '#FF6B8A'},
};

export const Persona: React.FC<{
  tipo: TipoPersona;
  x?: number;
  y?: number;
  escala?: number;
  voltear?: boolean;
  hablando?: boolean;
  boca?: Boca;
  seed?: number;
  /** 0..1 gesto (rebote del brazo) */
  gesto?: number;
}> = ({tipo, x = 0, y = 0, escala = 1, voltear = false, hablando = false, boca = 'sonrisa', seed = 5, gesto = 0}) => {
  const f = useCurrentFrame();
  const d = DEF[tipo];
  const resp = respiracion(f, seed);
  const cierre = parpadeo(f, `p-${tipo}-${seed}`);
  const abre = hablando ? bocaHablando(f, seed * 3) : 0;
  const s = (voltear ? -1 : 1) * escala;
  const g = Math.sin(gesto * Math.PI) * 20;

  const HL: P = [-80, -566];
  const HR: P = [80, -566];
  let L: [P, P] = [[-112, -470], [-104, -380]];
  let R: [P, P] = [[112, -470], [104, -380]];
  if (tipo === 'amigo') R = [[150, -500], [130, -580 - g]];
  if (tipo === 'jefe') R = [[150, -640], [160, -760 - g]];
  if (tipo === 'chica') R = [[140, -490], [150, -560 - g]];
  if (tipo === 'jefe') L = [[-130, -480], [-80, -440]];

  const brazo = (h: P, c: P, m: P, k: string, manga: string, largoManga = 0.4) => (
    <g key={k}>
      <Extremidad a={h} codo={c} b={m} ancho={26} color={tipo === 'jefe' ? d.ropa : d.piel} />
      <Extremidad a={puntoQ(h, c, m, 0)} codo={puntoQ(h, c, m, largoManga / 2)} b={puntoQ(h, c, m, largoManga)} ancho={46} color={manga} />
    </g>
  );

  return (
    <g transform={`translate(${x},${y}) scale(${s},${escala})`}>
      <g transform={`scale(1,${resp})`}>
        <ellipse cx={0} cy={0} rx={120} ry={18} fill="#000" opacity={0.15} />
        {[-1, 1].map((k) => (
          <Extremidad key={k} a={[k * 32, -320]} codo={[k * 36, -170]} b={[k * 36, -24]} ancho={tipo === 'chica' ? 28 : 34} color={d.pierna} />
        ))}
        {[-1, 1].map((k) => (
          <ellipse key={`z${k}`} cx={k * 44} cy={-14} rx={40} ry={18} fill={d.zapato} stroke={C.linea} strokeWidth={LINEA} />
        ))}
        {tipo === 'amigo' && (
          <path d="M-82,-420 L82,-420 L88,-290 L8,-286 L0,-330 L-8,-286 L-88,-290 Z" fill="#fff" stroke={C.linea} strokeWidth={LINEA} strokeLinejoin="round" />
        )}
        {tipo === 'jefe' && <rect x={-82} y={-430} width={164} height={120} fill={d.pierna} stroke={C.linea} strokeWidth={LINEA} />}
        {tipo === 'chica' && (
          <path d="M-84,-450 L84,-450 L116,-290 Q0,-274 -116,-290 Z" fill={d.ropa} stroke={C.linea} strokeWidth={LINEA} strokeLinejoin="round" />
        )}
        {/* torso */}
        <path d="M-82,-592 Q-94,-500 -82,-410 Q0,-398 82,-410 Q94,-500 82,-592 Q0,-612 -82,-592 Z" fill={d.ropa} stroke={C.linea} strokeWidth={LINEA} strokeLinejoin="round" />
        {tipo === 'amigo' && (
          <text x={0} y={-470} textAnchor="middle" fontSize={70} fontWeight={800} fill="#fff" stroke={C.linea} strokeWidth={4} fontFamily="sans-serif">
            10
          </text>
        )}
        {tipo === 'jefe' && (
          <g>
            <path d="M-34,-600 L0,-530 L34,-600 Z" fill={d.ropa2} stroke={C.linea} strokeWidth={5} />
            <path d="M-10,-580 L10,-580 L16,-470 L0,-450 L-16,-470 Z" fill={C.rojo} stroke={C.linea} strokeWidth={5} strokeLinejoin="round" />
          </g>
        )}
        {tipo === 'chica' && <path d="M-40,-600 Q0,-560 40,-600" fill="none" stroke={d.ropa2} strokeWidth={10} />}
        {/* cabeza */}
        <rect x={-24} y={-650} width={48} height={64} fill={d.piel} stroke={C.linea} strokeWidth={LINEA} />
        {tipo === 'chica' && (
          <path d="M-110,-740 Q-130,-600 -90,-560 L90,-560 Q130,-600 110,-740 Z" fill="#4A2C20" stroke={C.linea} strokeWidth={LINEA} />
        )}
        {[-1, 1].map((k) => (
          <circle key={k} cx={k * 102} cy={-732} r={22} fill={d.piel} stroke={C.linea} strokeWidth={LINEA} />
        ))}
        <ellipse cx={0} cy={-738} rx={104} ry={112} fill={d.piel} stroke={C.linea} strokeWidth={LINEA} />
        <ellipse cx={-64} cy={-694} rx={20} ry={11} fill={C.rubor} opacity={0.35} />
        <ellipse cx={64} cy={-694} rx={20} ry={11} fill={C.rubor} opacity={0.35} />
        <Ojo x={-42} y={-735} cierre={cierre} dir={[voltear ? -8 : 8, 0]} piel={d.piel} pupila={12} />
        <Ojo x={42} y={-735} cierre={cierre} dir={[voltear ? -8 : 8, 0]} piel={d.piel} pupila={12} />
        <path d="M-4,-714 Q-14,-692 2,-688 Q12,-688 14,-696" stroke={C.linea} strokeWidth={5} fill="none" strokeLinecap="round" />
        {tipo === 'jefe' && (
          <path d="M-4,-684 Q-30,-694 -56,-672 Q-36,-668 -4,-674 Q0,-678 4,-674 Q36,-668 56,-672 Q30,-694 4,-684 Z" fill="#5A3A30" stroke={C.linea} strokeWidth={5} />
        )}
        <BocaSVG x={0} y={-664} forma={tipo === 'jefe' && !hablando ? 'triste' : boca} abre={abre} ancho={26} />
        {/* pelo */}
        {tipo === 'amigo' && (
          <g>
            <path d="M-108,-760 Q-100,-860 0,-866 Q100,-860 108,-760 Q60,-800 0,-796 Q-60,-800 -108,-760 Z" fill="#2E5EAA" stroke={C.linea} strokeWidth={LINEA} />
            <path d="M-10,-780 Q90,-790 170,-760 Q100,-740 20,-756 Z" fill="#2E5EAA" stroke={C.linea} strokeWidth={LINEA} strokeLinejoin="round" />
          </g>
        )}
        {tipo === 'jefe' && (
          <g>
            <path d="M-110,-720 Q-112,-790 -84,-800 Q-90,-760 -96,-720 Z M110,-720 Q112,-790 84,-800 Q90,-760 96,-720 Z" fill="#8A8A8A" stroke={C.linea} strokeWidth={5} />
            <ellipse cx={-30} cy={-830} rx={26} ry={10} fill="#fff" opacity={0.35} />
            <path d="M-66,-786 L-20,-774 M66,-786 L20,-774" stroke={C.linea} strokeWidth={9} strokeLinecap="round" />
          </g>
        )}
        {tipo === 'chica' && (
          <g>
            <path d="M-112,-730 C-120,-820 -70,-858 0,-858 C70,-858 120,-820 112,-730 Q90,-800 20,-806 Q-40,-780 -112,-730 Z" fill="#4A2C20" stroke={C.linea} strokeWidth={LINEA} strokeLinejoin="round" />
            <circle cx={70} cy={-830} r={18} fill="#FF6B8A" stroke={C.linea} strokeWidth={5} />
            <path d="M-56,-760 l-12,-8 M56,-760 l12,-8" stroke={C.linea} strokeWidth={5} strokeLinecap="round" />
          </g>
        )}
        {/* brazos */}
        {brazo(HL, L[0], L[1], 'l', tipo === 'jefe' ? d.ropa : d.ropa, tipo === 'jefe' ? 1 : 0.4)}
        {brazo(HR, R[0], R[1], 'r', d.ropa, tipo === 'jefe' ? 1 : 0.4)}
        {tipo === 'amigo' && <Pelota x={R[1][0]} y={R[1][1] - 46} r={50} rot={f * 3} />}
        {tipo === 'chica' && <Entradas x={R[1][0] + 10} y={R[1][1] - 40} rot={-10 + g * 0.3} />}
        <Mano p={L[1]} color={d.piel} />
        <Mano p={R[1]} color={d.piel} />
        {tipo === 'jefe' && (
          <path d={`M${R[1][0] - 6},${R[1][1] - 16} l4,-46`} stroke={C.linea} strokeWidth={14 + LINEA} strokeLinecap="round" />
        )}
        {tipo === 'jefe' && <path d={`M${R[1][0] - 6},${R[1][1] - 16} l4,-46`} stroke={d.piel} strokeWidth={14} strokeLinecap="round" />}
      </g>
    </g>
  );
};
