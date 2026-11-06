import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, MONO, TITULAR} from '../estilo';
import {Pastilla, Reticula} from '../hud';
import {A_INI, B_INI, CHOQUE, C_INI, DURACION_GANCHO, FRENO, SEG, VEL} from './tiempos';
export {SEG, DURACION_GANCHO};

// Gancho del video 09: la cámara de seguridad graba cómo la camioneta y el tráiler se van solos… y chocan abajo.
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const TOP = 370; // el monitor ocupa de 370 a 1410
export const ALTO = 1040;
const ESC = ALTO / 750; // la franja original es 1080×750
const IZQ = -150; // recorte a la izquierda (el alero de la casa)

export const Monitor: React.FC<{clip?: 'A' | 'C'; desde: number; velocidad?: number; oscuro?: number; zoom?: number; temblor?: number}> = ({
  clip = 'A',
  desde,
  velocidad = 1,
  oscuro = 0,
  zoom = 1,
  temblor = 0,
}) => {
  const f = useCurrentFrame();
  const v = (estilo: React.CSSProperties) => (
    <OffthreadVideo src={staticFile(`porquepaso/p09/${clip}.mp4`)} muted trimBefore={desde} playbackRate={velocidad} style={estilo} />
  );
  const dx = Math.sin(f * 2.3) * 14 * temblor;
  const dy = Math.cos(f * 3.1) * 10 * temblor;
  const caja: React.CSSProperties =
    clip === 'A'
      ? {position: 'absolute', left: IZQ, top: 0, width: 1080 * ESC, height: ALTO, transformOrigin: '30% 30%'}
      : {position: 'absolute', left: 0, top: 0, width: 1080, height: ALTO, transformOrigin: '48% 58%'};
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: -80, filter: 'blur(40px) brightness(0.45)'}}>{v({width: '100%', height: '100%', objectFit: 'cover'})}</div>
      <div style={{position: 'absolute', left: 0, top: TOP, width: 1080, height: ALTO, overflow: 'hidden', boxShadow: `0 0 0 3px ${C.cian}88, 0 0 60px ${C.cian}33`}}>
        <div style={{...caja, transform: `translate(${dx}px, ${dy}px) scale(${zoom})`}}>{v({width: caja.width as number, height: ALTO, objectFit: 'cover'})}</div>
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
  const tc = frame - SEG.C.desde;
  const enZoom = tc >= 0;
  const tw = frame - FRENO;
  const tch = frame - CHOQUE;
  const flash = interpolate(tch, [0, 2, 10], [0, 0.55, 0], clamp);
  const temblor = interpolate(tch, [0, 1, 14], [0, 1, 0], clamp);
  const barrido = interpolate(tc, [SEG.C.dur - 16, SEG.C.dur], [-80, 2000], clamp);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence from={0} durationInFrames={SEG.A.dur}>
        <Monitor desde={A_INI} />
      </Sequence>
      <Reticula centro={aPantalla(250, 215)} radio={95} color={C.ambar} inicio={84} fin={SEG.A.dur - 4} etiqueta="Se mueve sola" ladoEtiqueta="der" />
      {/* el señor salta del tractor y corre detrás */}
      <Sequence from={SEG.B.desde} durationInFrames={SEG.B.dur}>
        <Monitor desde={B_INI} velocidad={VEL} />
      </Sequence>
      {/* zoom al final de la entrada: llega abajo, se dobla y choca */}
      <Sequence from={SEG.C.desde} durationInFrames={SEG.C.dur}>
        <Monitor clip="C" desde={C_INI} velocidad={VEL} zoom={interpolate(tc, [0, SEG.C.dur], [1, 1.06], clamp)} temblor={temblor} oscuro={interpolate(frame, [CHOQUE + 20, CHOQUE + 36], [0, 0.25], clamp)} />
      </Sequence>
      {enZoom && (
        <div style={{position: 'absolute', left: 40, top: TOP + ALTO - 84, opacity: interpolate(tc, [0, 8], [0, 1], clamp)}}>
          <Pastilla color={C.ambar} punto tam={28}>
            Zoom ×3 · al final de la entrada
          </Pastilla>
        </div>
      )}
      <Reticula centro={[580, TOP + 590]} radio={150} color={C.rojo} inicio={CHOQUE - 3} fin={SEG.C.dur + SEG.C.desde - 6} etiqueta="¡Choca!" ladoEtiqueta="der" />
      <AbsoluteFill style={{background: '#fff', opacity: flash, pointerEvents: 'none'}} />
      {tw >= -2 && (
        <div
          style={{
            position: 'absolute',
            top: TOP + 90,
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
      {enZoom && <div style={{position: 'absolute', left: 0, top: barrido, width: '100%', height: 6, background: C.cian, boxShadow: `0 0 40px 18px ${C.cian}88`}} />}

      {/* Texto fijo, centrado en el margen de arriba */}
      <div style={{position: 'absolute', top: 44, left: 40, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 1.5, color: 'rgba(248,250,252,0.85)', textShadow: '0 2px 8px rgba(0,0,0,0.9)'}}>
        VIDEO · REDDIT
      </div>
      <div
        style={{
          position: 'absolute',
          top: 110,
          left: 40,
          right: 40,
          textAlign: 'center',
          fontFamily: TITULAR,
          fontWeight: 900,
          fontSize: 80,
          lineHeight: 1.05,
          color: C.blanco,
          textShadow: '0 4px 24px rgba(0,0,0,0.85), 0 2px 0 rgba(0,0,0,0.9)',
        }}
      >
        ¿Por qué se fue <span style={{color: C.cian}}>sola</span>
        <br />
        esta camioneta?
      </div>
    </AbsoluteFill>
  );
};
