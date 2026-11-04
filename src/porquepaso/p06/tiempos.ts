import {PALABRAS} from './subtitulos';

// =====================================================================
// Video 06 · "¿Por qué explotó este camión?" (nitrato de amonio, Mongolia Interior, China)
// Toda la línea de tiempo sale de la narración.
// =====================================================================
export const FPS = 30;

const ORDEN: [string, number][] = [
  ['01_exploto', 3], // la voz entra desde el inicio: así el bucle empalma con nuestra voz
  ['02_bomba', 4],
  ['03_fertilizante', 4],
  ['04_nitrato', 10],
  ['05_estable', 6],
  ['06_choque', 6],
  ['07_derrite', 6],
  ['08_gases', 6],
  ['09_golpe', 6],
  ['10_beirut', 8],
  ['11_victimas', 10],
  ['12_consejo', 10],
  ['13_ya_sabes', 8],
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

// ---------- Gancho (videos de testigos) ----------
// A.mp4 = segundos 0–4 del original (el camión arde; explota a los 3.3 s).
// B.mp4 = segundos 4.4–10 (la bola de fuego vista de lejos). C.mp4 = segundos 19.5–23 (el asfalto partido).
// El gancho empieza en el cuadro 30 de A: los cuadros 0–30 van en la tarjeta final (bucle).
export const A_INI = 30; // un segundo más del camión ardiendo antes de la explosión (pedido del usuario)
export const A_TOTAL = 120;
// Sonido real del clip: solo desde el estallido (antes se oye a una persona hablando, y se quita).
export const ESTALLIDO = 78; // cuadro del gancho (A_INI + 78 = segundo 3.6 del original)
export const SEG = {
  A: {desde: 0, dur: 0}, // el camión arde y explota
  C: {desde: 0, dur: 0}, // el asfalto partido
  B: {desde: 0, dur: 0}, // la bola de fuego de lejos, en cámara lenta + "¿UNA BOMBA?"
};
SEG.A.dur = A_TOTAL - A_INI;
SEG.C.desde = SEG.A.dur;
SEG.B.desde = INICIO['02_bomba'] - 2;
SEG.C.dur = SEG.B.desde - SEG.C.desde;
export const BOMBA = marca('02_bomba', 'bomba');
export const INI_HOLO = marca('03_fertilizante', 'fertilizante') - 4;
SEG.B.dur = INI_HOLO - SEG.B.desde;
export const DURACION_GANCHO = INI_HOLO;

// ---------- Holograma (relativo a INI_HOLO) ----------
const rel = (f: number) => f - INI_HOLO;
export const H = {
  NITRATO: rel(INICIO['04_nitrato']) - 6,
  CAMPO: rel(marca('04_nitrato', 'campo')),
  PLANTAS: rel(marca('04_nitrato', 'plantas')),
  ESTABLE: rel(INICIO['05_estable']) - 4,
  MANO: rel(marca('05_estable', 'mano')),
  CHOQUE: rel(INICIO['06_choque']) - 4,
  CHOCO: rel(marca('06_choque', 'choco')),
  MONGOLIA: rel(marca('06_choque', 'mongolia')),
  ARDER: rel(marca('06_choque', 'arder')),
  DERRITE: rel(INICIO['07_derrite']) - 4,
  GRADOS: rel(marca('07_derrite', 'ciento')),
  SE_DERRITE: rel(marca('07_derrite', 'derrite')),
  GASES: rel(INICIO['08_gases']) - 4,
  DESCOMPONE: rel(marca('08_gases', 'descompone')),
  OXIGENO: rel(marca('08_gases', 'oxigeno')),
  GOLPE: rel(INICIO['09_golpe']) - 4,
  REACCIONA: rel(marca('09_golpe', 'golpe')),
  BEIRUT: rel(INICIO['10_beirut']) - 4,
  VICTIMAS: rel(INICIO['11_victimas']) - 6,
  CONSEJO: rel(INICIO['12_consejo']) - 4,
  ROMBO: rel(marca('12_consejo', 'rombo')),
  ALEJATE: rel(marca('12_consejo', 'alejate')),
  KM: rel(marca('12_consejo', 'kilometro')),
  FIN: rel(INICIO['13_ya_sabes']) - 8,
  DUR: rel(FIN['13_ya_sabes']) + 2,
};

export const FIN_CARD = INI_HOLO + H.FIN + 2;
export const DURACION_P06 = FIN['13_ya_sabes'] + 2;
