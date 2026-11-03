import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {C, fundido} from '../estilo';
import {Fondo} from '../piezas/Fondo';
import {PeliculaAntigua} from '../piezas/PeliculaAntigua';
import {LineaVida} from '../piezas/LineaVida';
import {Titulo} from '../piezas/Titulo';
import {RotuloCapitulo} from '../piezas/RotuloCapitulo';
import {FichaEstudio} from '../piezas/FichaEstudio';
import {ProporcionVida} from '../piezas/Graficos';
import {Subtitulo} from '../piezas/Subtitulo';

// Vídeo 01 · primer minuto montado con material REAL de dominio público + motion graphics propios.
// Fuentes (archive.org, dominio público): The City (1939), Safety Last! (1923), Sleep for Health (1950), American Look (1958).
// Sin voz todavía: la narración del guion aparece como subtítulo de referencia.

type Plano =
  | {tipo: 'clip'; src: string; dur: number; rotulo?: string; intensidad?: number}
  | {tipo: 'grafico'; dur: number; nodo: React.ReactNode};

const clip = (src: string, dur: number, rotulo?: string, intensidad = 0.6): Plano => ({tipo: 'clip', src: `mente/clips/${src}.mp4`, dur, rotulo, intensidad});
const grafico = (dur: number, nodo: React.ReactNode): Plano => ({tipo: 'grafico', dur, nodo});

const PLANOS: Plano[] = [
  clip('c01_oficina_filas', 105, 'THE CITY · 1939'),
  clip('c02_maquina_escribir', 75),
  clip('c04_nino_dibujando', 105, 'AMERICAN LOOK · 1958', 0.75),
  clip('c03_ninos_juguetes', 90, undefined, 0.75),
  clip('c06_multitud', 90, 'THE CITY · 1939'),
  clip('c07_reloj', 150, 'SAFETY LAST! · 1923', 0.5),
  grafico(330, <LineaVida dur={330} compresion={170} />),
  clip('c08_colgado', 90, undefined, 0.5),
  clip('c09_dormir', 90, 'SLEEP FOR HEALTH · 1950'),
  clip('c10_rascacielos', 90),
  grafico(150, <Titulo lineas={['YOUR BRAIN IS LYING', 'ABOUT TIME']} acento="TIME" />),
  grafico(110, <RotuloCapitulo numero="01" nombre="The Shrinking Year" />),
  clip('c11_ojos_cerrados', 110, 'SLEEP FOR HEALTH · 1950'),
  grafico(270, <FichaEstudio dur={270} />),
  grafico(240, <ProporcionVida />),
];

// Narración de referencia (texto del guion) con su fotograma de inicio y fin.
const NARRACION: [number, number, string][] = [
  [8, 170, 'Think about last year. Really think about it.'],
  [182, 365, 'Now think about one summer when you were eight years old.'],
  [372, 460, 'That summer felt endless. Last year… barely happened.'],
  [470, 610, 'You’ve probably told yourself it’s just “getting older.” It isn’t.'],
  [620, 930, 'Your brain is quietly editing your life — cutting whole months out of your memory.'],
  [945, 1035, 'Today, we’re going to catch your brain in the act.'],
  [1040, 1125, 'You’ll see it invent time in your dreams…'],
  [1130, 1210, '…and show you a world that’s already in the past.'],
  [1480, 1585, 'Close your eyes and count to thirty in your head. Then check a stopwatch.'],
  [1600, 1860, 'A researcher asked three age groups to count off three minutes.'],
  [1870, 2100, 'When you’re ten, one year is a tenth of your life. At fifty, it’s a fiftieth.'],
];

export const DURACION_MINUTO01 = PLANOS.reduce((s, p) => s + p.dur, 0);

const Transicion: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{opacity: fundido(f, dur, 6, 6)}}>{children}</AbsoluteFill>;
};

export const Minuto01: React.FC = () => {
  let t = 0;
  return (
    <AbsoluteFill style={{background: C.noche}}>
      {PLANOS.map((p, i) => {
        const desde = t;
        t += p.dur;
        return (
          <Sequence key={i} from={desde} durationInFrames={p.dur}>
            <Transicion dur={p.dur}>
              {p.tipo === 'clip' ? (
                <PeliculaAntigua src={p.src} descripcion="" rotulo={p.rotulo} intensidad={p.intensidad} />
              ) : (
                <>
                  <Fondo />
                  {p.nodo}
                </>
              )}
            </Transicion>
          </Sequence>
        );
      })}
      {NARRACION.map(([a, b, txt], i) => (
        <Subtitulo key={i} desde={a} hasta={b} texto={txt} />
      ))}
    </AbsoluteFill>
  );
};
