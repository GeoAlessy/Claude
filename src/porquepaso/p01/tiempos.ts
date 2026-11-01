import {PALABRAS} from './subtitulos';

// =====================================================================
// Toda la línea de tiempo del piloto sale de la narración.
// Si se regenera la voz, los cortes, tomas y efectos se reacomodan solos.
// =====================================================================
export const FPS = 30;

// [archivo de voz, fotogramas de pausa antes de la frase]
const ORDEN: [string, number][] = [
  ['01_se_detuvo', 3],
  ['02_onu', 4],
  ['03_sabotaje', 4],
  ['04_pieza', 4],
  ['05_camarografo', 16], // incluye la transición de escaneo al holograma
  ['06_peine', 8],
  ['07_clic', 8],
  ['08_para_que', 8],
  ['09_onu_confirmo', 8],
  ['10_cierre', 8],
  ['11_ya_sabes', 8],
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
export const SEG = {
  A: {desde: 0, dur: 81}, // se acercan y se suben
  C: {desde: 81, dur: 42}, // plano desde arriba
  D: {desde: 123, dur: 66}, // Trump sube a pie
  E: {desde: 189, dur: 54}, // sigue subiendo (extensión)
  CONGELADO: {desde: 0, dur: 0},
};
// Se congela justo cuando se dice "sabotaje" (o al acabarse el clip)
SEG.CONGELADO.desde = Math.min(SEG.E.desde + SEG.E.dur, marca('03_sabotaje', 'sabotaje'));
// El holograma empieza a construirse en "Pero la verdadera razón…"
export const INI_HOLO = INICIO['04_pieza'] + 10;
SEG.CONGELADO.dur = INI_HOLO - SEG.CONGELADO.desde;
export const DURACION_GANCHO = INI_HOLO;

// ---------- Holograma (relativo a INI_HOLO) ----------
const rel = (f: number) => f - INI_HOLO;
export const H = {
  PREVIA: 0, // se construye la escalera; en "pieza" se ilumina el peine
  PIEZA: rel(marca('04_pieza', 'pieza')) - 4,
  CAMARA: rel(INICIO['05_camarografo']) - 12,
  PEINE: rel(INICIO['06_peine']) - 8,
  RAYOSX: rel(marca('06_peine', 'secreto')) - 12,
  CLIC: rel(INICIO['07_clic']) - 6,
  PARA_QUE: rel(INICIO['08_para_que']) - 6,
  ONU: rel(INICIO['09_onu_confirmo']) - 8,
  CIERRE: rel(INICIO['10_cierre']) - 8,
  FIN: rel(INICIO['11_ya_sabes']) - 8,
  DUR: rel(FIN['11_ya_sabes']) + 2,
};
export const EMPUJE = rel(marca('07_clic', 'empuja')) + 2; // el talón toca el peine
export const SENAL = EMPUJE + 10; // el sensor hace clic
export const LLEGA_MOTOR = Math.max(SENAL + 30, rel(marca('07_clic', 'motor')) - 2); // la señal llega al motor
export const ATASCO = rel(marca('08_para_que', 'atrapado')) - 4; // el zapato llega al peine

// ---------- Total ----------
export const FIN_CARD = INI_HOLO + H.FIN + 2; // vuelve al primer fotograma real
export const DURACION_P01 = FIN['11_ya_sabes'] + 2; // termina justo con "por qué" → bucle
