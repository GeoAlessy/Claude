import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import {Gancho, Dash} from './Gancho';
import {Holograma} from './Holograma';
import {PALABRAS} from './subtitulos';
import {C, TITULAR} from '../estilo';
import {DASH_INI, DURACION_GANCHO, DURACION_P02 as DUR_TOTAL, FIN_CARD, FPS, H, FIN, HIELO_DICHO, INICIO, INI_HOLO, SEG, VOZ_ORDEN, marca} from './tiempos';

// La cita grande aparece en el centro: el subtítulo de abajo se apaga desde "Tenemos"
const TENEMOS = marca('03_radio', 'tenemos') - 6;

// =====================================================================
// Video 02 completo: gancho real → holograma 3D → vuelta al inicio (bucle)
// Bucle: "…Y muy pronto sabremos por qué" + "este jet cayó del cielo en Florida…"
// =====================================================================
export const DURACION_P02 = DUR_TOTAL;

// La frase 1 ya es el titular y la última va en la tarjeta final.
const SIN_SUBTITULO = new Set(['01_cayo', '12_pronto']);
const VOZ: [string, number, boolean][] = VOZ_ORDEN.map((id) => [id, INICIO[id], !SIN_SUBTITULO.has(id)]);

// Efectos: [archivo, fotograma, volumen]. Los "fiu" van muy bajos (regla del usuario).
const SFX: [string, number, number][] = [
  ['radio', SEG.RADIO.desde + 2, 0.35],
  ['radio', HIELO_DICHO - 6, 0.3],
  ['escaneo', INI_HOLO - 14, 0.14],
  ['transicion', INI_HOLO + H.HIELO, 0.05],
  ['transicion', INI_HOLO + H.COLA, 0.05],
  ['transicion', INI_HOLO + H.CAE, 0.05],
  ['radio', INI_HOLO + H.SOBRE - 6, 0.3],
  ['clacker', INI_HOLO + H.SOBRE - 4, 0.28],
  ['viento', INI_HOLO + H.CAIDA - 20, 0.35],
  ['transicion', INI_HOLO + H.CIERRE, 0.05],
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
    // En el tramo de radio, la cita "¡Tenemos HIELO!" ya está grande en pantalla
    if (nombre === '03_radio' && f >= TENEMOS) continue;
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

// ---------- Tarjeta final: los primeros cuadros reales en cámara lenta → empalma con el cuadro 0 ----------
const Cierre: React.FC = () => {
  const f = useCurrentFrame();
  const dur = DURACION_P02 - FIN_CARD;
  const op = interpolate(f, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
  const texto = interpolate(f, [4, 12, dur - 10, dur - 2], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: op}}>
      <Dash desdeCuadro={0} velocidad={DASH_INI / dur} />
      <AbsoluteFill style={{background: `rgba(0,0,0,${0.45 * texto})`}} />
      <div
        style={{
          position: 'absolute',
          top: 860,
          width: '100%',
          textAlign: 'center',
          fontFamily: TITULAR,
          fontWeight: 900,
          fontSize: 92,
          lineHeight: 1.05,
          color: C.blanco,
          opacity: texto,
          textShadow: `0 0 40px ${C.cian}66, 0 6px 0 rgba(0,0,0,0.7)`,
        }}
      >
        Y muy pronto
        <br />
        sabremos <span style={{color: C.cian}}>por qué…</span>
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
  // más baja en el momento de las víctimas
  const respeto = interpolate(f, [SEG.CRATER.desde - 6, SEG.CRATER.desde, SEG.RADIO.desde, SEG.RADIO.desde + 10], [1, 0.45, 0.45, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const extremos = interpolate(f, [0, 10, DURACION_P02 - 20, DURACION_P02], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return base * respeto * extremos;
}

const FirmaCanal: React.FC = () => {
  const f = useCurrentFrame();
  const op = interpolate(f, [INI_HOLO + 30, INI_HOLO + 40, FIN_CARD - 5, FIN_CARD + 5], [1, 0, 0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
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

export const Video02: React.FC = () => {
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
          <Audio src={staticFile(`porquepaso/p02/voz/${nombre}.mp3`)} volume={1} />
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
