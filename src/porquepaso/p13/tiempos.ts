import {PALABRAS} from './subtitulos';

// =====================================================================
// Video 13 · "¿Por qué no se cayó del capó?" (agente de tránsito sobre el capó, Yakarta, 3 ene 2024 · inercia)
// Toda la línea de tiempo sale de la narración.
// =====================================================================
export const FPS = 30;

const ORDEN: [string, number][] = [
  ['01_capo', 3], // la voz entra desde el inicio: así el bucle empalma con nuestra voz
  ['02_milagro', 4],
  ['03_inercia', 4],
  ['04_yakarta', 8],
  ['05_misma', 5],
  ['06_fuerza', 5],
  ['07_viento', 5],
  ['08_agarre', 5],
  ['09_frenazo', 5],
  ['10_zigzag', 5],
  ['11_consejo', 7],
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
// A.mp4 = segundos 110–115.5 del original (el agente sobre el capó, el auto en marcha).
// B.mp4 = segundos 149.5–152.5 (un movimiento brusco: se le va el cuerpo).
// El gancho empieza en el cuadro 30 de A: los cuadros 0–30 van en la tarjeta final (bucle).
export const A_INI = 30;
export const B_INI = 0;
export const SEG = {
  A: {desde: 0, dur: 0},
  B: {desde: 0, dur: 0}, // cámara lenta + "¿UN MILAGRO?"
};
SEG.B.desde = INICIO['02_milagro'] - 2;
SEG.A.dur = SEG.B.desde;
export const MILAGRO = marca('02_milagro', 'milagro');
export const INI_HOLO = marca('03_inercia', 'inercia') - 4;
SEG.B.dur = INI_HOLO - SEG.B.desde;
export const DURACION_GANCHO = INI_HOLO;

// ---------- Holograma (relativo a INI_HOLO) ----------
const rel = (f: number) => f - INI_HOLO;
export const H = {
  YAKARTA: rel(INICIO['04_yakarta']) - 6,
  AGENTE: rel(marca('04_yakarta', 'agente')),
  ARRANCO: rel(marca('04_yakarta', 'arranco')),
  MISMA: rel(INICIO['05_misma']) - 4,
  CONSTANTE: rel(marca('05_misma', 'constante')),
  VELOCIDAD: rel(marca('05_misma', 'misma')),
  FUERZA: rel(INICIO['06_fuerza']) - 4,
  NINGUNA: rel(marca('06_fuerza', 'ninguna')),
  CAMBIAR: rel(marca('06_fuerza', 'cambiar')),
  VIENTO: rel(INICIO['07_viento']) - 4,
  VIENTO_W: rel(marca('07_viento', 'viento')),
  KILOS: rel(marca('07_viento', 'kilos')),
  AGARRE: rel(INICIO['08_agarre']) - 4,
  MANOS: rel(marca('08_agarre', 'manos')),
  ROCE: rel(marca('08_agarre', 'roce')),
  FRENAZO: rel(INICIO['09_frenazo']) - 4,
  FRENA: rel(marca('09_frenazo', 'frena')),
  DETIENE: rel(marca('09_frenazo', 'detiene')),
  LARGO: rel(marca('09_frenazo', 'largo')),
  ZIGZAG: rel(INICIO['10_zigzag']) - 4,
  CURVA: rel(marca('10_zigzag', 'curva')),
  DERECHO: rel(marca('10_zigzag', 'derecho')),
  CONSEJO: rel(INICIO['11_consejo']) - 4,
  NUNCA: rel(marca('11_consejo', 'nunca')),
  FRENAZO2: rel(marca('11_consejo', 'frenazo')),
  FIN: rel(INICIO['12_ya_sabes']) - 8,
  DUR: rel(FIN['12_ya_sabes']) + 2,
};

export const FIN_CARD = INI_HOLO + H.FIN + 2;
export const DURACION_P13 = FIN['12_ya_sabes'] + 2;
