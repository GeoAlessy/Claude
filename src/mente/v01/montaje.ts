import {NARRACION} from './narracion';
import {palabrasLimpias} from '../piezas/TextoAnimado';

// Utilidades de montaje del vídeo 01: todo se ancla a las palabras de la narración.

export const linea = (id: string) => {
  const l = NARRACION.find((x) => x.id === id);
  if (!l) throw new Error(`Falta la línea ${id}`);
  return l;
};
export const limpia = (w: string) => w.toLowerCase().replace(/[’]/g, "'").replace(/[^a-z0-9']/g, '');
/** Fotograma (global) en que empieza la palabra `w` (n-ésima aparición) de la línea `id`. */
export const P = (id: string, w: string, n = 0) => {
  const l = linea(id);
  const hits = l.palabras.filter(([p]) => limpia(p) === limpia(w));
  if (!hits[n]) throw new Error(`No encuentro "${w}" en ${id}`);
  return l.desde + Math.round(hits[n][1] * 30);
};
/** Fotograma (global) en que TERMINA la palabra `w`. */
export const Pfin = (id: string, w: string, n = 0) => {
  const l = linea(id);
  const hits = l.palabras.filter(([p]) => limpia(p) === limpia(w));
  if (!hits[n]) throw new Error(`No encuentro "${w}" en ${id}`);
  return l.desde + Math.round(hits[n][2] * 30);
};
export const inicio = (id: string) => linea(id).desde;
export const fin = (id: string) => linea(id).desde + linea(id).dur;
export const A = (n: number) => n - 4; // corte un pelín antes de la palabra

/**
 * Tiempos (globales) de cada palabra de una frase dicha en la línea `id`, para escribirla al ritmo de la voz.
 * La frase puede llevar marcado (*acento*). Si alguna palabra no se encuentra (cifras, p. ej.), se interpola.
 */
export const tiemposFrase = (id: string, frase: string): number[] => {
  const l = linea(id);
  const voz = l.palabras.map(([p, a]) => [limpia(p), l.desde + Math.round(a * 30)] as const);
  const ps = palabrasLimpias(frase).map(limpia);
  // busca la mejor posición de arranque (la que más palabras casa en orden)
  let mejor = {i: 0, aciertos: -1};
  for (let i = 0; i < voz.length; i++) {
    let k = i;
    let ac = 0;
    for (const p of ps) {
      const j = voz.findIndex(([w], idx) => idx >= k && idx < k + 3 && w === p);
      if (j >= 0) (ac++, (k = j + 1));
    }
    if (voz[i][0] === ps[0] && ac > mejor.aciertos) mejor = {i, aciertos: ac};
  }
  if (mejor.aciertos < 0) throw new Error(`No encuentro la frase "${frase}" en ${id}`);
  const out: (number | null)[] = [];
  let k = mejor.i;
  for (const p of ps) {
    const j = voz.findIndex(([w], idx) => idx >= k && idx < k + 3 && w === p);
    if (j >= 0) (out.push(voz[j][1]), (k = j + 1));
    else out.push(null);
  }
  // interpola los huecos
  return out.map((v, i) => {
    if (v !== null) return v;
    const prev = out.slice(0, i).reverse().find((x) => x !== null) ?? out.find((x) => x !== null)!;
    return (prev as number) + 6;
  });
};

// ---------------- Audio ----------------
// Regla del canal: los efectos NUNCA suenan más fuerte que la voz (voz a -16 LUFS).
// Los archivos de efectos ya vienen normalizados a -18 LUFS (scripts/mente_audio_gratis.sh);
// mientras habla el narrador bajan 6 dB más, y en las pausas suenan a su nivel.
const BAJO_VOZ = 0.5; // ≈ -6 dB

export const HABLA = NARRACION.map((l) => [l.desde, l.desde + l.dur] as const);
/** Distancia en fotogramas al tramo de voz más cercano (0 si está hablando). */
export const distanciaVoz = (f: number) => {
  let d = Infinity;
  for (const [a, b] of HABLA) {
    if (f >= a && f <= b) return 0;
    d = Math.min(d, Math.abs(f - a), Math.abs(f - b));
  }
  return d;
};
const factorVoz = (fGlobal: number) => BAJO_VOZ + (1 - BAJO_VOZ) * Math.min(1, distanciaVoz(fGlobal) / 10);

/** Volumen de un efecto (callback de Remotion): `nivel` 0–1 relativo, `desde` = fotograma global del Sequence. */
export const volSfx = (_s: string, nivel: number, desde: number) => (f: number) => Math.min(1, nivel) * factorVoz(desde + f);

/** Música con "ducking": baja cuando habla el narrador y sube en las pausas. */
export const volMusica = (alta: number, baja: number, desdeGlobal = 0, entrada = 45) => (f: number) => {
  const g = desdeGlobal + f;
  const t = Math.min(1, distanciaVoz(g) / 12);
  return (baja + (alta - baja) * t) * Math.min(1, f / entrada);
};
