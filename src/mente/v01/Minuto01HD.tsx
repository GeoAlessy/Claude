import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, fundido} from '../estilo';
import {Fondo} from '../piezas/Fondo';
import {PeliculaAntigua} from '../piezas/PeliculaAntigua';
import {LineaVida} from '../piezas/LineaVida';
import {Titulo} from '../piezas/Titulo';
import {RotuloCapituloCine, golpeRotulo} from '../piezas/RotuloCapituloCine';
import {CerebroGalaxia} from '../piezas/CerebroGalaxia';
import {PruebaContar} from '../piezas/PruebaContar';
import {LogoCanal} from '../piezas/LogoCanal';
import {NARRACION} from './narracion';

// Vídeo 01 · primer minuto (gancho + inicio del cap. 1) en HD, con voz (Fish Audio "Psychological"), música y efectos.
// Cada corte está anclado a una palabra de la narración: si se regraba la voz, el montaje se reajusta solo.
// Material: masters HD de Prelinger (dominio público), Safety Last! 1080p (dominio público, sin su música),
// stock 1080p de Mixkit (licencia gratuita) y gráficos propios. Registro en canal-mente/fuentes-material-v01.md.

import {A, P, fin, inicio, tiemposFrase, volMusica, volSfx} from './montaje';
import {FraseClave} from '../piezas/TextoAnimado';

const ROTULO_01 = {
  numero: '01',
  nombre: 'The Shrinking Year',
  flashes: [{src: 'h01_columpio', inicio: 1}, {src: 'h03_tarta_cumple'}, {src: 'c07_reloj', inicio: 1}, {src: 'h02_nina_corriendo'}],
  dentro: {src: 's08_relojes_antiguos', inicio: 2},
  tono: 'rapido' as const,
};

type Plano = {desde: number; hasta: number; nodo: React.ReactNode};
const arch = (src: string, rotulo?: string, intensidad = 0.4) => (
  <PeliculaAntigua src={`mente/clips/${src}.mp4`} descripcion="" rotulo={rotulo} intensidad={intensidad} />
);
const stock = (src: string) => <PeliculaAntigua src={`mente/clips/${src}.mp4`} descripcion="" modo="stock" />;
const graf = (n: React.ReactNode) => (
  <>
    <Fondo />
    {n}
  </>
);

const T_TITULO = A(P('gancho_05', 'scientists'));
const T_LOGO = fin('gancho_05') + 24; // el título se queda solo 0,8 s tras la voz
const T_ROTULO = inicio('cap01_01');
const T_PRUEBA = A(P('cap01_01', 'pause'));
export const DURACION_MINUTO01HD = fin('cap01_02') + 45;

const PLANOS: Plano[] = [
  {desde: 0, hasta: A(P('gancho_01', 'really')), nodo: stock('s07_pantalla_gafas')},
  {desde: A(P('gancho_01', 'really')), hasta: A(P('gancho_01', 'now')), nodo: stock('s02_inquieto_cama')},
  {desde: A(P('gancho_01', 'now')), hasta: A(P('gancho_02', 'that')), nodo: arch('h01_columpio', 'HOME MOVIE · 1950')},
  {desde: A(P('gancho_02', 'that')), hasta: A(P('gancho_02', 'last')), nodo: arch('h02_nina_corriendo')},
  {desde: A(P('gancho_02', 'last')), hasta: A(P('gancho_03', "you've")), nodo: stock('s01_oficina')},
  {desde: A(P('gancho_03', "you've")), hasta: A(P('gancho_03', 'it')), nodo: arch('h04_manhattan_cruce', 'NEW YORK · 1945', 0.35)},
  {
    desde: A(P('gancho_03', 'it')),
    hasta: A(P('gancho_04', 'today')),
    nodo: graf(<LineaVida dur={A(P('gancho_04', 'today')) - A(P('gancho_03', 'it'))} compresion={P('gancho_03', 'compressing') - A(P('gancho_03', 'it'))} />),
  },
  {desde: A(P('gancho_04', 'today')), hasta: A(P('gancho_04', "you'll")), nodo: graf(<CerebroGalaxia dur={150} cambio={9999} />)},
  {desde: A(P('gancho_04', "you'll")), hasta: A(P('gancho_04', 'make')), nodo: arch('c07_reloj', 'SAFETY LAST! · 1923', 0.35)},
  {desde: A(P('gancho_04', 'make')), hasta: A(P('gancho_04', 'lose')), nodo: stock('s04_festival')},
  {desde: A(P('gancho_04', 'lose')), hasta: A(P('gancho_04', 'erase')), nodo: stock('s05_cueva')},
  {desde: A(P('gancho_04', 'erase')), hasta: A(P('gancho_04', 'invent')), nodo: arch('h05_manhattan_multitud', undefined, 0.35)},
  {desde: A(P('gancho_04', 'invent')), hasta: A(P('gancho_04', 'and', 1)), nodo: stock('s06_dormir_noche')},
  {desde: A(P('gancho_04', 'and', 1)), hasta: A(P('gancho_05', 'and')), nodo: arch('c08_colgado', undefined, 0.35)},
  {desde: A(P('gancho_05', 'and')), hasta: T_TITULO, nodo: arch('h03_tarta_cumple', 'HOME MOVIE · 1950s')},
  {desde: T_TITULO, hasta: T_LOGO, nodo: graf(<Titulo lineas={['YOUR BRAIN IS LYING', 'TO YOU ABOUT TIME']} acento="TIME" />)},
  {desde: T_LOGO, hasta: T_ROTULO, nodo: graf(<LogoCanal dur={T_ROTULO - T_LOGO} />)},
  {desde: T_ROTULO, hasta: T_PRUEBA, nodo: <RotuloCapituloCine {...ROTULO_01} dur={T_PRUEBA - T_ROTULO} />},
  {
    desde: T_PRUEBA,
    hasta: DURACION_MINUTO01HD,
    nodo: graf(
      <PruebaContar
        cerrar={P('cap01_02', 'close') - T_PRUEBA}
        crono={P('cap01_02', 'stopwatch') - T_PRUEBA}
        fallos={P('cap01_02', 'most') - T_PRUEBA}
        comentar={P('cap01_02', 'drop') - T_PRUEBA}
      />,
    ),
  },
];

