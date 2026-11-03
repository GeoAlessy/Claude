import {loadFont} from '@remotion/fonts';
import {Easing, interpolate, staticFile} from 'remotion';

// Identidad visual del canal de "la ciencia inquietante de tu mente".
// Concepto: el cerebro como un cosmos nocturno. Fondo azul noche, recuerdos = luz dorada,
// un único acento rojo para lo inquietante. Fuentes OFL guardadas en public/mente/fonts.
loadFont({family: 'Cormorant Garamond', url: staticFile('mente/fonts/CormorantGaramond-500.woff2'), weight: '500'});
loadFont({family: 'Cormorant Garamond', url: staticFile('mente/fonts/CormorantGaramond-500i.woff2'), weight: '500', style: 'italic'});
loadFont({family: 'Cormorant Garamond', url: staticFile('mente/fonts/CormorantGaramond-700.woff2'), weight: '700'});
loadFont({family: 'Cormorant Garamond', url: staticFile('mente/fonts/CormorantGaramond-700i.woff2'), weight: '700', style: 'italic'});
loadFont({family: 'Inter', url: staticFile('mente/fonts/Inter-400.woff2'), weight: '400'});
loadFont({family: 'Inter', url: staticFile('mente/fonts/Inter-600.woff2'), weight: '600'});
loadFont({family: 'JetBrains Mono', url: staticFile('mente/fonts/JetBrainsMono-500.woff2'), weight: '500'});

export const SERIF = "'Cormorant Garamond', Georgia, serif";
export const SANS = "'Inter', system-ui, sans-serif";
export const MONO = "'JetBrains Mono', monospace";

export const C = {
  noche: '#05070F',
  nocheMedia: '#0B1024',
  tinta: '#16204A',
  niebla: 'rgba(160, 178, 230, 0.55)',
  nieblaSuave: 'rgba(160, 178, 230, 0.18)',
  luz: '#F4EFE6',
  oro: '#E9C27B',
  oroSuave: 'rgba(233, 194, 123, 0.35)',
  rojo: '#E5484D',
  luna: '#A9C4FF', // segundo acento del texto: luz de luna (lo inquietante), en vez del rojo
  gris: '#6B7280',
};

export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const suave = Easing.bezier(0.45, 0, 0.2, 1);

export function rango(f: number, a: number, b: number, de = 0, a2 = 1, easing = suave) {
  return interpolate(f, [a, b], [de, a2], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});
}

// Aparición y desaparición de una escena dentro de su duración.
export function fundido(f: number, dur: number, entrada = 15, salida = 15) {
  return Math.min(rango(f, 0, entrada), 1 - rango(f, dur - salida, dur));
}

// Aleatorio determinista (mismo resultado en cada fotograma y en cada render).
export function semilla(s: number) {
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
