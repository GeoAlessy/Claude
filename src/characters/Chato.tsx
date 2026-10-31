import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, LINEA} from '../estilo';
import {bocaHablando, clamp, colorPorTramos, parpadeo, respiracion} from '../anim';
import {Boca, BocaSVG, Extremidad, Mano, Ojo, P, puntoQ} from './partes';
import {Celular} from '../props/Celular';

/*
 * EL CHATO — 19 años, flaco, pelo negro despeinado, polo mostaza, short azul, sandalias.
 * Todo está parametrizado por `edad` (19 → 78) y cambia en tiempo real:
 *  pelo negro→gris→blanco · barba que crece · arrugas · espalda encorvada ·
 *  lentes desde los 50 · bastón desde los 70.
 * Origen (0,0) = entre los pies, sobre el piso. Altura de pie ≈ 870 px a escala 1.
 */

export type BrazosChato = 'relajado' | 'celular' | 'arriba' | 'baston' | 'bajarCel' | 'apoyo' | 'cuchara';
export type MiradaChato = 'celular' | 'frente' | 'izquierda' | 'derecha' | 'arriba' | 'abajo';
export type ExpresionChato = 'normal' | 'shock' | 'aburrido' | 'emocionado' | 'brilloso' | 'feliz';

type PoseBrazos = {
  L: [P, P]; // codo, mano (lado izquierdo de la pantalla)
  R: [P, P];
  cel?: {p: P; rot: number};
  baston?: boolean;
};

const HOMBRO_L: P = [-80, -572];
const HOMBRO_R: P = [80, -572];

