import React from 'react';
import {AbsoluteFill, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {Clip, Rotulo, SOMBRA, trazo} from './opciones2';

// =====================================================================
// Opciones v3: 5 barras nuevas, inspiradas en formatos virales, cada una con su letra.
// La barra baja a golpes (4 impactos) para ver cómo reacciona.
// =====================================================================
[
  ['Cinzel', 'Cinzel'],
  ['Bungee', 'Bungee'],
  ['PressStart2P', 'PressStart2P'],
  ['BowlbyOne', 'BowlbyOne'],
  ['BlackOpsOne', 'BlackOpsOne'],
].forEach(([fam, arch]) => loadFont({family: fam, url: staticFile(`fonts/${arch}-latin.woff2`), weight: '400'}));

const AM = '#FFD90F';
const NEG = '#0E0E12';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const SEG3 = 165;
export const GOLPES = [56, 78, 100, 122];
export const NIVELES = [72, 55, 38, 22, 9];

/** Valor con caídas bruscas en cada golpe. */
export function valor(f: number) {
  let v = NIVELES[0];
  GOLPES.forEach((g, i) => {
    v -= (NIVELES[i] - NIVELES[i + 1]) * interpolate(f, [g, g + 5], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  });
  return v;
}
/** Golpe más reciente: fotogramas desde el impacto (o -1). */
export function desdeGolpe(f: number) {
  let k = -1;
  GOLPES.forEach((g) => {
    if (f >= g) k = f - g;
  });
  return k;
}
export const sacude = (k: number, a = 14) => (k < 0 ? 0 : Math.sin(k * 2.9) * a * Math.exp(-k / 3));

// ---------- Título y subtítulos en la letra de cada barra ----------
const PAL = ['HIT', 'ONE:', 'RIBS.', 'HIT', 'TWO:', 'SPLEEN.'];
export const Textos: React.FC<{fuente: string; acento: string; escala?: number; mayus?: boolean}> = ({fuente, acento, escala = 1}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < 46) {
    const s = spring({frame: f, fps, config: {damping: 12, stiffness: 200}});
    return (
      <div style={{position: 'absolute', top: 650, width: '100%', textAlign: 'center', fontFamily: fuente, lineHeight: 1.05, transform: `rotate(-2deg) scale(${0.6 + 0.4 * s})`, filter: SOMBRA}}>
        <div style={{fontSize: 92 * escala, color: '#fff', ...trazo(16)}}>COULD A REAL HUMAN</div>
        <div style={{fontSize: 112 * escala, color: acento, ...trazo(18)}}>SURVIVE THIS?</div>
      </div>
    );
  }
  const k = Math.min(PAL.length - 1, Math.floor((f - 46) / 11));
  const local = (f - 46) % 11;
  const w = PAL[k];
  const pop = interpolate(local, [0, 2, 4], [0.75, 1.1, 1], clamp);
  const clave = w.endsWith('.');
  return (
    <div style={{position: 'absolute', top: 1270, width: '100%', textAlign: 'center', fontFamily: fuente, fontSize: 100 * escala, color: clave ? acento : '#fff', transform: `scale(${pop}) rotate(-2deg)`, ...trazo(17), filter: SOMBRA}}>
      {w}
    </div>
  );
};

// ---------------- 1 · Barra de jefe final (estilo Dark Souls / Elden Ring) ----------------
const BarraJefe: React.FC = () => {
  const f = useCurrentFrame();
  const v = valor(f);
  const estela = valor(f - 14);
  const entra = interpolate(f, [0, 14], [0, 1], clamp);
  return (
    <div style={{position: 'absolute', left: 70, right: 70, top: 150, opacity: entra, filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.8))'}}>
      <div style={{fontFamily: 'Cinzel', fontSize: 40, color: '#F5EBD8', letterSpacing: 2, marginBottom: 10, whiteSpace: 'nowrap', textShadow: '0 2px 6px #000'}}>Homer, the Gorge Diver</div>
      <div style={{position: 'relative', height: 34, background: 'rgba(10,6,4,0.85)', border: '2px solid #8C7A5B', boxShadow: 'inset 0 0 0 2px #1A120B'}}>
        <div style={{position: 'absolute', left: 3, top: 3, bottom: 3, width: `calc(${estela}% - 6px)`, background: '#E8C66A'}} />
        <div style={{position: 'absolute', left: 3, top: 3, bottom: 3, width: `calc(${v}% - 6px)`, background: 'linear-gradient(180deg,#B3191F 0%,#7A0C10 60%,#5A070A 100%)'}} />
        <div style={{position: 'absolute', left: 3, right: 3, top: 3, height: 6, background: 'rgba(255,255,255,0.18)'}} />
      </div>
      <div style={{display: 'flex', justifyContent: 'flex-end', fontFamily: 'Cinzel', fontSize: 30, color: '#D9C9A8', marginTop: 6}}>{Math.round(v)}% SURVIVAL</div>
    </div>
  );
};

// ---------------- 2 · Batería del celular que se agota ----------------
const Bateria: React.FC = () => {
  const f = useCurrentFrame();
  const v = valor(f);
  const k = desdeGolpe(f);
  const color = v > 40 ? '#34D399' : v > 20 ? '#FBBF24' : '#EF4444';
  const parpadeo = v < 20 ? (Math.floor(f / 6) % 2 ? 1 : 0.35) : 1;
  return (
    <div style={{position: 'absolute', left: 60, top: 140, display: 'flex', alignItems: 'center', gap: 64, transform: `translateX(${sacude(k)}px)`, filter: SOMBRA}}>
      <div style={{position: 'relative', width: 300, height: 140}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: 30, border: `11px solid #fff`, background: 'rgba(0,0,0,0.55)', boxShadow: `0 0 0 6px ${NEG}`}} />
        <div style={{position: 'absolute', right: -32, top: 42, width: 22, height: 56, borderRadius: '0 10px 10px 0', background: '#fff', boxShadow: `0 0 0 6px ${NEG}`}} />
        <div style={{position: 'absolute', left: 20, top: 20, bottom: 20, width: `${(260 * v) / 100}px`, borderRadius: 14, background: color, opacity: parpadeo, boxShadow: `0 0 24px ${color}`}} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Bungee', fontSize: 58, color: '#fff', ...trazo(9)}}>{Math.round(v)}%</div>
      </div>
      <div style={{fontFamily: 'Bungee', color: '#fff', lineHeight: 1, ...trazo(10)}}>
        <div style={{fontSize: 40}}>SURVIVAL</div>
        <div style={{fontSize: 40, color}}>{v < 20 ? 'LOW BATTERY' : 'BATTERY'}</div>
      </div>
    </div>
  );
};

