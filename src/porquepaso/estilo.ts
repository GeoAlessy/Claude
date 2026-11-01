import {loadFont} from '@remotion/fonts';
import {interpolate, staticFile, Easing} from 'remotion';

// Identidad visual de "¿Por qué pasó?": HUD técnico tipo holograma.
// Fuentes OFL guardadas en public/fonts/porquepaso para que el render funcione sin conexión.
loadFont({family: 'Inter Display', url: staticFile('fonts/porquepaso/InterDisplay-Black.otf'), weight: '900'});
loadFont({family: 'Inter', url: staticFile('fonts/porquepaso/Inter-SemiBold.otf'), weight: '600'});
loadFont({family: 'Inter', url: staticFile('fonts/porquepaso/Inter-Bold.otf'), weight: '700'});
loadFont({family: 'JetBrains Mono', url: staticFile('fonts/porquepaso/JetBrainsMono-Bold.ttf'), weight: '700'});

export const TITULAR = "'Inter Display', 'Inter', sans-serif";
export const TEXTO = "'Inter', sans-serif";
export const MONO = "'JetBrains Mono', monospace";

export const C = {
  cian: '#22D3EE',
  cianSuave: 'rgba(34, 211, 238, 0.35)',
  rojo: '#FF3B47',
  verde: '#34D399',
  ambar: '#FBBF24',
  vidrio: 'rgba(4, 10, 18, 0.72)',
  blanco: '#F8FAFC',
};

export type Punto = [number, number];
export type Clave<T> = [frame: number, valor: T];

const suave = Easing.inOut(Easing.cubic);

// Interpola números o puntos entre fotogramas clave (para seguir objetos en el video).
export function seguir(frame: number, claves: Clave<number>[]): number {
  return interpolate(frame, claves.map((k) => k[0]), claves.map((k) => k[1]), {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: suave,
  });
}

export function seguirPunto(frame: number, claves: Clave<Punto>[]): Punto {
  return [
    seguir(frame, claves.map(([f, p]) => [f, p[0]])),
    seguir(frame, claves.map(([f, p]) => [f, p[1]])),
  ];
}
