import {PALABRAS} from './subtitulos';

// =====================================================================
// Video 15 · "¿Por qué se fue hacia atrás la escalera?" (escalera casi vertical apoyada en un bote · equilibrio)
// Toda la línea de tiempo sale de la narración.
// =====================================================================
export const FPS = 30;

const ORDEN: [string, number][] = [
  ['01_escalera', 3],
  ['02_resbalo', 4],
  ['03_vertical', 4],
  ['04_muelle', 8],
  ['05_linea', 5],
  ['06_afuera', 5],
  ['07_bote', 5],
  ['08_arbol', 5],
  ['09_regla', 5],
  ['10_amarra', 5],
  ['11_suerte', 6],
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

// ---------- Gancho (video vertical a pantalla completa) ----------
// A.mp4 = segundos 29.6–36.0 del original (cuadro i del mp4 = segundo 29.6 + i/30).
//   El trabajador baja del muelle a la escalera (30–120); la escalera se va hacia atrás (120–165).
//   La caída NO se muestra: desde el cuadro 161 la imagen se difumina (regla del usuario).
// El gancho empieza en el cuadro 30 de A: los cuadros 0–30 van en la tarjeta final (bucle).
export const A_INI = 30;
export const B_INI = 120; // cámara lenta: la escalera empieza a irse hacia atrás
export const C_INI = 165;
export const B_VEL = 0.5;
export const C_VEL = 0.15;
export const SEG = {
  A: {desde: 0, dur: B_INI - A_INI},
  B: {desde: B_INI - A_INI, dur: Math.round((C_INI - B_INI) / B_VEL)},
  C: {desde: 0, dur: 0},
};
SEG.C.desde = SEG.B.desde + SEG.B.dur;
// cuadro del gancho en que empieza a taparse la imagen (cuadro 161 de A)
export const CENSURA = SEG.B.desde + Math.round((161 - B_INI) / B_VEL);
export const RESBALO = marca('02_resbalo', 'resbalo');
export const INI_HOLO = INICIO['03_vertical'] - 2;
SEG.C.dur = INI_HOLO - SEG.C.desde;
export const DURACION_GANCHO = INI_HOLO;

// ---------- Holograma (relativo a INI_HOLO) ----------
const rel = (f: number) => f - INI_HOLO;
export const H = {
  VERTICAL: rel(marca('03_vertical', 'vertical')),
  BOTE1: rel(marca('03_vertical', 'bote')),
  MUELLE: rel(INICIO['04_muelle']) - 6,
  BASE: rel(marca('04_muelle', 'base')),
  PUNTA: rel(marca('04_muelle', 'punta')),
  AMARRAR: rel(marca('04_muelle', 'amarrar')),
  LINEA: rel(INICIO['05_linea']) - 4,
  PESO: rel(marca('05_linea', 'peso')),
  ENTRE: rel(marca('05_linea', 'entre')),
  AFUERA: rel(INICIO['06_afuera']) - 4,
  FUERA: rel(marca('06_afuera', 'fuera')),
  INCLINARSE: rel(marca('06_afuera', 'inclinarse')),
  BOTE2: rel(INICIO['07_bote']) - 4,
  PASO: rel(marca('07_bote', 'paso')),
  MUEVE: rel(marca('07_bote', 'mueve')),
  INCLINA: rel(marca('07_bote', 'inclina')),
  ARBOL: rel(INICIO['08_arbol']) - 4,
  PASA: rel(marca('08_arbol', 'pasa')),
  GIRA: rel(marca('08_arbol', 'gira')),
  FRENAR: rel(marca('08_arbol', 'frenar')),
  REGLA: rel(INICIO['09_regla']) - 4,
  CUATRO: rel(marca('09_regla', 'cuatro')),
  METRO: rel(marca('09_regla', 'metro')),
  AMARRA: rel(INICIO['10_amarra']) - 4,
  AMARRA_W: rel(marca('10_amarra', 'amarra')),
  FIRME: rel(marca('10_amarra', 'firme')),
  FLOTA: rel(marca('10_amarra', 'flota')),
  SUERTE: rel(INICIO['11_suerte']) - 4,
  AGUA: rel(marca('11_suerte', 'agua')),
  SUBIERON: rel(marca('11_suerte', 'subieron')),
  FIN: rel(INICIO['12_ya_sabes']) - 8,
  DUR: rel(FIN['12_ya_sabes']) + 2,
};

export const FIN_CARD = INI_HOLO + H.FIN + 2;
export const DURACION_P15 = FIN['12_ya_sabes'] + 2;
