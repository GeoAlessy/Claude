import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, MONO, TITULAR} from '../estilo';
import {Pastilla} from '../hud';
import {CAM_INI, DISTRAIDO, DURACION_GANCHO, SEG} from './tiempos';
export {SEG, DURACION_GANCHO};

// Gancho del video 04: el choque del tren, sin mostrar el empujón (la revelación va en el holograma).
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const TOP = 430; // el monitor cuadrado ocupa 1080×1074 desde aquí

// Video de la cámara de seguridad dentro de un "monitor", con el mismo video desenfocado de fondo
export const Monitor: React.FC<{desde: number; velocidad?: number; oscuro?: number; zoom?: number}> = ({desde, velocidad = 1, oscuro = 0, zoom = 1}) => {
  const f = useCurrentFrame();
  const v = (estilo: React.CSSProperties) => (
    <OffthreadVideo src={staticFile('porquepaso/p04/cam_hd.mp4')} muted trimBefore={desde} playbackRate={velocidad} style={estilo} />
  );
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: -80, filter: 'blur(40px) brightness(0.45)'}}>{v({width: '100%', height: '100%', objectFit: 'cover'})}</div>
      <div style={{position: 'absolute', left: 0, top: TOP, width: 1080, height: 1074, overflow: 'hidden', boxShadow: `0 0 0 3px ${C.cian}88, 0 0 60px ${C.cian}33`}}>
        <div style={{width: '100%', height: '100%', transform: `scale(${zoom})`}}>{v({width: 1080, height: 1074})}</div>
        <AbsoluteFill style={{background: `rgba(0,0,0,${oscuro})`}} />
        {/* marco de cámara de seguridad */}
        <div style={{position: 'absolute', left: 24, top: 20, display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.blanco, textShadow: '0 2px 6px #000'}}>
          <span style={{width: 18, height: 18, borderRadius: 9, background: C.rojo, opacity: Math.floor(f / 15) % 2 ? 0.3 : 1}} />
          CÁMARA · LAYTON, UTAH
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tc = frame - SEG.CONGELADO.desde;
  const enRepeticion = tc >= 0;
  const td = frame - DISTRAIDO;
  const barrido = interpolate(tc, [SEG.CONGELADO.dur - 16, SEG.CONGELADO.dur], [-80, 2000], clamp);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence from={0} durationInFrames={SEG.CAM.dur}>
        <Monitor desde={CAM_INI} />
      </Sequence>
      {/* Repetición en cámara lenta del impacto mientras se plantea la duda */}
      <Sequence from={SEG.CONGELADO.desde} durationInFrames={SEG.CONGELADO.dur}>
        <Monitor desde={CAM_INI + 35} velocidad={0.6} oscuro={interpolate(tc, [0, 12], [0, 0.35], clamp)} zoom={interpolate(tc, [0, SEG.CONGELADO.dur], [1, 1.12], clamp)} />
      </Sequence>

      {enRepeticion && (
        <div style={{position: 'absolute', left: 60, top: TOP + 1074 - 80, opacity: interpolate(tc, [0, 8], [0, 1], clamp)}}>
          <Pastilla color={C.ambar} punto tam={28}>
            Repetición · cámara lenta
          </Pastilla>
        </div>
      )}
      {td >= -2 && (
        <div
          style={{
            position: 'absolute',
            top: 880,
            width: '100%',
            textAlign: 'center',
            fontFamily: TITULAR,
            fontWeight: 900,
            fontSize: 112,
            color: C.rojo,
            textShadow: `0 0 40px ${C.rojo}88, 0 6px 0 rgba(0,0,0,0.7)`,
            transform: `scale(${spring({frame: td, fps, config: {damping: 12, stiffness: 180}})})`,
          }}
        >
          ¿DISTRAÍDO?
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
        ¿Por qué <span style={{color: C.cian}}>se quedó</span>
        <br />
        en las vías?
      </div>
      <div style={{position: 'absolute', top: 170, left: 62, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 1.5, color: 'rgba(248,250,252,0.85)', textShadow: '0 2px 8px rgba(0,0,0,0.9)'}}>
        VIDEO · REDDIT
      </div>
    </AbsoluteFill>
  );
};
