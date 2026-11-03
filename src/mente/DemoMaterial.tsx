import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {C} from './estilo';
import {Fondo} from './piezas/Fondo';
import {PeliculaAntigua} from './piezas/PeliculaAntigua';
import {TarjetaTestimonio} from './piezas/TarjetaTestimonio';
import {Subtitulo} from './piezas/Subtitulo';

// Demo (16 s) de las piezas para material real: filtro de película antigua, ranura de clip pendiente
// y tarjeta de testimonio. Regla del canal: el código nunca dibuja personas; las personas salen de material real.
export const DURACION_DEMO_MATERIAL = 480;

export const DemoMaterial: React.FC = () => (
  <AbsoluteFill style={{background: C.noche}}>
    <Sequence from={0} durationInFrames={180}>
      <PeliculaAntigua descripcion="Dominio público: 'Safety Last!' (1923) — Harold Lloyd colgado del reloj gigante, sin música" rotulo="SAFETY LAST! · 1923" intensidad={0.6} />
    </Sequence>
    <Sequence from={180} durationInFrames={70}>
      <PeliculaAntigua descripcion="Stock (Pexels): office worker at a desk, gray morning light — se gradúa con el filtro suave" intensidad={0.3} />
    </Sequence>
    <Sequence from={250} durationInFrames={230}>
      <Fondo />
      <TarjetaTestimonio
        dur={230}
        texto="I swear my twenties lasted forever, but my thirties went by in what feels like two years."
        origen="Example layout · in the real video this will be a real post, paraphrased, without usernames"
      />
    </Sequence>
    <Subtitulo desde={15} hasta={170} texto="That summer felt endless." />
  </AbsoluteFill>
);
