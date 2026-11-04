import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, MONO, SERIF, rango, suave} from '../estilo';
import {Escribe, Teclea} from './TextoAnimado';

// Rótulo de capítulo "de cine" (opción A):
//   1) mini tráiler: 3–4 destellos muy rápidos de planos del capítulo, con flash blanco en cada corte;
//   2) golpe: el número gigante cae desde el desenfoque y DENTRO de las cifras se ve un vídeo del tema;
//   3) "CHAPTER 01" se teclea arriba y el nombre se escribe sílaba a sílaba debajo.
// El vídeo exterior queda como un fantasma muy oscuro: nunca hay un fondo plano.
// `tono`: 'rapido' (ciencia, sorpresa) o 'lento' (capítulos inquietantes) cambia el ritmo de los destellos y del golpe.

export type Clip = {src: string; inicio?: number};
type Props = {numero: string; nombre: string; flashes: Clip[]; dentro: Clip; dur: number; tono?: 'rapido' | 'lento'};

const Video: React.FC<{c: Clip; estilo?: React.CSSProperties}> = ({c, estilo}) => (
  <OffthreadVideo
    src={staticFile(`mente/clips/${c.src}.mp4`)}
    startFrom={Math.round((c.inicio ?? 0) * 30)}
    muted
    style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...estilo}}
  />
);

/** Fotograma (relativo) del golpe del número: útil para sincronizar el efecto de sonido. */
export const golpeRotulo = (flashes: number, tono: 'rapido' | 'lento' = 'rapido') => flashes * (tono === 'lento' ? 8 : 5);

export const RotuloCapituloCine: React.FC<Props> = ({numero, nombre, flashes, dentro, dur, tono = 'rapido'}) => {
  const f = useCurrentFrame();
  const paso = tono === 'lento' ? 8 : 5;
  const golpe = golpeRotulo(flashes.length, tono);
  const caida = rango(f, golpe, golpe + (tono === 'lento' ? 16 : 10), 0, 1, suave);
  const salida = rango(f, dur - 12, dur);
  // brillo que barre las cifras una vez
  const barrido = rango(f, golpe + 8, golpe + 38);
  const flashCorte = (k: number) => Math.max(0, 1 - Math.abs(f - k * paso) / 2.2);
  const flashBlanco = Math.max(...flashes.map((_, k) => flashCorte(k)), Math.max(0, 1 - Math.abs(f - golpe) / 3));

  return (
    <AbsoluteFill style={{background: C.noche}}>
      {/* 1) mini tráiler */}
      {flashes.map((c, k) => (
        <Sequence key={k} from={k * paso} durationInFrames={paso} layout="none">
          <AbsoluteFill style={{transform: `scale(${1.1 - 0.02 * (f - k * paso)})`, filter: 'contrast(1.15) saturate(0.7)'}}>
            <Video c={c} />
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* 2) número gigante con vídeo dentro (fusión "multiply": blanco = se ve el vídeo) */}
      {f >= golpe && (
        <AbsoluteFill style={{isolation: 'isolate', opacity: 1 - salida}}>
          <AbsoluteFill style={{transform: `scale(${1.04 + 0.0009 * (f - golpe)})`}}>
            <Video c={dentro} estilo={{filter: 'contrast(1.1) saturate(0.85)'}} />
          </AbsoluteFill>
          <AbsoluteFill
            style={{
              background: 'rgb(24, 28, 52)',
              mixBlendMode: 'multiply',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: 860,
                fontFeatureSettings: '"lnum" 1',
                fontVariantNumeric: 'lining-nums',
                lineHeight: 1,
                letterSpacing: -20,
                color: '#fff',
                marginTop: -170,
                transform: `scale(${1.35 - 0.35 * caida + 0.05 * salida})`,
                filter: `blur(${(1 - caida) * 24 + salida * 10}px)`,
                opacity: caida,
              }}
            >
              {numero}
            </div>
          </AbsoluteFill>
          {/* contorno dorado fino + brillo que barre */}
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 700,
                fontSize: 860,
                fontFeatureSettings: '"lnum" 1',
                fontVariantNumeric: 'lining-nums',
                lineHeight: 1,
                letterSpacing: -20,
                marginTop: -170,
                color: 'transparent',
                WebkitTextStroke: `2px rgba(233, 194, 123, ${0.55 * caida})`,
                backgroundImage: `linear-gradient(105deg, transparent ${barrido * 140 - 30}%, rgba(255,240,210,0.55) ${barrido * 140 - 15}%, transparent ${barrido * 140}%)`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                transform: `scale(${1.35 - 0.35 * caida + 0.05 * salida})`,
                filter: `blur(${(1 - caida) * 24 + salida * 10}px)`,
              }}
            >
              {numero}
            </div>
          </AbsoluteFill>
          {/* viñeta */}
          <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 45%, rgba(5,7,15,0.85) 100%)'}} />
          {/* 3) textos */}
          <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 150}}>
            <div style={{fontFamily: MONO, fontSize: 26, letterSpacing: 12, color: C.oro, marginBottom: 22}}>
              <Teclea texto={`CHAPTER ${numero}`} desde={golpe + 8} />
            </div>
            <div style={{fontFamily: SERIF, fontSize: 92, color: C.luz, letterSpacing: 3}}>
              <Escribe texto={nombre} desde={golpe + 14} ritmo={6} salida={dur - 14} />
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      )}

      {/* flash blanco en cada corte y en el golpe */}
      <AbsoluteFill style={{background: '#fff', opacity: flashBlanco * 0.55, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