// ---------------- 3 · Corazones pixelados (videojuego retro) ----------------
const CORAZON = ['..XX...XX..', '.XXXX.XXXX.', 'XXXXXXXXXXX', 'XXXXXXXXXXX', '.XXXXXXXXX.', '..XXXXXXX..', '...XXXXX...', '....XXX....', '.....X.....'];
const CorazonPixel: React.FC<{lleno: number; roto: number}> = ({lleno, roto}) => {
  const px = 6;
  return (
    <svg width={11 * px + 8} height={9 * px + 8} viewBox={`-4 -4 ${11 * px + 8} ${9 * px + 8}`} style={{transform: `translateY(${roto * -8}px) rotate(${roto * 12}deg)`}}>
      {CORAZON.map((fila, y) =>
        fila.split('').map((c, x) =>
          c === 'X' ? (
            <rect key={`${x}-${y}`} x={x * px} y={y * px} width={px} height={px} fill={x / 11 < lleno ? (y < 3 && x > 1 && x < 4 ? '#FFB3B3' : '#E8222B') : '#3B3B46'} stroke={NEG} strokeWidth={1.2} />
          ) : null,
        ),
      )}
    </svg>
  );
};
const Corazones: React.FC = () => {
  const f = useCurrentFrame();
  const v = valor(f);
  const k = desdeGolpe(f);
  const llenos = v / 10;
  return (
    <div style={{position: 'absolute', left: 50, top: 150, transform: `translateX(${sacude(k, 10)}px)`, filter: SOMBRA}}>
      <div style={{fontFamily: 'PressStart2P', fontSize: 34, color: '#fff', marginBottom: 16, ...trazo(8)}}>
        SURVIVAL <span style={{color: v < 25 ? '#FF4D4D' : AM}}>{Math.round(v)}%</span>
      </div>
      <div style={{display: 'flex', gap: 4}}>
        {Array.from({length: 10}).map((_, i) => {
          const lleno = Math.max(0, Math.min(1, llenos - i));
          const recien = k >= 0 && k < 8 && lleno < 1 && Math.max(0, Math.min(1, valor(f - k - 1) / 10 - i)) > lleno;
          return <CorazonPixel key={i} lleno={lleno} roto={recien ? 1 - k / 8 : 0} />;
        })}
      </div>
    </div>
  );
};

