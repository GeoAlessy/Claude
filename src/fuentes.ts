import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// "Baloo 2" ExtraBold (Google Fonts, licencia OFL) guardada localmente en public/fonts
// para que el render funcione sin conexión.
export const FAMILIA = 'Baloo 2';
// En SVG/CSS el nombre debe ir entre comillas porque contiene un número.
export const FUENTE = `'${FAMILIA}', 'Arial Rounded MT Bold', sans-serif`;

loadFont({family: FAMILIA, url: staticFile('fonts/Baloo2-ExtraBold-latin.woff2'), weight: '800'});
loadFont({
  family: FAMILIA,
  url: staticFile('fonts/Baloo2-ExtraBold-latin-ext.woff2'),
  weight: '800',
  unicodeRange: 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
});
