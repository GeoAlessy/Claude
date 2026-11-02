import {PALABRAS} from './subtitulos';

// =====================================================================
// Video 04 · "¿Por qué se quedó en las vías?" (tren FrontRunner, Layton, Utah)
// Toda la línea de tiempo sale de la narración.
// =====================================================================
export const FPS = 30;

const ORDEN: [string, number][] = [
  ['01_parado', 3],
  ['02_distraido', 4],
  ['03_historia', 4],
  ['04_detenido', 10],
  ['05_empujo', 6],
  ['06_barrera', 6],
  ['07_frenar', 6],
  ['08_correr', 6],
  ['09_logro', 6],
  ['10_consejo', 6],
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

export function marca(id: string, palabra: string): number {
  const w = PALABRAS[id].find((p) => norm(p[0]).startsWith(norm(palabra)));
  if (!w) throw new Error(`No encuentro "${palabra}" en ${id}`);
  return INICIO[id] + fps(w[1]);
}

// ---------- Gancho (cámara de seguridad) ----------
// cam_hd.mp4 = segundos 29.5–37.5 del original. El gancho empieza en su cuadro 75 (32.0 s):
// el tren ya se ve venir y el auto está en las vías. Los cuadros anteriores se usan al final (bucle).
export const CAM_INI = 75;
export const CAM_TOTAL = 240;
export const SEG = {
  CAM: {desde: 0, dur: 0},
  CONGELADO: {desde: 0, dur: 0},
};
SEG.CONGELADO.desde = Math.min(INICIO['02_distraido'] + 4, CAM_TOTAL - CAM_INI - 2);
SEG.CAM.dur = SEG.CONGELADO.desde;
export const DISTRAIDO = marca('02_distraido', 'distraido');
export const INI_HOLO = marca('03_historia', 'otra') - 4;
SEG.CONGELADO.dur = INI_HOLO - SEG.CONGELADO.desde;
export const DURACION_GANCHO = INI_HOLO;

// ---------- Holograma (relativo a INI_HOLO) ----------
const rel = (f: number) => f - INI_HOLO;
export const H = {
  DETENIDO: rel(INICIO['04_detenido']) - 6,
  CAMIONETA: rel(INICIO['05_empujo']) - 4,
  EMPUJA: rel(marca('05_empujo', 'empujo')),
  BARRERA: rel(INICIO['06_barrera']) - 4,
  RETRO: rel(marca('06_barrera', 'retroceder')),
  BAJADO: rel(marca('06_barrera', 'bajado')),
  FRENAR: rel(INICIO['07_frenar']) - 4,
  KM: rel(marca('07_frenar', 'kilometro')),
  SALIR: rel(marca('08_correr', 'salir')),
  CORRER: rel(marca('08_correr', 'correr')),
  LOGRO: rel(INICIO['09_logro']) - 4,
  IMPACTO: rel(marca('09_logro', 'impacto')) + 2,
  CONSEJO: rel(INICIO['10_consejo']) - 4,
  DIAGONAL: rel(marca('10_consejo', 'diagonal')),
  PEDAZOS: rel(marca('10_consejo', 'pedazos')),
  FIN: rel(INICIO['11_ya_sabes']) - 8,
  DUR: rel(FIN['11_ya_sabes']) + 2,
};

export const FIN_CARD = INI_HOLO + H.FIN + 2;
export const DURACION_P04 = FIN['11_ya_sabes'] + 2;
