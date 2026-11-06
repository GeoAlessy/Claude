import {PALABRAS} from './subtitulos';

// =====================================================================
// Video 09 · "¿Por qué se fue sola la camioneta?" (cargando un tractor en un tráiler)
// Toda la línea de tiempo sale de la narración.
// =====================================================================
export const FPS = 30;

const ORDEN: [string, number][] = [
  ['01_sola', 3], // la voz entra desde el inicio: así el bucle empalma con nuestra voz
  ['02_freno', 4],
  ['03_igual', 4],
  ['04_perno', 8],
  ['05_atras', 6],
  ['06_libres', 5],
  ['07_bajada', 6],
  ['08_tractor', 6],
  ['09_grava', 6],
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

// ---------- Gancho (cámara de seguridad de la casa) ----------
// A.mp4 = segundos 0–14 del original (recorte de la franja de video, mejorado con ESRGAN).
// El gancho empieza en su cuadro 90 (segundo 3.0): los cuadros 0–90 van en la tarjeta final (bucle).
export const A_INI = 90;
export const REPE_INI = 198; // segundo 6.6: la camioneta empieza a rodar y el señor salta del tractor
export const SEG = {
  A: {desde: 0, dur: 0}, // sube el tractor y todo empieza a rodar
  B: {desde: 0, dur: 0}, // repetición en cámara lenta + "¿SIN FRENO?"
};
SEG.B.desde = INICIO['02_freno'] - 2;
SEG.A.dur = SEG.B.desde;
export const FRENO = marca('02_freno', 'freno');
export const INI_HOLO = marca('03_igual', 'aunque') - 4;
SEG.B.dur = INI_HOLO - SEG.B.desde;
export const DURACION_GANCHO = INI_HOLO;

// ---------- Holograma (relativo a INI_HOLO) ----------
const rel = (f: number) => f - INI_HOLO;
export const H = {
  PUESTO: rel(marca('03_igual', 'puesto')),
  IGUAL: rel(marca('03_igual', 'igual')),
  PERNO: rel(INICIO['04_perno']) - 4,
  PARK: rel(marca('04_perno', 'park')),
  DETIENE: rel(marca('04_perno', 'detiene')),
  PERNO_W: rel(marca('04_perno', 'perno')),
  CAJA: rel(marca('04_perno', 'caja')),
  ATRAS: rel(INICIO['05_atras']) - 4,
  MANO: rel(marca('05_atras', 'mano')),
  TRABA: rel(marca('05_atras', 'traba')),
  LIBRES: rel(INICIO['06_libres']) - 4,
  FRENTE: rel(marca('06_libres', 'frente')),
  CUATRO: rel(marca('06_libres', 'cuatro')),
  GIRAN: rel(marca('06_libres', 'giran')),
  BAJADA: rel(INICIO['07_bajada']) - 4,
  BAJA: rel(marca('07_bajada', 'bajada')),
  PESO: rel(marca('07_bajada', 'peso')),
  ABAJO: rel(marca('07_bajada', 'abajo')),
  TRACTOR: rel(INICIO['08_tractor']) - 4,
  SUBIR: rel(marca('08_tractor', 'subir')),
  TONELADA: rel(marca('08_tractor', 'tonelada')),
  GOLPE: rel(marca('08_tractor', 'golpe')),
  GRAVA: rel(INICIO['09_grava']) - 4,
  GRAVA_W: rel(marca('09_grava', 'grava')),
  PATINAN: rel(marca('09_grava', 'patinan')),
  VA: rel(marca('09_grava', 'va')),
  CONSEJO: rel(INICIO['10_consejo']) - 4,
  PLANO: rel(marca('10_consejo', 'plano')),
  FRENO: rel(marca('10_consejo', 'freno')),
  CALZAS: rel(marca('10_consejo', 'calzas')),
  FIN: rel(INICIO['11_ya_sabes']) - 8,
  DUR: rel(FIN['11_ya_sabes']) + 2,
};

export const FIN_CARD = INI_HOLO + H.FIN + 2;
export const DURACION_P09 = FIN['11_ya_sabes'] + 2;
