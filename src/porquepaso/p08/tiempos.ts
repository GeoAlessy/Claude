import {PALABRAS} from './subtitulos';

// =====================================================================
// Video 08 · "¿Por qué flotó esta casa?" (río San Juan, Pagosa Springs, Colorado)
// Toda la línea de tiempo sale de la narración.
// =====================================================================
export const FPS = 30;

const ORDEN: [string, number][] = [
  ['01_casa', 3],
  ['02_mal', 4],
  ['03_fisica', 4],
  ['04_lluvia', 10],
  ['05_esponja', 6],
  ['06_crecio', 6],
  ['07_aire', 6],
  ['08_flota', 6],
  ['09_anclada', 8],
  ['10_puente', 8],
  ['11_consejo', 8],
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

// ---------- Gancho (video del testigo, vertical a pantalla completa) ----------
// A.mp4 = segundos 7.0–18.0 del original (la casa flota, choca con el puente y se deshace).
// El gancho empieza en su cuadro 60 (segundo 9.0): los cuadros 0–60 van en la tarjeta final (bucle).
export const A_INI = 60;
export const REPE_INI = 144; // segundo 11.8: justo antes del choque con el puente
export const SEG = {
  A: {desde: 0, dur: 0}, // la casa flota y choca
  B: {desde: 0, dur: 0}, // repetición del choque en cámara lenta + "¿MAL HECHA?"
};
SEG.B.desde = INICIO['02_mal'] - 2;
SEG.A.dur = SEG.B.desde;
export const MAL = marca('02_mal', 'mal');
export const INI_HOLO = marca('03_fisica', 'fisica') - 4;
SEG.B.dur = INI_HOLO - SEG.B.desde;
export const DURACION_GANCHO = INI_HOLO;

// ---------- Holograma (relativo a INI_HOLO) ----------
const rel = (f: number) => f - INI_HOLO;
export const H = {
  LLUVIA: rel(INICIO['04_lluvia']) - 6,
  TORMENTAS: rel(marca('04_lluvia', 'tormentas')),
  EMPAPADO: rel(marca('04_lluvia', 'empapado')),
  ESPONJA: rel(INICIO['05_esponja']) - 4,
  LLENA: rel(marca('05_esponja', 'llena')),
  CORRE: rel(marca('05_esponja', 'toda')),
  CRECIO: rel(INICIO['06_crecio']) - 4,
  ALTO: rel(marca('06_crecio', 'alto')),
  AIRE: rel(INICIO['07_aire']) - 4,
  RODEA: rel(marca('07_aire', 'rodea')),
  ARRIBA: rel(marca('07_aire', 'arriba')),
  FLOTA: rel(INICIO['08_flota']) - 4,
  PESA: rel(marca('08_flota', 'pesa')),
  FLOTO: rel(marca('08_flota', 'flota')),
  ANCLADA: rel(INICIO['09_anclada']) - 4,
  AMARRAN: rel(marca('09_anclada', 'amarran')),
  LLEVA: rel(marca('09_anclada', 'lleva')),
  PUENTE: rel(INICIO['10_puente']) - 4,
  CHOCAR: rel(marca('10_puente', 'chocar')),
  ACUMULA: rel(marca('10_puente', 'acumula')),
  APLASTA: rel(marca('10_puente', 'aplasta')),
  CONSEJO: rel(INICIO['11_consejo']) - 4,
  QUINCE: rel(marca('11_consejo', 'quince')),
  SESENTA: rel(marca('11_consejo', 'sesenta')),
  FIN: rel(INICIO['12_ya_sabes']) - 8,
  DUR: rel(FIN['12_ya_sabes']) + 2,
};

export const FIN_CARD = INI_HOLO + H.FIN + 2;
export const DURACION_P08 = FIN['12_ya_sabes'] + 2;