// ---------------- 4 · Medidor de "aura" con carita que cambia ----------------
const Carita: React.FC<{v: number}> = ({v}) => {
  const ojos = v > 50 ? 'feliz' : v > 25 ? 'nervioso' : v > 12 ? 'panico' : 'muerto';
  return (
    <svg width={150} height={150} viewBox="0 0 100 100">
      <circle cx={50} cy={50} r={46} fill={v > 25 ? AM : v > 12 ? '#FFB020' : '#D4D4D8'} stroke={NEG} strokeWidth={6} />
      {ojos === 'muerto' ? (
        <g stroke={NEG} strokeWidth={6} strokeLinecap="round">
          <path d="M28,34 l12,12 M40,34 l-12,12 M60,34 l12,12 M72,34 l-12,12" />
          <path d="M34,72 q16,-8 32,0" fill="none" />
        </g>
      ) : (
        <g>
          <ellipse cx={36} cy={40} rx={ojos === 'panico' ? 9 : 6} ry={ojos === 'panico' ? 11 : 8} fill={NEG} />
          <ellipse cx={64} cy={40} rx={ojos === 'panico' ? 9 : 6} ry={ojos === 'panico' ? 11 : 8} fill={NEG} />
          {ojos === 'feliz' && <path d="M30,62 q20,20 40,0" stroke={NEG} strokeWidth={6} fill="none" strokeLinecap="round" />}
          {ojos === 'nervioso' && <path d="M30,68 l8,-5 l8,5 l8,-5 l8,5 l8,-5" stroke={NEG} strokeWidth={5} fill="none" strokeLinejoin="round" />}
          {ojos === 'panico' && <ellipse cx={50} cy={70} rx={11} ry={13} fill={NEG} />}
          {ojos !== 'feliz' && <path d="M82,20 q4,10 0,14 q-6,-2 0,-14" fill="#60A5FA" stroke={NEG} strokeWidth={2} />}
        </g>
      )}
    </svg>
  );
};
const Aura: React.FC = () => {
  const f = useCurrentFrame();
  const v = valor(f);
  const k = desdeGolpe(f);
  const i = GOLPES.filter((g) => f >= g).length - 1;
  const caida = i >= 0 ? NIVELES[i] - NIVELES[i + 1] : 0;
  const sube = interpolate(k, [0, 20], [0, -80], clamp);
  const op = interpolate(k, [0, 2, 14, 20], [0, 1, 1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 50, top: 140, display: 'flex', alignItems: 'center', gap: 22, filter: SOMBRA}}>
      <div style={{transform: `scale(${1 + 0.18 * Math.exp(-Math.max(0, k) / 4) * (k >= 0 ? 1 : 0)}) rotate(${sacude(k, 8)}deg)`}}>
        <Carita v={v} />
      </div>
      <div>
        <div style={{fontFamily: 'BowlbyOne', fontSize: 40, color: '#fff', ...trazo(9)}}>SURVIVAL AURA</div>
        <div style={{width: 470, height: 52, borderRadius: 26, background: NEG, padding: 6, marginTop: 6}}>
          <div style={{width: `${v}%`, height: '100%', borderRadius: 20, background: 'linear-gradient(90deg,#A855F7,#EC4899,#F59E0B)', boxShadow: '0 0 20px rgba(236,72,153,0.8)'}} />
        </div>
        <div style={{fontFamily: 'BowlbyOne', fontSize: 56, color: AM, marginTop: 4, ...trazo(10)}}>{Math.round(v)}%</div>
      </div>
      {k >= 0 && (
        <div style={{position: 'absolute', left: 440, top: 150 + sube, opacity: op, fontFamily: 'BowlbyOne', fontSize: 60, color: '#FF3B3B', whiteSpace: 'nowrap', transform: 'rotate(-8deg)', ...trazo(10)}}>
          −{Math.round(caida)}% AURA
        </div>
      )}
    </div>
  );
};

