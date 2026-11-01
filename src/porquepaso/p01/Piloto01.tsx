import React from 'react';
import {AbsoluteFill, Audio, Freeze, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {Gancho, DURACION_GANCHO, SEG} from './Gancho';
import {Holograma, H, SENAL, LLEGA_MOTOR, ATASCO} from './Holograma';
import {PALABRAS} from './subtitulos';
import {C, TITULAR} from '../estilo';

// =====================================================================
// Piloto 01 completo: gancho real → holograma 3D → vuelta al inicio (bucle)
// =====================================================================
const FPS = 30;
const INI_HOLO = DURACION_GANCHO; // 289
const FIN_CARD = INI_HOLO + H.FIN + 26; // aparece el primer fotograma real
export const DURACION_P01 = INI_HOLO + H.DUR + 16;

// Narración: [archivo, fotograma de inicio, ¿subtítulos?]
const VOZ: [string, number, boolean][] = [
  ['01_pregunta', 8, false],
  ['02_sabotaje', SEG.CONGELADO.desde + 4, false],
  ['03_camarografo', INI_HOLO + H.CAMARA + 12, true],
  ['04_peine', INI_HOLO + H.PEINE + 8, true],
  ['05_clic', INI_HOLO + H.CLIC + 5, true],
  ['06_para_que', INI_HOLO + H.PARA_QUE + 5, true],
  ['07_onu', INI_HOLO + H.ONU + 8, true],
  ['08_cierre', INI_HOLO + H.CIERRE + 8, true],
  ['09_ya_sabes', INI_HOLO + H.FIN + 8, false],
];

// Efectos: [archivo, fotograma, volumen]
const SFX: [string, number, number][] = [
  ['impacto', SEG.CONGELADO.desde, 0.9],
  ['escaneo', INI_HOLO - 14, 0.6],
  ['whoosh', INI_HOLO + H.PEINE, 0.5],
  ['whoosh', INI_HOLO + H.CLIC, 0.5],
  ['clic', INI_HOLO + SENAL, 1],
  ['senal', INI_HOLO + SENAL + 2, 0.45],
  ['motor_apagado', INI_HOLO + LLEGA_MOTOR - 4, 0.7],
  ['freno', INI_HOLO + LLEGA_MOTOR + 2, 0.8],
  ['whoosh', INI_HOLO + H.PARA_QUE, 0.5],
  ['clic', INI_HOLO + ATASCO + 4, 0.8],
  ['confirmacion', INI_HOLO + ATASCO + 8, 0.6],
  ['whoosh', INI_HOLO + H.ONU, 0.5],
  ['whoosh', INI_HOLO + H.CIERRE, 0.5],
  ['confirmacion', INI_HOLO + H.CIERRE + 45, 0.5],
  ['escaneo', FIN_CARD - 20, 0.5],
];

// ---------- Subtítulos palabra por palabra ----------
type Palabra = [string, number, number];
function bloques(palabras: Palabra[]): Palabra[][] {
  const out: Palabra[][] = [];
  let actual: Palabra[] = [];
  for (const p of palabras) {
    actual.push(p);
    if (actual.length >= 3 || /[.,:;?!…]$/.test(p[0])) {
      out.push(actual);
      actual = [];
    }
  }
  if (actual.length) out.push(actual);
  return out;
}

const Subtitulos: React.FC = () => {
  const f = useCurrentFrame();
  for (const [nombre, desde, mostrar] of VOZ) {
    if (!mostrar) continue;
    const t = (f - desde) / FPS;
    const pals = PALABRAS[nombre];
    if (!pals || t < 0 || t > pals[pals.length - 1][2] + 0.25) continue;
    const bs = bloques(pals);
    const b = bs.find((bl, i) => t < (bs[i + 1]?.[0][1] ?? Infinity) && t >= bl[0][1] - 0.05) ?? bs[bs.length - 1];
    let activa = 0;
    b.forEach(([, a], i) => {
      if (t >= a - 0.02) activa = i;
    });
    const entrada = interpolate((t - b[0][1]) * FPS, [0, 4], [0.85, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2))});
    return (
      <div style={{position: 'absolute', top: 1440, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            transform: `scale(${entrada})`,
            fontFamily: TITULAR,
            fontWeight: 900,
            fontSize: 74,
            textAlign: 'center',
            padding: '0 60px',
            lineHeight: 1.1,
            textShadow: '0 4px 0 rgba(0,0,0,0.85), 0 0 30px rgba(0,0,0,0.7)',
            WebkitTextStroke: '2px rgba(0,0,0,0.55)',
          }}
        >
          {b.map(([w, a], i) => (
            <span key={i} style={{color: i === activa ? C.cian : t >= a - 0.02 ? C.blanco : 'rgba(248,250,252,0.55)'}}>
              {w.toUpperCase()}{' '}
            </span>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// ---------- Tarjeta final: vuelve al primer fotograma real (bucle sin corte) ----------
const Cierre: React.FC = () => {
  const f = useCurrentFrame();
  const dur = DURACION_P01 - FIN_CARD;
  const op = interpolate(f, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
  const texto = interpolate(f, [4, 12, dur - 10, dur - 2], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: op}}>
      <Freeze frame={0}>
        <OffthreadVideo src={staticFile('porquepaso/p01/A.mp4')} muted style={{width: 1080, height: 1920}} />
      </Freeze>
      <AbsoluteFill style={{background: `rgba(0,0,0,${0.45 * texto})`}} />
      <div
        style={{
          position: 'absolute',
          top: 860,
          width: '100%',
          textAlign: 'center',
          fontFamily: TITULAR,
          fontWeight: 900,
          fontSize: 96,
          lineHeight: 1.05,
          color: C.blanco,
          opacity: texto,
          textShadow: `0 0 40px ${C.cian}66, 0 6px 0 rgba(0,0,0,0.7)`,
        }}
      >
        Ahora ya sabes
        <br />
        <span style={{color: C.cian}}>por qué.</span>
      </div>
    </AbsoluteFill>
  );
};

export const Piloto01: React.FC = () => {
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <Sequence durationInFrames={DURACION_GANCHO}>
        <Gancho />
      </Sequence>
      <Sequence from={INI_HOLO} durationInFrames={H.DUR}>
        <Holograma />
      </Sequence>
      <Sequence from={FIN_CARD}>
        <Cierre />
      </Sequence>
      <Subtitulos />

      {/* Audio */}
      <Audio src={staticFile('porquepaso/sfx/fondo_investigacion.wav')} volume={(f) => interpolate(f, [0, 10, DURACION_P01 - 20, DURACION_P01], [0, 0.16, 0.16, 0], {extrapolateRight: 'clamp'})} />
      {VOZ.map(([nombre, desde]) => (
        <Sequence key={nombre} from={desde}>
          <Audio src={staticFile(`porquepaso/p01/voz/${nombre}.mp3`)} volume={1} />
        </Sequence>
      ))}
      {SFX.map(([nombre, desde, vol], i) => (
        <Sequence key={i} from={desde}>
          <Audio src={staticFile(`porquepaso/sfx/${nombre}.wav`)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
