import React from 'react';
import {AbsoluteFill} from 'remotion';
import {SERIF} from '../estilo';
import {Escribe} from './TextoAnimado';

// Título del vídeo: se escribe sílaba a sílaba desde el desenfoque, como un recuerdo que se enfoca;
// la palabra de acento termina en dorado, negrita y con un destello.
export const Titulo: React.FC<{lineas: string[]; acento?: string}> = ({lineas, acento}) => {
  let desde = 8;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 6}}>
      {lineas.map((linea, li) => {
        const texto = acento ? linea.replace(acento, `*${acento}*`) : linea;
        const d = desde;
        desde += linea.split(' ').length * 5 + 4;
        return (
          <div key={li} style={{fontFamily: SERIF, fontSize: li === 0 ? 92 : 120, letterSpacing: 6, lineHeight: 1.05}}>
            <Escribe texto={texto} desde={d} ritmo={5} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
