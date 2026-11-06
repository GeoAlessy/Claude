import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {Gancho, Monitor} from './Gancho';
import {Holograma} from './Holograma';
import {PALABRAS} from './subtitulos';
import {C, TITULAR} from '../estilo';
import {A_INI, FRENO, DURACION_GANCHO, DURACION_P09 as DUR_TOTAL, FIN_CARD, FPS, H, FIN, INICIO, INI_HOLO, VOZ_ORDEN} from './tiempos';


// =====================================================================
// Video 09 completo: gancho real → holograma 3D → vuelta al inicio (bucle)
// Bucle: "…Y ahora ya sabes por qué" + "este señor subía su tractor…"
// =====================================================================
export const DURACION_P09 = DUR_TOTAL;

// La frase 1 ya es el titular y la última va en la tarjeta final.
const SIN_SUBTITULO = new Set(['01_sola', '11_ya_sabes']);
const VOZ: [string, number, boolean][] = VOZ_ORDEN.map((id) => [id, INICIO[id], !SIN_SUBTITULO.has(id)]);

// Efectos: [archivo, fotograma, volumen]. Los "fiu" van muy bajos (regla del usuario); sin estática de radio.
// Sin heridos: la música no baja.
const SFX: [string, number, number][] = [
  ['impacto', FRENO - 2, 0.16],
  ['escaneo', INI_HOLO - 14, 0.042],
  ['clic', INI_HOLO + H.PERNO_W + 4, 0.8], // el perno cae en la rueda dentada
  ['clic', INI_HOLO + H.TRABA, 0.5],
  ['transicion', INI_HOLO + H.LIBRES, 0.05],
  ['transicion', INI_HOLO + H.BAJADA, 0.05],
  ['motor_apagado', INI_HOLO + H.SUBIR - 10, 0.25],
  ['riser', INI_HOLO + H.GOLPE - 30, 0.08],
  ['senal', INI_HOLO + H.PATINAN, 0.3],
  ['transicion', INI_HOLO + H.CONSEJO, 0.05],
  ['confirmacion', INI_HOLO + H.PLANO, 0.3],
  ['confirmacion', INI_HOLO + H.FRENO, 0.3],
  ['confirmacion', INI_HOLO + H.CALZAS, 0.35],
  ['escaneo', FIN_CARD - 20, 0.1],
];

// ---------- Subtítulos palabra por palabra ----------
type Palabra = [string, number, number];
function bloques(palabras: Palabra[]): Palabra[][] {
  const out: Palabra[][] = [];
  let actual: Palabra[] = [];
  for (const p of palabras) {
    actual.push(p);
    if (actual.length >= 3 || /[.,:;?!…"”]$/.test(p[0])) {
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
    // "¿SIN FRENO?" ya está grande: el subtítulo de abajo se apaga
    if (nombre === '02_freno' && f >= FRENO - 22) continue;
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
      <div style={{position: 'absolute', top: 1540, width: '100%', display: 'flex', justifyContent: 'center'}}>
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

// ---------- Tarjeta final: los segundos reales justo antes del gancho → empalma con el cuadro 0 ----------
const Cierre: React.FC = () => {
  const f = useCurrentFrame();
  const dur = DURACION_P09 - FIN_CARD;
  const op = interpolate(f, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
  const texto = interpolate(f, [4, 12, dur - 10, dur - 2], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: op}}>
      <Monitor desde={0} velocidad={A_INI / dur} />
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

// ---------- Música con ducking ----------
function volumenMusica(f: number) {
  let distancia = Infinity;
  for (const id of VOZ_ORDEN) {
    const ini = INICIO[id] - 3;
    const fin = FIN[id] + 3;
    distancia = Math.min(distancia, f < ini ? ini - f : f > fin ? f - fin : 0);
  }
  const base = 0.09 + 0.07 * Math.min(1, distancia / 8);
  const extremos = interpolate(f, [0, 10, DURACION_P09 - 20, DURACION_P09], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const respeto = 1; // sin víctimas: la música no baja
  return base * extremos * respeto;
}

const FirmaCanal: React.FC = () => {
  const f = useCurrentFrame();
  const op = 1;
  return (
  <div
    style={{
      opacity: op,
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
};

export const Video09: React.FC = () => {
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
      <Audio src={staticFile('porquepaso/sfx/fondo_curiosidad.wav')} volume={volumenMusica} />

      {VOZ.map(([nombre, desde]) => (
        <Sequence key={nombre} from={desde}>
          <Audio src={staticFile(`porquepaso/p09/voz/${nombre}.mp3`)} volume={1} />
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
