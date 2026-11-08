import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, MONO, TITULAR} from '../estilo';
import {Pastilla, Reticula} from '../hud';
import {A_INI, B_INI, B_VEL, C_INI, C_VEL, DURACION_GANCHO, ROMPIO, SEG} from './tiempos';
export {SEG, DURACION_GANCHO};

// Gancho del video 14: arrancón a fondo; la moto empieza a sacudirse sola y se cae.
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Posición de la moto (cuadro del gancho, x, y, radio), medida cuadro a cuadro en el clip:
// el círculo la acompaña mientras se acerca, se sacude y se cae.
const PISTA: [number, number, number, number][] = [
  [32, 612, 1150, 90], [38, 604, 1165, 95], [44, 622, 1167, 100], [47, 575, 1157, 105], [53, 530, 1167, 110], [60, 494, 1208, 125],
  [68, 483, 1333, 145], [75, 422, 1400, 150], [80, 480, 1430, 155], [83, 752, 1475, 160], [90, 794, 1475, 160], [98, 836, 1091, 150],
];
const sigue = (f: number) => {
  const t = PISTA.map((p) => p[0]);
  const v = (i: number) => interpolate(f, t, PISTA.map((p) => p[i]), clamp);
  return {c: [v(1), v(2)] as [number, number], r: v(3)};
};

export const Clip: React.FC<{desde: number; velocidad?: number; oscuro?: number; zoom?: number; origen?: string}> = ({desde, velocidad = 1, oscuro = 0, zoom = 1, origen = '50% 60%'}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: origen}}>
      <OffthreadVideo src={staticFile('porquepaso/p14/A.mp4')} muted trimBefore={desde} playbackRate={velocidad} style={{width: 1080, height: 1920}} />
    </AbsoluteFill>
    <AbsoluteFill style={{background: `rgba(0,0,0,${oscuro})`}} />
    {/* sombra arriba y abajo para que se lean el título y los subtítulos */}
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.55) 100%)'}} />
  </AbsoluteFill>
);

export const Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tb = frame - SEG.B.desde;
  const tc = frame - SEG.C.desde;
  const tw = frame - ROMPIO;
  const barrido = interpolate(frame, [DURACION_GANCHO - 16, DURACION_GANCHO], [-80, 2000], clamp);
  const {c, r} = sigue(frame);
  // después de "se rompió", la segunda toma sigue aún más lenta (nunca imagen quieta)
  const C1 = Math.max(1, ROMPIO - 2 - SEG.C.desde);
  const srcC2 = C_INI + C1 * C_VEL;
  const C2 = SEG.C.dur - C1;
  const velC2 = Math.min(C_VEL, (167 - srcC2) / Math.max(1, C2));

  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* Toma 1: de lejos, la moto se acerca a fondo */}
      <Sequence from={0} durationInFrames={SEG.A.dur}>
        <Clip desde={A_INI} zoom={interpolate(frame, [0, SEG.A.dur], [1, 1.06])} />
      </Sequence>
      {/* La sacudida y la caída, en cámara lenta */}
      <Sequence from={SEG.B.desde} durationInFrames={SEG.B.dur}>
        <Clip desde={B_INI} velocidad={B_VEL} zoom={1.06} />
      </Sequence>
      {/* Toma 2: desde atrás del público, la moto y el piloto ruedan por la carretera */}
      <Sequence from={SEG.C.desde} durationInFrames={C1}>
        <Clip desde={C_INI} velocidad={C_VEL} zoom={interpolate(tc, [0, C1], [1.04, 1.12], clamp)} origen="62% 52%" />
      </Sequence>
      <Sequence from={SEG.C.desde + C1} durationInFrames={C2}>
        <Clip desde={Math.round(srcC2)} velocidad={velC2} oscuro={interpolate(tw, [0, 10], [0, 0.25], clamp)} zoom={interpolate(tc, [C1, SEG.C.dur], [1.12, 1.24], clamp)} origen="62% 52%" />
      </Sequence>

      <Reticula centro={c} radio={r} color={C.ambar} inicio={32} fin={SEG.C.desde - 4} etiqueta="Acelerador a fondo" ladoEtiqueta="der" />
      {tb >= 0 && tc < 0 + 20 && (
        <div style={{position: 'absolute', left: 60, top: 480, opacity: interpolate(tb, [0, 8], [0, 1], clamp) * interpolate(tc, [10, 20], [1, 0], clamp)}}>
          <Pastilla color={C.ambar} punto tam={28}>
            Cámara lenta
          </Pastilla>
        </div>
      )}
      {tw >= -2 && (
        <div
          style={{
            position: 'absolute',
            top: 1180,
            width: '100%',
            textAlign: 'center',
            fontFamily: TITULAR,
            fontWeight: 900,
            fontSize: 104,
            color: C.rojo,
            textShadow: `0 0 40px ${C.rojo}88, 0 6px 0 rgba(0,0,0,0.7)`,
            transform: `scale(${spring({frame: tw, fps, config: {damping: 12, stiffness: 180}})})`,
          }}
        >
          ¿SE ROMPIÓ?
        </div>
      )}
      {frame >= DURACION_GANCHO - 16 && <div style={{position: 'absolute', left: 0, top: barrido, width: '100%', height: 6, background: C.cian, boxShadow: `0 0 40px 18px ${C.cian}88`}} />}

      {/* Texto fijo */}
      <div
        style={{
          position: 'absolute',
          top: 230,
          left: 60,
          right: 60,
          fontFamily: TITULAR,
          fontWeight: 900,
          fontSize: 76,
          lineHeight: 1.05,
          color: C.blanco,
          textShadow: '0 4px 24px rgba(0,0,0,0.85), 0 2px 0 rgba(0,0,0,0.9)',
        }}
      >
        ¿Por qué se sacudió
        <br />
        <span style={{color: C.cian}}>esta moto?</span>
      </div>
      <div style={{position: 'absolute', top: 170, left: 62, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 1.5, color: 'rgba(248,250,252,0.85)', textShadow: '0 2px 8px rgba(0,0,0,0.9)'}}>
        VIDEO · REDDIT
      </div>
      <div style={{position: 'absolute', top: 410, left: 62, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 1.5, color: C.blanco, textShadow: '0 2px 8px rgba(0,0,0,0.95)'}}>
        <span style={{color: C.rojo}}>●</span> R/WHATCOULDGOWRONG
      </div>
    </AbsoluteFill>
  );
};
