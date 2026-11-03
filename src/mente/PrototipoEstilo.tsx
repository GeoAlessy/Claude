import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {C, MONO, SERIF, fundido, rango} from './estilo';
import {Fondo} from './piezas/Fondo';
import {LineaVida} from './piezas/LineaVida';
import {Titulo} from './piezas/Titulo';
import {RotuloCapitulo} from './piezas/RotuloCapitulo';
import {CerebroGalaxia} from './piezas/CerebroGalaxia';
import {FichaEstudio} from './piezas/FichaEstudio';
import {PruebaOddball} from './piezas/PruebaOddball';
import {Subtitulo} from './piezas/Subtitulo';

// Prototipo de estilo (≈52 s, 1920x1080) con las piezas clave del vídeo 01.
// Sin voz todavía: las líneas de narración salen como subtítulo para poder seguirlo.
const ESCENAS = {
  vida: {desde: 0, dur: 330},
  titulo: {desde: 330, dur: 150},
  capitulo: {desde: 480, dur: 120},
  cerebro: {desde: 600, dur: 360},
  estudio: {desde: 960, dur: 270},
  prueba: {desde: 1230, dur: 300},
  cierre: {desde: 1530, dur: 120},
};
export const DURACION_PROTO = 1650;

const Escena: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{opacity: fundido(f, dur, 12, 12)}}>{children}</AbsoluteFill>;
};

const Cierre: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
      <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: 10, color: C.oro, opacity: rango(f, 0, 20)}}>NEXT</div>
      <div style={{fontFamily: SERIF, fontSize: 76, color: C.luz, marginTop: 20, opacity: rango(f, 10, 35)}}>
        Your Brain Invents Memories You Never Lived
      </div>
    </AbsoluteFill>
  );
};

export const PrototipoEstilo: React.FC = () => {
  const E = ESCENAS;
  return (
    <AbsoluteFill style={{background: C.noche}}>
      <Fondo />
      <Sequence from={E.vida.desde} durationInFrames={E.vida.dur}>
        <Escena dur={E.vida.dur}>
          <LineaVida dur={E.vida.dur} compresion={190} />
        </Escena>
      </Sequence>
      <Sequence from={E.titulo.desde} durationInFrames={E.titulo.dur}>
        <Escena dur={E.titulo.dur}>
          <Titulo lineas={['YOUR BRAIN IS LYING', 'ABOUT TIME']} acento="TIME" />
        </Escena>
      </Sequence>
      <Sequence from={E.capitulo.desde} durationInFrames={E.capitulo.dur}>
        <Escena dur={E.capitulo.dur}>
          <RotuloCapitulo numero="01" nombre="The Shrinking Year" />
        </Escena>
      </Sequence>
      <Sequence from={E.cerebro.desde} durationInFrames={E.cerebro.dur}>
        <Escena dur={E.cerebro.dur}>
          <CerebroGalaxia dur={E.cerebro.dur} cambio={190} />
        </Escena>
      </Sequence>
      <Sequence from={E.estudio.desde} durationInFrames={E.estudio.dur}>
        <Escena dur={E.estudio.dur}>
          <FichaEstudio dur={E.estudio.dur} />
        </Escena>
      </Sequence>
      <Sequence from={E.prueba.desde} durationInFrames={E.prueba.dur}>
        <Escena dur={E.prueba.dur}>
          <PruebaOddball dur={E.prueba.dur} />
        </Escena>
      </Sequence>
      <Sequence from={E.cierre.desde} durationInFrames={E.cierre.dur}>
        <Escena dur={E.cierre.dur}>
          <Cierre />
        </Escena>
      </Sequence>

      {/* narración de referencia (en el vídeo real la dice la voz) */}
      <Subtitulo desde={20} hasta={150} texto="That summer felt endless. Last year… barely happened." />
      <Subtitulo desde={160} hasta={320} texto="It isn't just “getting older.” Your brain is compressing your life." />
      <Subtitulo desde={620} hasta={790} texto="As a child, almost everything was a first — and your brain recorded it all." />
      <Subtitulo desde={800} hasta={950} texto="Same commute. Same desk. Same week. Your brain stops writing it down." />
      <Subtitulo desde={1250} hasta={1400} texto="Watch the circles. Gray… gray… gray… red." />
    </AbsoluteFill>
  );
};
