import React from 'react';
import {AbsoluteFill, Audio, Easing, Freeze, Img, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {PALABRAS} from './subtitulos2';
import {BRILLOS, CLIPS, DURACION_S01V2, EVENTOS, FIN, FPS, INICIO, INI_B, INI_C, M, MEDIDOR_DESDE, ORIG_B, ORIG_C, ORIG_H, PLANOS, REPLAY, VOZ_ORDEN} from './tiempos2';
import {SonidoEventos, VidasEventos} from '../rosquillas';
import {DMedabot} from '../opciones2';

// =====================================================================
// Survive 01 · v2 · Short final
// Clips a pantalla completa (escalados con Real-ESRGAN), voz Skylar, ritmo dominó,
// vidas en rosquillas, panel Medabot, delineado con brillo y bucle con el audio original.
// =====================================================================
loadFont({family: 'LuckiestGuy', url: staticFile('fonts/LuckiestGuy-latin.woff2'), weight: '400'});
loadFont({family: 'Bangers', url: staticFile('fonts/Bangers-latin.woff2'), weight: '400'});
loadFont({family: 'Simpsonfont', url: staticFile('fonts/Simpsonfont-demo.otf'), weight: '400'});
loadFont({family: 'Chewy', url: staticFile('fonts/Chewy-latin.woff2'), weight: '400'});
// Las mediciones (velocidad, metros) tienen su propia letra y color para reconocerlas de un vistazo
const MEDIDA = '#36D6FF';

export {DURACION_S01V2};
const AM = '#FFD90F';
const ROSA = '#FF8CC6';
const NEG = '#0E0E12';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const trazo = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px ${NEG}`, paintOrder: 'stroke fill'});
const SOMBRA = 'drop-shadow(0 8px 0 rgba(0,0,0,0.3)) drop-shadow(0 16px 28px rgba(0,0,0,0.35))';
const RATIO = 2544 / 1440;

function archivoDe(src: number, forzado?: string) {
  if (forzado) return forzado;
  let mejor = 'caida';
  for (const n of ['caida', 'camilla', 'segunda', 'hospital']) if (src >= CLIPS[n]) mejor = n;
  return mejor;
}

// ---------- Plano a pantalla completa ----------
const Plano: React.FC<{p: (typeof PLANOS)[number]}> = ({p}) => {
  const f = useCurrentFrame();
  const dur = p.hasta - p.desde;
  const archivo = archivoDe(p.src, p.archivo);
  const trim = Math.round((p.src - CLIPS[archivo]) * FPS);
  let zoom = interpolate(f, [0, dur], p.zoom, clamp);
  const pan = p.pan ? interpolate(f, [0, dur], p.pan, clamp) : 0;
  let dx = 0;
  let dy = 0;
  let rojo = 0;
  if (p.golpe === 'rojo') {
    const k = f - 6; // el impacto cae justo en la palabra "Hit"
    if (k >= 0) {
      zoom *= 1 + 0.14 * Math.exp(-k / 5);
      const a = 34 * Math.exp(-k / 3.5);
      dx = Math.sin(k * 2.7) * a;
      dy = Math.cos(k * 3.3) * a;
      rojo = interpolate(k, [0, 1, 8], [0, 0.85, 0], clamp);
    }
  }
  let caja: React.CSSProperties;
  let fondo: React.ReactNode = null;
  const fuente = staticFile(`survive/s01/clips/${archivo}.mp4`);
  if (p.encaja) {
    // cuadro completo a lo ancho (se ve el cuerpo entero) + el mismo cuadro desenfocado de fondo
    const W = 1080 * zoom;
    const H = W / RATIO;
    const cxe = p.sigue ? interpolate(f / Math.max(1, dur), p.sigue.map((k) => k[0]), p.sigue.map((k) => k[1]), clamp) : 0.5;
    caja = {position: 'absolute', left: Math.min(0, Math.max(1080 - W, 540 - cxe * W)) + pan + dx, top: 900 - H / 2 + dy, width: W, height: H, borderRadius: 26, boxShadow: '0 20px 60px rgba(0,0,0,0.6)'};
    const Hf = 1920 * 1.1;
    fondo = <OffthreadVideo src={fuente} muted trimBefore={trim} playbackRate={p.vel} style={{position: 'absolute', height: Hf, width: Hf * RATIO, left: 540 - (Hf * RATIO) / 2, top: -96, filter: 'blur(28px) brightness(0.55)'}} />;
  } else {
    const H = 1920 * zoom;
    const W = H * RATIO;
    const cxv = p.sigue ? interpolate(f / Math.max(1, dur), p.sigue.map((k) => k[0]), p.sigue.map((k) => k[1]), clamp) : p.cx;
    const left = Math.min(0, Math.max(1080 - W, 540 - cxv * W + pan)) + dx;
    if (p.fy !== undefined) {
      // foco: la parte golpeada queda en el centro; si el cuadro no alcanza, el borde se funde con un fondo desenfocado
      const top = 960 - p.fy * H + dy;
      const borde = 'linear-gradient(to bottom, transparent 0, #000 90px, #000 calc(100% - 90px), transparent 100%)';
      caja = {position: 'absolute', left, top, width: W, height: H, WebkitMaskImage: borde, maskImage: borde};
      const Hf = 1920 * 1.15;
      fondo = <OffthreadVideo src={fuente} muted trimBefore={trim} playbackRate={p.vel} style={{position: 'absolute', height: Hf, width: Hf * RATIO, left: 540 - p.cx * Hf * RATIO, top: -144, filter: 'blur(30px) brightness(0.6)'}} />;
    } else {
      const cyv = p.cy2 !== undefined ? interpolate(f, [0, dur], [p.cy ?? 0.5, p.cy2], clamp) : (p.cy ?? 0.5);
      const top = (1920 - H) * cyv + dy;
      caja = {position: 'absolute', left, top, width: W, height: H};
    }
  }
  const video = (
    <>
      {fondo}
      <OffthreadVideo src={fuente} muted trimBefore={trim} playbackRate={p.vel} style={caja} />
    </>
  );
  const brillo = BRILLOS.find((b) => b.desde >= p.desde && b.desde < p.hasta);
  return (
    <AbsoluteFill style={{overflow: 'hidden', filter: p.golpe === 'replay' ? 'saturate(1.3) contrast(1.1)' : undefined}}>
      {p.congela !== undefined ? (
        <Freeze frame={p.congela} active={(fr) => fr >= p.congela!}>
          {video}
        </Freeze>
      ) : (
        video
      )}
      {brillo && <Brillo recorte={brillo.recorte} k={f - (brillo.desde - p.desde)} hasta={brillo.hasta - p.desde - f} caja={caja} />}
      {rojo > 0 && <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(255,0,0,0) 32%, rgba(225,0,0,0.95) 100%)', opacity: rojo}} />}
      {p.golpe === 'replay' && <Replay />}
    </AbsoluteFill>
  );
};

/** Homero recortado encima del cuadro congelado: delineado blanco + brillo amarillo que "hace plup". */
const Brillo: React.FC<{recorte: string; k: number; hasta: number; caja: React.CSSProperties}> = ({recorte, k, hasta, caja}) => {
  if (k < 0 || hasta <= 0) return null;
  const pop = interpolate(k, [0, 3, 7], [0, 1.25, 1], clamp);
  const sale = interpolate(hasta, [0, 4], [0, 1], clamp);
  const glow = 18 + 20 * pop;
  return (
    <>
      <AbsoluteFill style={{background: 'rgba(0,0,0,0.28)', opacity: Math.min(1, pop) * sale}} />
      <Img
        src={staticFile(`survive/s01/clips/${recorte}`)}
        style={{
          ...caja,
          opacity: sale,
          transform: `scale(${1 + 0.02 * pop})`,
          filter: `drop-shadow(0 0 3px #fff) drop-shadow(0 0 3px #fff) drop-shadow(0 0 3px #fff) drop-shadow(0 0 ${glow}px ${AM}) drop-shadow(0 0 ${glow * 1.6}px ${AM})`,
        }}
      />
    </>
  );
};

