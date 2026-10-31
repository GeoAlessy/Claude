import {Easing, interpolate} from 'remotion';

export const FPS = 30;
export const DURACION = 1140; // 38 s

// Escenas (frame inicial, frame final exclusivo)
export const ESC = {
  s1: [0, 75],
  s2: [75, 150],
  s3: [150, 210],
  s4: [210, 285],
  s5: [285, 330],
  s6: [330, 390],
  m1: [390, 442],
  m2: [442, 494],
  m3: [494, 546],
  m4: [546, 600],
  s8a: [600, 680],
  s8b: [680, 720],
  s9a: [720, 780],
  s9b: [780, 840],
  s10a: [840, 915],
  s10b: [915, 990],
  s11: [990, 1080],
  s12: [1080, 1140],
} as const;

export type Escena = keyof typeof ESC;
export const dur = (e: Escena) => ESC[e][1] - ESC[e][0];

/** Cada "ya voy": POOF + −1 AÑO + sacudida de 4 frames. */
export const YA_VOY = [166, 298, 422, 474, 526, 578];

/** Golpes de la olla */
export const GOLPES_OLLA = [228, 246, 262];

/** Guiño de la Mamá */
export const GUINO = 1028;

// Edad del Chato en el tiempo
const KEYS: [number, number][] = [
  [0, 19],
  [166, 19],
  [176, 20],
  [298, 20],
  [308, 21],
  [422, 21],
  [432, 25],
  [474, 25],
  [484, 34],
  [526, 34],
  [536, 47],
  [578, 47],
  [588, 63],
  [606, 63],
  [656, 78],
];

export const edadEn = (f: number): number => {
  if (f <= KEYS[0][0]) return KEYS[0][1];
  for (let i = 1; i < KEYS.length; i++) {
    const [f0, e0] = KEYS[i - 1];
    const [f1, e1] = KEYS[i];
    if (f <= f1) {
      if (e0 === e1) return e0;
      return interpolate(f, [f0, f1], [e0, e1], {easing: Easing.out(Easing.cubic)});
    }
  }
  return KEYS[KEYS.length - 1][1];
};