const POSES: Record<BrazosChato, PoseBrazos> = {
  relajado: {L: [[-116, -470], [-108, -378]], R: [[116, -470], [108, -378]]},
  celular: {L: [[-128, -440], [-38, -486]], R: [[128, -440], [38, -486]], cel: {p: [0, -512], rot: 0}},
  arriba: {L: [[-170, -620], [-150, -735]], R: [[170, -620], [150, -735]]},
  baston: {L: [[-128, -446], [-36, -498]], R: [[136, -470], [150, -392]], cel: {p: [-14, -526], rot: 12}, baston: true},
  bajarCel: {L: [[-120, -455], [-58, -398]], R: [[118, -470], [104, -382]], cel: {p: [-50, -416], rot: -60}},
  apoyo: {L: [[-150, -480], [-150, -392]], R: [[150, -480], [150, -392]]},
  cuchara: {L: [[-120, -450], [-40, -470]], R: [[130, -470], [60, -560]]},
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpP = (a: P, b: P, t: number): P => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

const MIRADAS: Record<MiradaChato, P> = {
  celular: [0, 12],
  frente: [0, 0],
  izquierda: [-11, 2],
  derecha: [11, 2],
  arriba: [0, -11],
  abajo: [0, 10],
};

export type ChatoProps = {
  x?: number;
  y?: number;
  escala?: number;
  voltear?: boolean;
  edad?: number;
  pose?: 'parado' | 'sentado';
  /** sentado→parado 0..1 (para levantarse) */
  levantarse?: number;
  brazos?: BrazosChato;
  brazos2?: BrazosChato;
  mezclaBrazos?: number;
  mirada?: MiradaChato;
  expresion?: ExpresionChato;
  boca?: Boca;
  hablando?: boolean;
  /** 1 = normal, <1 aplasta, >1 estira */
  squash?: number;
  seed?: number;
  /** congela parpadeo/respiración (para hojas de personajes) */
  quieto?: boolean;
};

export const Chato: React.FC<ChatoProps> = ({
  x = 0,
  y = 0,
  escala = 1,
  voltear = false,
  edad = 19,
  pose = 'parado',
  levantarse,
  brazos = 'relajado',
  brazos2,
  mezclaBrazos = 0,
  mirada = 'frente',
  expresion = 'normal',
  boca = 'cerrada',
  hablando = false,
  squash = 1,
  seed = 1,
  quieto = false,
}) => {
  const frame = useCurrentFrame();
  const f = quieto ? 0 : frame;

  // ---------- Parámetros de edad ----------
  const encorve = interpolate(edad, [40, 78], [0, 1], clamp);
  const colorPelo = colorPorTramos(edad, [19, 34, 47, 63, 72], ['#1E1919', '#2B2525', '#6F6A67', '#C2BFBB', '#F4F2EE']);
  const largoBarba = interpolate(edad, [25, 34, 47, 63, 78], [0, 22, 70, 200, 700], clamp);
  const barbita = interpolate(edad, [20.5, 24], [0, 0.55], clamp);
  const arrugas = interpolate(edad, [33, 60], [0, 1], clamp);
  const lentes = interpolate(edad, [49.2, 50.6], [0, 1], clamp);
  const baston = interpolate(edad, [69.2, 70.6], [0, 1], clamp);
  const entradas = interpolate(edad, [40, 78], [0, 26], clamp);
  const canas = Math.floor(interpolate(edad, [20, 21, 33], [0, 1, 7], clamp));

  // ---------- Pose ----------
  const sentadoT = pose === 'sentado' ? 1 - (levantarse ?? 0) : 0;
  const bajaSentado = 150 * sentadoT;
  const bajaEncorve = 62 * encorve;
  const inclinacion = -6 * encorve;
  const bajaCabeza = 28 * encorve;
  const desplCuerpo = bajaSentado + bajaEncorve;

  const pa = POSES[brazos];
  const pb = brazos2 ? POSES[brazos2] : pa;
  const t = brazos2 ? mezclaBrazos : 0;
  const codoL = lerpP(pa.L[0], pb.L[0], t);
  const manoL = lerpP(pa.L[1], pb.L[1], t);
  const codoR = lerpP(pa.R[0], pb.R[0], t);
  const manoR = lerpP(pa.R[1], pb.R[1], t);
  const celA = pa.cel;
  const celB = pb.cel;
  const cel = celA && celB ? {p: lerpP(celA.p, celB.p, t), rot: lerp(celA.rot, celB.rot, t)} : t < 0.5 ? celA : celB;
  const usaBaston = (pa.baston || pb.baston) && baston > 0;
  // con bastón la mano derecha siempre lo sostiene
  const codoRf: P = usaBaston ? [136, -470] : codoR;
  const manoRf: P = usaBaston ? [150, -392] : manoR;

  // ---------- Cara ----------
  const cierre = quieto ? 0 : parpadeo(f, `chato-${seed}`);
  const dir = MIRADAS[mirada];
  let parpado = mirada === 'celular' ? 0.32 : 0;
  if (expresion === 'aburrido') parpado = 0.48;
  const ojoRx = expresion === 'shock' ? 31 : 26;
  const ojoRy = expresion === 'shock' ? 39 : 31;
  const pupila = expresion === 'shock' ? 8 : expresion === 'brilloso' ? 16 : 13;
  const abre = hablando ? bocaHablando(f, seed * 7) : boca === 'cerrada' ? 0 : 0.6;

  const resp = quieto ? 1.01 : respiracion(f, seed);
  const sx = (voltear ? -1 : 1) * escala * (1 + (1 - squash) * 0.7);
  const sy = escala * squash;

  const piel = C.chatoPiel;
  const cejaColor = colorPorTramos(edad, [19, 40, 63, 72], ['#1E1919', '#2B2525', '#BDBAB6', '#F4F2EE']);
  const grosorCeja = interpolate(edad, [19, 78], [9, 15], clamp);
  const yCeja = expresion === 'shock' ? -800 : expresion === 'brilloso' ? -786 : -780;
  const angCeja = expresion === 'shock' ? 6 : expresion === 'brilloso' ? -10 : expresion === 'aburrido' ? 0 : 3;

  // piso en coordenadas locales de la cabeza (para que la barba toque el piso)
  const pisoLocalCabeza = -(desplCuerpo + bajaCabeza);

  // ---------- Piernas ----------
  const cadera = -300 + desplCuerpo * 0.98;
  const rodillaAfuera = 30 * encorve;
  const piernas = (
    <g>
      {[-1, 1].map((s) => {
        const hip: P = [s * 32, cadera];
        const tobillo: P = [s * (sentadoT > 0.5 ? 48 : 36), -18];
        const rod: P = [s * (36 + rodillaAfuera + 14 * sentadoT), (hip[1] + tobillo[1]) / 2];
        return (
          <g key={s}>
            <Extremidad a={hip} codo={rod} b={tobillo} ancho={30} color={piel} />
          </g>
        );
      })}
      {/* pies y sandalias */}
      {[-1, 1].map((s) => {
        const fx = s * (sentadoT > 0.5 ? 52 : 40);
        return (
          <g key={`p${s}`}>
            <ellipse cx={fx} cy={-6} rx={36} ry={12} fill={C.sandalia} stroke={C.linea} strokeWidth={LINEA} />
            <ellipse cx={fx + s * 4} cy={-16} rx={24} ry={13} fill={piel} stroke={C.linea} strokeWidth={LINEA} />
            <path d={`M${fx - 18},${-8} L${fx + s * 4},${-24} L${fx + 18},${-8}`} stroke={C.sandalia} strokeWidth={8} fill="none" strokeLinecap="round" />
          </g>
        );
      })}
    </g>
  );

  // ---------- Short ----------
  const shortTop = -412 + desplCuerpo;
  const shortParado = (
    <path
      d={`M-80,${shortTop} L80,${shortTop} L88,${shortTop + 134} L8,${shortTop + 138} L0,${shortTop + 86} L-8,${shortTop + 138} L-88,${shortTop + 134} Z`}
      fill={C.short}
      stroke={C.linea}
      strokeWidth={LINEA}
      strokeLinejoin="round"
    />
  );
  const shortSentado = (
    <g>
      <path
        d={`M-82,${shortTop} L82,${shortTop} Q104,${shortTop + 70} 92,${shortTop + 118} Q60,${shortTop + 140} 6,${shortTop + 118} L0,${shortTop + 96} L-6,${shortTop + 118} Q-60,${shortTop + 140} -92,${shortTop + 118} Q-104,${shortTop + 70} -82,${shortTop} Z`}
        fill={C.short}
        stroke={C.linea}
        strokeWidth={LINEA}
        strokeLinejoin="round"
      />
      <ellipse cx={-50} cy={shortTop + 96} rx={30} ry={14} fill={C.shortSombra} opacity={0.5} />
      <ellipse cx={50} cy={shortTop + 96} rx={30} ry={14} fill={C.shortSombra} opacity={0.5} />
    </g>
  );

  // ---------- Brazo con manga ----------
  const brazo = (h: P, c: P, m: P, key: string) => {
    const manga1 = puntoQ(h, c, m, 0.0);
    const mangaC = puntoQ(h, c, m, 0.18);
    const manga2 = puntoQ(h, c, m, 0.34);
    return (
      <g key={key}>
        <Extremidad a={h} codo={c} b={m} ancho={26} color={piel} />
        <Extremidad a={manga1} codo={mangaC} b={manga2} ancho={50} color={C.polo} />
      </g>
    );
  };

  // ---------- Barba ----------
  const barba = () => {
    if (largoBarba <= 0 && barbita <= 0) return null;
    const chinY = -630;
    const tipDeseado = chinY + largoBarba;
    const tip = Math.min(tipDeseado, pisoLocalCabeza - 10);
    const charco = tipDeseado - tip; // cuánto "sobra" en el piso
    const L = tip - chinY;
    const m = chinY + L * 0.45;
    const wm = Math.max(40, 92 - L * 0.04);
    const ondas = [];
    const nL = Math.min(7, Math.floor(L / 60));
    for (let i = 0; i < nL; i++) {
      const yy = chinY + 20 + (i * (L - 30)) / Math.max(1, nL);
      const xx = (i % 2 === 0 ? -1 : 1) * (14 + (i % 3) * 10);
      ondas.push(
        <path
          key={i}
          d={`M${xx},${yy} q${xx > 0 ? 10 : -10},${30} 0,${60}`}
          stroke="#9C9893"
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
          opacity={0.6}
        />,
      );
    }
    return (
      <g>
        {barbita > 0 && largoBarba < 30 && (
          <path
            d="M-102,-712 Q-98,-640 0,-626 Q98,-640 102,-712 Q70,-668 30,-662 Q0,-690 -30,-662 Q-70,-668 -102,-712 Z"
            fill={colorPelo}
            opacity={barbita * (1 - largoBarba / 30)}
          />
        )}
        {largoBarba > 0 && (
          <g opacity={interpolate(largoBarba, [0, 10], [0, 1], clamp)}>
            {charco > 0 && (
              <g>
                <ellipse cx={18} cy={pisoLocalCabeza - 8} rx={Math.min(120, 40 + charco * 0.5)} ry={22} fill={colorPelo} stroke={C.linea} strokeWidth={LINEA} />
                <path
                  d={`M${60},${pisoLocalCabeza - 14} q${30},${-14} ${50},${2}`}
                  stroke="#9C9893"
                  strokeWidth={4}
                  fill="none"
                />
              </g>
            )}
            <path
              d={`M-104,-716 C-116,-660 -${wm},${m - 50} -${wm * 0.8},${m}
                 C-${wm * 0.62},${m + (tip - m) * 0.55} -24,${tip - 22} 0,${tip}
                 C24,${tip - 22} ${wm * 0.62},${m + (tip - m) * 0.55} ${wm * 0.8},${m}
                 C${wm},${m - 50} 116,-660 104,-716
                 Q70,-676 34,-690 Q0,-700 -34,-690 Q-70,-676 -104,-716 Z`}
              fill={colorPelo}
              stroke={C.linea}
              strokeWidth={LINEA}
              strokeLinejoin="round"
            />
            {ondas}
          </g>
        )}
      </g>
    );
  };

  const bigote = interpolate(largoBarba, [30, 70], [0, 1], clamp);

  // ---------- Cabeza ----------
  const cabeza = (
    <g transform={`translate(0,${bajaCabeza}) scale(${1 + 0.04 * encorve})`} style={{transformOrigin: '0px -630px'}}>
      {/* orejas */}
      {[-1, 1].map((s) => (
        <g key={s}>
          <circle cx={s * 106} cy={-735} r={23} fill={piel} stroke={C.linea} strokeWidth={LINEA} />
          <path d={`M${s * 104},${-745} q${s * 8},${8} 0,${18}`} stroke={C.chatoPielSombra} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
      ))}
      {/* cuello */}
      <rect x={-24} y={-650} width={48} height={70} fill={piel} stroke={C.linea} strokeWidth={LINEA} />
      <rect x={-20} y={-640} width={40} height={20} fill={C.chatoPielSombra} opacity={0.5} />
      {/* cara */}
      <ellipse cx={0} cy={-740} rx={108} ry={116} fill={piel} stroke={C.linea} strokeWidth={LINEA} />
      {/* arrugas de frente (se revelan con las entradas) */}
      <g opacity={arrugas} stroke={C.chatoPielSombra} strokeWidth={5} fill="none" strokeLinecap="round">
        <path d="M-48,-812 Q0,-824 48,-812" />
        <path d="M-40,-828 Q0,-840 40,-828" />
        <path d="M-30,-799 Q0,-807 30,-799" />
      </g>
      {/* rubor */}
      <ellipse cx={-66} cy={-695} rx={20} ry={11} fill={C.rubor} opacity={0.35} />
      <ellipse cx={66} cy={-695} rx={20} ry={11} fill={C.rubor} opacity={0.35} />
      {barba()}
      {/* ojos */}
      <Ojo x={-42} y={-735} rx={ojoRx} ry={ojoRy} cierre={cierre} dir={dir} piel={piel} parpadoSup={parpado} pupila={pupila} />
      <Ojo x={42} y={-735} rx={ojoRx} ry={ojoRy} cierre={cierre} dir={dir} piel={piel} parpadoSup={parpado} pupila={pupila} />
      {expresion === 'brilloso' && cierre < 0.5 && (
        <g>
          <path d="M-62,-712 Q-42,-704 -22,-712" stroke="#7FD3FF" strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M22,-712 Q42,-704 62,-712" stroke="#7FD3FF" strokeWidth={6} fill="none" strokeLinecap="round" />
          <circle cx={-48} cy={-744} r={5} fill="#fff" />
          <circle cx={36} cy={-744} r={5} fill="#fff" />
        </g>
      )}
      {/* patas de gallo y ojeras */}
      <g opacity={arrugas} stroke={C.chatoPielSombra} strokeWidth={4.5} fill="none" strokeLinecap="round">
        {[-1, 1].map((s) => (
          <g key={s}>
            <path d={`M${s * 74},${-748} l${s * 16},${-8}`} />
            <path d={`M${s * 76},${-736} l${s * 18},${0}`} />
            <path d={`M${s * 74},${-724} l${s * 16},${8}`} />
            <path d={`M${s * 60},${-700} q${-s * 18},${8} ${-s * 36},${0}`} />
            <path d={`M${s * 22},${-694} q${s * 20},${18} ${s * 18},${44}`} />
          </g>
        ))}
      </g>
      {/* cejas */}
      {[-1, 1].map((s) => (
        <path
          key={s}
          d={`M${s * 20},${yCeja + angCeja} Q${s * 42},${yCeja - 8} ${s * 66},${yCeja - angCeja + 2}`}
          stroke={cejaColor}
          strokeWidth={grosorCeja}
          fill="none"
          strokeLinecap="round"
        />
      ))}
      {/* nariz */}
      <path d="M-4,-716 Q-14,-694 2,-690 Q12,-690 14,-698" stroke={C.linea} strokeWidth={5} fill="none" strokeLinecap="round" />
      {/* boca + bigote */}
      <BocaSVG x={0} y={-668} forma={expresion === 'shock' && boca === 'cerrada' ? 'o' : boca} abre={abre} ancho={28} />
      {bigote > 0 && (
        <path
          d="M-4,-684 Q-30,-694 -56,-672 Q-36,-668 -4,-674 Q0,-678 4,-674 Q36,-668 56,-672 Q30,-694 4,-684 Z"
          fill={colorPelo}
          stroke={C.linea}
          strokeWidth={5}
          opacity={bigote}
          strokeLinejoin="round"
        />
      )}
      {/* pelo despeinado (con canas) */}
      <g transform={`translate(0,${-entradas})`}>
        <path
          d={`M-116,-728 C-132,-800 -112,-856 -66,-872 L-84,-904 L-36,-884 L-22,-928 L14,-888 L46,-920 L62,-874
             C108,-858 132,-800 116,-728 Q104,-770 84,-786 L70,-768 L56,-800 L30,-782 L14,-808 L-8,-784 L-30,-806 L-50,-780 L-70,-798 Q-102,-778 -116,-728 Z`}
          fill={colorPelo}
          stroke={C.linea}
          strokeWidth={LINEA}
          strokeLinejoin="round"
        />
        {Array.from({length: canas}).map((_, i) => {
          const xs = [-40, 20, -70, 52, -12, 80, -90][i];
          return (
            <path
              key={i}
              d={`M${xs},${-858 + (i % 2) * 10} q${8},${26} ${2},${50}`}
              stroke="#F4F2EE"
              strokeWidth={5}
              fill="none"
              strokeLinecap="round"
            />
          );
        })}
        <path d="M-60,-850 Q-40,-866 -12,-860" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.25} />
      </g>
      {/* lentes (desde los 50) */}
      {lentes > 0 && (
        <g transform={`translate(0,-735) scale(${lentes}) translate(0,735)`}>
          {[-1, 1].map((s) => (
            <g key={s}>
              <circle cx={s * 42} cy={-735} r={38} fill="#E9F7FF" fillOpacity={0.25} stroke="#5A3A2A" strokeWidth={7} />
              <path d={`M${s * 42 - 20},${-752} l14,-10`} stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.8} />
              <path d={`M${s * 80},${-740} L${s * 104},${-744}`} stroke="#5A3A2A" strokeWidth={6} />
            </g>
          ))}
          <path d="M-6,-740 Q0,-748 6,-740" stroke="#5A3A2A" strokeWidth={6} fill="none" />
        </g>
      )}
    </g>
  );

  // ---------- Torso ----------
  const torso = (
    <g>
      <path
        d="M-82,-592 Q-94,-500 -80,-400 Q0,-386 80,-400 Q94,-500 82,-592 Q0,-612 -82,-592 Z"
        fill={C.polo}
        stroke={C.linea}
        strokeWidth={LINEA}
        strokeLinejoin="round"
      />
      <path d="M-74,-430 Q0,-418 74,-430" stroke={C.poloSombra} strokeWidth={6} fill="none" opacity={0.6} />
      {/* cuello del polo */}
      <path d="M-40,-598 L-10,-556 L0,-588 L10,-556 L40,-598 Q0,-606 -40,-598 Z" fill={C.poloSombra} stroke={C.linea} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={0} cy={-540} r={5} fill={C.linea} />
      <circle cx={0} cy={-516} r={5} fill={C.linea} />
    </g>
  );

  const capaBaston = usaBaston ? (
    <g opacity={baston} transform={`translate(${manoRf[0]},${manoRf[1]}) scale(${0.6 + 0.4 * baston}) translate(${-manoRf[0]},${-manoRf[1]})`}>
      <path
        d={`M${manoRf[0] - 30},${manoRf[1] - 6} Q${manoRf[0]},${manoRf[1] - 46} ${manoRf[0] + 8},${manoRf[1]} L${manoRf[0] + 14},${-desplCuerpo - 4}`}
        stroke={C.linea}
        strokeWidth={18 + LINEA * 2}
        fill="none"
        strokeLinecap="round"
      />
      <path
        d={`M${manoRf[0] - 30},${manoRf[1] - 6} Q${manoRf[0]},${manoRf[1] - 46} ${manoRf[0] + 8},${manoRf[1]} L${manoRf[0] + 14},${-desplCuerpo - 4}`}
        stroke="#8A5A35"
        strokeWidth={18}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  ) : null;

  const cuerpoSuperior = (
    <g transform={`translate(0,${desplCuerpo}) rotate(${inclinacion}, 0, -320)`}>
      {torso}
      {cabeza}
      {brazo(HOMBRO_L, codoL, manoL, 'bl')}
      {brazo(HOMBRO_R, codoRf, manoRf, 'br')}
      {cel && <Celular x={cel.p[0]} y={cel.p[1]} rot={cel.rot} escala={0.9} />}
      {capaBaston}
      <Mano p={manoL} color={piel} />
      <Mano p={manoRf} color={piel} />
    </g>
  );

  return (
    <g transform={`translate(${x},${y}) scale(${sx},${sy})`}>
      <g transform={`scale(1,${resp})`}>
        {/* sombra */}
        <ellipse cx={0} cy={0} rx={120} ry={18} fill="#000" opacity={0.15} />
        {piernas}
        {sentadoT > 0.5 ? shortSentado : shortParado}
        {cuerpoSuperior}
      </g>
    </g>
  );
};
