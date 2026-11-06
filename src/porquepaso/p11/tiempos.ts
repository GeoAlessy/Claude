import {PALABRAS} from './subtitulos';

// =====================================================================
// Video 11 · "¿Por qué salió volando este inflable?" (efecto látigo de una lancha que gira cerca de la playa)
// Toda la línea de tiempo sale de la narración.
// =====================================================================
export const FPS = 30;

const ORDEN: [string, number][] = [
  ['01_vuela', 3], // la voz entra desde el inicio: así el bucle empalma con nuestra voz
  ['02_suerte', 4],
  ['03_latigo', 4],
  ['04_cuerda', 10],
  ['05_inercia', 6],
  ['06_circulo', 6],
  ['07_rapido', 6],
  ['08_ala', 6],
  ['09_orilla', 6],
  ['10_consejo', 8],
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

// ---------- Gancho (video de la playa, dentro de un monitor grande) ----------
// A.mp4 = segundos 0–13.5 del original, sin la franja de arriba (marca de agua), mejorado con ESRGAN (1620×1836).
// El gancho empieza en su cuadro 30 (segundo 1.0): los cuadros 0–30 van en la tarjeta final (bucle).
export const A_INI = 30;
export const REPE_INI = 102; // segundo 3.4: el inflable despega y vuela sobre la gente
export const SEG = {
  A: {desde: 0, dur: 0},
  B: {desde: 0, dur: 0}, // repetición en cámara lenta + "¿MALA SUERTE?"
};
SEG.B.desde = INICIO['02_suerte'] - 2;
SEG.A.dur = SEG.B.desde;
export const SUERTE = marca('02_suerte', 'suerte');
export const GOLPE_REAL = 84; // el inflable cae sobre la gente (segundo 3.8 del original)
export const INI_HOLO = marca('03_latigo', 'efecto') - 4;
SEG.B.dur = INI_HOLO - SEG.B.desde;
export const DURACION_GANCHO = INI_HOLO;

// ---------- Holograma (relativo a INI_HOLO) ----------
const rel = (f: number) => f - INI_HOLO;
export const H = {
  CUERDA: rel(INICIO['04_cuerda']) - 6,
  LARGA: rel(marca('04_cuerda', 'larga')),
  FRENOS: rel(marca('04_cuerda', 'frenos')),
  INERCIA: rel(INICIO['05_inercia']) - 4,
  GIRA: rel(marca('05_inercia', 'gira')),
  DERECHO: rel(marca('05_inercia', 'derecho')),
  CIRCULO: rel(INICIO['06_circulo']) - 4,
  TENSA: rel(marca('06_circulo', 'tensa')),
  GRANDE: rel(marca('06_circulo', 'circulo')),
  RAPIDO: rel(INICIO['07_rapido']) - 4,
  MAS: rel(marca('07_rapido', 'rapido')),
  ALA: rel(INICIO['08_ala']) - 4,
  AIRE: rel(marca('08_ala', 'aire')),
  LEVANTA: rel(marca('08_ala', 'levanta')),
  ORILLA: rel(INICIO['09_orilla']) - 4,
  METROS: rel(marca('09_orilla', 'metros')),
  GENTE: rel(marca('09_orilla', 'gente')),
  CONSEJO: rel(INICIO['10_consejo']) - 4,
  NUNCA: rel(marca('10_consejo', 'nunca')),
  LEJOS: rel(marca('10_consejo', 'lejos')),
  FIN: rel(INICIO['11_ya_sabes']) - 8,
  DUR: rel(FIN['11_ya_sabes']) + 2,
};

export const FIN_CARD = INI_HOLO + H.FIN + 2;
export const DURACION_P11 = FIN['11_ya_sabes'] + 2;
