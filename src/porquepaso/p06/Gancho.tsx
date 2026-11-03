import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, MONO, TITULAR} from '../estilo';
import {Pastilla} from '../hud';
import {A_INI, BOMBA, DURACION_GANCHO, SEG} from './tiempos';
export {SEG, DURACION_GANCHO};

// Gancho del video 06: el camión con nitrato de amonio arde y explota (videos de testigos).
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const TOP = 420; // el monitor 1080×1449 (3:4) ocupa desde aquí
const ALTO = 1449;

// Video del testigo dentro de un "monitor", con el mismo video desenfocado de fondo
export const Monitor: React.FC<{clip: 'A' | 'B' | 'C'; desde: number; velocidad?: number; oscuro?: number; zoom?: number}> = ({clip, desde, velocidad = 1, oscuro = 0, zoom = 1}) => {
  const f = useCurrentFrame();
  const v = (estilo: React.CSSProperties) => (
    <OffthreadVideo src={staticFile(`porquepaso/p06/${clip}.mp4`)} muted trimBefore={desde} playbackRate={velocidad} style={estilo} />
  );
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: -80, filter: 'blur(40px) brightness(0.45)'}}>{v({width: '100%', height: '100%', objectFit: 'cover'})}</div>
      <div style={{position: 'absolute', left: 0, top: TOP, width: 1080, height: ALTO, overflow: 'hidden', boxShadow: `0 0 0 3px ${C.cian}88, 0 0 60px ${C.cian}33`}}>
        <div style={{width: '100%', height: '100%', transform: `scale(${zoom})`, transformOrigin: '55% 35%'}}>{v({width: 1080, height: ALTO})}</div>
        <AbsoluteFill style={{background: `rgba(0,0,0,${oscuro})`}} />
        <div style={{position: 'absolute', left: 24, top: 20, display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.blanco, textShadow: '0 2px 6px #000'}}>
          <span style={{width: 18, height: 18, borderRadius: 9, background: C.rojo, opacity: Math.floor(f / 15) % 2 ? 0.3 : 1}} />
          MONGOLIA INTERIOR, CHINA
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
  const tw = frame - BOMBA;
  const barrido = interpolate(tb, [SEG.B.dur - 16, SEG.B.dur], [-80, 2000], clamp);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence from={0} durationInFrames={SEG.A.dur}>
        <Monitor clip="A" desde={A_INI} />
      </Sequence>
      <Sequence from={SEG.C.desde} durationInFrames={SEG.C.dur}>
        <Monitor clip="C" desde={20} />
      </Sequence>
      {/* La bola de fuego vista de lejos, en cámara lenta, mientras se plantea la duda */}
      <Sequence from={SEG.B.desde} durationInFrames={SEG.B.dur}>
        <Monitor clip="B" desde={10} velocidad={0.75} oscuro={interpolate(tb, [0, 12], [0, 0.3], clamp)} zoom={interpolate(tb, [0, SEG.B.dur], [1, 1.15], clamp)} />
      </Sequence>

      {enRepeticion && (
        <div style={{position: 'absolute', left: 60, top: TOP + 90, opacity: interpolate(tb, [0, 8], [0, 1], clamp)}}>
          <Pastilla color={C.ambar} punto tam={28}>
            Otro testigo · cámara lenta
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
            fontSize: 120,
            color: C.rojo,
            textShadow: `0 0 40px ${C.rojo}88, 0 6px 0 rgba(0,0,0,0.7)`,
            transform: `scale(${spring({frame: tw, fps, config: {damping: 12, stiffness: 180}})})`,
          }}
        >
          ¿UNA BOMBA?
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
        ¿Por qué <span style={{color: C.cian}}>explotó</span>
        <br />
        este camión?
      </div>
      <div style={{position: 'absolute', top: 170, left: 62, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 1.5, color: 'rgba(248,250,252,0.85)', textShadow: '0 2px 8px rgba(0,0,0,0.9)'}}>
        VIDEO · REDDIT
      </div>
    </AbsoluteFill>
  );
};
