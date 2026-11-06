import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, MONO, TITULAR} from '../estilo';
import {Pastilla, Reticula} from '../hud';
import {A_INI, B_INI, DURACION_GANCHO, HUMO, SEG} from './tiempos';
export {SEG, DURACION_GANCHO};

// Gancho del video 10: desde un bote, la nube del Stromboli baja del volcán y corre sobre el mar (vertical a pantalla completa).
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const Clip: React.FC<{clip?: 'A' | 'B'; desde: number; velocidad?: number; oscuro?: number; zoom?: number}> = ({clip = 'A', desde, velocidad = 1, oscuro = 0, zoom = 1}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 45%'}}>
      <OffthreadVideo src={staticFile(`porquepaso/p10/${clip}.mp4`)} muted trimBefore={desde} playbackRate={velocidad} style={{width: 1134, height: 1920, marginLeft: -27}} />
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
  const enRepeticion = tb >= 0;
  const tw = frame - HUMO;
  const barrido = interpolate(tb, [SEG.B.dur - 16, SEG.B.dur], [-80, 2000], clamp);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence from={0} durationInFrames={SEG.A.dur}>
        <Clip desde={A_INI} />
      </Sequence>
      {/* La nube gigante, ya encima del bote, en cámara lenta */}
      <Sequence from={SEG.B.desde} durationInFrames={SEG.B.dur}>
        <Clip clip="B" desde={B_INI} velocidad={0.75} oscuro={interpolate(tb, [0, 12], [0, 0.25], clamp)} zoom={interpolate(tb, [0, SEG.B.dur], [1, 1.12], clamp)} />
      </Sequence>

      <Reticula centro={[560, 900]} radio={170} color={C.ambar} inicio={40} fin={SEG.A.dur - 6} etiqueta="Corre sobre el mar" ladoEtiqueta="der" />
      {enRepeticion && (
        <div style={{position: 'absolute', left: 60, top: 480, opacity: interpolate(tb, [0, 8], [0, 1], clamp)}}>
          <Pastilla color={C.ambar} punto tam={28}>
            Repetición · cámara lenta
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
            fontSize: 128,
            color: C.rojo,
            textShadow: `0 0 40px ${C.rojo}88, 0 6px 0 rgba(0,0,0,0.7)`,
            transform: `scale(${spring({frame: tw, fps, config: {damping: 12, stiffness: 180}})})`,
          }}
        >
          ¿SOLO HUMO?
        </div>
      )}
      {enRepeticion && <div style={{position: 'absolute', left: 0, top: barrido, width: '100%', height: 6, background: C.cian, boxShadow: `0 0 40px 18px ${C.cian}88`}} />}

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
        ¿Por qué esta nube
        <br />
        <span style={{color: C.cian}}>corre sobre el mar?</span>
      </div>
      <div style={{position: 'absolute', top: 170, left: 62, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 1.5, color: 'rgba(248,250,252,0.85)', textShadow: '0 2px 8px rgba(0,0,0,0.9)'}}>
        VIDEO · REDDIT
      </div>
      <div style={{position: 'absolute', top: 410, left: 62, fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 1.5, color: C.blanco, textShadow: '0 2px 8px rgba(0,0,0,0.95)'}}>
        <span style={{color: C.rojo}}>●</span> VOLCÁN STROMBOLI, ITALIA · 2019
      </div>
    </AbsoluteFill>
  );
};