const Replay: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(255,0,0,0) 40%, rgba(200,0,0,0.55) 100%)'}} />
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 3px, transparent 3px 7px)'}} />
      <div style={{position: 'absolute', top: 470, left: 50, fontFamily: 'Bangers', fontSize: 74, letterSpacing: 4, color: '#fff', background: '#E11D48', padding: '4px 26px', borderRadius: 12, border: `5px solid ${NEG}`, opacity: Math.floor(f / 7) % 2 ? 1 : 0.7}}>
        ● REPLAY 0.3x
      </div>
    </>
  );
};

// ---------- Cinta métrica 3D pegada al sendero del acantilado ----------
const LARGO = 1220; // largo total de la cinta (antes de la perspectiva): el final queda dentro de la pantalla
const Cinta: React.FC = () => {
  const f = useCurrentFrame();
  const largo = interpolate(f, [0, 16], [0, LARGO], {...clamp, easing: Easing.out(Easing.cubic)});
  const salida = interpolate(f, [M.SO - INICIO['02_deep'] - 5, M.SO - INICIO['02_deep']], [1, 0], clamp);
  const etiqueta = f - (M.THIRTY - INICIO['02_deep'] + 2);
  const paso = LARGO / 100; // 1 m
  return (
    <AbsoluteFill style={{perspective: 1300, opacity: salida}}>
      <div style={{position: 'absolute', left: 560, top: 100, transformOrigin: 'top center', transform: 'rotateX(32deg) rotateZ(-4deg)', transformStyle: 'preserve-3d'}}>
        {/* carcasa de la cinta */}
        <div style={{position: 'absolute', left: -52, top: -78, width: 178, height: 118, borderRadius: 28, background: 'linear-gradient(160deg,#FDE047,#CA8A04)', border: `6px solid ${NEG}`, boxShadow: '0 10px 0 rgba(0,0,0,0.3)'}}>
          <div style={{position: 'absolute', left: 58, top: 26, width: 52, height: 52, borderRadius: 26, background: '#3F3F46', border: `5px solid ${NEG}`}} />
        </div>
        <div style={{position: 'relative', width: 76, height: largo, overflow: 'hidden', background: 'linear-gradient(90deg,#EAB308,#FDE68A 45%,#FACC15 70%,#CA8A04)', borderLeft: `4px solid ${NEG}`, borderRight: `4px solid ${NEG}`, boxShadow: '10px 0 16px rgba(0,0,0,0.35)'}}>
          {Array.from({length: 101}).map((_, m) => (
            <div key={m} style={{position: 'absolute', top: m * paso, left: 0, width: m % 10 === 0 ? 40 : m % 5 === 0 ? 26 : 14, height: m % 10 === 0 ? 5 : 3, background: NEG}} />
          ))}
          {Array.from({length: 10}).map((_, i) => (
            <div key={i} style={{position: 'absolute', top: (i + 1) * 10 * paso - 30, left: 20, fontFamily: 'Bangers', fontSize: 30, letterSpacing: 1, color: NEG, transform: 'rotate(-90deg)', transformOrigin: 'left top', whiteSpace: 'nowrap'}}>
              {(i + 1) * 10} M
            </div>
          ))}
        </div>
        {/* etiqueta al costado del final, con el mismo diseño de la cinta */}
        {etiqueta >= 0 && (
          <div style={{position: 'absolute', right: 84, top: LARGO - 420, transform: `scale(${interpolate(etiqueta, [0, 4, 7], [0.4, 1.08, 1], clamp)})`, transformOrigin: 'right center', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap'}}>
            <div style={{background: 'linear-gradient(180deg,#FDE68A,#FACC15)', border: `5px solid ${NEG}`, borderRadius: 10, padding: '6px 18px', fontFamily: 'Bangers', color: NEG, lineHeight: 0.95, textAlign: 'center', boxShadow: '0 8px 0 rgba(0,0,0,0.3)'}}>
              <div style={{fontSize: 62, letterSpacing: 2}}>100 M</div>
              <div style={{fontSize: 32, letterSpacing: 2}}>≈ 30 FLOORS</div>
            </div>
            <div style={{width: 30, height: 6, background: NEG}} />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

/** Dato discreto (no tapa el video): pastilla semitransparente. */
const Dato: React.FC<{children: React.ReactNode; x: number; y: number; k: number; hasta: number; tam?: number}> = ({children, x, y, k, hasta, tam = 58}) => {
  if (k < 0 || hasta <= 0) return null;
  const s = interpolate(k, [0, 4, 7], [0.6, 1.08, 1], clamp);
  const o = interpolate(hasta, [0, 4], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, opacity: o * 0.95, fontFamily: 'LuckiestGuy', fontSize: tam, color: '#fff', background: 'rgba(14,14,18,0.55)', padding: '10px 26px', borderRadius: 22, whiteSpace: 'nowrap', ...trazo(6)}}>
      {children}
    </div>
  );
};

/** Medición (velocidad): letra Chewy en celeste, como un cartel pintado de la serie. */
const Medida: React.FC<{valor: number; unidad: string; k: number; hasta: number; x?: number; y?: number}> = ({valor, unidad, k, hasta, x = 770, y = 1030}) => {
  if (k < 0 || hasta <= 0) return null;
  const s = interpolate(k, [0, 4, 7], [0.5, 1.12, 1], clamp);
  const o = interpolate(hasta, [0, 4], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${s}) rotate(-4deg)`, opacity: o, fontFamily: 'Chewy', color: MEDIDA, whiteSpace: 'nowrap', lineHeight: 0.9, ...trazo(11), filter: SOMBRA}}>
      <span style={{fontSize: 120}}>{Math.round(valor)}</span>
      <span style={{fontSize: 58, color: '#fff'}}> MPH</span>
    </div>
  );
};

const Velocidad: React.FC = () => {
  const f = useCurrentFrame();
  const k = f - M.SO;
  if (k < 0 || f > FIN['02_deep'] + 3) return null;
  const v = interpolate(f, [M.SO, M.HUNDRED + 5], [0, 100], {...clamp, easing: Easing.out(Easing.cubic)});
  return <Medida valor={v} unidad="MPH" k={k} hasta={FIN['02_deep'] + 3 - f} />;
};

const Velocidad2: React.FC = () => {
  const f = useCurrentFrame();
  if (f < M.EVERY || f > FIN['05_twist'] + 2) return null;
  const v = interpolate(f, [M.EVERY + 6, M.BRAKES + 4], [100, 45], {...clamp, easing: Easing.inOut(Easing.cubic)});
  return <Medida valor={v} unidad="MPH" k={f - M.EVERY} hasta={FIN['05_twist'] + 2 - f} />;
};

// ---------- Latido que avanza (sigue vivo) ----------
const PERIODO = 22;
const Latido: React.FC = () => {
  const f = useCurrentFrame();
  const ini = M.ALIVE - 4;
  const fin = INI_C - 2;
  if (f < ini || f > fin) return null;
  const k = f - ini;
  const pts: string[] = [];
  for (let x = 0; x <= 1080; x += 6) {
    const fase = (((x - k * 16) % 352) + 352) % 352 / 352;
    let y = 0;
    if (fase > 0.4 && fase < 0.45) y = -110;
    else if (fase >= 0.45 && fase < 0.5) y = 80;
    else if (fase > 0.58 && fase < 0.68) y = -22;
    pts.push(`${x},${y}`);
  }
  const o = interpolate(k, [0, 4], [0, 1], clamp) * interpolate(fin - f, [0, 4], [0, 1], clamp);
  return (
    <svg width={1080} height={300} style={{position: 'absolute', top: 1330, left: 0, opacity: o}}>
      <polyline points={pts.join(' ')} transform="translate(0,150)" fill="none" stroke="#34F5A1" strokeWidth={9} strokeLinejoin="round" style={{filter: 'drop-shadow(0 0 10px #34F5A1) drop-shadow(0 4px 0 rgba(0,0,0,0.5))'}} />
    </svg>
  );
};
const BIPS = Array.from({length: 6}).map((_, i) => M.ALIVE - 4 + 6 + i * PERIODO).filter((b) => b < INI_C - 2);

// ---------- Caso real: la azafata que sobrevivió (ilustración estilo serie) ----------
// Colores planos, contorno marrón oscuro, una sombra dura; nubes y cielo como en la serie.
const OL = '#2B1A10';
const CREMA = '#FFF6DF';

/** DC-9 de perfil (el avión real del vuelo 367): cola en T, motores atrás, un solo ala visible bajo el fuselaje. */
const Avion: React.FC = () => (
  <g stroke={OL} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
    {/* ala (la del lado de la cámara), en flecha hacia atrás, bajo el fuselaje */}
    <path d="M232 76 L196 78 L128 124 L150 126 Z" fill="#C9C6BE" />
    <path d="M150 126 L128 124 L134 120 L156 121 Z" fill="#D6312B" />
    {/* fuselaje */}
    <path d="M24 44 L330 40 Q370 41 386 60 Q372 82 330 84 L84 84 Q50 80 24 58 Z" fill="#F7F4EC" />
    {/* sombra dura de la panza */}
    <path d="M84 84 L330 84 Q366 82 382 66 L60 70 Q70 78 84 84 Z" fill="#D9D4C8" stroke="none" />
    <path d="M24 44 L330 40 Q370 41 386 60 Q372 82 330 84 L84 84 Q50 80 24 58 Z" fill="none" />
    {/* franja de la aerolínea */}
    <path d="M40 56 L346 52 L352 58 L46 62 Z" fill="#D6312B" stroke="none" />
    {/* ventanillas */}
    {Array.from({length: 15}).map((_, i) => (
      <rect key={i} x={118 + i * 14} y={45} width={7} height={8} rx={3} fill="#3E6FA8" stroke="none" />
    ))}
    {/* cabina */}
    <path d="M352 47 L372 50 L378 56 L354 55 Z" fill="#2E4A6E" strokeWidth={3} />
    {/* puerta */}
    <rect x={322} y={44} width={12} height={24} rx={3} fill="none" strokeWidth={3} />
    {/* deriva (cola en T) */}
    <path d="M30 44 L96 42 L50 -44 L18 -44 Z" fill="#D6312B" />
    <path d="M40 22 L80 21 L72 8 L34 9 Z" fill={CREMA} stroke="none" />
    {/* estabilizador horizontal encima de la deriva */}
    <path d="M58 -44 L-6 -58 L-14 -52 L22 -40 Z" fill="#F7F4EC" />
    {/* motor trasero con su pilón */}
    <path d="M96 52 L108 40" strokeWidth={5} />
    <rect x={64} y={18} width={86} height={28} rx={14} fill="#E8E4DA" />
    <path d="M70 38 L144 38 Q148 40 146 44 L76 46 Q66 44 70 38 Z" fill="#C2BDB2" stroke="none" />
    <rect x={64} y={18} width={86} height={28} rx={14} fill="none" />
    <ellipse cx={150} cy={32} rx={6} ry={13} fill="#3A3330" />
  </g>
);

/** Nube como las del cielo de la serie: blanca, sin contorno, sombra lila abajo. */
const Nube: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 40 Q-4 14 26 14 Q34 -8 62 0 Q80 -16 104 2 Q134 -2 134 26 Q152 34 140 46 L4 48 Q-8 46 0 40 Z" fill="#FFFFFF" />
    <path d="M4 48 L140 46 Q146 40 140 36 Q100 44 60 40 Q30 44 0 40 Q-2 46 4 48 Z" fill="#D7DDF2" />
  </g>
);

/** Pino plano con contorno */
const Pino: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke={OL} strokeWidth={4} strokeLinejoin="round">
    <rect x={-6} y={0} width={12} height={22} fill="#7A4A2A" />
    <path d="M0 -92 L30 -40 L18 -40 L40 0 L-40 0 L-18 -40 L-30 -40 Z" fill="#2F7D46" />
    <path d="M0 -92 L30 -40 L18 -40 L40 0 L10 0 L0 -60 Z" fill="#225E35" stroke="none" />
    <path d="M0 -92 L30 -40 L18 -40 L40 0 L-40 0 L-18 -40 L-30 -40 Z" fill="none" />
    <path d="M-10 -76 L0 -92 L10 -76 Q0 -70 -10 -76 Z" fill="#FFFFFF" />
  </g>
);

/** Homero chiquito cayendo: gordito, camisa blanca, pantalón azul, dos pelos y barba de tres días. */
const HomeroCae: React.FC<{giro: number}> = ({giro}) => (
  <g transform={`rotate(${giro}) scale(1.4)`} stroke={OL} strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round">
    {/* brazos arriba */}
    <path d="M-12 -6 Q-26 -14 -28 -30" fill="none" stroke={OL} strokeWidth={9} />
    <path d="M-12 -6 Q-26 -14 -28 -30" fill="none" stroke={AM} strokeWidth={5} />
    <path d="M12 -6 Q26 -14 28 -30" fill="none" stroke={OL} strokeWidth={9} />
    <path d="M12 -6 Q26 -14 28 -30" fill="none" stroke={AM} strokeWidth={5} />
    <circle cx={-28} cy={-32} r={4.5} fill={AM} />
    <circle cx={28} cy={-32} r={4.5} fill={AM} />
    {/* piernas (pantalón azul) y zapatos grises */}
    <path d="M-14 16 L-18 34 L-6 34 L-3 18 Z" fill="#2F6FD0" />
    <path d="M14 16 L18 34 L6 34 L3 18 Z" fill="#2F6FD0" />
    <ellipse cx={-13} cy={37} rx={8} ry={4} fill="#5B5F6B" />
    <ellipse cx={13} cy={37} rx={8} ry={4} fill="#5B5F6B" />
    {/* panza: pantalón abajo, camisa blanca arriba */}
    <ellipse cx={0} cy={12} rx={19} ry={11} fill="#2F6FD0" />
    <path d="M-17 6 Q-20 -10 -10 -12 L10 -12 Q20 -10 17 6 Q0 12 -17 6 Z" fill="#FFFFFF" />
    {/* mangas */}
    <path d="M-10 -12 L-17 -7 L-13 -2 Z" fill="#FFFFFF" />
    <path d="M10 -12 L17 -7 L13 -2 Z" fill="#FFFFFF" />
    {/* cabeza */}
    <path d="M-9 -12 L-9 -30 Q-9 -42 1 -42 Q11 -42 11 -30 L11 -16 Z" fill={AM} />
    {/* barba de tres días */}
    <path d="M-2 -22 Q-6 -10 4 -10 Q14 -10 13 -20 Q10 -23 4 -22 Z" fill="#C9A26A" />
    <path d="M1 -14 Q5 -12 9 -15" fill="none" strokeWidth={1.8} />
    {/* ojos */}
    <circle cx={2} cy={-30} r={5} fill="#FFFFFF" />
    <circle cx={10} cy={-30} r={5} fill="#FFFFFF" />
    <circle cx={3} cy={-30} r={1.3} fill={OL} stroke="none" />
    <circle cx={11} cy={-30} r={1.3} fill={OL} stroke="none" />
    {/* nariz */}
    <path d="M10 -25 Q16 -25 16 -22 Q16 -19 11 -20" fill={AM} strokeWidth={2} />
    {/* oreja */}
    <path d="M-8 -26 Q-12 -26 -12 -22 Q-12 -18 -8 -19" fill={AM} strokeWidth={2} />
    {/* los dos pelos */}
    <path d="M-4 -42 Q-2 -50 2 -42 M2 -42 Q4 -50 8 -42" fill="none" strokeWidth={1.8} />
    {/* boca abierta del grito */}
    <ellipse cx={6} cy={-15} rx={3} ry={2.2} fill="#7A2A1E" strokeWidth={1.5} />
  </g>
);

const CasoReal: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ini = M.FLIGHT - 4;
  const fin = FIN['06b_real'] + 2;
  if (f < ini || f > fin) return null;
  const k = f - ini;
  const s = spring({frame: k, fps, config: {damping: 13, stiffness: 210}});
  const sale = interpolate(fin - f, [0, 5], [0, 1], clamp);
  const caida = interpolate(f, [M.FLIGHT + 2, M.SIXMILE + 6], [0, 1], {...clamp, easing: Easing.in(Easing.quad)});
  const km = caida * 10;
  const sello = f - (M.SIXMILE + 10);
  // trayectoria de la caída: del avión a la nieve
  const P0 = [236, 360];
  const P1 = [400, 390];
  const P2 = [520, 560];
  const t = caida;
  const px = (1 - t) * (1 - t) * P0[0] + 2 * (1 - t) * t * P1[0] + t * t * P2[0];
  const py = (1 - t) * (1 - t) * P0[1] + 2 * (1 - t) * t * P1[1] + t * t * P2[1];
  const sube = Math.sin(k / 9) * 4;
  return (
    <div style={{position: 'absolute', left: 64, right: 64, top: 460, height: 660, transform: `translateY(${(1 - s) * 300}px) scale(${0.85 + 0.15 * s}) rotate(-1.5deg)`, opacity: Math.min(1, s * 1.4) * sale, filter: `drop-shadow(0 14px 0 rgba(43,26,16,0.55))`}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 36, border: `7px solid ${OL}`, overflow: 'hidden', background: '#6FB6E8'}}>
        <svg width={952} height={660} viewBox="0 0 952 660" style={{position: 'absolute', left: -7, top: -7}}>
          {/* cielo: franja más clara arriba, como el fondo de la serie */}
          <rect x={0} y={0} width={952} height={660} fill="#6FB6E8" />
          <rect x={0} y={0} width={952} height={140} fill="#7EC2EE" />
          <Nube x={620 - k * 0.6} y={300} s={1.3} />
          <Nube x={40 + k * 0.4} y={400} s={1.0} />
          <Nube x={760 - k * 0.3} y={70} s={0.9} />
          {/* línea punteada de la caída */}
          <path d={`M${P0[0]} ${P0[1]} Q${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`} fill="none" stroke="#FFFFFF" strokeWidth={6} strokeDasharray="2 18" strokeLinecap="round" opacity={0.9} pathLength={1} style={{strokeDashoffset: 0}} />
          {/* montaña nevada (cayó en una ladera con nieve) */}
          <path d="M-10 670 L-10 520 Q160 440 330 500 Q480 450 640 520 Q800 470 962 520 L962 670 Z" fill="#F4F7FB" stroke={OL} strokeWidth={6} strokeLinejoin="round" />
          <path d="M-10 670 L-10 590 Q200 540 420 600 Q640 560 962 610 L962 670 Z" fill="#CFDDEE" />
          <Pino x={110} y={540} s={1} />
          <Pino x={175} y={560} s={0.8} />
          <Pino x={760} y={548} s={1.05} />
          <Pino x={850} y={565} s={0.85} />
          {/* hoyo en la nieve donde aterriza */}
          {caida >= 1 && <ellipse cx={P2[0]} cy={P2[1] + 8} rx={40} ry={12} fill="#9FB4CF" stroke={OL} strokeWidth={4} />}
          {/* avión */}
          <g transform={`translate(46 ${196 + sube}) rotate(-5) scale(1.32)`}>
            <Avion />
          </g>
          {/* la azafata */}
          {caida > 0 && caida < 1 && (
            <g transform={`translate(${px} ${py})`}>
              <HomeroCae giro={k * 14} />
            </g>
          )}
        </svg>
        {/* rótulo superior */}
        <div style={{position: 'absolute', left: 30, top: 26, fontFamily: 'LuckiestGuy', fontSize: 40, color: CREMA, background: '#D6312B', border: `5px solid ${OL}`, padding: '6px 22px 0', borderRadius: 18, transform: 'rotate(-2deg)', boxShadow: `0 6px 0 ${OL}`}}>REAL CASE · 1972</div>
        {/* contador de la caída */}
        <div style={{position: 'absolute', right: 36, top: 120, textAlign: 'right'}}>
          <div style={{fontFamily: 'LuckiestGuy', fontSize: 140, lineHeight: 0.9, color: AM, WebkitTextStroke: `14px ${OL}`, paintOrder: 'stroke fill', filter: `drop-shadow(0 7px 0 ${OL})`}}>
            {km.toFixed(km < 10 ? 1 : 0)}
            <span style={{fontSize: 66}}> KM</span>
          </div>
          <div style={{fontFamily: 'LuckiestGuy', fontSize: 46, color: '#fff', WebkitTextStroke: `9px ${OL}`, paintOrder: 'stroke fill', opacity: interpolate(f, [M.SIXMILE + 4, M.SIXMILE + 8], [0, 1], clamp)}}>(6 MILES) FALL</div>
        </div>
        {/* sello */}
        {sello >= 0 && (
          <div style={{position: 'absolute', right: 40, top: 370, transform: `rotate(-8deg) scale(${interpolate(sello, [0, 4, 7], [2.4, 0.92, 1], clamp)})`, opacity: interpolate(sello, [0, 3], [0, 1], clamp), fontFamily: 'LuckiestGuy', fontSize: 84, color: '#fff', background: '#2FA84F', border: `7px solid ${OL}`, borderRadius: 22, padding: '8px 28px 0', boxShadow: `0 8px 0 ${OL}`, WebkitTextStroke: `7px ${OL}`, paintOrder: 'stroke fill'}}>
            SURVIVED ✓
          </div>
        )}
        {/* nombre */}
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 64, background: CREMA, borderTop: `6px solid ${OL}`, fontFamily: 'LuckiestGuy', fontSize: 34, color: OL, textAlign: 'center', paddingTop: 16}}>VESNA VULOVIC · FLIGHT ATTENDANT</div>
      </div>
    </div>
  );
};

// ---------- Veredicto ----------
const Fila: React.FC<{titulo: string; k: number; texto: string; color: string; icono: string}> = ({titulo, k, texto, color, icono}) => {
  const s = interpolate(k, [0, 4, 7], [2.2, 0.94, 1], clamp);
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 22, marginBottom: 30}}>
      <div style={{fontFamily: 'LuckiestGuy', fontSize: 84, color: '#fff', background: 'rgba(14,14,18,0.8)', padding: '12px 32px', borderRadius: 24, border: `5px solid ${NEG}`, ...trazo(4)}}>{titulo}</div>
      {k >= 0 && (
        <div style={{transform: `scale(${s}) rotate(-4deg)`, opacity: interpolate(k, [0, 3], [0, 1], clamp), fontFamily: 'LuckiestGuy', fontSize: 96, color: '#fff', background: color, padding: '8px 34px', borderRadius: 24, border: `6px solid ${NEG}`, ...trazo(8)}}>
          {texto} {icono}
        </div>
      )}
    </div>
  );
};
const Veredicto: React.FC = () => {
  const f = useCurrentFrame();
  if (f < INICIO['08_verdict'] - 2 || f >= INI_B) return null;
  const sale = interpolate(INI_B - f, [0, 4], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', left: 60, top: 520, opacity: sale, filter: SOMBRA}}>
      <Fila titulo="FALL #1" k={f - M.MAYBE} texto="MAYBE" color="#16A34A" icono="✓" />
      <Fila titulo="FALL #2" k={f - M.KILLS} texto="DEAD" color="#DC2626" icono="☠" />
    </div>
  );
};

// ---------- Título del gancho ----------
const Titulo: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const ini = M.BUT;
  const fin = FIN['01_hook'] + 4;
  if (f < ini || f > fin) return null;
  const s = spring({frame: f - ini, fps, config: {damping: 11, stiffness: 220}});
  const o = interpolate(fin - f, [0, 4], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', top: 760, width: '100%', textAlign: 'center', fontFamily: 'LuckiestGuy', lineHeight: 0.98, transform: `rotate(-3deg) scale(${0.5 + 0.5 * s})`, opacity: o, filter: SOMBRA}}>
      <div style={{fontSize: 100, color: '#fff', ...trazo(17)}}>COULD A REAL HUMAN</div>
      <div style={{fontSize: 126, color: AM, ...trazo(19)}}>SURVIVE THIS?</div>
    </div>
  );
};

// ---------- Subtítulos: una palabra a la vez (como el video de referencia) ----------
const CLAVE = new Set(['kill', 'ambulance', 'thirty', 'hundred', 'clean', 'ribs', 'spleen', 'lungs', 'skull', 'twist', 'brakes', 'alive', 'real', 'sixmile', 'again', 'same', 'maybe', 'kills', 'you']);
const SIN_SUB_DESDE: Record<string, number> = {'01_hook': M.BUT}; // ahí entra el título
// Frases originales: [desde (fotograma), segundo del episodio en que empieza el audio, palabras, color]
const ORIGINALES: [number, number, [string, number][], string][] = [
  [0, ORIG_H.src, [["DON'T", 1189.65], ['YOU', 1189.85], ['THINK', 1189.95], ['I', 1190.21], ['KNOW', 1190.33], ['THAT?', 1190.57]], AM],
  [INI_C, ORIG_C.src, [['BONES', 984.75], ['HEAL,', 985.09], ['CHICKS', 985.73], ['DIG', 986.03], ['SCARS!', 986.27]], '#7CFF4F'],
  [INI_B, ORIG_B.src, [['BUT,', 1187.57], ['DAD,', 1188.03], ["YOU'LL", 1188.57], ['NEVER', 1188.75], ['MAKE', 1189.05], ['IT.', 1189.33]], '#fff'],
];
const DUR_ORIG = [ORIG_H.dur, ORIG_C.dur, ORIG_B.dur];
const Palabra: React.FC<{w: string; k: number; color: string}> = ({w, k, color}) => {
  const pop = interpolate(k, [0, 2, 4], [0.7, 1.12, 1], clamp);
  return (
    <div style={{position: 'absolute', top: 1220, width: '100%', textAlign: 'center', fontFamily: 'LuckiestGuy', fontSize: 118, color, transform: `scale(${pop}) rotate(-2deg)`, ...trazo(18), filter: SOMBRA}}>
      {w}
    </div>
  );
};
const Subtitulos: React.FC = () => {
  const f = useCurrentFrame();
  for (let j = 0; j < ORIGINALES.length; j++) {
    const [ini, src, pals, color] = ORIGINALES[j];
    if (f < ini || f >= ini + DUR_ORIG[j]) continue;
    const t = src + (f - ini) / FPS;
    let actual: [string, number] | undefined;
    for (const w of pals) if (t >= w[1] - 0.03) actual = w;
    if (!actual) return null;
    return <Palabra w={actual[0]} k={Math.round((t - actual[1]) * FPS)} color={color} />;
  }
  for (const id of VOZ_ORDEN) {
    const ps = PALABRAS[id];
    const t = (f - INICIO[id]) / FPS;
    if (t < 0 || t > ps[ps.length - 1][2] + 0.08) continue;
    if (SIN_SUB_DESDE[id] !== undefined && f >= SIN_SUB_DESDE[id]) return null;
    let w = ps[0];
    for (const p of ps) if (t >= p[1] - 0.02) w = p;
    const limpio = w[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const color = CLAVE.has(limpio) ? (['kill', 'ribs', 'spleen', 'lungs', 'skull', 'kills', 'again', 'same'].indexOf(limpio) >= 0 ? '#FF4D4D' : ROSA) : '#fff';
    return <Palabra w={w[0].toUpperCase()} k={Math.round((t - w[1]) * FPS)} color={color} />;
  }
  return null;
};

// ---------- Nombre del capítulo: en el hueco entre el borde de arriba y el video, hasta que entra la voz ----------
// Letras amarillas con contorno grueso y sombra dura, cada una a su altura y con su giro, como el logo de la serie.
const EPISODIO = 'BART THE DAREDEVIL';
const TituloEpisodio: React.FC = () => {
  const f = useCurrentFrame();
  const fin = INICIO['01_hook']; // hasta que entra nuestra voz
  if (f > fin) return null;
  const sale = interpolate(f, [fin - 5, fin], [1, 0], clamp);
  const giros = [-6, 4, -3, 7, -5, 3, -7, 5, -2, 6, -4, 3, -6, 4, -3, 5, -5, 2];
  const alturas = [0, -6, 4, -3, 6, -5, 2, -7, 5, -2, 4, -6, 3, -4, 6, -3, 5, -5];
  return (
    <div style={{position: 'absolute', top: 205, width: '100%', textAlign: 'center', opacity: sale}}>
      <div style={{display: 'inline-block', fontFamily: 'LuckiestGuy', fontSize: 30, color: '#fff', background: '#D6312B', border: `5px solid ${NEG}`, borderRadius: 14, padding: '6px 18px 0', transform: 'rotate(-2deg)', boxShadow: `0 6px 0 ${NEG}`}}>
        SEASON 2 · EPISODE 8
      </div>
      <div style={{marginTop: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', filter: `drop-shadow(0 7px 0 ${NEG})`}}>
        {EPISODIO.split('').map((c, i) => {
          if (c === ' ') return <span key={i} style={{display: 'inline-block', width: 26}} />;
          const k = f - i * 1.1;
          const pop = interpolate(k, [0, 3, 6], [0, 1.2, 1], clamp);
          return (
            <span key={i} style={{display: 'inline-block', fontFamily: 'Simpsonfont', fontSize: 86, color: AM, transform: `translateY(${alturas[i % alturas.length]}px) rotate(${giros[i % giros.length]}deg) scale(${pop})`, ...trazo(16), margin: '0 -1px'}}>
              {c === ' ' ? '\u00A0' : c}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Gancho del cuadro 0 (2 s): letrero de alarma "W8 4 IT" que se prende y se apaga ----------
// W8 4 IT = "wait for it" (jerga de internet en EE. UU.): avisa que el final vale la pena.
const ALARMA_CICLO = 14; // fotogramas por destello
const ALARMA_ON = 9; // fotogramas encendido dentro de cada ciclo
const ALARMA_FIN = 60;
export const ALARMA_DESTELLOS = [0, 1, 2, 3].map((i) => i * ALARMA_CICLO);
const Sirena: React.FC<{on: boolean; lado: 1 | -1; f: number}> = ({on, lado, f}) => {
  const giro = (f * 24 * lado) % 360;
  return (
    <div style={{position: 'relative', width: 78, height: 92}}>
      {on && (
        <div style={{position: 'absolute', left: -60, top: -50, width: 198, height: 198, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,60,40,0.75) 0%, rgba(255,60,40,0.25) 40%, rgba(255,60,40,0) 70%)', transform: `rotate(${giro}deg)`}} />
      )}
      {/* cúpula */}
      <div style={{position: 'absolute', left: 4, top: 0, width: 70, height: 70, borderRadius: '35px 35px 8px 8px', border: `6px solid ${NEG}`,
        background: on ? 'radial-gradient(circle at 35% 30%, #FFE3DC 0%, #FF4A2E 35%, #C4120B 100%)' : 'radial-gradient(circle at 35% 30%, #A0524A 0%, #6E1A14 45%, #3E0B08 100%)'}} />
      {/* base */}
      <div style={{position: 'absolute', left: 0, top: 66, width: 78, height: 22, borderRadius: 6, background: '#5B5F6B', border: `6px solid ${NEG}`}} />
    </div>
  );
};
const Gancho: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f > ALARMA_FIN + 6) return null;
  const on = f < ALARMA_FIN && f % ALARMA_CICLO < ALARMA_ON;
  const entra = spring({frame: f, fps, config: {damping: 10, stiffness: 260}});
  const sale = interpolate(f, [ALARMA_FIN, ALARMA_FIN + 6], [1, 0], clamp);
  const k = f % ALARMA_CICLO;
  const latido = on ? interpolate(k, [0, 2, 5], [1.07, 1.0, 1.0], clamp) : 0.985;
  const brillo = on ? '0 0 18px #FF3B2F, 0 0 42px rgba(255,59,47,0.8)' : 'none';
  return (
    <div style={{position: 'absolute', top: 150, width: '100%', display: 'flex', justifyContent: 'center', opacity: sale, filter: SOMBRA}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, transform: `rotate(-3deg) scale(${(0.8 + 0.2 * entra) * latido})`}}>
        <Sirena on={on} lado={-1} f={f} />
        {/* letrero con borde de franjas de peligro */}
        <div style={{padding: 12, borderRadius: 26, border: `6px solid ${NEG}`, background: `repeating-linear-gradient(-45deg, ${AM} 0 22px, ${NEG} 22px 44px)`}}>
          <div style={{borderRadius: 16, border: `5px solid ${NEG}`, background: on ? '#2A0B0B' : '#160707', padding: '6px 30px 0', textAlign: 'center'}}>
            <div style={{fontFamily: 'LuckiestGuy', fontSize: 96, lineHeight: 1.05, color: on ? '#FFF1E8' : '#5A2320', textShadow: brillo, letterSpacing: 3}}>W8 4 IT</div>
          </div>
        </div>
        <Sirena on={on} lado={1} f={f} />
      </div>
    </div>
  );
};

// ---------- Panel Medabot durante los golpes ----------
const PanelDano: React.FC = () => {
  const f = useCurrentFrame();
  const ini = M.HIT[0] - 3;
  const fin = M.EVERY;
  if (f < ini || f > fin) return null;
  let i = -1;
  M.HIT.forEach((h, j) => {
    if (f >= h) i = j;
  });
  const k = i >= 0 ? f - M.HIT[i] : 0;
  const entra = interpolate(f - ini, [0, 6], [300, 0], {...clamp, easing: Easing.out(Easing.back(1.4))});
  const sale = interpolate(fin - f, [0, 5], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(${entra + (1 - sale) * 300}px, 250px) scale(0.86)`, transformOrigin: 'right top'}}>
      <DMedabot e={{i, k}} />
    </div>
  );
};

// ---------- Audio ----------
const SFX: [string, number, number][] = [];
PLANOS.forEach((p, i) => {
  if (i > 0 && !p.golpe && p.desde < INI_B) SFX.push(['swish', p.desde - 2, 0.16]);
});
[...M.HIT, M.SAME].forEach((h) => {
  SFX.push(['bonk', h, 0.7]);
  SFX.push(['impacto', h, 0.35]);
});
BRILLOS.forEach((b) => SFX.push(['brillo', b.desde, 0.55]));
BIPS.forEach((b) => SFX.push(['bip', b, 0.35]));
SFX.push(
  ['ding', M.THIRTY, 0.3],
  ['ding', M.HUNDRED + 5, 0.35],
  ['impacto', REPLAY.desde + Math.round(0.25 / 0.3 * FPS), 0.5],
  ['pop', M.TWIST, 0.45],
  ['swish', M.FLIGHT - 5, 0.3],
  ['ding', M.SIXMILE + 8, 0.4],
  ['sello', M.SIXMILE + 10, 0.6],
  ['riser', INICIO['07_again'] - 14, 0.2],
  ['pop', M.MAYBE, 0.45],
  ['sello', M.KILLS, 0.95],
);

function volMusica(f: number) {
  const base = 0.1;
  const bajo = f < ORIG_H.dur + 2 || f >= INI_B - 2 || (f >= INI_C - 2 && f < INI_C + ORIG_C.dur + 2);
  const orig = bajo ? 0.25 : 1; // baja mucho bajo el audio original
  const ext = interpolate(f, [0, 3, DURACION_S01V2 - 8, DURACION_S01V2], [0.6, 1, 1, 0], clamp);
  return base * orig * ext;
}

export const Survive01v2: React.FC = () => {
  const f = useCurrentFrame();
  const visibleMedidor = interpolate(f, [MEDIDOR_DESDE, MEDIDOR_DESDE + 6, INI_B - 4, INI_B], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {PLANOS.map((p, i) => (
        <Sequence key={i} from={p.desde} durationInFrames={p.hasta - p.desde}>
          <Plano p={p} />
        </Sequence>
      ))}
      <Sequence from={INICIO['02_deep'] - 2} durationInFrames={M.SO - INICIO['02_deep'] + 2}>
        <Cinta />
      </Sequence>
      <Velocidad />
      <Velocidad2 />
      <Latido />
      <CasoReal />
      <Veredicto />
      <PanelDano />
      {visibleMedidor > 0 && <VidasEventos eventos={EVENTOS} visible={visibleMedidor} left={40} top={100} escala={0.6} />}
      <Titulo />
      <TituloEpisodio />
      <Subtitulos />

      {/* audio */}
      <Audio src={staticFile('survive/sfx/musica.wav')} volume={volMusica} />
      <Audio src={staticFile(`survive/s01/clips/${ORIG_H.archivo}`)} volume={1} />
      <Sequence from={INI_C}>
        <Audio src={staticFile(`survive/s01/clips/${ORIG_C.archivo}`)} volume={1} />
      </Sequence>
      <Sequence from={INI_B}>
        <Audio src={staticFile(`survive/s01/clips/${ORIG_B.archivo}`)} volume={1} />
      </Sequence>
      {VOZ_ORDEN.map((id) => (
        <Sequence key={id} from={INICIO[id]}>
          <Audio src={staticFile(`survive/s01/voz2/${id}.mp3`)} volume={1} />
        </Sequence>
      ))}
      {SFX.map(([n, desde, vol], i) => (
        <Sequence key={i} from={Math.max(0, desde)}>
          <Audio src={staticFile(`survive/sfx/${n}.wav`)} volume={vol} />
        </Sequence>
      ))}
      <SonidoEventos eventos={EVENTOS} />
    </AbsoluteFill>
  );
};
