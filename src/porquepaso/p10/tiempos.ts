import {PALABRAS} from './subtitulos';

// =====================================================================
// Video 10 · "¿Por qué esta nube corre sobre el mar?" (flujo piroclástico, Stromboli, 28 ago 2019)
// Toda la línea de tiempo sale de la narración.
// =====================================================================
export const FPS = 30;

const ORDEN: [string, number][] = [
  ['01_nube', 3], // la voz entra desde el inicio: así el bucle empalma con nuestra voz
  ['02_humo', 4],
  ['03_peor', 4],
  ['04_stromboli', 10],
  ['05_flujo', 6],
  ['06_pesado', 6],
  ['07_rapido', 5],
  ['08_vapor', 6],
  ['09_desliza', 5],
  ['10_bote', 6],
  ['11_consejo', 8],
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

// ---------- Gancho (video del bote, vertical a pantalla completa) ----------
// A.mp4 = segundos 0–8.5 del original (la nube baja y corre sobre el mar; el bote huye con su lancha a remolque).
// B.mp4 = segundos 11–16.5 (la nube gigante, ya muy cerca del bote).
// El gancho empieza en el cuadro 60 de A (segundo 2.0): los cuadros 0–60 van en la tarjeta final (bucle).
export const A_INI = 60;
export const B_INI = 0;
export const SEG = {
  A: {desde: 0, dur: 0},
  B: {desde: 0, dur: 0}, // la nube gigante en cámara lenta + "¿SOLO HUMO?"
};
SEG.B.desde = INICIO['02_humo'] - 2;
SEG.A.dur = SEG.B.desde;
export const HUMO = marca('02_humo', 'humo');
export const INI_HOLO = marca('03_peor', 'peor') - 4;
SEG.B.dur = INI_HOLO - SEG.B.desde;
export const DURACION_GANCHO = INI_HOLO;

// ---------- Holograma (relativo a INI_HOLO) ----------
const rel = (f: number) => f - INI_HOLO;
export const H = {
  ISLA: rel(INICIO['04_stromboli']) - 6,
  EXPLOSION: rel(marca('04_stromboli', 'explosion')),
  SUBIO: rel(marca('04_stromboli', 'subio')),
  DESPLOMO: rel(marca('04_stromboli', 'desplomo')),
  FLUJO: rel(INICIO['05_flujo']) - 4,
  PIRO: rel(marca('05_flujo', 'piroclastico')),
  GAS: rel(marca('05_flujo', 'gas')),
  CENIZA: rel(marca('05_flujo', 'ceniza')),
  ROCAS: rel(marca('05_flujo', 'rocas')),
  GRADOS: rel(marca('05_flujo', 'grados')),
  PESADO: rel(INICIO['06_pesado']) - 4,
  AIRE: rel(marca('06_pesado', 'aire')),
  FLOTA: rel(marca('06_pesado', 'flota')),
  LADERA: rel(marca('06_pesado', 'ladera')),
  AVALANCHA: rel(marca('06_pesado', 'avalancha')),
  RAPIDO: rel(INICIO['07_rapido']) - 4,
  CIEN: rel(marca('07_rapido', 'cien')),
  VAPOR: rel(INICIO['08_vapor']) - 4,
  TOCAR: rel(marca('08_vapor', 'tocar')),
  HIERVE: rel(marca('08_vapor', 'hierve')),
  COLCHON: rel(marca('08_vapor', 'colchon')),
  DESLIZA: rel(INICIO['09_desliza']) - 4,
  DISCO: rel(marca('09_desliza', 'disco')),
  BOTE: rel(INICIO['10_bote']) - 4,
  HUIR: rel(marca('10_bote', 'huir')),
  NADIE: rel(marca('10_bote', 'nadie')),
  CONSEJO: rel(INICIO['11_consejo']) - 4,
  ALEJATE: rel(marca('11_consejo', 'alejate')),
  RAPIDA: rel(marca('11_consejo', 'rapida')),
  FIN: rel(INICIO['12_ya_sabes']) - 8,
  DUR: rel(FIN['12_ya_sabes']) + 2,
};

export const FIN_CARD = INI_HOLO + H.FIN + 2;
export const DURACION_P10 = FIN['12_ya_sabes'] + 2;
