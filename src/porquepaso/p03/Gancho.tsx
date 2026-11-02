import React from 'react';
import {AbsoluteFill, Freeze, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, MONO, TITULAR, Clave, Punto, seguirPunto} from '../estilo';
import {Pastilla, Reticula} from '../hud';
import {A_INI, DURACION_GANCHO, SEG} from './tiempos';
export {SEG, DURACION_GANCHO};

// Gancho del video 03: "¿Por qué vuela sobre el agua?"
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const B_INI = 15;

const Clip: React.FC<{archivo: string; desde?: number}> = ({archivo, desde = 0}) => (
  <OffthreadVideo src={staticFile(`porquepaso/p03/${archivo}`)} muted trimBefore={desde} style={{width: 1080, height: 1920}} />
);

// Seguimiento aproximado de la chica en A (coordenadas 1080×1920)
const CHICA_A: Clave<Punto>[] = [
  [0, [560, 900]],
  [40, [600, 860]],
  [80, [640, 900]],
  [131, [600, 980]],
];

export const Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const tc = frame - SEG.CONGELADO.desde;
  const enCongelado = tc >= 0;
  const zoom = enCongelado ? interpolate(tc, [0, SEG.CONGELADO.dur], [1, 1.08], clamp) : 1;
  const flash = enCongelado ? interpolate(tc, [0, 2, 8], [0, 0.6, 0], clamp) : 0;
  const oscuro = enCongelado ? interpolate(tc, [0, 10], [0, 0.4], clamp) : 0;
  const barrido = interpolate(tc, [SEG.CONGELADO.dur - 16, SEG.CONGELADO.dur], [-80, 2000], clamp);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <Sequence from={SEG.A.desde} durationInFrames={SEG.A.dur}>
          <Clip archivo="A.mp4" desde={A_INI} />
        </Sequence>
        <Sequence from={SEG.B.desde} durationInFrames={SEG.B.dur}>
          <Clip archivo="B.mp4" desde={B_INI} />
        </Sequence>
        <Sequence from={SEG.CONGELADO.desde} durationInFrames={SEG.CONGELADO.dur}>
          <Freeze frame={B_INI + SEG.B.dur - 1}>
            <Clip archivo="B.mp4" />
          </Freeze>
        </Sequence>
      </AbsoluteFill>

      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.4) 100%)'}} />

      {/* Indicadores */}
      {frame < SEG.B.desde && (
        <>
          <Reticula centro={seguirPunto(frame, CHICA_A)} radio={210} inicio={8} fin={SEG.A.dur - 6} etiqueta="Sin motor" ladoEtiqueta="der" />
          <div style={{position: 'absolute', left: 60, top: 1240, opacity: interpolate(frame, [20, 30], [0, 1], clamp)}}>
            <Pastilla color={C.verde} punto tam={30}>
              Sin olas · sin viento
            </Pastilla>
          </div>
        </>
      )}

      <AbsoluteFill style={{background: `rgba(0,0,0,${oscuro})`}} />
      <AbsoluteFill style={{background: `rgba(255,255,255,${flash})`}} />
      {enCongelado && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 860,
              width: '100%',
              textAlign: 'center',
              fontFamily: TITULAR,
              fontWeight: 900,
              fontSize: 120,
              color: C.rojo,
              textShadow: `0 0 40px ${C.rojo}88, 0 6px 0 rgba(0,0,0,0.6)`,
              transform: `scale(${spring({frame: tc - 2, fps, config: {damping: 12, stiffness: 180}})})`,
            }}
          >
            ¿EDITADO?
          </div>
          <div style={{position: 'absolute', left: 0, top: barrido, width: '100%', height: 6, background: C.cian, boxShadow: `0 0 40px 18px ${C.cian}88`}} />
        </>
      )}

      {/* Texto fijo */}
      <div
        style={{
          position: 'absolute',
          top: 230,
          left: 60,
          right: 60,
          fontFamily: TITULAR,
          fontWeight: 900,
          fontSize: 78,
          lineHeight: 1.05,
          color: C.blanco,
          textShadow: '0 4px 24px rgba(0,0,0,0.85), 0 2px 0 rgba(0,0,0,0.9)',
        }}
      >
        ¿Por qué <span style={{color: C.cian}}>vuela</span>
        <br />
        sobre el agua?
      </div>
      <div style={{position: 'absolute', top: 170, left: 62, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 1.5, color: 'rgba(248,250,252,0.85)', textShadow: '0 2px 8px rgba(0,0,0,0.9)'}}>
        VIDEO · REDDIT
      </div>
    </AbsoluteFill>
  );
};
