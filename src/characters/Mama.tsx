import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, LINEA} from '../estilo';
import {bocaHablando, parpadeo, respiracion} from '../anim';
import {Boca, BocaSVG, Extremidad, Mano, Ojo, P, puntoQ} from './partes';
import {Cucharon} from '../props/Cucharon';

/*
 * LA MAMÁ — ~45 años, moño, delantal floreado rojo, cucharón de madera, cara de "ya me cansé".
 * Origen (0,0) = entre los pies. Altura ≈ 880 px a escala 1 (con moño).
 * IMPORTANTE (giro del Ep. 1): la Mamá NUNCA envejece. No tiene parámetro de edad.
 */

export type BrazosMama = 'cucharon' | 'golpe' | 'jarra' | 'servir' | 'asomar' | 'guino';
export type ExpresionMama = 'cansada' | 'grito' | 'guino' | 'sonrisa' | 'tierna' | 'enojada';

type PoseM = {L: [P, P]; R: [P, P]; cuch?: {rot: number}; bowl?: boolean};

const HL: P = [-84, -566];
const HR: P = [84, -566];

const POSES: Record<BrazosMama, PoseM> = {
  // mano izquierda en la cintura, derecha con el cucharón en alto
  cucharon: {L: [[-150, -500], [-86, -440]], R: [[150, -560], [140, -650]], cuch: {rot: 12}},
  golpe: {L: [[-120, -470], [-60, -420]], R: [[160, -520], [150, -600]], cuch: {rot: 30}},
  jarra: {L: [[-150, -500], [-86, -440]], R: [[150, -500], [86, -440]]},
  servir: {L: [[-120, -460], [-60, -470]], R: [[120, -460], [60, -470]], bowl: true},
  asomar: {L: [[-120, -470], [-110, -380]], R: [[160, -620], [190, -700]], cuch: {rot: -10}},
  guino: {L: [[-150, -500], [-86, -440]], R: [[150, -520], [110, -610]], cuch: {rot: -25}},
};

export type MamaProps = {
  x?: number;
  y?: number;
  escala?: number;
  voltear?: boolean;
  brazos?: BrazosMama;
  /** 0..1 golpe del cucharón (anima el brazo hacia abajo) */
  golpe?: number;
  expresion?: ExpresionMama;
  boca?: Boca;
  hablando?: boolean;
  mirada?: P;
  squash?: number;
  seed?: number;
  quieto?: boolean;
  conCucharon?: boolean;
};

