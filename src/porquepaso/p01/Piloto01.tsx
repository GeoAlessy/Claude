import React from 'react';
import {AbsoluteFill, Audio, Freeze, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {Gancho} from './Gancho';
import {Holograma} from './Holograma';
import {PALABRAS} from './subtitulos';
import {C, TITULAR} from '../estilo';
import {
  ATASCO,
  DURACION_GANCHO,
  DURACION_P01 as DUR_TOTAL,
  FIN_CARD,
  FPS,
  H,
  FIN,
  INICIO,
  INI_HOLO,
  LLEGA_MOTOR,
  SEG,
  SENAL,
  VOZ_ORDEN,
} from './tiempos';

// =====================================================================
// Piloto 01 completo: gancho real → holograma 3D → vuelta al inicio (bucle)
// Bucle: "…Y ahora ya sabes por qué" + "se detuvo la escalera de Trump…"
// =====================================================================
export const DURACION_P01 = DUR_TOTAL;

// Frases sin subtítulo: la 1 ya está en pantalla como titular, la 3 como "¿SABOTAJE?",
// y la última aparece en la tarjeta final.
const SIN_SUBTITULO = new Set(['01_se_detuvo', '03_sabotaje', '11_ya_sabes']);
const VOZ: [string, number, boolean][] = VOZ_ORDEN.map((id) => [id, INICIO[id], !SIN_SUBTITULO.has(id)]);

// Efectos: [archivo, fotograma, volumen]
const SFX: [string, number, number][] = [
  ['riser', SEG.CONGELADO.desde - 33, 0.35],
  ['impacto', SEG.CONGELADO.desde, 0.9],
  ['escaneo', INI_HOLO - 14, 0.6],
  ['transicion', INI_HOLO + H.PEINE, 0.22],
  ['transicion', INI_HOLO + H.CLIC, 0.22],
  ['riser', INI_HOLO + SENAL - 33, 0.3],
  ['clic', INI_HOLO + SENAL, 1],
  ['senal', INI_HOLO + SENAL + 2, 0.45],
  ['motor_apagado', INI_HOLO + LLEGA_MOTOR - 4, 0.7],
  ['freno', INI_HOLO + LLEGA_MOTOR + 2, 0.8],
  ['transicion', INI_HOLO + H.PARA_QUE, 0.22],
  ['clic', INI_HOLO + ATASCO + 4, 0.8],
  ['confirmacion', INI_HOLO + ATASCO + 8, 0.6],
  ['transicion', INI_HOLO + H.ONU, 0.22],
  ['transicion', INI_HOLO + H.CIERRE, 0.22],
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
      {/* Los 2 s reales que van justo antes del gancho: termina en el mismo cuadro con el que empieza el video */}
      <OffthreadVideo src={staticFile('porquepaso/p01/Z.mp4')} muted trimBefore={Math.max(0, 60 - dur)} style={{width: 1080, height: 1920}} />
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
        Y ahora ya sabes
        <br />
        <span style={{color: C.cian}}>por qué…</span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Música que se hace a un lado cuando habla la voz (ducking) ----------
function volumenMusica(f: number) {
  let distancia = Infinity;
  for (const id of VOZ_ORDEN) {
    const ini = INICIO[id] - 3;
    const fin = FIN[id] + 3;
    distancia = Math.min(distancia, f < ini ? ini - f : f > fin ? f - fin : 0);
  }
  const base = 0.07 + 0.11 * Math.min(1, distancia / 8); // 0.07 con voz, 0.18 en pausas
  const extremos = interpolate(f, [0, 10, DURACION_P01 - 20, DURACION_P01], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return base * extremos;
}

// ---------- Firma fija del canal (reconocimiento en el feed) ----------
const FirmaCanal: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      top: 164,
      right: 62,
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 700,
      fontSize: 26,
      letterSpacing: 2,
      color: C.cian,
      padding: '6px 14px',
      border: `2px solid ${C.cian}`,
      borderRadius: 10,
      background: 'rgba(4,10,18,0.55)',
      boxShadow: `0 0 18px ${C.cian}55`,
    }}
  >
    ¿POR QUÉ PASÓ?
  </div>
);

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
      <FirmaCanal />

      {/* Audio */}
      <Audio src={staticFile('porquepaso/sfx/fondo_investigacion.wav')} volume={volumenMusica} />
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
