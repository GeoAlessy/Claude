import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, SERIF, rango} from '../estilo';

// Título del vídeo: cada letra emerge desde el desenfoque, como un recuerdo que se enfoca.
export const Titulo: React.FC<{lineas: string[]; acento?: string}> = ({lineas, acento}) => {
  const f = useCurrentFrame();
  let n = 0;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 6}}>
      {lineas.map((linea, li) => (
        <div key={li} style={{fontFamily: SERIF, fontSize: li === 0 ? 92 : 120, color: C.luz, letterSpacing: 6, lineHeight: 1.05}}>
          {linea.split('').map((ch, i) => {
            const k = n++;
            const t = rango(f, 8 + k * 1.6, 30 + k * 1.6);
            const esAcento = acento && linea.includes(acento) && linea.indexOf(acento) <= i && i < linea.indexOf(acento) + acento.length;
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  opacity: t,
                  filter: `blur(${(1 - t) * 14}px)`,
                  transform: `translateY(${(1 - t) * 18}px)`,
                  color: esAcento ? C.oro : C.luz,
                  whiteSpace: 'pre',
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
      ))}
    </AbsoluteFill>
  );
};
