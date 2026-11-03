import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SANS, SERIF, rango} from '../estilo';

// Testimonio real (parafraseado de un post público, sin usuario ni logotipos) con diseño propio del canal.
// El texto se escribe palabra a palabra al ritmo de la voz que lo lee.
type Props = {
  texto: string;
  origen: string; // p. ej. "Paraphrased from a public Reddit post"
  dur: number;
  inicio?: number;
  palabrasPorSegundo?: number;
};

export const TarjetaTestimonio: React.FC<Props> = ({texto, origen, dur, inicio = 12, palabrasPorSegundo = 2.6}) => {
  const f = useCurrentFrame();
  const palabras = texto.split(' ');
  const visibles = Math.floor(Math.max(0, f - inicio) / (30 / palabrasPorSegundo));
  const entrada = rango(f, 0, 18);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: entrada * (1 - rango(f, dur - 12, dur))}}>
      <div
        style={{
          width: 1180,
          padding: '60px 76px 52px',
          borderRadius: 16,
          background: 'rgba(11, 16, 36, 0.82)',
          border: `1px solid ${C.nieblaSuave}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
          transform: `translateY(${(1 - entrada) * 24}px)`,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28}}>
          <div style={{width: 10, height: 10, borderRadius: 5, background: C.oro}} />
          <div style={{fontFamily: MONO, fontSize: 20, letterSpacing: 6, color: C.oro}}>A REAL ACCOUNT</div>
        </div>
        <div style={{fontFamily: SERIF, fontSize: 52, lineHeight: 1.3, color: C.luz}}>
          <span style={{color: C.oro}}>“</span>
          {palabras.map((p, i) => (
            <span key={i} style={{opacity: i < visibles ? 1 : 0.12, transition: 'none'}}>
              {p}{' '}
            </span>
          ))}
          <span style={{color: C.oro, opacity: visibles >= palabras.length ? 1 : 0}}>”</span>
        </div>
        <div style={{fontFamily: SANS, fontSize: 18, color: C.gris, marginTop: 34}}>{origen}</div>
      </div>
    </AbsoluteFill>
  );
};
