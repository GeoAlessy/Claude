import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SERIF, rango} from '../estilo';

// Prueba interactiva "oddball": todos los círculos duran exactamente lo mismo (18 fotogramas),
// pero el rojo, el inesperado, parece durar más. La voz narra encima: "gray… gray… gray… red".
const SECUENCIA = ['g', 'g', 'g', 'r', 'g'];
const PASO = 24; // 18 visibles + 6 de hueco
const VISIBLE = 18;

export const PruebaOddball: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const inicio = 40;
  const idx = Math.floor((f - inicio) / PASO);
  const dentro = (f - inicio) % PASO;
  const mostrando = f >= inicio && idx < SECUENCIA.length && dentro < VISIBLE;
  const final = inicio + SECUENCIA.length * PASO + 10;

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: 1 - rango(f, dur - 15, dur)}}>
      <div style={{position: 'absolute', top: 150, fontFamily: MONO, fontSize: 24, letterSpacing: 8, color: C.oro, opacity: rango(f, 0, 15)}}>
        TRY THIS · WATCH THE CIRCLES
      </div>
      {mostrando && (
        <div
          style={{
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: SECUENCIA[idx] === 'r' ? C.rojo : '#9CA3AF',
            boxShadow: SECUENCIA[idx] === 'r' ? `0 0 90px ${C.rojo}` : 'none',
          }}
        />
      )}
      {f >= final && (
        <div style={{textAlign: 'center'}}>
          <div style={{fontFamily: SERIF, fontSize: 84, color: C.luz, opacity: rango(f, final, final + 15)}}>Which one lasted longer?</div>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 54, color: C.oro, marginTop: 24, opacity: rango(f, final + 40, final + 55)}}>
            They all lasted exactly the same.
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
