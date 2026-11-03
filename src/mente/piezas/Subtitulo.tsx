import React from 'react';
import {useCurrentFrame} from 'remotion';
import {C, SANS, rango} from '../estilo';

// Línea de narración en pantalla (en el vídeo real la dirá la voz; aquí sirve para seguir el prototipo).
export const Subtitulo: React.FC<{texto: string; desde: number; hasta: number}> = ({texto, desde, hasta}) => {
  const f = useCurrentFrame();
  const o = Math.min(rango(f, desde, desde + 10), 1 - rango(f, hasta - 10, hasta));
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 90,
        width: '100%',
        textAlign: 'center',
        fontFamily: SANS,
        fontSize: 34,
        color: C.luz,
        opacity: o * 0.92,
        letterSpacing: 0.3,
        textShadow: '0 2px 14px rgba(0,0,0,0.9)',
      }}
    >
      {texto}
    </div>
  );
};
