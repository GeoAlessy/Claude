import React from 'react';
import {AbsoluteFill, Audio, Freeze, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';

// =====================================================================
// Demo para elegir el efecto de golpe: el mismo impacto real con 5 tratamientos.
// =====================================================================
const SEG = 54; // fotogramas por variante
const IMP = 14; // fotograma del impacto dentro de cada variante
const SRC = 1232.45 - 1218; // segundo del golpe 1 dentro de caida.mp4
export const DUR_DEMO = SEG * 5;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Video: React.FC<{zoom?: number; dx?: number; dy?: number}> = ({zoom = 1, dx = 0, dy = 0}) => {
  const H = 1920 * zoom;
  const W = (H * 2544) / 1440;
  return (
    <OffthreadVideo
      src={staticFile('survive/s01/clips/caida.mp4')}
      muted
      trimBefore={Math.round((SRC - IMP / 30) * 30)}
      style={{position: 'absolute', height: H, width: W, left: 540 - W * 0.36 + dx, top: 960 - H / 2 + dy}}
    />
  );
};

function sacudida(k: number, fuerza = 36) {
  if (k < 0) return [0, 0];
  const a = fuerza * Math.exp(-k / 3.5);
  return [Math.sin(k * 2.7) * a, Math.cos(k * 3.3) * a];
}

const Rotulo: React.FC<{n: number; texto: string}> = ({n, texto}) => (
  <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center'}}>
    <span style={{fontFamily: 'LuckiestGuy', fontSize: 64, color: '#FFD90F', WebkitTextStroke: '12px #111', paintOrder: 'stroke fill'}}>
      {n}. {texto}
    </span>
  </div>
);

const Variante: React.FC<{n: number}> = ({n}) => {
  const f = useCurrentFrame();
  const k = f - IMP;
  const congelado = n !== 4; // la 4 sigue en movimiento (cámara lenta)
  let zoom = 1;
  let [dx, dy] = [0, 0];
  let filtro = 'none';
  let rojo = 0;
  let blanco = 0;
  if (n === 1) {
    // Pantallazo rojo + sacudida
    [dx, dy] = sacudida(k);
    rojo = interpolate(k, [0, 1, 7], [0, 0.85, 0], clamp);
  } else if (n === 2) {
    // "Impact frame" estilo anime: 2 cuadros invertidos en blanco y negro
    if (k >= 0 && k < 2) filtro = 'grayscale(1) invert(1) contrast(3)';
    else if (k >= 2 && k < 4) filtro = 'grayscale(1) contrast(4)';
    [dx, dy] = sacudida(k - 4, 28);
  } else if (n === 3) {
    // Separación RGB + viñeta roja de daño (como en videojuegos)
    if (k >= 0 && k < 6) filtro = 'url(#rgb)';
    rojo = interpolate(k, [0, 2, 16], [0, 0.65, 0.25], clamp);
    [dx, dy] = sacudida(k, 20);
  } else if (n === 4) {
    // Repetición en cámara lenta del golpe ("instant replay")
    zoom = interpolate(f, [0, SEG], [1.05, 1.3], clamp);
  } else if (n === 5) {
    // Combo: congelado + zoom de golpe + destello + viñeta roja
    zoom = k >= 0 ? 1 + 0.18 * Math.exp(-k / 6) : 1;
    [dx, dy] = sacudida(k, 26);
    blanco = interpolate(k, [0, 1, 4], [0, 0.8, 0], clamp);
    rojo = interpolate(k, [1, 3, 14], [0, 0.6, 0.2], clamp);
  }
  const video = <Video zoom={zoom} dx={dx} dy={dy} />;
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{filter: filtro}}>
        {n === 4 ? (
          <Freeze frame={Math.round(IMP + (f - IMP) * 0.3)} active={(fr) => fr >= IMP}>
            {video}
          </Freeze>
        ) : congelado ? (
          <Freeze frame={IMP + 1} active={(fr) => fr >= IMP + 1}>
            {video}
          </Freeze>
        ) : (
          video
        )}
      </AbsoluteFill>
      {/* viñeta roja de daño: bordes rojos, centro limpio */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(255,0,0,0) 35%, rgba(230,0,0,0.95) 100%)', opacity: rojo}} />
      <AbsoluteFill style={{background: '#fff', opacity: blanco}} />
      {n === 4 && f >= IMP && (
        <div style={{position: 'absolute', top: 260, left: 60, fontFamily: 'Bangers', fontSize: 70, color: '#fff', background: '#E11D48', padding: '4px 24px', borderRadius: 10, opacity: Math.floor(f / 6) % 2 ? 1 : 0.6}}>
          ● REPLAY 0.3x
        </div>
      )}
      <Rotulo
        n={n}
        texto={['PANTALLAZO ROJO', 'IMPACT FRAME (ANIME)', 'RGB + VIÑETA DAÑO', 'REPLAY CÁMARA LENTA', 'COMBO'][n - 1]}
      />
      <Sequence from={IMP}>
        <Audio src={staticFile('survive/sfx/bonk.wav')} volume={0.8} />
        <Audio src={staticFile('survive/sfx/impacto.wav')} volume={0.4} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const DemoGolpes: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <svg width={0} height={0} style={{position: 'absolute'}}>
      <filter id="rgb" x="0" y="0" width="100%" height="100%">
        <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
        <feOffset in="r" dx={-22} dy={0} result="r2" />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
        <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
        <feOffset in="b" dx={22} dy={0} result="b2" />
        <feBlend in="r2" in2="g" mode="screen" result="rg" />
        <feBlend in="rg" in2="b2" mode="screen" />
      </filter>
    </svg>
    {[1, 2, 3, 4, 5].map((n) => (
      <Sequence key={n} from={(n - 1) * SEG} durationInFrames={SEG}>
        <Variante n={n} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
