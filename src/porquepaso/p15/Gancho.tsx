import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, MONO, TITULAR} from '../estilo';
import {Pastilla, Reticula} from '../hud';
import {A_INI, B_INI, B_VEL, C_INI, C_VEL, CENSURA, DURACION_GANCHO, RESBALO, SEG} from './tiempos';
export {SEG, DURACION_GANCHO};

// Gancho del video 15: un trabajador baja por una escalera apoyada en un bote y la escalera se va hacia atrás.
// La caída no se muestra: la imagen se difumina antes (regla del usuario).
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Posición del trabajador (cuadro del gancho, x, y, radio), medida cuadro a cuadro en el clip:
// el círculo lo acompaña mientras baja y la escalera se va hacia atrás.
const PISTA: [number, number, number, number][] = [
  [45, 193, 405, 120], [54, 167, 539, 120], [63, 72, 606, 120], [72, 116, 585, 120], [81, 67, 653, 120], [90, 88, 697, 125],
  [108, 56, 762, 130], [126, 72, 853, 135], [144, 214, 822, 140], [162, 208, 1046, 145], [180, 202, 1096, 145],
];
const sigue = (f: number) => {
  const t = PISTA.map((p) => p[0]);
  const v = (i: number) => interpolate(f, t, PISTA.map((p) => p[i]), clamp);
  // el círculo no se sale de la pantalla (él baja pegado al borde izquierdo)
  return {c: [Math.max(150, v(1)), v(2)] as [number, number], r: v(3)};
};

export const Clip: React.FC<{desde: number; velocidad?: number; oscuro?: number; zoom?: number; origen?: string; borroso?: number}> = ({desde, velocidad = 1, oscuro = 0, zoom = 1, origen = '50% 60%', borroso = 0}) => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: origen, filter: borroso > 0 ? `blur(${borroso}px)` : undefined}}>
      <OffthreadVideo src={staticFile('porquepaso/p15/A.mp4')} muted trimBefore={desde} playbackRate={velocidad} style={{width: 1080, height: 1920}} />
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
  const tw = frame - RESBALO;
  const barrido = interpolate(frame, [DURACION_GANCHO - 16, DURACION_GANCHO], [-80, 2000], clamp);
  const {c, r} = sigue(frame);
  // censura: la caída nunca se ve
  const borroso = interpolate(frame, [CENSURA - 4, CENSURA + 8], [0, 28], clamp);
  const velC = Math.min(C_VEL, (191 - C_INI) / Math.max(1, SEG.C.dur));

  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* El trabajador baja del muelle a la escalera */}
      <Sequence from={0} durationInFrames={SEG.A.dur}>
        <Clip desde={A_INI} zoom={interpolate(frame, [0, SEG.A.dur], [1.04, 1.1])} />
      </Sequence>
      {/* La escalera se va hacia atrás, en cámara lenta */}
      <Sequence from={SEG.B.desde} durationInFrames={SEG.B.dur}>
        <Clip desde={B_INI} velocidad={B_VEL} zoom={interpolate(tb, [0, SEG.B.dur], [1.1, 1.2], clamp)} borroso={borroso} oscuro={interpolate(borroso, [0, 28], [0, 0.3])} />
      </Sequence>
      <Sequence from={SEG.C.desde} durationInFrames={SEG.C.dur}>
        <Clip desde={C_INI} velocidad={velC} zoom={interpolate(tc, [0, SEG.C.dur], [1.2, 1.28], clamp)} borroso={28} oscuro={0.3} />
      </Sequence>

      <Reticula centro={c} radio={r} color={C.ambar} inicio={50} fin={CENSURA - 6} etiqueta="Escalera casi vertical" ladoEtiqueta="der" />
      {tb >= 0 && frame < CENSURA + 30 && (
        <div style={{position: 'absolute', left: 60, top: 480, opacity: interpolate(tb, [0, 8], [0, 1], clamp) * interpolate(frame, [CENSURA + 20, CENSURA + 30], [1, 0], clamp)}}>
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
          ¿SE RESBALÓ?
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
        ¿Por qué se fue
        <br />
        <span style={{color: C.cian}}>hacia atrás?</span>
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
