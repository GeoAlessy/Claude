import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SERIF, rango} from '../estilo';
import {Escribe, Teclea} from './TextoAnimado';

// Rótulo de capítulo: número en mono, una línea fina que se dibuja y el nombre en serif.
export const RotuloCapitulo: React.FC<{numero: string; nombre: string}> = ({numero, nombre}) => {
  const f = useCurrentFrame();
  const linea = rango(f, 5, 35);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
      <div style={{fontFamily: MONO, fontSize: 26, color: C.oro, letterSpacing: 10}}>
        <Teclea texto={`CHAPTER ${numero}`} desde={2} />
      </div>
      <div style={{width: 520 * linea, height: 1, background: C.niebla, margin: '28px 0'}} />
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 88,
          color: C.luz,
          letterSpacing: 4,
        }}
      >
        <Escribe texto={nombre} desde={20} ritmo={6} />
      </div>
    </AbsoluteFill>
  );
};
