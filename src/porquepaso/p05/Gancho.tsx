import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, MONO, TITULAR} from '../estilo';
import {Pastilla, Reticula} from '../hud';
import {CAM_INI, DURACION_GANCHO, REPE_INI, SEG, SUERTE} from './tiempos';
export {SEG, DURACION_GANCHO};

// Gancho del video 05: la webcam del clima de Pheriche graba el choque de los dos helicópteros.
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const TOP = 470; // el monitor 1080×810 ocupa desde aquí
const ALTO = 810;

// Video de la webcam dentro de un "monitor", con el mismo video desenfocado de fondo
export const Monitor: React.FC<{desde: number; velocidad?: number; oscuro?: number; zoom?: number}> = ({desde, velocidad = 1, oscuro = 0, zoom = 1}) => {
  const f = useCurrentFrame();
  const v = (estilo: React.CSSProperties) => (
    <OffthreadVideo src={staticFile('porquepaso/p05/cam_hd.mp4')} muted trimBefore={desde} playbackRate={velocidad} style={estilo} />
  );
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: -80, filter: 'blur(40px) brightness(0.45)'}}>{v({width: '100%', height: '100%', objectFit: 'cover'})}</div>
      <div style={{position: 'absolute', left: 0, top: TOP, width: 1080, height: ALTO, overflow: 'hidden', boxShadow: `0 0 0 3px ${C.cian}88, 0 0 60px ${C.cian}33`}}>
        <div style={{width: '100%', height: '100%', transform: `scale(${zoom})`, transformOrigin: '35% 40%'}}>{v({width: 1080, height: ALTO})}</div>
        <AbsoluteFill style={{background: `rgba(0,0,0,${oscuro})`}} />
        <div style={{position: 'absolute', left: 24, top: 20, display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.blanco, textShadow: '0 2px 6px #000'}}>
          <span style={{width: 18, height: 18, borderRadius: 9, background: C.rojo, opacity: Math.floor(f / 15) % 2 ? 0.3 : 1}} />
          WEBCAM · PHERICHE, NEPAL
        </div>
        <div style={{position: 'absolute', right: 24, top: 20, fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.blanco, textShadow: '0 2px 6px #000'}}>4,200 m</div>
      </div>
    </AbsoluteFill>
  );
};

export const Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tr = frame - SEG.REPE.desde;
  const enRepeticion = tr >= 0;
  const ts = frame - SUERTE;
  const barrido = interpolate(tr, [SEG.REPE.dur - 16, SEG.REPE.dur], [-80, 2000], clamp);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence from={0} durationInFrames={SEG.CAM.dur}>
        <Monitor desde={CAM_INI} />
      </Sequence>
      {/* Repetición en cámara lenta del roce de las aspas mientras se plantea la duda */}
      <Sequence from={SEG.REPE.desde} durationInFrames={SEG.REPE.dur}>
        <Monitor desde={REPE_INI} velocidad={0.5} oscuro={interpolate(tr, [0, 12], [0, 0.3], clamp)} zoom={interpolate(tr, [0, SEG.REPE.dur], [1, 1.15], clamp)} />
      </Sequence>

      {enRepeticion && (
        <>
          <Reticula centro={[400, TOP + 300]} radio={110} color={C.ambar} inicio={SEG.REPE.desde + 22} fin={SEG.REPE.desde + 62} etiqueta="Las aspas" ladoEtiqueta="der" />
          <div style={{position: 'absolute', left: 60, top: TOP + ALTO - 80, opacity: interpolate(tr, [0, 8], [0, 1], clamp)}}>
            <Pastilla color={C.ambar} punto tam={28}>
              Repetición · cámara lenta
            </Pastilla>
          </div>
        </>
      )}
      {ts >= -2 && (
        <div
          style={{
            position: 'absolute',
            top: 1330,
            width: '100%',
            textAlign: 'center',
            fontFamily: TITULAR,
            fontWeight: 900,
            fontSize: 112,
            color: C.rojo,
            textShadow: `0 0 40px ${C.rojo}88, 0 6px 0 rgba(0,0,0,0.7)`,
            transform: `scale(${spring({frame: ts, fps, config: {damping: 12, stiffness: 180}})})`,
          }}
        >
          ¿MALA SUERTE?
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
        ¿Por qué <span style={{color: C.cian}}>chocaron</span>
        <br />
        en el Everest?
      </div>
      <div style={{position: 'absolute', top: 170, left: 62, fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 1.5, color: 'rgba(248,250,252,0.85)', textShadow: '0 2px 8px rgba(0,0,0,0.9)'}}>
        VIDEO · WEBCAM NEPAL
      </div>
    </AbsoluteFill>
  );
};
