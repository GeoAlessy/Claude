import {PALABRAS} from './subtitulos';

// =====================================================================
// Survive 01 · "Could a human survive Homer's fall into Springfield Gorge?"
// The Simpsons T2E08 "Bart the Daredevil". Toda la línea de tiempo sale de la voz.
// =====================================================================
export const FPS = 30;

// [id, pausa antes en fotogramas]: casi sin pausas (ritmo "pum, pum, pum").
const ORDEN: [string, number][] = [
  ['01_hook', 0],
  ['02_math', 2],
  ['03_deep', 2],
  ['04_speed', 2],
  ['05_hits', 3],
  ['06_twist', 3],
  ['07_alive', 3],
  ['08_but', 4],
  ['09_again', 1],
  ['10_verdict', 4],
];

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

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

/** Fotograma en que empieza la palabra (n = qué aparición, desde 0). */
export function marca(id: string, palabra: string, n = 0): number {
  const ws = PALABRAS[id].filter((p) => norm(p[0]).startsWith(norm(palabra)));
  const w = ws[n];
  if (!w) throw new Error(`No encuentro "${palabra}" #${n} en ${id}`);
  return INICIO[id] + Math.round(w[1] * FPS);
}

export const DURACION_S01 = FIN['10_verdict'] + 16;

// ---------- Clips (segundos del episodio) ----------
// Archivos escalados a 2560x1440, 30 fps, sin audio.
export const CLIPS: Record<string, number> = {caida: 1218, camilla: 1247, segunda: 1255, hospital: 1266};
// Golpes contra las rocas (segundo exacto del episodio)
export const IMPACTO = [1232.45, 1233.65, 1234.95, 1237.7];

// ---------- Marcas clave ----------
export const M = {
  DEEP: marca('03_deep', 'thirty'),
  HUNDRED: marca('04_speed', 'hundred'),
  HIT: [marca('05_hits', 'hit', 0), marca('05_hits', 'hit', 1), marca('05_hits', 'hit', 2), marca('05_hits', 'hit', 3)],
  PARTE: [marca('05_hits', 'ribs'), marca('05_hits', 'spleen'), marca('05_hits', 'lungs'), marca('05_hits', 'skull')],
  TWIST: marca('06_twist', 'twist'),
  EVERY: marca('06_twist', 'every'),
  STEALS: marca('06_twist', 'steals'),
  ROCKS: marca('06_twist', 'the', 1),
  BRAKING: marca('06_twist', 'braking'),
  ALIVE: marca('07_alive', 'alive'),
  AND: marca('07_alive', 'and'),
  ATTENDANT: marca('07_alive', 'flight'),
  SIXMILE: marca('07_alive', 'sixmile'),
  SAME: marca('09_again', 'same'),
  ALL: marca('09_again', 'all'),
  FIRST: marca('10_verdict', 'first'),
  MAYBE: marca('10_verdict', 'maybe'),
  SECOND: marca('10_verdict', 'second'),
  KILLS: marca('10_verdict', 'kills'),
};

// ---------- Planos ----------
// desde: fotograma de la composición · src: segundo del episodio · vel: velocidad
// cx/cy: centro del encuadre (0–1 del cuadro original) · zoom: inicial → final
// congela: fotograma (relativo al plano) desde el que se queda quieto
export type Plano = {desde: number; src: number; vel: number; cx: number; cy?: number; zoom: [number, number]; congela?: number; sacudir?: boolean};

const P: Plano[] = [];
const plano = (p: Plano) => P.push(p);

// 01 · Homer vuela, feliz (gancho)
plano({desde: 0, src: 1221.6, vel: 1.15, cx: 0.5, cy: 0.5, zoom: [1.05, 1.3]});
// 02 · se da cuenta… y mira hacia abajo
plano({desde: INICIO['02_math'] - 2, src: 1225.4, vel: 1.0, cx: 0.36, cy: 0.42, zoom: [1.1, 1.3]});
// 03 · el acantilado gigante, con la gente diminuta abajo
plano({desde: INICIO['03_deep'] - 2, src: 1218.0, vel: 0.85, cx: 0.5, cy: 0.5, zoom: [1.0, 1.08]});
// 04 · cae de lejos
plano({desde: INICIO['04_speed'] - 2, src: 1226.6, vel: 1.15, cx: 0.5, cy: 0.5, zoom: [1.0, 1.15]});
// 05 · "doesn't fall clean": los niños miran desde el borde
plano({desde: INICIO['05_hits'] - 3, src: 1230.0, vel: 1.1, cx: 0.5, cy: 0.5, zoom: [1.0, 1.12]});
// 05 · los 4 golpes: entra 8 fotogramas antes, golpea justo en "Hit…", se congela en el impacto
IMPACTO.forEach((imp, i) => {
  const desde = M.HIT[i] - 8;
  plano({desde, src: imp - 8 / FPS, vel: 1.0, cx: [0.42, 0.45, 0.4, 0.4][i], cy: 0.5, zoom: [1.05, 1.25], congela: 10, sacudir: true});
});
// 06 · el giro: niños abajo, rebote contra la pared, sigue cayendo
plano({desde: INICIO['06_twist'] - 3, src: 1235.4, vel: 1.4, cx: 0.5, cy: 0.5, zoom: [1.0, 1.1]});
plano({desde: M.EVERY - 2, src: 1237.15, vel: 0.75, cx: 0.4, cy: 0.5, zoom: [1.1, 1.25]});
plano({desde: M.ROCKS - 2, src: 1238.3, vel: 1.0, cx: 0.55, cy: 0.5, zoom: [1.0, 1.1]});
// 07 · llega al fondo, destrozado… pero vivo
plano({desde: INICIO['07_alive'] - 3, src: 1239.7, vel: 0.9, cx: 0.48, cy: 0.5, zoom: [1.0, 1.2]});
// 08 · "But then…": lo suben en la camilla
plano({desde: INICIO['08_but'] - 4, src: 1247.4, vel: 1.4, cx: 0.45, cy: 0.5, zoom: [1.05, 1.15]});
// 09 · la ambulancia choca y la camilla rueda al vacío… otra vez
plano({desde: INICIO['09_again'] - 1, src: 1255.1, vel: 2.0, cx: 0.5, cy: 0.5, zoom: [1.0, 1.1]});
plano({desde: M.SAME - 2, src: 1256.6, vel: 1.25, cx: 0.4, cy: 0.5, zoom: [1.05, 1.2]});
plano({desde: M.ALL - 2, src: 1259.0, vel: 1.6, cx: 0.5, cy: 0.5, zoom: [1.0, 1.12]});
// 10 · veredicto: Homer enyesado en el hospital
plano({desde: INICIO['10_verdict'] - 4, src: 1266.6, vel: 0.7, cx: 0.5, cy: 0.5, zoom: [1.0, 1.15]});

export const PLANOS = P.map((p, i) => ({...p, hasta: P[i + 1]?.desde ?? DURACION_S01}));

// ---------- Medidor de supervivencia ----------
export const MEDIDOR: [number, number][] = [
  [0, 50],
  [M.DEEP, 38],
  [M.HUNDRED, 14],
  [M.PARTE[0], 11],
  [M.PARTE[1], 8],
  [M.PARTE[2], 5],
  [M.PARTE[3], 3],
  [M.STEALS, 22],
  [M.BRAKING, 38],
  [M.ALIVE, 52],
  [M.SIXMILE, 64],
  [INICIO['09_again'], 30],
  [M.ALL, 8],
  [M.KILLS, 0],
];
