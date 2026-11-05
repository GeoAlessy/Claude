import {PALABRAS} from './subtitulos';

// =====================================================================
// Video 07 · "¿Funciona echarle refresco a un transformador?" (Valle de la Pascua, Venezuela)
// Toda la línea de tiempo sale de la narración.
// =====================================================================
export const FPS = 30;

const ORDEN: [string, number][] = [
  ['01_refresco', 3],
  ['02_funciona', 4],
  ['03_dentro', 4],
  ['04_aceite', 10],
  ['05_arde', 6],
  ['06_agua', 6],
  ['07_vapor', 6],
  ['08_bola', 6],
  ['09_gas', 8],
  ['10_corriente', 8],
  ['11_expertos', 8],
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
// A.mp4 = segundos 6.0–11.5 del original (sostiene la botella, la lanza: bola de fuego).
// B.mp4 = segundos 46.3–52.5 (el chorro de fuego llega hasta la canasta).
// El gancho empieza en el cuadro 45 de A: los cuadros 0–45 van en la tarjeta final (bucle).
export const A_INI = 45;
export const A_TOTAL = 165;
export const SEG = {
  A: {desde: 0, dur: 0}, // lanza la botella → bola de fuego
  B: {desde: 0, dur: 0}, // la llamarada hacia la canasta, en cámara lenta + "¿FUNCIONA?"
};
SEG.A.dur = A_TOTAL - A_INI;
SEG.B.desde = SEG.A.dur;
export const FUNCIONA = marca('02_funciona', 'funciona');
export const INI_HOLO = marca('03_dentro', 'dentro') - 4;
SEG.B.dur = INI_HOLO - SEG.B.desde;
export const DURACION_GANCHO = INI_HOLO;

// ---------- Holograma (relativo a INI_HOLO) ----------
const rel = (f: number) => f - INI_HOLO;
export const H = {
  ACEITE: rel(INICIO['04_aceite']) - 6,
  LLENO: rel(marca('04_aceite', 'aceite')),
  BOBINAS: rel(marca('04_aceite', 'bobinas')),
  AISLA: rel(marca('04_aceite', 'aisla')),
  ARDE: rel(INICIO['05_arde']) - 4,
  CALIENTA: rel(marca('05_arde', 'calienta')),
  LLAMAS: rel(marca('05_arde', 'arde')),
  AGUA: rel(INICIO['06_agua']) - 4,
  TOCAR: rel(marca('06_agua', 'tocar')),
  VAPOR: rel(marca('06_agua', 'vapor')),
  ESPACIO: rel(INICIO['07_vapor']) - 4,
  MIL: rel(marca('07_vapor', 'mil')),
  LANZA: rel(marca('07_vapor', 'lanza')),
  BOLA: rel(INICIO['08_bola']) - 4,
  SARTEN: rel(marca('08_bola', 'sarten')),
  GAS: rel(INICIO['09_gas']) - 4,
  GRAMOS: rel(marca('09_gas', 'quince')),
  KILOS: rel(marca('09_gas', 'dos')),
  CORRIENTE: rel(INICIO['10_corriente']) - 4,
  CONDUCE: rel(marca('10_corriente', 'conduce')),
  DESCARGA: rel(marca('10_corriente', 'descarga')),
  EXPERTOS: rel(INICIO['11_expertos']) - 4,
  CORTA: rel(marca('11_expertos', 'corta')),
  EXTINTOR: rel(marca('11_expertos', 'extintor')),
  FIN: rel(INICIO['12_ya_sabes']) - 8,
  DUR: rel(FIN['12_ya_sabes']) + 2,
};

export const FIN_CARD = INI_HOLO + H.FIN + 2;
export const DURACION_P07 = FIN['12_ya_sabes'] + 2;
