import {PALABRAS} from './subtitulos';

// =====================================================================
// Video 05 · "¿Por qué chocaron dos helicópteros en el Everest?" (Pheriche, Nepal)
// Toda la línea de tiempo sale de la narración.
// =====================================================================
export const FPS = 30;

const ORDEN: [string, number][] = [
  ['01_chocaron', 3],
  ['02_suerte', 4],
  ['03_pista', 4],
  ['04_pheriche', 10],
  ['05_nieve', 6],
  ['06_torre', 6],
  ['07_dos', 6],
  ['08_mismo', 6],
  ['09_aspas', 6],
  ['10_aire', 8],
  ['11_victima', 10],
  ['12_cierre', 10],
  ['13_pronto', 8],
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

// ---------- Gancho (webcam del clima, Webcam Nepal) ----------
// cam_hd.mp4 = segundos 0–11 del original (recorte 960×720, escalado a 1080×810).
// El gancho empieza en su cuadro 60: los dos helicópteros ya se acercan. Los cuadros 0–60 van en la tarjeta final (bucle).
export const CAM_INI = 60;
export const CAM_TOTAL = 330;
export const REPE_INI = 72; // repetición en cámara lenta desde justo antes del roce de las aspas
export const SEG = {
  CAM: {desde: 0, dur: 0},
  REPE: {desde: 0, dur: 0},
};
SEG.REPE.desde = INICIO['02_suerte'] - 2;
SEG.CAM.dur = SEG.REPE.desde;
export const SUERTE = marca('02_suerte', 'mala');
export const INI_HOLO = marca('03_pista', 'pista') - 4;
SEG.REPE.dur = INI_HOLO - SEG.REPE.desde;
export const DURACION_GANCHO = INI_HOLO;

// ---------- Holograma (relativo a INI_HOLO) ----------
const rel = (f: number) => f - INI_HOLO;
export const H = {
  PHERICHE: rel(INICIO['04_pheriche']) - 6,
  ALTURA: rel(marca('04_pheriche', 'cuatro')),
  NIEVE: rel(INICIO['05_nieve']) - 4,
  GENTE: rel(marca('05_nieve', 'excursionistas')),
  IBAN: rel(marca('05_nieve', 'iban')),
  TORRE: rel(INICIO['06_torre']) - 4,
  TORRE_NO: rel(marca('06_torre', 'torre')),
  RADIO: rel(marca('06_torre', 'radio')),
  DOS: rel(INICIO['07_dos']) - 4,
  LUKLA: rel(marca('07_dos', 'lukla')),
  BASE: rel(marca('07_dos', 'campamento')),
  MISMO: rel(INICIO['08_mismo']) - 4,
  TIEMPO: rel(marca('08_mismo', 'tiempo')),
  ASPAS: rel(INICIO['09_aspas']) - 4,
  COMUNICACION: rel(marca('09_aspas', 'comunicacion')),
  TOCAN: rel(marca('09_aspas', 'tocaron')) + 6,
  AIRE: rel(INICIO['10_aire']) - 4,
  DELGADO: rel(marca('10_aire', 'delgado')),
  ESQUIVAR: rel(marca('10_aire', 'esquivar')),
  VICTIMA: rel(INICIO['11_victima']) - 6,
  CIERRE: rel(INICIO['12_cierre']) - 4,
  FIN: rel(INICIO['13_pronto']) - 8,
  DUR: rel(FIN['13_pronto']) + 2,
};

export const FIN_CARD = INI_HOLO + H.FIN + 2;
export const DURACION_P05 = FIN['13_pronto'] + 2;
