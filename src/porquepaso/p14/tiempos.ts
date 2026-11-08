import {PALABRAS} from './subtitulos';

// =====================================================================
// Video 14 · "¿Por qué se sacudió esta moto?" (arrancón a fondo · bamboleo de velocidad)
// Toda la línea de tiempo sale de la narración.
// =====================================================================
export const FPS = 30;

const ORDEN: [string, number][] = [
  ['01_moto', 3],
  ['02_rompio', 4],
  ['03_bamboleo', 4],
  ['04_arrancon', 8],
  ['05_peso', 5],
  ['06_toque', 5],
  ['07_pasa', 5],
  ['08_crece', 5],
  ['09_manubrio', 5],
  ['10_consejo', 6],
  ['11_manos', 5],
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
// A.mp4 = segundos 25.4–31.0 del original (cuadro i del mp4 = segundo 25.4 + i/30).
//   Toma 1 (de lejos): cuadros 30–78. La sacudida y la caída: 78–101. Toma 2 (desde atrás del público): 101–167.
// El gancho empieza en el cuadro 30 de A: los cuadros 0–30 van en la tarjeta final (bucle).
export const A_INI = 30;
export const B_INI = 78; // empieza a sacudirse
export const C_INI = 101; // segunda toma
export const B_VEL = 0.4;
export const C_VEL = 0.5;
export const SEG = {
  A: {desde: 0, dur: 48},
  B: {desde: 48, dur: Math.round((C_INI - B_INI) / B_VEL)},
  C: {desde: 0, dur: 0},
};
SEG.C.desde = SEG.B.desde + SEG.B.dur;
export const ROMPIO = marca('02_rompio', 'rompio');
export const INI_HOLO = marca('03_bamboleo', 'bamboleo') - 4;
SEG.C.dur = INI_HOLO - SEG.C.desde;
export const DURACION_GANCHO = INI_HOLO;

// ---------- Holograma (relativo a INI_HOLO) ----------
const rel = (f: number) => f - INI_HOLO;
export const H = {
  ARRANCON: rel(INICIO['04_arrancon']) - 6,
  CARRERA: rel(marca('04_arrancon', 'arrancones')),
  FONDO: rel(marca('04_arrancon', 'fondo')),
  PESO: rel(INICIO['05_peso']) - 4,
  PESO_W: rel(marca('05_peso', 'peso')),
  ATRAS: rel(marca('05_peso', 'atras')),
  DELANTERA: rel(marca('05_peso', 'delantera')),
  FLOTANDO: rel(marca('05_peso', 'flotando')),
  TOQUE: rel(INICIO['06_toque']) - 4,
  BACHE: rel(marca('06_toque', 'bache')),
  TOQUE_W: rel(marca('06_toque', 'toque')),
  TUERCE: rel(marca('06_toque', 'tuerce')),
  PASA: rel(INICIO['07_pasa']) - 4,
  CENTRO: rel(marca('07_pasa', 'centro')),
  PASA_W: rel(marca('07_pasa', 'pasa')),
  VUELVE: rel(marca('07_pasa', 'vuelve')),
  CRECE: rel(INICIO['08_crece']) - 4,
  FUERTE: rel(marca('08_crece', 'fuerte')),
  DIEZ: rel(marca('08_crece', 'diez')),
  MANUBRIO: rel(INICIO['09_manubrio']) - 4,
  GOLPEA: rel(marca('09_manubrio', 'golpea')),
  SOSTENER: rel(marca('09_manubrio', 'sostenerlo')),
  CAE: rel(marca('09_manubrio', 'cae')),
  CONSEJO: rel(INICIO['10_consejo']) - 4,
  AMORT: rel(marca('10_consejo', 'amortiguador')),
  FRENA: rel(marca('10_consejo', 'frena')),
  MANOS: rel(INICIO['11_manos']) - 4,
  APRIETES: rel(marca('11_manos', 'aprietes')),
  FRENES: rel(marca('11_manos', 'frenes')),
  SUELTA: rel(marca('11_manos', 'suelta')),
  FIN: rel(INICIO['12_ya_sabes']) - 8,
  DUR: rel(FIN['12_ya_sabes']) + 2,
};

export const FIN_CARD = INI_HOLO + H.FIN + 2;
export const DURACION_P14 = FIN['12_ya_sabes'] + 2;
