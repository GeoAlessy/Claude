import {PALABRAS} from './subtitulos';

// =====================================================================
// Video 09 · "¿Por qué se fue sola la camioneta?" (cargando un tractor en un tráiler)
// Toda la línea de tiempo sale de la narración.
// =====================================================================
export const FPS = 30;

const ORDEN: [string, number][] = [
  ['01_sola', 3], // la voz entra desde el inicio: así el bucle empalma con nuestra voz
  ['02_freno', 4],
  ['03_igual', 24], // silencio máximo 0.8 s después de "freno" (pedido del usuario)
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
// A.mp4 = segundos 0–10 del original (franja de video mejorada con ESRGAN).
// C.mp4 = segundos 14.6–18.8, recorte ampliado ×3 del final de la entrada (donde choca).
// B y C van a 1.3× para que no quede silencio después de "freno".
// El gancho empieza en el cuadro 90 de A (segundo 3.0): los cuadros 0–90 van en la tarjeta final (bucle).
export const A_INI = 90;
export const B_INI = 240; // segundo 8.0: el señor salta del tractor y corre detrás
export const C_INI = 18; // segundo 15.2 (en C.mp4): llega abajo, se dobla y choca
export const VEL = 1.3;
export const SEG = {
  A: {desde: 0, dur: 114}, // sube el tractor y todo empieza a rodar
  B: {desde: 114, dur: 60}, // el señor salta y corre
  C: {desde: 174, dur: 0}, // zoom al choque + "¿SIN FRENO?"
};
const enC = (segOriginal: number) => SEG.C.desde + Math.round(((segOriginal - 15.2) * FPS) / VEL);
export const CHOQUE = enC(16.95); // golpe (el sonido real llega aquí)
export const SONIDO_REAL = CHOQUE - 14; // el audio original (choque.wav empieza en el seg. 16.5) suena a velocidad normal: el golpe coincide con CHOQUE
export const FRENO = marca('02_freno', 'freno');
export const INI_HOLO = marca('03_igual', 'aunque') - 4;
SEG.C.dur = INI_HOLO - SEG.C.desde;
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
