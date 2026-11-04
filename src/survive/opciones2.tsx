import React from 'react';
import {AbsoluteFill, Easing, Freeze, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/fonts';

// =====================================================================
// Opciones v2 (en movimiento, dentro del video real):
//  - DemoMedidores: 5 estilos completos (medidor + letra del título + letra de subtítulos).
//  - DemoDano: 5 indicadores de daño que palpitan con cada golpe.
// =====================================================================
['LuckiestGuy', 'TitanOne', 'Chewy', 'LilitaOne', 'Bangers'].forEach((f) => loadFont({family: f, url: staticFile(`fonts/${f}-latin.woff2`), weight: '400'}));

const AM = '#FFD90F';
const NEG = '#0E0E12';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const trazo = (px: number, c = NEG): React.CSSProperties => ({WebkitTextStroke: `${px}px ${c}`, paintOrder: 'stroke fill'});
const SOMBRA = 'drop-shadow(0 10px 0 rgba(0,0,0,0.28)) drop-shadow(0 18px 30px rgba(0,0,0,0.35))';

// ---------- Clip de fondo a pantalla completa, con cámara siempre en movimiento ----------
const Clip: React.FC<{src: number; vel?: number; cx?: number; zoom?: [number, number]; dur: number; congela?: number; dx?: number; dy?: number}> = ({src, vel = 1, cx = 0.5, zoom = [1.05, 1.18], dur, congela, dx = 0, dy = 0}) => {
  const f = useCurrentFrame();
  const z = interpolate(f, [0, dur], zoom, clamp);
  const H = 1920 * z;
  const W = (H * 2544) / 1440;
  const left = Math.min(0, Math.max(1080 - W, 540 - cx * W)) + dx;
  const v = (
    <OffthreadVideo
      src={staticFile('survive/s01/clips/caida.mp4')}
      muted
      trimBefore={Math.round((src - 1218) * 30)}
      playbackRate={vel}
      style={{position: 'absolute', height: H, width: W, left, top: (1920 - H) / 2 + dy}}
    />
  );
  return congela === undefined ? v : <Freeze frame={congela} active={(fr) => fr >= congela}>{v}</Freeze>;
};

const Rotulo: React.FC<{n: number; nombre: string; fuentes: string}> = ({n, nombre, fuentes}) => (
  <div style={{position: 'absolute', bottom: 70, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
    <div style={{background: 'rgba(10,10,14,0.82)', borderRadius: 18, padding: '14px 26px', textAlign: 'center', border: '2px solid rgba(255,255,255,0.15)'}}>
      <div style={{fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 40, color: '#fff'}}>
        OPCIÓN {n} · {nombre}
      </div>
      <div style={{fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 28, color: 'rgba(255,255,255,0.7)', marginTop: 4}}>{fuentes}</div>
    </div>
  </div>
);

// ---------- Título + subtítulos palabra a palabra en la letra de cada opción ----------
const PALABRAS = ['SO', 'YOU’D', 'HIT', 'THE', 'BOTTOM', 'AT', '100', 'MPH'];
const Textos: React.FC<{fuente: string; acento: string; tamTitulo?: number; tamSub?: number; mayus?: boolean}> = ({fuente, acento, tamTitulo = 118, tamSub = 104}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const titulo = f < 46;
  if (titulo) {
    const s = spring({frame: f, fps, config: {damping: 12, stiffness: 200}});
    return (
      <div style={{position: 'absolute', top: 640, width: '100%', textAlign: 'center', fontFamily: fuente, lineHeight: 0.98, transform: `rotate(-3deg) scale(${0.6 + 0.4 * s})`, filter: SOMBRA}}>
        <div style={{fontSize: tamTitulo * 0.82, color: '#fff', ...trazo(17)}}>COULD A REAL HUMAN</div>
        <div style={{fontSize: tamTitulo, color: acento, ...trazo(20)}}>SURVIVE THIS?</div>
      </div>
    );
  }
  const k = Math.floor((f - 46) / 5.5);
  const w = PALABRAS[Math.min(PALABRAS.length - 1, k)];
  const local = (f - 46) % 5.5;
  const pop = interpolate(local, [0, 2, 4], [0.75, 1.12, 1], clamp);
  const clave = w === '100' || w === 'MPH' || w === 'BOTTOM';
  return (
    <div style={{position: 'absolute', top: 1260, width: '100%', textAlign: 'center', fontFamily: fuente, fontSize: tamSub, color: clave ? acento : '#fff', transform: `scale(${pop}) rotate(-2deg)`, ...trazo(18), filter: SOMBRA}}>
      {w}
    </div>
  );
};

// valor del medidor durante la demo: baja con la caída
const valor = (f: number) => interpolate(f, [30, 140], [72, 14], {...clamp, easing: Easing.inOut(Easing.cubic)});

// ---------------- MEDIDOR 1 · Manómetro de la planta nuclear ----------------
const Manometro: React.FC = () => {
  const f = useCurrentFrame();
  const v = valor(f);
  const tiembla = Math.sin(f * 1.7) * (v < 25 ? 3 : 1);
  const ang = -120 + (v / 100) * 240 + tiembla;
  const R = 118;
  const arco = (a0: number, a1: number) => {
    const p = (a: number) => [150 + Math.cos(((a - 90) * Math.PI) / 180) * R, 150 + Math.sin(((a - 90) * Math.PI) / 180) * R];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    return `M${x0},${y0} A${R},${R} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1},${y1}`;
  };
  return (
    <div style={{position: 'absolute', left: 48, top: 120, display: 'flex', alignItems: 'center', gap: 18, filter: SOMBRA}}>
      <svg width={300} height={300} viewBox="0 0 300 300">
        <defs>
          <radialGradient id="bisel" cx="35%" cy="30%">
            <stop offset="0" stopColor="#F5F5F4" />
            <stop offset="0.6" stopColor="#A8A29E" />
            <stop offset="1" stopColor="#57534E" />
          </radialGradient>
          <radialGradient id="cara" cx="45%" cy="35%">
            <stop offset="0" stopColor="#FFFBEB" />
            <stop offset="1" stopColor="#E7DFC6" />
          </radialGradient>
        </defs>
        <circle cx={150} cy={150} r={146} fill={NEG} />
        <circle cx={150} cy={150} r={138} fill="url(#bisel)" />
        <circle cx={150} cy={150} r={122} fill="url(#cara)" stroke={NEG} strokeWidth={5} />
        <path d={arco(-120, -40)} stroke="#DC2626" strokeWidth={20} fill="none" />
        <path d={arco(-40, 40)} stroke="#F59E0B" strokeWidth={20} fill="none" />
        <path d={arco(40, 120)} stroke="#16A34A" strokeWidth={20} fill="none" />
        {Array.from({length: 13}).map((_, i) => {
          const a = ((-120 + i * 20 - 90) * Math.PI) / 180;
          return <line key={i} x1={150 + Math.cos(a) * 92} y1={150 + Math.sin(a) * 92} x2={150 + Math.cos(a) * (i % 2 ? 100 : 106)} y2={150 + Math.sin(a) * (i % 2 ? 100 : 106)} stroke={NEG} strokeWidth={i % 2 ? 3 : 5} />;
        })}
        <text x={150} y={200} textAnchor="middle" fontFamily="TitanOne" fontSize={22} fill="#44403C">☢ SURVIVAL</text>
        <g transform={`rotate(${ang} 150 150)`}>
          <path d="M146,165 L150,52 L154,165 Z" fill="#DC2626" stroke={NEG} strokeWidth={3} />
        </g>
        <circle cx={150} cy={150} r={17} fill={NEG} />
        <circle cx={150} cy={150} r={8} fill="#A8A29E" />
        <ellipse cx={110} cy={90} rx={60} ry={26} fill="rgba(255,255,255,0.35)" transform="rotate(-25 110 90)" />
      </svg>
      <div style={{fontFamily: 'TitanOne', color: '#fff', ...trazo(12)}}>
        <div style={{fontSize: 40, color: AM}}>SURVIVAL</div>
        <div style={{fontSize: 96, lineHeight: 0.95}}>{Math.round(v)}%</div>
      </div>
    </div>
  );
};

// ---------------- MEDIDOR 2 · Rosquilla mordida ----------------
const Rosquilla: React.FC = () => {
  const f = useCurrentFrame();
  const v = valor(f);
  const R = 96;
  const C = 2 * Math.PI * R;
  return (
    <div style={{position: 'absolute', left: 48, top: 120, display: 'flex', alignItems: 'center', gap: 20, filter: SOMBRA}}>
      <svg width={270} height={270} viewBox="0 0 270 270">
        <defs>
          <radialGradient id="masa" cx="40%" cy="35%">
            <stop offset="0" stopColor="#F6C27A" />
            <stop offset="1" stopColor="#B86B25" />
          </radialGradient>
          <linearGradient id="glaseado" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FF9ACB" />
            <stop offset="1" stopColor="#F0569B" />
          </linearGradient>
        </defs>
        <circle cx={135} cy={135} r={128} fill={NEG} />
        <circle cx={135} cy={135} r={121} fill="url(#masa)" />
        <circle cx={135} cy={135} r={R} fill="none" stroke={NEG} strokeWidth={56} strokeDasharray={`${(C * v) / 100} ${C}`} transform="rotate(-90 135 135)" strokeLinecap="round" />
        <circle cx={135} cy={135} r={R} fill="none" stroke="url(#glaseado)" strokeWidth={46} strokeDasharray={`${(C * v) / 100} ${C}`} transform="rotate(-90 135 135)" strokeLinecap="round" />
        {Array.from({length: 22}).map((_, i) => {
          const a = (i / 22) * Math.PI * 2 * (v / 100) - Math.PI / 2 + 0.12;
          const rr = R + ((i * 37) % 3 - 1) * 12;
          const cols = ['#FFFFFF', '#38BDF8', '#FDE047', '#4ADE80', '#A78BFA'];
          return <rect key={i} x={135 + Math.cos(a) * rr - 8} y={135 + Math.sin(a) * rr - 3} width={16} height={6} rx={3} fill={cols[i % 5]} transform={`rotate(${(i * 47) % 180} ${135 + Math.cos(a) * rr} ${135 + Math.sin(a) * rr})`} />;
        })}
        <circle cx={135} cy={135} r={52} fill={NEG} />
        <circle cx={135} cy={135} r={46} fill="#7CC8F0" />
        <text x={135} y={152} textAnchor="middle" fontFamily="LuckiestGuy" fontSize={44} fill="#fff" stroke={NEG} strokeWidth={9} paintOrder="stroke">
          {Math.round(v)}%
        </text>
      </svg>
      <div style={{fontFamily: 'LuckiestGuy', fontSize: 62, lineHeight: 0.92, color: '#fff', ...trazo(12)}}>
        SURVIVAL
        <br />
        <span style={{color: '#FF7AB8'}}>CHANCE</span>
      </div>
    </div>
  );
};

// ---------------- MEDIDOR 3 · Barra de pelea (con estela de daño) ----------------
const BarraPelea: React.FC = () => {
  const f = useCurrentFrame();
  const v = valor(f);
  const estela = valor(f - 10); // la parte blanca que se vacía con retraso, como en los juegos de pelea
  const bajo = v < 25;
  const brillo = bajo ? 0.5 + 0.5 * Math.sin(f / 2.5) : 0;
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 130, filter: SOMBRA}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontFamily: 'LilitaOne', color: '#fff', marginBottom: 8, padding: '0 20px 0 150px', ...trazo(9)}}>
        <span style={{fontSize: 46, letterSpacing: 2}}>SURVIVAL</span>
        <span style={{fontSize: 72, color: bajo ? '#FF4D4D' : AM}}>{Math.round(v)}%</span>
      </div>
      <div style={{position: 'relative', height: 76}}>
        <div style={{position: 'absolute', left: 100, right: 0, top: 0, bottom: 0, transform: 'skewX(-18deg)', background: NEG, borderRadius: 10, padding: 7}}>
          <div style={{position: 'relative', width: '100%', height: '100%', background: 'rgba(255,255,255,0.12)', borderRadius: 5, overflow: 'hidden'}}>
            <div style={{position: 'absolute', inset: 0, width: `${estela}%`, background: '#FFF7D6'}} />
            <div style={{position: 'absolute', inset: 0, width: `${v}%`, background: 'linear-gradient(180deg, #FFE65C 0%, #FFC300 55%, #E89B00 100%)', boxShadow: `0 0 ${24 * brillo}px #FF3B3B`}} />
            {bajo && <div style={{position: 'absolute', inset: 0, width: `${v}%`, background: '#FF3B3B', opacity: 0.55 * brillo}} />}
            <div style={{position: 'absolute', left: 0, right: 0, top: 6, height: 12, background: 'rgba(255,255,255,0.35)', borderRadius: 6}} />
          </div>
        </div>
        <div style={{position: 'absolute', left: 0, top: -34, width: 140, height: 140, borderRadius: 70, background: 'radial-gradient(circle at 40% 35%, #FF6B6B, #C81E1E)', border: `8px solid ${NEG}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + 0.08 * Math.max(0, Math.sin(f / 3))})`}}>
          <span style={{fontSize: 70, filter: 'drop-shadow(0 3px 0 rgba(0,0,0,0.4))'}}>❤</span>
        </div>
      </div>
    </div>
  );
};

