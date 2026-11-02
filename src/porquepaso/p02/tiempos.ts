import {PALABRAS} from './subtitulos';

// =====================================================================
// Video 02 · "¿Por qué cayó este jet en Florida?"
// Toda la línea de tiempo sale de la narración.
// =====================================================================
export const FPS = 30;

// [archivo de voz, fotogramas de pausa antes de la frase]
const ORDEN: [string, number][] = [
  ['01_cayo', 3],
  ['02_nueve', 6],
  ['03_radio', 6],
  ['04_expertos', 4],
  ['05_altura', 10],
  ['06_hielo', 6],
  ['07_cola', 6],
  ['08_nariz', 6],
  ['09_velocidad', 6],
  ['10_caida', 6],
  ['11_cierre', 8],
  ['12_pronto', 6],
];

const fps = (s: number) => Math.round(s * FPS);
const durVoz = (id: string) => {
  const p = PALABRAS[id];
  return Math.ceil(p[p.length - 1][2] * FPS);
};

export const INICIO: Record<string, number> = {};
export const FIN: Record<string, number> = {};
{
  let t = 0;
  for (const [id, pausa] of ORDEN) {
    INICIO[id] = t + pausa;
    FIN[id] = INICIO[id] + durVoz(id);
    t = FIN[id];
  }
}
export const VOZ_ORDEN = ORDEN.map(([id]) => id);

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');

/** Fotograma absoluto en que se empieza a decir una palabra de una frase. */
export function marca(id: string, palabra: string): number {
  const w = PALABRAS[id].find((p) => norm(p[0]).startsWith(norm(palabra)));
  if (!w) throw new Error(`No encuentro "${palabra}" en ${id}`);
  return INICIO[id] + fps(w[1]);
}

// ---------- Gancho (video real) ----------
// La cámara del auto empieza en su fotograma 18: los 18 primeros se usan al final (bucle).
export const DASH_INI = 18;
export const SEG = {
  DASH: {desde: 0, dur: 0}, // cámara del auto: la bola de fuego
  CRATER: {desde: 0, dur: 0}, // video vertical del cráter
  RADIO: {desde: 0, dur: 0}, // congelado + "¡Tenemos HIELO!"
};
SEG.CRATER.desde = INICIO['02_nueve'] - 2;
SEG.DASH.dur = SEG.CRATER.desde;
SEG.RADIO.desde = INICIO['03_radio'] - 2;
SEG.CRATER.dur = SEG.RADIO.desde - SEG.CRATER.desde;
export const HIELO_DICHO = marca('03_radio', 'hielo'); // el piloto dice "HIELO"
// El holograma se construye durante "ahí empezó todo"
export const INI_HOLO = marca('04_expertos', 'ahi') - 2;
SEG.RADIO.dur = INI_HOLO - SEG.RADIO.desde;
export const DURACION_GANCHO = INI_HOLO;

// ---------- Holograma (relativo a INI_HOLO) ----------
const rel = (f: number) => f - INI_HOLO;
export const H = {
  ALTURA: rel(INICIO['05_altura']) - 4,
  TORMENTA: rel(marca('05_altura', 'tormenta')),
  FRIO: rel(marca('05_altura', 'afuera')),
  HIELO: rel(INICIO['06_hielo']) - 4,
  PEGA: rel(marca('06_hielo', 'hielo')),
  COLA: rel(INICIO['07_cola']) - 4,
  NARIZ: rel(INICIO['08_nariz']) - 4,
  PIERDE: rel(marca('08_nariz', 'pierde')),
  CAE: rel(marca('08_nariz', 'caer')) - 4,
  VEL: rel(INICIO['09_velocidad']) - 2,
  LIMITE: rel(marca('09_velocidad', 'limite')),
  SOBRE: rel(marca('09_velocidad', 'sobrevelocidad')),
  CAIDA: rel(INICIO['10_caida']) - 2,
  CIERRE: rel(INICIO['11_cierre']) - 6,
  FIN: rel(INICIO['12_pronto']) - 8,
  DUR: rel(FIN['12_pronto']) + 2,
};

// ---------- Total ----------
export const FIN_CARD = INI_HOLO + H.FIN + 2;
export const DURACION_P02 = FIN['12_pronto'] + 2;
