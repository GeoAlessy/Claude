import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {C} from './estilo';
import {Fondo} from './piezas/Fondo';
import {CalendariosSiffre, CompuertaAtencion, CurvaDecada, DosRelojes, ExperimentoCaida, ProporcionVida, PruebaFlashLag, RelojCronostasis} from './piezas/Graficos';

// Galería de las piezas de motion graphics del vídeo 01, una tras otra (8 s cada una).
const PIEZAS = [ProporcionVida, CurvaDecada, ExperimentoCaida, CompuertaAtencion, CalendariosSiffre, RelojCronostasis, PruebaFlashLag, DosRelojes];
const DUR = 240;
export const DURACION_GALERIA = PIEZAS.length * DUR;

export const GaleriaPiezas: React.FC = () => (
  <AbsoluteFill style={{background: C.noche}}>
    <Fondo />
    {PIEZAS.map((P, i) => (
      <Sequence key={i} from={i * DUR} durationInFrames={DUR}>
        <P />
      </Sequence>
    ))}
  </AbsoluteFill>
);
