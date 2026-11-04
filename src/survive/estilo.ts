import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Identidad de "Could You Survive It?": cuaderno + plumón sobre clips de caricatura.
// Fuentes OFL guardadas en public/fonts (render sin conexión).
loadFont({family: 'Permanent Marker', url: staticFile('fonts/PermanentMarker-latin.woff2'), weight: '400'});
loadFont({family: 'Caveat', url: staticFile('fonts/Caveat-Bold-latin.woff2'), weight: '700'});
loadFont({family: 'Baloo 2', url: staticFile('fonts/Baloo2-ExtraBold-latin.woff2'), weight: '800'});

export const MARCADOR = "'Permanent Marker', 'Comic Sans MS', cursive";
export const MANO = "'Caveat', cursive";
export const SUB = "'Baloo 2', 'Arial Rounded MT Bold', sans-serif";

export const S = {
  papel: '#F4ECD8',
  papelClaro: '#FFFDF4',
  linea: 'rgba(70, 120, 200, 0.22)',
  margen: 'rgba(220, 60, 60, 0.45)',
  tinta: '#1B1B1F',
  amarillo: '#FFD90F', // amarillo Simpson
  rojo: '#F43F3F',
  verde: '#22C55E',
  azul: '#2F7BF6',
  blanco: '#FFFFFF',
};

// Panel del clip (coordenadas de la pantalla 1080x1920)
export const PANEL = {x: 0, y: 300, w: 1080, h: 1350};
