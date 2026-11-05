import {PALABRAS} from './subtitulos2';

// =====================================================================
// Survive 01 · v2 · "Could a real human survive Homer's fall?"
// Ritmo dominó: la línea de tiempo sale de la voz (Skylar, ~200 palabras/min).
// =====================================================================
export const FPS = 30;

// Audio original del episodio
// Bucle: el video termina con Bart ("But, Dad, you'll never make it.") y empieza con la respuesta de Homero.
export const ORIG_H = {archivo: 'orig_H_know.wav', dur: 39, src: 1189.58}; // Homero: "Don't you think I know that?" (1,30 s)
export const ORIG_C = {archivo: 'orig_C_bones.wav', dur: 66, src: 984.62}; // Lance Murdock: "Bones heal, chicks dig scars" (2,2 s)
export const ORIG_B = {archivo: 'orig_B_bart.wav', dur: 64, src: 1187.45}; // Bart: "But, Dad, you'll never make it." (2,13 s)

// [id, pausa antes]: la pausa tras los golpes deja ver la repetición en cámara lenta
const ORDEN: [string, number][] = [
  ['01_hook', ORIG_H.dur + 18], // 0,6 s de aire tras la frase de Homero antes de nuestra voz
  ['02_deep', 2],
  ['03_clean', 2],
  ['04_hits', 2],
  ['05_twist', 26],
  ['06a_alive', 2],
  ['06b_real', ORIG_C.dur + 6], // en medio: Lance Murdock, "Bones heal, chicks dig scars"
  ['07_again', 3],
  ['08_verdict', 3],
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
export function marca(id: string, palabra: string, n = 0): number {
  const ws = PALABRAS[id].filter((p) => norm(p[0]).startsWith(norm(palabra)));
  const w = ws[n];
  if (!w) throw new Error(`No encuentro "${palabra}" #${n} en ${id}`);
  return INICIO[id] + Math.round(w[1] * FPS);
}

export const INI_C = FIN['06a_alive'] + 3;
export const INI_B = FIN['08_verdict'] + 6;
export const DURACION_S01V2 = INI_B + ORIG_B.dur + 2;

export const M = {
  KILL: marca('01_hook', 'kill'),
  AMB: marca('01_hook', 'ambulance'),
  BUT: marca('01_hook', 'but'),
  THIRTY: marca('02_deep', 'thirty'),
  SO: marca('02_deep', 'so'),
  HUNDRED: marca('02_deep', 'hundred'),
  HIT: [0, 1, 2, 3].map((n) => marca('04_hits', 'hit', n)),
  PARTE: [marca('04_hits', 'ribs'), marca('04_hits', 'spleen'), marca('04_hits', 'lungs'), marca('04_hits', 'skull')],
  TWIST: marca('05_twist', 'twist'),
  EVERY: marca('05_twist', 'every'),
  ROCKS: marca('05_twist', 'the', 1),
  BRAKES: marca('05_twist', 'brakes'),
  ALIVE: marca('06a_alive', 'alive'),
  AND: INICIO['06b_real'],
  FLIGHT: marca('06b_real', 'flight'),
  SIXMILE: marca('06b_real', 'sixmile'),
  SURVIVED: marca('06b_real', 'survived'),
  FALLS: marca('07_again', 'falls'),
  SAME: marca('07_again', 'same'),
  AND7: marca('07_again', 'and'),
  MAYBE: marca('08_verdict', 'maybe'),
  SECOND: marca('08_verdict', 'second'),
  KILLS: marca('08_verdict', 'kills'),
};

// Repetición en cámara lenta del golpe 4 (entre "skull." y el giro)
export const REPLAY = {desde: FIN['04_hits'] - 4, hasta: INICIO['05_twist'] + 2};

// ---------- Clips (segundo del episodio en que empieza cada archivo) ----------
export const CLIPS: Record<string, number> = {caida: 1218, camilla: 1247, segunda: 1255, hospital: 1266, dialogo: 1186.5, lance: 984.2};
export const IMPACTO = [1232.45, 1233.65, 1234.95, 1237.7];

// ---------- Planos: la cámara nunca se queda quieta ----------
export type Plano = {
  desde: number;
  src: number;
  vel: number;
  cx: number;
  cy?: number;
  zoom: [number, number];
  pan?: [number, number]; // desplazamiento horizontal (px) de inicio a fin
  sigue?: [number, number][]; // seguimiento horizontal: [progreso 0..1 del plano, cx] (la cámara acompaña a Homero)
  cy2?: number; // cy al final del plano (sigue la caída vertical)
  fy?: number; // foco vertical: punto del cuadro (0 arriba, 1 abajo) que queda en el centro de la pantalla
  congela?: number; // fotograma (relativo) desde el que se queda quieto
  golpe?: 'rojo' | 'replay';
  archivo?: string;
  encaja?: boolean; // muestra el cuadro completo (ancho) sobre un fondo desenfocado
};
const P: Plano[] = [];
const plano = (p: Plano) => P.push(p);

// H · Homero responde a Bart (cierra el bucle): "Don't you think I know that?"
plano({desde: 0, src: 1189.72, vel: 1.0, cx: 0.5, zoom: [1.25, 1.4], archivo: 'dialogo', encaja: true}); // la cámara se mueve con ellos: cuadro completo
// 01 · "This fall probably won't kill you." Homero en el aire, se congela con brillo
plano({desde: INICIO['01_hook'] - 1, src: 1224.6, vel: 1.0, cx: 0.5, zoom: [1.55, 1.75], congela: 12, encaja: true}); // cuadro 12 = segundo 1225,0 (el del recorte)
// 01 · "The ambulance will." adelanto: la ambulancia que lo hace caer otra vez (se paga al final)
plano({desde: M.AMB - 2, src: 1255.3, vel: 1.0, cx: 0.45, zoom: [1.0, 1.12], archivo: 'segunda'}); // la ambulancia contra el árbol
// 01 · "But could a real human survive this?" cae
plano({desde: M.BUT - 1, src: 1226.5, vel: 1.05, cx: 0.5, sigue: [[0, 0.5], [0.5, 0.6], [1, 0.6]], cy: 0.2, cy2: 0.85, zoom: [1.2, 1.45]}); // Homero cae al desfiladero: la cámara lo sigue
// 02 · el acantilado con la cinta métrica 3D
plano({desde: INICIO['02_deep'] - 2, src: 1218.0, vel: 0.9, cx: 0.52, zoom: [1.0, 1.04]}); // casi quieto: la cinta va pegada al sendero
// 02 · "so you'd hit the bottom at a hundred miles an hour"
plano({desde: M.SO - 1, src: 1221.3, vel: 1.0, cx: 0.5, zoom: [1.0, 1.15]}); // Homero gritando en el aire, centrado
// 03 · los niños se asoman al borde
plano({desde: INICIO['03_clean'] - 2, src: 1230.0, vel: 1.15, cx: 0.5, zoom: [1.0, 1.15], pan: [30, -30]});
// 04 · los cuatro golpes: entra 6 fotogramas antes de "Hit", golpea en la palabra
// El cuadro congelado es el del contacto; el centro de la pantalla cae en la parte golpeada (medido cuadro a cuadro).
const FOCO_GOLPE: {ajuste: number; x: number; y: number; zoom: number}[] = [
  {ajuste: 0, x: 0.45, y: 0.58, zoom: 1.12}, // costillas: el torso entra en el arbusto
  {ajuste: 0.1, x: 0.45, y: 0.45, zoom: 1.12}, // bazo: la cadera choca contra la roca
  {ajuste: 0.1, x: 0.2, y: 0.75, zoom: 1.25}, // pulmones: el pecho contra la cornisa
  {ajuste: 0.1, x: 0.27, y: 0.76, zoom: 1.25}, // cráneo: la cabeza contra las piedras
];
IMPACTO.forEach((imp, i) => {
  const g = FOCO_GOLPE[i];
  plano({desde: M.HIT[i] - 6, src: imp + g.ajuste - 6 / FPS, vel: 1.0, cx: g.x, fy: g.y, zoom: [g.zoom, g.zoom * 1.1], congela: 7, golpe: 'rojo'});
});
// 04 · repetición del golpe 4 en cámara lenta
plano({desde: REPLAY.desde, src: IMPACTO[3] - 0.15, vel: 0.3, cx: 0.27, fy: 0.76, zoom: [1.35, 1.55], golpe: 'replay'});
// 05 · el giro
plano({desde: INICIO['05_twist'] - 2, src: 1232.45, vel: 0.8, cx: 0.45, sigue: [[0, 0.45], [1, 0.33]], zoom: [1.05, 1.15]}); // Homero se clava en el arbusto
plano({desde: M.EVERY - 2, src: 1233.1, vel: 0.75, cx: 0.3, sigue: [[0, 0.3], [0.5, 0.25], [1, 0.18]], zoom: [1.0, 1.1]}); // patea la roca: cada golpe le quita velocidad
plano({desde: M.ROCKS - 2, src: 1237.4, vel: 0.55, cx: 0.27, sigue: [[0, 0.27], [0.6, 0.2], [1, 0.15]], zoom: [1.0, 1.1]}); // rebota en la roca y sigue cayendo
// 06 · llega al fondo: se congela con brillo en "alive"
plano({desde: INICIO['06a_alive'] - 2, src: 1239.55, vel: 1.0, cx: 0.5, zoom: [1.12, 1.25], congela: 10, encaja: true}); // cuadro 10 = segundo 1239,9 (el del recorte)
// C · Lance Murdock en el hospital: "Bones heal, chicks dig scars"
plano({desde: INI_C - 1, src: ORIG_C.src - 0.1, vel: 1.0, cx: 0.76, zoom: [1.1, 1.3], archivo: 'lance'}); // Lance está a la derecha del cuadro
// 06b · caso real: de vuelta a Homero en el fondo (quieto) bajo la tarjeta
plano({desde: INICIO['06b_real'] - 2, src: 1239.9, vel: 1.0, cx: 0.5, zoom: [1.15, 1.3], congela: 0, encaja: true});
// 07 · la ambulancia choca y vuelve a caer
plano({desde: INICIO['07_again'] - 3, src: 1255.1, vel: 1.4, cx: 0.45, sigue: [[0, 0.45], [0.38, 0.55], [0.55, 0.45], [0.71, 0.25], [0.88, 0.17], [1, 0.15]], zoom: [1.0, 1.1], archivo: 'segunda'}); // la ambulancia choca y la camilla con Homero sale rodando
plano({desde: M.AND7 - 2, src: 1234.6, vel: 0.6, cx: 0.2, cy: 0.9, zoom: [1.2, 1.3]}); // vuelve a caer de cabeza
plano({desde: M.SAME - 6, src: IMPACTO[3] + 0.1 - 6 / FPS, vel: 1.0, cx: 0.27, fy: 0.76, zoom: [1.25, 1.375], congela: 7, golpe: 'rojo'}); // "Same rocks": las mismas piedras, mismo golpe
// 08 · hospital
plano({desde: INICIO['08_verdict'] - 3, src: 1266.6, vel: 0.7, cx: 0.5, zoom: [1.0, 1.2], archivo: 'hospital'});
// B · Bart: "But, Dad, you'll never make it." (el bucle vuelve a H)
plano({desde: INI_B, src: ORIG_B.src, vel: 1.0, cx: 0.5, zoom: [1.0, 1.1], archivo: 'dialogo'});

export const PLANOS = P.map((p, i) => ({...p, hasta: P[i + 1]?.desde ?? DURACION_S01V2}));

// Momentos de brillo (Homero recortado encima del cuadro congelado)
export const BRILLOS = [
  {recorte: 'recorte_vuelo.png', desde: INICIO['01_hook'] - 1 + 12, hasta: M.AMB - 2},
  {recorte: 'recorte_fondo.png', desde: INICIO['06a_alive'] - 2 + 10, hasta: INI_C - 1},
];

// ---------- Vidas en rosquillas: -1 se come una, +1 vuelve ----------
export const EVENTOS: [number, number][] = [
  [M.HIT[0], -1],
  [M.HIT[1], -1],
  [M.HIT[2], -1],
  [M.HIT[3], -1],
  [M.BRAKES, +1],
  [M.ALIVE, +1],
  [M.FALLS, -1],
  [M.SAME, -1],
  [M.KILLS, -1],
];
export const MEDIDOR_DESDE = M.BUT + 4;