export const Mama: React.FC<MamaProps> = ({
  x = 0,
  y = 0,
  escala = 1,
  voltear = false,
  brazos = 'cucharon',
  golpe = 0,
  expresion = 'cansada',
  boca,
  hablando = false,
  mirada = [0, 0],
  squash = 1,
  seed = 2,
  quieto = false,
  conCucharon = true,
}) => {
  const frame = useCurrentFrame();
  const f = quieto ? 0 : frame;
  const piel = C.mamaPiel;
  const pose = POSES[brazos];

  let codoR = pose.R[0];
  let manoR = pose.R[1];
  let rotCuch = pose.cuch?.rot ?? 0;
  if (brazos === 'golpe') {
    // de arriba (0) a abajo sobre la olla (1)
    codoR = [160 - 10 * golpe, -520 + 60 * golpe];
    manoR = [150 + 40 * golpe, -600 + 170 * golpe];
    rotCuch = 30 + 80 * golpe;
  }

  const cierre = quieto ? 0 : parpadeo(f, `mama-${seed}`);
  const resp = quieto ? 1.01 : respiracion(f, seed + 3);
  const sx = (voltear ? -1 : 1) * escala * (1 + (1 - squash) * 0.7);
  const sy = escala * squash;

  const formaBoca: Boca =
    boca ?? (expresion === 'grito' ? 'grito' : expresion === 'sonrisa' || expresion === 'tierna' ? 'sonrisa' : expresion === 'guino' ? 'sonrisaLado' : expresion === 'enojada' ? 'triste' : 'plana');
  const abre = hablando ? bocaHablando(f, seed * 5) : formaBoca === 'grito' ? 0.7 : 0;
  const parpado = expresion === 'cansada' ? 0.42 : expresion === 'tierna' ? 0.25 : expresion === 'enojada' ? 0.3 : 0;

  const brazo = (h: P, c: P, m: P, key: string) => {
    const m1 = puntoQ(h, c, m, 0);
    const mc = puntoQ(h, c, m, 0.3);
    const m2 = puntoQ(h, c, m, 0.55);
    return (
      <g key={key}>
        <Extremidad a={h} codo={c} b={m} ancho={28} color={piel} />
        <Extremidad a={m1} codo={mc} b={m2} ancho={42} color={C.blusa} />
      </g>
    );
  };

  // flores del delantal
  const Flor: React.FC<{x: number; y: number; r?: number}> = ({x: fx, y: fy, r = 11}) => (
    <g>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx={fx + Math.cos((a * Math.PI) / 180) * r} cy={fy + Math.sin((a * Math.PI) / 180) * r} r={r * 0.62} fill={C.flor} />
      ))}
      <circle cx={fx} cy={fy} r={r * 0.45} fill={C.brillo} />
    </g>
  );
  const flores: [number, number, number?][] = [
    [-40, -530, 9],
    [30, -500, 8],
    [-60, -440],
    [10, -420, 10],
    [62, -400],
    [-30, -370, 9],
    [40, -345],
    [-70, -330, 10],
    [0, -315, 8],
  ];

  // ojos según expresión
  const ojos = () => {
    const dir = mirada;
    if (expresion === 'guino') {
      return (
        <g>
          <Ojo x={-42} y={-735} cierre={cierre} dir={dir} piel={piel} />
          {/* ojo derecho guiñado */}
          <path d="M18,-732 Q42,-752 68,-732" stroke={C.linea} strokeWidth={LINEA} fill="none" strokeLinecap="round" />
          <path d="M22,-728 Q42,-718 64,-728" stroke={C.linea} strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
      );
    }
    const rx = expresion === 'grito' ? 27 : 25;
    const ry = expresion === 'grito' ? 30 : 29;
    return (
      <g>
        <Ojo x={-42} y={-735} rx={rx} ry={ry} cierre={cierre} dir={dir} piel={piel} parpadoSup={parpado} pupila={12} />
        <Ojo x={42} y={-735} rx={rx} ry={ry} cierre={cierre} dir={dir} piel={piel} parpadoSup={parpado} pupila={12} />
      </g>
    );
  };

  // cejas: la de "ya me cansé" levanta una
  const cejas = () => {
    let l = 'M-66,-776 Q-44,-786 -20,-778';
    let r = 'M20,-778 Q44,-786 66,-776';
    if (expresion === 'cansada') {
      l = 'M-66,-778 Q-44,-782 -20,-776';
      r = 'M20,-790 Q44,-806 68,-792';
    } else if (expresion === 'grito' || expresion === 'enojada') {
      l = 'M-66,-790 Q-44,-784 -18,-768';
      r = 'M18,-768 Q44,-784 66,-790';
    } else if (expresion === 'guino') {
      l = 'M-66,-792 Q-44,-806 -20,-794';
      r = 'M20,-770 Q44,-774 66,-764';
    } else if (expresion === 'tierna') {
      l = 'M-66,-776 Q-44,-790 -20,-784';
      r = 'M20,-784 Q44,-790 66,-776';
    }
    return (
      <g stroke={C.pelo} strokeWidth={9} fill="none" strokeLinecap="round">
        <path d={l} />
        <path d={r} />
      </g>
    );
  };

  return (
    <g transform={`translate(${x},${y}) scale(${sx},${sy})`}>
      <g transform={`scale(1,${resp})`}>
        <ellipse cx={0} cy={0} rx={130} ry={18} fill="#000" opacity={0.15} />
        {/* piernas */}
        {[-1, 1].map((s) => (
          <Extremidad key={s} a={[s * 36, -300]} codo={[s * 40, -160]} b={[s * 38, -22]} ancho={30} color={piel} />
        ))}
        {/* pantuflas */}
        {[-1, 1].map((s) => (
          <g key={`pt${s}`}>
            <ellipse cx={s * 44} cy={-12} rx={40} ry={18} fill={C.pantufla} stroke={C.linea} strokeWidth={LINEA} />
            <ellipse cx={s * 44} cy={-20} rx={18} ry={8} fill="#fff" opacity={0.6} />
          </g>
        ))}
        {/* falda */}
        <path d="M-84,-450 L84,-450 L108,-282 Q0,-268 -108,-282 Z" fill={C.falda} stroke={C.linea} strokeWidth={LINEA} strokeLinejoin="round" />
        {/* blusa */}
        <path d="M-86,-588 Q-96,-500 -84,-440 L84,-440 Q96,-500 86,-588 Q0,-606 -86,-588 Z" fill={C.blusa} stroke={C.linea} strokeWidth={LINEA} strokeLinejoin="round" />
        {/* cuello */}
        <rect x={-24} y={-650} width={48} height={64} fill={piel} stroke={C.linea} strokeWidth={LINEA} />
        <path d="M-30,-598 Q0,-566 30,-598" fill={piel} stroke={C.linea} strokeWidth={5} />
        {/* delantal */}
        <path
          d="M-30,-596 Q0,-604 30,-596 M-56,-578 L56,-578 L60,-470 Q92,-470 98,-450 L104,-300 Q0,-286 -104,-300 L-98,-450 Q-92,-470 -60,-470 Z"
          fill={C.delantal}
          stroke={C.linea}
          strokeWidth={LINEA}
          strokeLinejoin="round"
        />
        <path d="M-56,-578 L-28,-640 M56,-578 L28,-640" stroke={C.delantal} strokeWidth={10} strokeLinecap="round" />
        <path d="M-98,-456 Q0,-446 98,-456" stroke="#A61B2E" strokeWidth={8} fill="none" />
        {flores.map(([fx, fy, r], i) => (
          <Flor key={i} x={fx} y={fy} r={r} />
        ))}
        {/* bolsillo */}
        <path d="M-40,-400 L40,-400 L36,-350 Q0,-344 -36,-350 Z" fill="#E03A4F" stroke={C.linea} strokeWidth={5} strokeLinejoin="round" />

        {/* cabeza */}
        <g>
          {/* moño (detrás) */}
          <circle cx={0} cy={-880} r={50} fill={C.pelo} stroke={C.linea} strokeWidth={LINEA} />
          <path d="M-30,-900 Q0,-920 30,-896" stroke="#5A3A30" strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M-22,-862 Q0,-878 26,-866" stroke="#5A3A30" strokeWidth={6} fill="none" strokeLinecap="round" />
          {/* orejas y aretes */}
          {[-1, 1].map((s) => (
            <g key={s}>
              <circle cx={s * 102} cy={-732} r={22} fill={piel} stroke={C.linea} strokeWidth={LINEA} />
              <circle cx={s * 104} cy={-704} r={9} fill={C.brillo} stroke={C.linea} strokeWidth={4} />
            </g>
          ))}
          <ellipse cx={0} cy={-738} rx={104} ry={112} fill={piel} stroke={C.linea} strokeWidth={LINEA} />
          {/* pelo recogido con raya al medio */}
          <path
            d="M-108,-730 C-116,-810 -70,-856 0,-856 C70,-856 116,-810 108,-730 Q96,-786 50,-800 Q20,-806 0,-790 Q-20,-806 -50,-800 Q-96,-786 -108,-730 Z"
            fill={C.pelo}
            stroke={C.linea}
            strokeWidth={LINEA}
            strokeLinejoin="round"
          />
          <path d="M-60,-836 Q-30,-850 -6,-846" stroke="#fff" strokeWidth={6} fill="none" opacity={0.2} strokeLinecap="round" />
          {/* mechón suelto de cansancio */}
          <path d="M60,-800 Q86,-770 70,-740" stroke={C.pelo} strokeWidth={7} fill="none" strokeLinecap="round" />
          <ellipse cx={-64} cy={-694} rx={20} ry={11} fill={C.rubor} opacity={expresion === 'tierna' || expresion === 'guino' ? 0.6 : 0.3} />
          <ellipse cx={64} cy={-694} rx={20} ry={11} fill={C.rubor} opacity={expresion === 'tierna' || expresion === 'guino' ? 0.6 : 0.3} />
          {ojos()}
          {/* pestañas */}
          <path d="M-68,-748 l-10,-8 M68,-748 l10,-8" stroke={C.linea} strokeWidth={5} strokeLinecap="round" />
          {cejas()}
          <path d="M-4,-714 Q-14,-692 2,-688 Q12,-688 14,-696" stroke={C.linea} strokeWidth={5} fill="none" strokeLinecap="round" />
          <BocaSVG x={0} y={-668} forma={formaBoca} abre={abre} ancho={26} />
        </g>

        {/* brazos */}
        {brazo(HL, pose.L[0], pose.L[1], 'l')}
        {brazo(HR, codoR, manoR, 'r')}
        {pose.bowl && (
          <g>
            <path d="M-90,-490 Q0,-480 90,-490 Q80,-410 0,-404 Q-80,-410 -90,-490 Z" fill="#FFF3E0" stroke={C.linea} strokeWidth={LINEA} strokeLinejoin="round" />
            <path d="M-80,-488 Q0,-470 80,-488" stroke="#4A90A4" strokeWidth={8} fill="none" />
          </g>
        )}
        {pose.cuch && conCucharon && <Cucharon x={manoR[0]} y={manoR[1]} rot={rotCuch} escala={0.85} />}
        <Mano p={pose.L[1]} color={piel} />
        <Mano p={manoR} color={piel} />
      </g>
    </g>
  );
};