// ---------------- MEDIDOR 4 · Monitor de signos vitales ----------------
const Monitor: React.FC = () => {
  const f = useCurrentFrame();
  const v = valor(f);
  const W = 660;
  // línea de latido que avanza (se dibuja hasta "cabeza" y se repite)
  const pts: string[] = [];
  for (let x = 0; x <= W; x += 6) {
    const fase = ((x + f * 9) % 220) / 220;
    let y = 0;
    if (fase > 0.42 && fase < 0.47) y = -70 * (v / 70);
    else if (fase >= 0.47 && fase < 0.52) y = 50 * (v / 70);
    else if (fase > 0.6 && fase < 0.7) y = -14;
    pts.push(`${x},${110 + y}`);
  }
  const color = v < 25 ? '#FF4D4D' : '#34F5A1';
  return (
    <div style={{position: 'absolute', left: 210, top: 110, width: W + 30, height: 230, filter: SOMBRA}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 30, background: 'linear-gradient(180deg,#3F3F46,#18181B)', border: `6px solid ${NEG}`}} />
      <div style={{position: 'absolute', inset: 16, borderRadius: 18, background: '#04130C', overflow: 'hidden', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.9)'}}>
        <svg width={W} height={200} style={{position: 'absolute'}}>
          {Array.from({length: 14}).map((_, i) => <line key={i} x1={i * 50} y1={0} x2={i * 50} y2={200} stroke="rgba(52,245,161,0.08)" strokeWidth={2} />)}
          {Array.from({length: 5}).map((_, i) => <line key={i} x1={0} y1={i * 50} x2={W} y2={i * 50} stroke="rgba(52,245,161,0.08)" strokeWidth={2} />)}
          <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={6} strokeLinejoin="round" style={{filter: `drop-shadow(0 0 8px ${color})`}} />
        </svg>
        <div style={{position: 'absolute', right: 20, top: 10, textAlign: 'right', fontFamily: 'Bangers', color}}>
          <div style={{fontSize: 34, letterSpacing: 4}}>SURVIVAL</div>
          <div style={{fontSize: 108, lineHeight: 0.85, textShadow: `0 0 20px ${color}`}}>{Math.round(v)}%</div>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 60, background: 'linear-gradient(180deg, rgba(255,255,255,0.10), transparent)'}} />
      </div>
    </div>
  );
};

