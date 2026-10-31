import {interpolate, random} from 'remotion';

/** Cierre de párpado 0 (abierto) → 1 (cerrado). Parpadea cada 2–4 s. */
export const parpadeo = (frame: number, seed: number | string): number => {
  let t = Math.floor(random(`p0-${seed}`) * 50) + 10;
  let i = 0;
  while (t <= frame + 6) {
    const d = frame - t;
    if (d >= 0 && d < 6) {
      return d < 3 ? d / 2.5 : (6 - d) / 3;
    }
    t += 60 + Math.floor(random(`p-${seed}-${i}`) * 60);
    i++;
  }
  return 0;
};

/** Respiración idle: escala 1.00 ↔ 1.02 */
export const respiracion = (frame: number, seed = 0): number =>
  1.01 + 0.01 * Math.sin(((frame + seed * 13) / 30) * Math.PI * 2 * 0.4);

/** Apertura de boca al hablar (0..1), pseudo-sílabas. */
export const bocaHablando = (frame: number, seed = 0): number => {
  const a = Math.abs(Math.sin((frame + seed) * 0.9));
  const b = Math.abs(Math.sin((frame + seed) * 0.37 + 1.3));
  return Math.min(1, 0.15 + a * 0.6 + b * 0.35);
};

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const lerpColor = (a: string, b: string, t: number): string => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (p: number, s: number) => (p >> s) & 255;
  const mix = (s: number) => Math.round(ch(pa, s) + (ch(pb, s) - ch(pa, s)) * t);
  return `#${((1 << 24) | (mix(16) << 16) | (mix(8) << 8) | mix(0)).toString(16).slice(1)}`;
};

/** Interpolación de color por tramos. */
export const colorPorTramos = (v: number, xs: number[], cols: string[]): string => {
  if (v <= xs[0]) return cols[0];
  for (let i = 1; i < xs.length; i++) {
    if (v <= xs[i]) {
      const t = interpolate(v, [xs[i - 1], xs[i]], [0, 1]);
      return lerpColor(cols[i - 1], cols[i], t);
    }
  }
  return cols[cols.length - 1];
};