// ---------------- 5 · Porcentaje de daño estilo juego de pelea (sube con cada golpe) ----------------
const DanoPelea: React.FC = () => {
  const f = useCurrentFrame();
  const riesgo = 100 - valor(f);
  const k = desdeGolpe(f);
  const t = riesgo / 100;
  const color = t < 0.45 ? '#FFFFFF' : t < 0.65 ? '#FFE14D' : t < 0.8 ? '#FF8A1F' : '#FF2D2D';
  const golpe = k >= 0 ? Math.exp(-k / 4) : 0;
  return (
    <div style={{position: 'absolute', left: 60, top: 120, filter: SOMBRA}}>
      <div style={{fontFamily: 'BlackOpsOne', fontSize: 40, color: '#fff', letterSpacing: 3, ...trazo(8)}}>DEATH RISK</div>
      <div style={{fontFamily: 'BlackOpsOne', fontSize: 190, lineHeight: 0.9, color, fontStyle: 'italic', transform: `translate(${sacude(k, 22)}px, ${sacude(k + 1, 10)}px) scale(${1 + 0.25 * golpe}) skewX(-8deg)`, transformOrigin: 'left center', ...trazo(14), textShadow: `0 0 ${30 * golpe}px ${color}`}}>
        {Math.round(riesgo)}
        <span style={{fontSize: 100}}>%</span>
      </div>
    </div>
  );
};

const OPCIONES3: {nombre: string; fuentes: string; barra: React.FC; fuente: string; acento: string; escala?: number}[] = [
  {nombre: 'BARRA DE JEFE FINAL', fuentes: 'Barra: Cinzel · Títulos y subtítulos: Cinzel', barra: BarraJefe, fuente: 'Cinzel', acento: '#E8C66A', escala: 0.8},
  {nombre: 'BATERÍA AGOTÁNDOSE', fuentes: 'Barra, títulos y subtítulos: Bungee', barra: Bateria, fuente: 'Bungee', acento: '#34D399', escala: 0.82},
  {nombre: 'CORAZONES PIXELADOS', fuentes: 'Barra, títulos y subtítulos: Press Start 2P', barra: Corazones, fuente: 'PressStart2P', acento: '#FF4D4D', escala: 0.52},
  {nombre: 'MEDIDOR DE AURA', fuentes: 'Barra, títulos y subtítulos: Bowlby One', barra: Aura, fuente: 'BowlbyOne', acento: '#EC4899', escala: 0.9},
  {nombre: 'DAÑO DE JUEGO DE PELEA', fuentes: 'Barra, títulos y subtítulos: Black Ops One', barra: DanoPelea, fuente: 'BlackOpsOne', acento: '#FF8A1F', escala: 0.9},
];

export const DUR_BARRAS3 = SEG3 * OPCIONES3.length;

/** Destello rojo de daño en cada golpe (igual que en el video). */
export const DanoPantalla: React.FC = () => {
  const f = useCurrentFrame();
  const k = desdeGolpe(f);
  const op = k >= 0 ? interpolate(k, [0, 1, 7], [0, 0.6, 0], clamp) : 0;
  return <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(255,0,0,0) 35%, rgba(225,0,0,0.95) 100%)', opacity: op}} />;
};

export const DemoBarras3: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {OPCIONES3.map((o, i) => {
      const B = o.barra;
      return (
        <Sequence key={i} from={i * SEG3} durationInFrames={SEG3}>
          <AbsoluteFill style={{overflow: 'hidden'}}>
            <Sequence durationInFrames={46}>
              <Clip src={1221.8} vel={1.1} cx={0.5} zoom={[1.0, 1.15]} dur={46} />
            </Sequence>
            <Sequence from={46}>
              <Clip src={1229.5} vel={1.0} cx={0.45} zoom={[1.05, 1.2]} dur={SEG3 - 46} />
            </Sequence>
          </AbsoluteFill>
          <DanoPantalla />
          <B />
          <Textos fuente={o.fuente} acento={o.acento} escala={o.escala} />
          <Rotulo n={i + 1} nombre={o.nombre} fuentes={o.fuentes} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