// ---------------- MEDIDOR 5 · Placa de noticiero en vivo (Canal 6) ----------------
const Noticiero: React.FC = () => {
  const f = useCurrentFrame();
  const v = valor(f);
  const entra = interpolate(f, [0, 10], [-700, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <div style={{position: 'absolute', left: 40, top: 130, transform: `translateX(${entra}px)`, filter: SOMBRA}}>
      <div style={{display: 'flex', alignItems: 'stretch', height: 110}}>
        <div style={{background: '#E11D2E', color: '#fff', fontFamily: 'TitanOne', fontSize: 40, padding: '0 22px', display: 'flex', alignItems: 'center', gap: 10, borderRadius: '16px 0 0 16px', border: `5px solid ${NEG}`, borderRight: 'none'}}>
          <span style={{width: 20, height: 20, borderRadius: 10, background: '#fff', opacity: Math.floor(f / 8) % 2 ? 1 : 0.35}} />
          LIVE
        </div>
        <div style={{background: 'linear-gradient(180deg,#1F3A8A,#132559)', color: '#fff', padding: '0 26px', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: `5px solid ${NEG}`, borderLeft: 'none', borderRight: 'none'}}>
          <div style={{fontFamily: 'TitanOne', fontSize: 26, color: '#93C5FD', letterSpacing: 2}}>SPRINGFIELD GORGE</div>
          <div style={{fontFamily: 'TitanOne', fontSize: 44}}>SURVIVAL ODDS</div>
        </div>
        <div style={{background: AM, color: NEG, fontFamily: 'TitanOne', fontSize: 78, padding: '0 26px', display: 'flex', alignItems: 'center', borderRadius: '0 16px 16px 0', border: `5px solid ${NEG}`, minWidth: 210, justifyContent: 'center'}}>{Math.round(v)}%</div>
      </div>
      <div style={{height: 14, marginTop: 6, background: 'rgba(14,14,18,0.85)', borderRadius: 7, overflow: 'hidden', border: `3px solid ${NEG}`}}>
        <div style={{width: `${v}%`, height: '100%', background: v < 25 ? '#E11D2E' : '#22C55E'}} />
      </div>
    </div>
  );
};

const OPCIONES: {nombre: string; fuentes: string; medidor: React.FC; titulo: string; sub: string; acento: string}[] = [
  {nombre: 'MANÓMETRO NUCLEAR', fuentes: 'Medidor y títulos: Titan One · Subtítulos: Titan One', medidor: Manometro, titulo: 'TitanOne', sub: 'TitanOne', acento: AM},
  {nombre: 'ROSQUILLA MORDIDA', fuentes: 'Medidor y títulos: Luckiest Guy · Subtítulos: Luckiest Guy', medidor: Rosquilla, titulo: 'LuckiestGuy', sub: 'LuckiestGuy', acento: '#FF7AB8'},
  {nombre: 'BARRA DE PELEA', fuentes: 'Medidor: Lilita One · Títulos: Luckiest Guy · Subtítulos: Lilita One', medidor: BarraPelea, titulo: 'LuckiestGuy', sub: 'LilitaOne', acento: AM},
  {nombre: 'MONITOR VITAL', fuentes: 'Medidor: Bangers · Títulos y subtítulos: Bangers', medidor: Monitor, titulo: 'Bangers', sub: 'Bangers', acento: '#34F5A1'},
  {nombre: 'NOTICIERO EN VIVO', fuentes: 'Medidor y títulos: Titan One · Subtítulos: Chewy', medidor: Noticiero, titulo: 'TitanOne', sub: 'Chewy', acento: AM},
];

export const SEG_M = 150;
export const DUR_MEDIDORES = SEG_M * OPCIONES.length;

export const DemoMedidores: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {OPCIONES.map((o, i) => {
      const M = o.medidor;
      return (
        <Sequence key={i} from={i * SEG_M} durationInFrames={SEG_M}>
          <AbsoluteFill style={{overflow: 'hidden'}}>
            <Sequence durationInFrames={46}>
              <Clip src={1221.8} vel={1.1} cx={0.5} zoom={[1.0, 1.15]} dur={46} />
            </Sequence>
            <Sequence from={46}>
              <Clip src={1226.6} vel={1.0} cx={0.52} zoom={[1.05, 1.25]} dur={SEG_M - 46} />
            </Sequence>
          </AbsoluteFill>
          <M />
          <Textos fuente={o.titulo} acento={o.acento} />
          <Rotulo n={i + 1} nombre={o.nombre} fuentes={o.fuentes} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

// =====================================================================
// INDICADORES DE DAÑO: 4 golpes reales, cada uno con pantallazo rojo, y la pieza que palpita
// =====================================================================
const IMPACTOS = [1232.45, 1233.65, 1234.95, 1237.7];
const PARTES = ['RIBS', 'SPLEEN', 'LUNGS', 'SKULL'] as const;
const GOLPE = 22; // fotogramas por golpe
export const SEG_D = GOLPE * 4 + 20;
export const DUR_DANO = SEG_D * 5;

/** Palpitar: 0→1→0 rápido justo después del golpe y luego latido suave. */
function palpito(k: number) {
  if (k < 0) return 0;
  return Math.max(Math.exp(-k / 4), 0.45 + 0.45 * Math.sin(k / 2.2));
}

const ParteCuerpo: React.FC<{d: string; activa: boolean; dañada: boolean; k: number; base: string; borde: string; rojo?: string}> = ({d, activa, dañada, k, base, borde, rojo = '#FF2D2D'}) => {
  const p = activa ? palpito(k) : dañada ? 0.35 : 0;
  return (
    <path
      d={d}
      fill={p > 0 ? rojo : base}
      fillOpacity={p > 0 ? 0.35 + 0.6 * p : 1}
      stroke={p > 0 ? '#FFD1D1' : borde}
      strokeWidth={5}
      style={p > 0 ? {filter: `drop-shadow(0 0 ${6 + 18 * p}px ${rojo})`} : {}}
    />
  );
};

// cuerpo genérico, bien proporcionado (viewBox 0 0 200 340)
const CUERPO = {
  SKULL: 'M100,8 c22,0 36,15 36,36 c0,22 -14,38 -36,38 c-22,0 -36,-16 -36,-38 c0,-21 14,-36 36,-36Z',
  LUNGS: 'M60,96 h80 a14,14 0 0 1 14,14 v34 h-108 v-34 a14,14 0 0 1 14,-14Z',
  RIBS: 'M46,148 h108 v40 h-108Z',
  SPLEEN: 'M52,192 h96 v34 a14,14 0 0 1 -14,14 h-68 a14,14 0 0 1 -14,-14Z',
  BRAZOS: 'M22,100 h20 v110 h-20Z M158,100 h20 v110 h-20Z',
  PIERNAS: 'M62,246 h32 v88 h-32Z M106,246 h32 v88 h-32Z',
};

type Estado = {i: number; k: number};
const Cuerpo: React.FC<{e: Estado; base: string; borde: string; estilo?: 'solido' | 'alambre'}> = ({e, base, borde, estilo = 'solido'}) => (
  <g strokeLinejoin="round" strokeDasharray={estilo === 'alambre' ? '7 5' : undefined}>
    <path d={CUERPO.BRAZOS} fill={base} stroke={borde} strokeWidth={5} />
    <path d={CUERPO.PIERNAS} fill={base} stroke={borde} strokeWidth={5} />
    {PARTES.map((p, j) => (
      <ParteCuerpo key={p} d={CUERPO[p]} activa={j === e.i} dañada={j < e.i} k={e.k} base={base} borde={borde} />
    ))}
  </g>
);

// 1 · Medabot: panel oscuro con barras de vida por pieza
const DMedabot: React.FC<{e: Estado}> = ({e}) => {
  const hp = PARTES.map((_, j) => (j < e.i ? 18 : j === e.i ? interpolate(e.k, [0, 8], [100, 18], clamp) : 100));
  const alerta = e.i >= 0 && Math.floor(e.k / 5) % 2 === 0;
  return (
    <div style={{position: 'absolute', right: 36, top: 150, width: 470, height: 600, borderRadius: 28, background: 'linear-gradient(160deg, rgba(10,24,52,0.94), rgba(4,10,24,0.96))', border: '5px solid #38BDF8', boxShadow: '0 0 40px rgba(56,189,248,0.45), 0 18px 40px rgba(0,0,0,0.5)'}}>
      <div style={{fontFamily: 'Bangers', fontSize: 42, color: '#7DD3FC', letterSpacing: 4, padding: '16px 26px 0'}}>DAMAGE REPORT</div>
      <svg viewBox="0 0 200 340" style={{position: 'absolute', left: 22, top: 80, width: 210, height: 360}}>
        <Cuerpo e={e} base="rgba(56,189,248,0.18)" borde="#38BDF8" />
      </svg>
      <div style={{position: 'absolute', left: 250, top: 96, width: 190}}>
        {PARTES.map((p, j) => (
          <div key={p} style={{marginBottom: 26}}>
            <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: 'Bangers', fontSize: 30, letterSpacing: 2, color: hp[j] < 50 ? '#FCA5A5' : '#BAE6FD'}}>
              <span>{p}</span>
              <span>{Math.round(hp[j])}</span>
            </div>
            <div style={{height: 16, borderRadius: 8, background: 'rgba(255,255,255,0.12)', overflow: 'hidden'}}>
              <div style={{width: `${hp[j]}%`, height: '100%', background: hp[j] < 50 ? 'linear-gradient(90deg,#FF2D2D,#FF8A8A)' : 'linear-gradient(90deg,#0EA5E9,#7DD3FC)'}} />
            </div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', bottom: 22, width: '100%', textAlign: 'center', fontFamily: 'Bangers', fontSize: 52, letterSpacing: 5, color: '#FF3B3B', opacity: e.i >= 0 ? (alerta ? 1 : 0.35) : 0, textShadow: '0 0 18px #FF3B3B'}}>
        ⚠ {e.i >= 0 ? PARTES[e.i] : ''} DAMAGED
      </div>
    </div>
  );
};

// 2 · Radiografía
const HUESOS: Record<(typeof PARTES)[number], string> = {
  SKULL: 'M100,14 c20,0 32,14 32,32 c0,14 -8,26 -18,30 v10 h-28 v-10 c-10,-4 -18,-16 -18,-30 c0,-18 12,-32 32,-32Z',
  LUNGS: 'M70,104 q-14,18 -10,46 q16,6 32,-4 v-42Z M130,104 q14,18 10,46 q-16,6 -32,-4 v-42Z',
  RIBS: 'M62,156 q38,-12 76,0 M58,170 q42,-12 84,0 M58,184 q42,-12 84,0',
  SPLEEN: 'M124,200 q18,4 16,22 q-10,12 -24,4 q-4,-16 8,-26Z',
};
const DRayosX: React.FC<{e: Estado}> = ({e}) => (
  <div style={{position: 'absolute', right: 36, top: 150, width: 430, height: 610, borderRadius: 22, background: 'radial-gradient(circle at 50% 40%, #12305C, #050D1E)', border: `8px solid ${NEG}`, outline: '4px solid #93C5FD', boxShadow: '0 18px 40px rgba(0,0,0,0.5)', overflow: 'hidden'}}>
    <div style={{fontFamily: 'Bangers', fontSize: 40, color: '#BFDBFE', letterSpacing: 4, padding: '12px 22px'}}>X-RAY · PATIENT: H.S.</div>
    <svg viewBox="0 0 200 340" style={{position: 'absolute', left: 50, top: 70, width: 330, height: 520}}>
      <g fill="none" stroke="#E0F2FE" strokeWidth={5} strokeLinecap="round" style={{filter: 'drop-shadow(0 0 6px #93C5FD)'}}>
        <line x1={100} y1={86} x2={100} y2={236} />
        <path d="M60,98 L40,210 M140,98 L160,210 M60,98 h80 M70,236 h60 M76,236 L70,330 M124,236 L130,330" />
      </g>
      {PARTES.map((p, j) => {
        const activa = j === e.i;
        const pp = activa ? palpito(e.k) : j < e.i ? 0.35 : 0;
        const col = pp > 0 ? '#FF3B3B' : '#E0F2FE';
        return (
          <g key={p}>
            <path d={HUESOS[p]} fill={p === 'SKULL' || p === 'SPLEEN' || p === 'LUNGS' ? `rgba(224,242,254,${pp > 0 ? 0.25 + 0.4 * pp : 0.1})` : 'none'} stroke={col} strokeWidth={p === 'RIBS' ? 7 : 5} strokeLinecap="round" style={{filter: `drop-shadow(0 0 ${pp > 0 ? 6 + 16 * pp : 5}px ${pp > 0 ? '#FF3B3B' : '#93C5FD'})`}} />
            {pp > 0 && <path d={p === 'SKULL' ? 'M104,20 l-6,14 l8,6 l-8,14' : p === 'RIBS' ? 'M112,152 l-6,12 l8,6 l-6,14' : p === 'LUNGS' ? 'M80,112 l6,12 l-6,8 l6,14' : 'M128,204 l4,8 l-4,6'} stroke="#fff" strokeWidth={3} fill="none" />}
          </g>
        );
      })}
    </svg>
    <div style={{position: 'absolute', bottom: 16, width: '100%', textAlign: 'center', fontFamily: 'Bangers', fontSize: 48, color: '#FF3B3B', letterSpacing: 3, opacity: e.i >= 0 ? 1 : 0}}>{e.i >= 0 ? `${PARTES[e.i]}: CRACKED` : ''}</div>
  </div>
);

// 3 · Muñeco de videojuego con -HP flotando
const DMuneco: React.FC<{e: Estado}> = ({e}) => {
  const sube = interpolate(e.k, [0, 18], [0, -90], clamp);
  const op = interpolate(e.k, [0, 3, 14, 20], [0, 1, 1, 0], clamp);
  return (
    <div style={{position: 'absolute', right: 30, top: 150, width: 440, height: 620, filter: SOMBRA}}>
      <svg viewBox="0 0 200 340" style={{position: 'absolute', left: 60, top: 40, width: 320, height: 545}}>
        <g stroke={NEG} strokeWidth={8}>
          <Cuerpo e={e} base={AM} borde={NEG} />
        </g>
        <circle cx={86} cy={42} r={9} fill="#fff" stroke={NEG} strokeWidth={4} />
        <circle cx={114} cy={42} r={9} fill="#fff" stroke={NEG} strokeWidth={4} />
        <circle cx={86} cy={42} r={3} fill={NEG} />
        <circle cx={114} cy={42} r={3} fill={NEG} />
      </svg>
      {e.i >= 0 && (
        <div style={{position: 'absolute', right: 0, top: 200 + sube, opacity: op, fontFamily: 'LuckiestGuy', fontSize: 92, color: '#FF3B3B', transform: 'rotate(10deg)', ...trazo(14)}}>
          −{[22, 18, 25, 30][e.i]} HP
        </div>
      )}
    </div>
  );
};

// 4 · Holograma escáner
const DHolograma: React.FC<{e: Estado}> = ({e}) => {
  const f = useCurrentFrame();
  const barrido = (f * 6) % 340;
  return (
    <div style={{position: 'absolute', right: 36, top: 150, width: 430, height: 610, borderRadius: 26, background: 'radial-gradient(circle at 50% 40%, rgba(10,60,36,0.92), rgba(2,14,8,0.96))', border: '4px solid #4ADE80', boxShadow: '0 0 40px rgba(74,222,128,0.4), 0 18px 40px rgba(0,0,0,0.5)', overflow: 'hidden'}}>
      <div style={{fontFamily: 'Bangers', fontSize: 38, color: '#4ADE80', letterSpacing: 4, padding: '14px 22px'}}>BODY SCAN</div>
      <svg viewBox="0 0 200 340" style={{position: 'absolute', left: 50, top: 70, width: 330, height: 520}}>
        <Cuerpo e={e} base="rgba(74,222,128,0.08)" borde="#4ADE80" estilo="alambre" />
        <rect x={0} y={barrido} width={200} height={6} fill="rgba(74,222,128,0.7)" />
        {Array.from({length: 18}).map((_, i) => <line key={i} x1={0} y1={i * 20} x2={200} y2={i * 20} stroke="rgba(74,222,128,0.10)" strokeWidth={1.5} />)}
      </svg>
      <div style={{position: 'absolute', bottom: 16, width: '100%', textAlign: 'center', fontFamily: 'Bangers', fontSize: 46, color: '#FF5A5A', letterSpacing: 3, opacity: e.i >= 0 ? 1 : 0}}>{e.i >= 0 ? `${PARTES[e.i]} · CRITICAL` : ''}</div>
    </div>
  );
};

// 5 · Órganos de caricatura
const DOrganos: React.FC<{e: Estado}> = ({e}) => {
  const org = (j: number) => (j === e.i ? palpito(e.k) : j < e.i ? 0.35 : 0);
  const esc = (j: number) => 1 + 0.12 * org(j);
  const glow = (j: number) => (org(j) > 0 ? {filter: `drop-shadow(0 0 ${8 + 16 * org(j)}px #FF2D2D)`} : {});
  return (
    <div style={{position: 'absolute', right: 36, top: 150, width: 430, height: 620, borderRadius: 34, background: '#FFF8E7', border: `9px solid ${NEG}`, boxShadow: '0 14px 0 rgba(0,0,0,0.3), 0 24px 40px rgba(0,0,0,0.35)'}}>
      <svg viewBox="0 0 200 340" style={{position: 'absolute', left: 40, top: 20, width: 350, height: 590}}>
        <path d="M100,10 c20,0 32,14 32,32 c0,20 -14,34 -32,34 c-18,0 -32,-14 -32,-34 c0,-18 12,-32 32,-32Z M64,84 h72 q26,0 30,26 l10,130 h-152 l10,-130 q4,-26 30,-26Z M60,240 h80 l-6,92 h-26 l-8,-60 l-8,60 h-26Z" fill="#FDE68A" stroke={NEG} strokeWidth={6} strokeLinejoin="round" />
        <g stroke={NEG} strokeWidth={4}>
          <g style={glow(3)} transform={`translate(100 42) scale(${esc(3)}) translate(-100 -42)`}>
            <ellipse cx={100} cy={42} rx={24} ry={20} fill={org(3) > 0 ? '#FF6B6B' : '#F9A8D4'} />
          </g>
          <g style={glow(2)} transform={`translate(100 130) scale(${esc(2)}) translate(-100 -130)`}>
            <ellipse cx={80} cy={130} rx={18} ry={30} fill={org(2) > 0 ? '#FF6B6B' : '#F9A8D4'} />
            <ellipse cx={120} cy={130} rx={18} ry={30} fill={org(2) > 0 ? '#FF6B6B' : '#F9A8D4'} />
          </g>
          <g style={glow(0)}>
            <path d="M62,172 q38,-12 76,0 M60,186 q40,-12 80,0" fill="none" stroke={org(0) > 0 ? '#FF2D2D' : '#A8A29E'} strokeWidth={7} strokeLinecap="round" />
          </g>
          <g style={glow(1)} transform={`translate(132 206) scale(${esc(1)}) translate(-132 -206)`}>
            <ellipse cx={132} cy={206} rx={14} ry={10} fill={org(1) > 0 ? '#FF2D2D' : '#A855F7'} />
          </g>
          <path d="M100,140 c-10,-12 -26,-2 -18,12 l18,18 l18,-18 c8,-14 -8,-24 -18,-12Z" fill="#EF4444" />
        </g>
      </svg>
      <div style={{position: 'absolute', bottom: 14, width: '100%', textAlign: 'center', fontFamily: 'LuckiestGuy', fontSize: 52, color: '#FF2D2D', ...trazo(8), opacity: e.i >= 0 ? 1 : 0}}>{e.i >= 0 ? `${PARTES[e.i]}!` : ''}</div>
    </div>
  );
};

const INDICADORES: [string, React.FC<{e: Estado}>][] = [
  ['ESQUEMA MEDABOT', DMedabot],
  ['RADIOGRAFÍA', DRayosX],
  ['MUÑECO DE VIDEOJUEGO', DMuneco],
  ['HOLOGRAMA ESCÁNER', DHolograma],
  ['ÓRGANOS DE CARICATURA', DOrganos],
];

/** Una variante: 4 golpes reales seguidos, pantallazo rojo + sacudida en cada uno. */
const VarianteDano: React.FC<{n: number}> = ({n}) => {
  const f = useCurrentFrame();
  const g = Math.min(3, Math.floor(f / GOLPE));
  const k = f - g * GOLPE - 6; // el impacto ocurre 6 fotogramas después de empezar cada golpe
  const e: Estado = k >= 0 || g > 0 ? {i: k >= 0 ? g : g - 1, k: k >= 0 ? k : k + GOLPE} : {i: -1, k: 0};
  const a = k >= 0 ? 30 * Math.exp(-k / 3.5) : 0;
  const dx = Math.sin(k * 2.7) * a;
  const dy = Math.cos(k * 3.3) * a;
  const rojo = interpolate(k, [0, 1, 8], [0, 0.85, 0], clamp);
  const [nombre, Ind] = INDICADORES[n];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{overflow: 'hidden'}}>
        {IMPACTOS.map((imp, j) => (
          <Sequence key={j} from={j * GOLPE} durationInFrames={j === 3 ? SEG_D - j * GOLPE : GOLPE}>
            <Clip src={imp - 6 / 30} cx={[0.38, 0.42, 0.36, 0.38][j]} zoom={[1.05, 1.2]} dur={GOLPE} congela={7} dx={dx} dy={dy} />
          </Sequence>
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(255,0,0,0) 30%, rgba(225,0,0,0.95) 100%)', opacity: rojo}} />
      <Ind e={e} />
      {e.i >= 0 && (
        <div style={{position: 'absolute', top: 1260, width: '100%', textAlign: 'center', fontFamily: 'LuckiestGuy', fontSize: 104, filter: SOMBRA}}>
          <span style={{color: '#fff', ...trazo(18)}}>HIT {['ONE', 'TWO', 'THREE', 'FOUR'][e.i]}: </span>
          <span style={{color: AM, ...trazo(18)}}>{PARTES[e.i]}</span>
        </div>
      )}
      <Rotulo n={n + 1} nombre={nombre} fuentes="Con pantallazo rojo en cada golpe" />
    </AbsoluteFill>
  );
};

export const DemoDano: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {INDICADORES.map((_, n) => (
      <Sequence key={n} from={n * SEG_D} durationInFrames={SEG_D}>
        <VarianteDano n={n} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
