import {PALABRAS} from './subtitulos';

// =====================================================================
// Video 12 · "¿Por qué el rayo bajó por el cohete?" (rayo provocado con un cohete que lleva un cable de cobre)
// Toda la línea de tiempo sale de la narración.
// =====================================================================
export const FPS = 30;

const ORDEN: [string, number][] = [
  ['01_rayo', 3], // la voz entra desde el inicio: así el bucle empalma con nuestra voz
  ['02_iman', 4],
  ['03_atajo', 4],
  ['04_nube', 8],
  ['05_muro', 5],
  ['06_cable', 5],
  ['07_punta', 5],
  ['08_salta', 5],
  ['09_cobre', 5],
  ['10_canal', 5],
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
// A.mp4 = segundos 3.0–12.5 del original, sin la franja de arriba (emoji del que lo reposteó), mejorado con ESRGAN (1222×1920).
// El gancho empieza en su cuadro 90 (segundo 6.0): los cuadros 0–90 van en la tarjeta final (bucle).
export const A_INI = 90;
export const REPE_INI = 150; // segundo 8.0: justo antes del destello
export const DESTELLO = 72; // el rayo cae (segundo 8.4 del original) en el gancho
export const SEG = {
  A: {desde: 0, dur: 0},
  B: {desde: 0, dur: 0}, // el destello en cámara lenta + "¿IMÁN DE RAYOS?"
};
SEG.B.desde = INICIO['02_iman'] - 2;
SEG.A.dur = SEG.B.desde;
export const IMAN = marca('02_iman', 'atrae');
export const INI_HOLO = marca('03_atajo', 'atajo') - 4;
SEG.B.dur = INI_HOLO - SEG.B.desde;
export const DURACION_GANCHO = INI_HOLO;

// ---------- Holograma (relativo a INI_HOLO) ----------
const rel = (f: number) => f - INI_HOLO;
export const H = {
  NUBE: rel(INICIO['04_nube']) - 6,
  NEGATIVA: rel(marca('04_nube', 'negativa')),
  POSITIVO: rel(marca('04_nube', 'positivo')),
  MURO: rel(INICIO['05_muro']) - 4,
  PARED: rel(marca('05_muro', 'muro')),
  TENSION: rel(marca('05_muro', 'tension')),
  CABLE: rel(INICIO['06_cable']) - 4,
  COBRE: rel(marca('06_cable', 'cobre')),
  SUELO: rel(marca('06_cable', 'suelo')),
  PUNTA: rel(INICIO['07_punta']) - 4,
  METROS: rel(marca('07_punta', 'metros')),
  CASI: rel(marca('07_punta', 'casi')),
  CONCENTRA: rel(marca('07_punta', 'concentra')),
  SALTA: rel(INICIO['08_salta']) - 4,
  CHISPA: rel(marca('08_salta', 'chispa')),
  CONECTA: rel(marca('08_salta', 'conecta')),
  RECORRE: rel(marca('08_salta', 'recorre')),
  VAPORIZA: rel(INICIO['09_cobre']) - 4,
  NARANJA: rel(marca('09_cobre', 'naranja')),
  CANAL: rel(INICIO['10_canal']) - 4,
  QUEDA: rel(marca('10_canal', 'queda')),
  SIGUIENTES: rel(marca('10_canal', 'siguientes')),
  CONSEJO: rel(INICIO['11_consejo']) - 4,
  COMETAS: rel(marca('11_consejo', 'cometas')),
  ATAJO: rel(marca('11_consejo', 'atajo')),
  FIN: rel(INICIO['12_ya_sabes']) - 8,
  DUR: rel(FIN['12_ya_sabes']) + 2,
};

export const FIN_CARD = INI_HOLO + H.FIN + 2;
export const DURACION_P12 = FIN['12_ya_sabes'] + 2;