// Efectos de sonido: [archivo, fotograma, volumen, duración opcional en fotogramas]
const ARCHIVO_PLANOS = [2, 3, 5, 8, 11, 13, 14]; // índices en PLANOS
const SFX: [string, number, number, number?][] = [
  ['tictac_reloj', 0, 0.28, P('gancho_02', 'that')],
  ['golpe_grave', P('gancho_03', "isn't"), 0.7],
  ['rebobinar', P('gancho_03', 'compressing') - 20, 0.55],
  ['pagina_papel', P('gancho_03', 'months'), 0.5],
  ['whoosh_suave', A(P('gancho_04', 'today')) - 8, 0.45],
  ['whoosh_suave', A(P('gancho_04', "you'll")) - 8, 0.35],
  ['cueva_goteo', A(P('gancho_04', 'lose')), 0.5, A(P('gancho_04', 'erase')) - A(P('gancho_04', 'lose')) + 20],
  ['riser_tension', P('gancho_05', 'and') - 10, 0.4],
  ['golpe_grave', T_TITULO, 0.75],
  ['campana_sueno', T_LOGO + 6, 0.5],
  ...ROTULO_01.flashes.map((_, k) => ['tick_dato', T_ROTULO + k * 5, 0.8] as [string, number, number]),
  ['golpe_grave', T_ROTULO + golpeRotulo(ROTULO_01.flashes.length), 0.85],
  ['tick_dato', P('cap01_02', 'close'), 0.5],
  ['latido', P('cap01_02', 'close') + 10, 0.35, P('cap01_02', 'most') - P('cap01_02', 'close')],
  ['tick_dato', P('cap01_02', 'most') + 0, 0.45],
  ['tick_dato', P('cap01_02', 'most') + 8, 0.45],
  ['tick_dato', P('cap01_02', 'most') + 16, 0.45],
  ['tick_dato', P('cap01_02', 'drop'), 0.5],
  // proyector suave bajo los planos de archivo
  ...ARCHIVO_PLANOS.map((i) => ['proyector', PLANOS[i].desde, 0.22, PLANOS[i].hasta - PLANOS[i].desde] as [string, number, number, number]),
];

// Frases clave del narrador escritas en pantalla, al ritmo exacto de su voz (sobre la imagen, con velo oscuro).
type Frase = {id: string; texto: string; hasta: number};
const FRASES: Frase[] = [
  {id: 'gancho_02', texto: 'That summer felt *endless.*', hasta: A(P('gancho_02', 'last'))},
  {id: 'gancho_02', texto: 'Last year… !barely! happened.', hasta: A(P('gancho_03', "you've"))},
];

// Música de fondo con "ducking": baja cuando habla el narrador y sube en las pausas.
const MUSICA = {src: 'mente/musica/p1_cz_is_that_you.mp3', inicio: 0, alta: 0.42, baja: 0.13};

const Transicion: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{opacity: fundido(f, dur, 4, 4)}}>{children}</AbsoluteFill>;
};

export const Minuto01HD: React.FC = () => (
  <AbsoluteFill style={{background: C.noche}}>
    {PLANOS.map((p, i) => (
      <Sequence key={i} from={p.desde} durationInFrames={Math.max(1, p.hasta - p.desde)}>
        <Transicion dur={p.hasta - p.desde}>{p.nodo}</Transicion>
      </Sequence>
    ))}
    {NARRACION.filter((l) => l.desde < DURACION_MINUTO01HD).map((l) => (
      <Sequence key={l.id} from={l.desde} durationInFrames={l.dur + 10}>
        <Audio src={staticFile(l.audio)} />
      </Sequence>
    ))}
    {FRASES.map((fr, i) => {
      const t = tiemposFrase(fr.id, fr.texto);
      const desde = t[0] - 8;
      return (
        <Sequence key={`f${i}`} from={desde} durationInFrames={fr.hasta - desde}>
          <FraseClave texto={fr.texto} tiempos={t.map((x) => x - desde)} dur={fr.hasta - desde} sobreImagen />
        </Sequence>
      );
    })}
    <Audio src={staticFile(MUSICA.src)} startFrom={MUSICA.inicio} volume={volMusica(MUSICA.alta, MUSICA.baja)} />
    {SFX.map(([s, desde, vol, dur], i) => (
      <Sequence key={`s${i}`} from={Math.max(0, desde)} durationInFrames={dur ?? 150}>
        <Audio src={staticFile(`mente/sfx/${s}.mp3`)} volume={volSfx(s, vol, Math.max(0, desde))} loop={dur !== undefined} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
