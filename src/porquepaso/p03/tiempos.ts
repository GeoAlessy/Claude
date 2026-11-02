import {PALABRAS} from './subtitulos';

// =====================================================================
// Video 03 · "¿Por qué vuela sobre el agua?" (pump foil)
// Toda la línea de tiempo sale de la narración.
// =====================================================================
export const FPS = 30;

const ORDEN: [string, number][] = [
  ['01_vuela', 3],
  ['02_truco', 4],
  ['03_secreto', 6],
  ['04_ala', 8],
  ['05_avion', 6],
  ['06_densidad', 6],
  ['07_fuera', 6],
  ['08_motor', 6],
  ['09_bombeo', 6],
  ['10_delfin', 6],
  ['11_cierre', 6],
  ['12_ya_sabes', 8],
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

export function marca(id: string, palabra: string): number {
  const w = PALABRAS[id].find((p) => norm(p[0]).startsWith(norm(palabra)));
  if (!w) throw new Error(`No encuentro "${palabra}" en ${id}`);
  return INICIO[id] + fps(w[1]);
}

// ---------- Gancho (video real) ----------
// A.mp4 = segundos 16–25 del original (los 2 primeros, en el muelle, se usan al final para el bucle)
// B.mp4 = segundos 50–57 (primer plano con el mástil)
export const A_INI = 60;
export const SEG = {
  A: {desde: 0, dur: 0},
  B: {desde: 0, dur: 0},
  CONGELADO: {desde: 0, dur: 0},
};
SEG.B.desde = INICIO['02_truco'] - 4;
SEG.A.dur = SEG.B.desde;
SEG.CONGELADO.desde = marca('02_truco', 'truco');
SEG.B.dur = SEG.CONGELADO.desde - SEG.B.desde;
export const INI_HOLO = marca('03_secreto', 'bajo') - 4;
SEG.CONGELADO.dur = INI_HOLO - SEG.CONGELADO.desde;
export const DURACION_GANCHO = INI_HOLO;

// ---------- Holograma (relativo a INI_HOLO) ----------
const rel = (f: number) => f - INI_HOLO;
export const H = {
  MASTIL: rel(marca('04_ala', 'mastil')),
  ALA: rel(marca('04_ala', 'ala')),
  AVION: rel(INICIO['05_avion']) - 4,
  AGUA: rel(marca('05_avion', 'agua')),
  DENSA: rel(INICIO['06_densidad']) - 4,
  OCHOCIENTAS: rel(marca('06_densidad', 'ochocientas')),
  LEVANTA: rel(marca('06_densidad', 'levanta')),
  FUERA: rel(INICIO['07_fuera']) - 4,
  MOTOR: rel(INICIO['08_motor']) - 4,
  ELLA: rel(marca('08_motor', 'ella')),
  BOMBEO: rel(INICIO['09_bombeo']) - 4,
  INCLINA: rel(marca('09_bombeo', 'inclina')),
  ARRIBA: rel(marca('09_bombeo', 'arriba')),
  DELFIN: rel(INICIO['10_delfin']) - 4,
  CIERRE: rel(INICIO['11_cierre']) - 4,
  FIN: rel(INICIO['12_ya_sabes']) - 8,
  DUR: rel(FIN['12_ya_sabes']) + 2,
};

export const FIN_CARD = INI_HOLO + H.FIN + 2;
export const DURACION_P03 = FIN['12_ya_sabes'] + 2;
