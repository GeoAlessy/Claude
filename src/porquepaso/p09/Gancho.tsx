import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, MONO, TITULAR} from '../estilo';
import {Pastilla, Reticula} from '../hud';
import {A_INI, DURACION_GANCHO, FRENO, REPE_INI, SEG} from './tiempos';
export {SEG, DURACION_GANCHO};

// Gancho del video 09: la cámara de seguridad de la casa graba cómo la camioneta y el tráiler se van solos.
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const TOP = 440; // el monitor ocupa desde aquí
export const ALTO = 900;
const ESC = ALTO / 750; // la franja original es 1080×750
const IZQ = -60; // recorte a la izquierda (el alero de la casa)

export const Monitor: React.FC<{desde: number; velocidad?: number; oscuro?: number; zoom?: number}> = ({desde, velocidad = 1, oscuro = 0, zoom = 1}) => {
  const f = useCurrentFrame();
  const v = (estilo: React.CSSProperties) => (
    <OffthreadVideo src={staticFile('porquepaso/p09/A.mp4')} muted trimBefore={desde} playbackRate={velocidad} style={estilo} />
  );
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: -80, filter: 'blur(40px) brightness(0.45)'}}>{v({width: '100%', height: '100%', objectFit: 'cover'})}</div>
      <div style={{position: 'absolute', left: 0, top: TOP, width: 1080, height: ALTO, overflow: 'hidden', boxShadow: `0 0 0 3px ${C.cian}88, 0 0 60px ${C.cian}33`}}>
        <div style={{position: 'absolute', left: IZQ, top: 0, width: 1080 * ESC, height: ALTO, transform: `scale(${zoom})`, transformOrigin: '25% 30%'}}>{v({width: 1080 * ESC, height: ALTO})}</div>
        <AbsoluteFill style={{background: `rgba(0,0,0,${oscuro})`}} />
        <div style={{position: 'absolute', left: 24, top: 20, display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.blanco, textShadow: '0 2px 6px #000'}}>
          <span style={{width: 18, height: 18, borderRadius: 9, background: C.rojo, opacity: Math.floor(f / 15) % 2 ? 0.3 : 1}} />
          CÁMARA DE SEGURIDAD
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Punto de la franja original (px de 1080×750) → pantalla
export const aPantalla = (x: number, y: number): [number, number] => [x * ESC + IZQ, TOP + y * ESC];

export const Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tb = frame - SEG.B.desde;
  const enRepeticion = tb >= 0;
  const tw = frame - FRENO;
  const barrido = interpolate(tb, [SEG.B.dur - 16, SEG.B.dur], [-80, 2000], clamp);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence from={0} durationInFrames={SEG.A.dur}>
        <Monitor desde={A_INI} />
      </Sequence>
      <Reticula centro={aPantalla(250, 215)} radio={95} color={C.ambar} inicio={84} fin={SEG.A.dur - 4} etiqueta="Se mueve sola" ladoEtiqueta="der" />
      {/* Repetición en cámara lenta: empieza a rodar y el señor salta del tractor */}
      <Sequence from={SEG.B.desde} durationInFrames={SEG.B.dur}>
        <Monitor desde={REPE_INI} velocidad={0.75} oscuro={interpolate(tb, [0, 12], [0, 0.3], clamp)} zoom={interpolate(tb, [0, SEG.B.dur], [1, 1.12], clamp)} />
      </Sequence>

      {enRepeticion && (
        <div style={{position: 'absolute', left: 60, top: TOP + ALTO - 80, opacity: interpolate(tb, [0, 8], [0, 1], clamp)}}>
          <Pastilla color={C.ambar} punto tam={28}>
            Repetición · cámara lenta
          </Pastilla>
        </div>
      )}
      {tw >= -2 && (
        <div
          style={{
            position: 'absolute',
            top: 800,
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
          ¿SIN FRENO?
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
        ¿Por qué se fue <span style={{color: C.cian}}>sola</span>
        <br />
        esta camioneta?
      </div>
      <div style={{position: 'absolute', top: 170, left: 62, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 1.5, color: 'rgba(248,250,252,0.85)', textShadow: '0 2px 8px rgba(0,0,0,0.9)'}}>
        VIDEO · REDDIT
      </div>
    </AbsoluteFill>
  );
};
