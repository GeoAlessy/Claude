import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, MONO, TITULAR} from '../estilo';
import {Pastilla, Reticula} from '../hud';
import {A_INI, DURACION_GANCHO, REPE_INI, SEG, SUERTE} from './tiempos';
export {SEG, DURACION_GANCHO};

// Gancho del video 11: la lancha gira cerca de la orilla y el inflable sale volando contra la gente de la playa.
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const TOP = 300; // el monitor ocupa de 300 a 1524
export const ALTO = 1224;

export const Monitor: React.FC<{desde: number; velocidad?: number; oscuro?: number; zoom?: number}> = ({desde, velocidad = 1, oscuro = 0, zoom = 1}) => {
  const f = useCurrentFrame();
  const v = (estilo: React.CSSProperties) => (
    <OffthreadVideo src={staticFile('porquepaso/p11/A.mp4')} muted trimBefore={desde} playbackRate={velocidad} style={estilo} />
  );
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: -80, filter: 'blur(40px) brightness(0.45)'}}>{v({width: '100%', height: '100%', objectFit: 'cover'})}</div>
      <div style={{position: 'absolute', left: 0, top: TOP, width: 1080, height: ALTO, overflow: 'hidden', boxShadow: `0 0 0 3px ${C.cian}88, 0 0 60px ${C.cian}33`}}>
        <div style={{width: 1080, height: ALTO, transform: `scale(${zoom})`, transformOrigin: '40% 35%'}}>{v({width: 1080, height: ALTO})}</div>
        <AbsoluteFill style={{background: `rgba(0,0,0,${oscuro})`}} />
        <div style={{position: 'absolute', left: 24, top: 20, display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.blanco, textShadow: '0 2px 6px #000'}}>
          <span style={{width: 18, height: 18, borderRadius: 9, background: C.rojo, opacity: Math.floor(f / 15) % 2 ? 0.3 : 1}} />
          VIDEO REAL
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tb = frame - SEG.B.desde;
  const enRepeticion = tb >= 0;
  const tw = frame - SUERTE;
  const barrido = interpolate(tb, [SEG.B.dur - 16, SEG.B.dur], [-80, 2000], clamp);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence from={0} durationInFrames={SEG.A.dur}>
        <Monitor desde={A_INI} />
      </Sequence>
      <Reticula centro={[620, TOP + 640]} radio={130} color={C.ambar} inicio={4} fin={40} etiqueta="Gira de golpe" ladoEtiqueta="izq" />
      {/* Repetición en cámara lenta del inflable volando sobre la gente */}
      <Sequence from={SEG.B.desde} durationInFrames={SEG.B.dur}>
        <Monitor desde={REPE_INI} velocidad={0.5} oscuro={interpolate(tb, [0, 12], [0, 0.25], clamp)} zoom={interpolate(tb, [0, SEG.B.dur], [1, 1.12], clamp)} />
      </Sequence>
      {enRepeticion && (
        <div style={{position: 'absolute', left: 40, top: TOP + ALTO - 84, opacity: interpolate(tb, [0, 8], [0, 1], clamp)}}>
          <Pastilla color={C.ambar} punto tam={28}>
            Repetición · cámara lenta
          </Pastilla>
        </div>
      )}
      {tw >= -2 && (
        <div
          style={{
            position: 'absolute',
            top: TOP + ALTO - 330,
            width: '100%',
            textAlign: 'center',
            fontFamily: TITULAR,
            fontWeight: 900,
            fontSize: 120,
            color: C.rojo,
            textShadow: `0 0 40px ${C.rojo}88, 0 6px 0 rgba(0,0,0,0.7)`,
            transform: `scale(${spring({frame: tw, fps, config: {damping: 12, stiffness: 180}})})`,
          }}
        >
          ¿MALA SUERTE?
        </div>
      )}
      {enRepeticion && <div style={{position: 'absolute', left: 0, top: barrido, width: '100%', height: 6, background: C.cian, boxShadow: `0 0 40px 18px ${C.cian}88`}} />}

      {/* Texto fijo, centrado en el margen de arriba */}
      <div style={{position: 'absolute', top: 40, left: 40, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 1.5, color: 'rgba(248,250,252,0.85)', textShadow: '0 2px 8px rgba(0,0,0,0.9)'}}>
        VIDEO · REDDIT
      </div>
      <div
        style={{
          position: 'absolute',
          top: 92,
          left: 40,
          right: 40,
          textAlign: 'center',
          fontFamily: TITULAR,
          fontWeight: 900,
          fontSize: 76,
          lineHeight: 1.05,
          color: C.blanco,
          textShadow: '0 4px 24px rgba(0,0,0,0.85), 0 2px 0 rgba(0,0,0,0.9)',
        }}
      >
        ¿Por qué salió <span style={{color: C.cian}}>volando</span>
        <br />
        este inflable?
      </div>
    </AbsoluteFill>
  );
};
