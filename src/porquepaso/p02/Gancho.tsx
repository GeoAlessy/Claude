import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {C, MONO, TITULAR, Clave, seguir} from '../estilo';
import {Pastilla} from '../hud';
import {DASH_INI, DURACION_GANCHO, HIELO_DICHO, SEG} from './tiempos';
export {SEG, DURACION_GANCHO};

// Gancho del video 02: "¿Por qué cayó este jet en Florida?"
// Clips de Reddit escalados con Real-ESRGAN: cámara de auto (horizontal) y cráter (vertical).
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// La cámara del auto es horizontal (854×478 → 3431×1920): se recorta en vertical siguiendo el fuego y el humo.
export const DASH_ANCHO = Math.round((1920 * 854) / 478);
// [fotograma de la cámara del auto, centro horizontal 0–1]
const CENTRO_DASH: Clave<number>[] = [
  [0, 0.5],
  [44, 0.52],
  [52, 0.62],
  [68, 0.76],
  [110, 0.75],
  [180, 0.7],
  [210, 0.61],
  [268, 0.64],
];
export function desplazamientoDash(fDash: number) {
  const cx = seguir(fDash, CENTRO_DASH);
  return Math.min(0, Math.max(1080 - DASH_ANCHO, 540 - cx * DASH_ANCHO));
}

export const Dash: React.FC<{desdeCuadro: number; velocidad?: number}> = ({desdeCuadro, velocidad = 1}) => {
  const f = useCurrentFrame();
  const fDash = desdeCuadro + f * velocidad;
  return (
    <div style={{position: 'absolute', left: desplazamientoDash(fDash), top: 0, width: DASH_ANCHO, height: 1920}}>
      <OffthreadVideo src={staticFile('porquepaso/p02/dash_hd.mp4')} muted trimBefore={desdeCuadro} playbackRate={velocidad} style={{width: DASH_ANCHO, height: 1920}} />
    </div>
  );
};

// Ondas de audio de la radio
const OndaRadio: React.FC<{f: number; fuerza: number}> = ({f, fuerza}) => {
  const barras = 28;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 8, height: 90}}>
      {Array.from({length: barras}, (_, i) => {
        const h = 10 + fuerza * 70 * Math.abs(Math.sin(i * 1.7 + f * 0.6) * Math.sin(i * 0.45 - f * 0.23));
        return <div key={i} style={{width: 10, height: h, borderRadius: 5, background: C.cian, boxShadow: `0 0 10px ${C.cian}`}} />;
      })}
    </div>
  );
};

export const Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Tramo de radio: el humo sigue en cámara lenta, oscurecido y frío
  const tr = frame - SEG.RADIO.desde;
  const enRadio = tr >= 0;
  const oscuro = enRadio ? interpolate(tr, [0, 12], [0, 0.55], clamp) : 0;
  const zoom = enRadio ? interpolate(tr, [0, SEG.RADIO.dur], [1, 1.12], clamp) : 1;
  const th = frame - HIELO_DICHO;
  const cita = spring({frame: th + 2, fps, config: {damping: 14, stiffness: 170}});
  const fuerzaOnda = enRadio ? (th >= -40 && th < 30 ? 1 : 0.35) : 0;
  const barrido = interpolate(tr, [SEG.RADIO.dur - 16, SEG.RADIO.dur], [-80, 2000], clamp);

  // "−8 km en 1 min" aparece con la frase de la caída
  const opCaida = interpolate(frame, [28, 38], [0, 1], clamp);

  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* ---------- VIDEO ---------- */}
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <Sequence from={SEG.DASH.desde} durationInFrames={SEG.DASH.dur}>
          <Dash desdeCuadro={DASH_INI} />
        </Sequence>
        <Sequence from={SEG.CRATER.desde} durationInFrames={SEG.CRATER.dur}>
          <OffthreadVideo src={staticFile('porquepaso/p02/crater_hd.mp4')} muted style={{width: 1080, height: 1920, objectFit: 'cover'}} />
        </Sequence>
        <Sequence from={SEG.RADIO.desde} durationInFrames={SEG.RADIO.dur}>
          <Dash desdeCuadro={DASH_INI + SEG.DASH.dur} velocidad={0.62} />
        </Sequence>
      </AbsoluteFill>

      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)'}} />
      <AbsoluteFill style={{background: `rgba(2,10,20,${oscuro})`}} />

      {/* ---------- INDICADORES ---------- */}
      {frame < SEG.CRATER.desde && (
        <div style={{position: 'absolute', left: 60, top: 1240, opacity: opCaida}}>
          <Pastilla color={C.rojo} punto tam={32}>
            −8 km en 1 minuto
          </Pastilla>
        </div>
      )}
      {frame >= SEG.CRATER.desde && frame < SEG.RADIO.desde && (
        <div style={{position: 'absolute', left: 60, top: 1240, opacity: interpolate(frame, [SEG.CRATER.desde + 6, SEG.CRATER.desde + 14], [0, 1], clamp)}}>
          <Pastilla color={C.blanco} tam={30}>
            9 personas a bordo
          </Pastilla>
        </div>
      )}

      {/* ---------- RADIO: "¡Tenemos HIELO!" ---------- */}
      {enRadio && (
        <>
          <div style={{position: 'absolute', top: 640, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, opacity: interpolate(tr, [4, 14], [0, 1], clamp)}}>
            <Pastilla color={C.cian} punto tam={28}>
              Radio · piloto → control aéreo
            </Pastilla>
            <OndaRadio f={frame} fuerza={fuerzaOnda} />
          </div>
          {th >= -2 && (
            <div
              style={{
                position: 'absolute',
                top: 880,
                width: '100%',
                textAlign: 'center',
                fontFamily: TITULAR,
                fontWeight: 900,
                fontSize: 98,
                color: C.blanco,
                textShadow: `0 0 50px ${C.cian}aa, 0 6px 0 rgba(0,0,0,0.6)`,
                transform: `scale(${cita})`,
              }}
            >
              “¡Tenemos <span style={{color: C.cian}}>HIELO</span>!”
            </div>
          )}
          <div style={{position: 'absolute', left: 0, top: barrido, width: '100%', height: 6, background: C.cian, boxShadow: `0 0 40px 18px ${C.cian}88`}} />
        </>
      )}

      {/* ---------- TEXTO FIJO ---------- */}
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
        ¿Por qué <span style={{color: C.cian}}>cayó</span>
        <br />
        este jet en Florida?
      </div>
      <div
        style={{
          position: 'absolute',
          top: 170,
          left: 62,
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: 1.5,
          color: 'rgba(248,250,252,0.75)',
          textShadow: '0 2px 8px rgba(0,0,0,0.9)',
        }}
      >
        VIDEO · REDDIT
      </div>
    </AbsoluteFill>
  );
};
