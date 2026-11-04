import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, SERIF, rango, suave} from '../estilo';
import {Teclea} from './TextoAnimado';

// Logo del canal (marca provisional): una esfera de reloj que se dibuja y, dentro, un ojo que se abre.
// El tiempo y la mente que lo mira. Dura ~1,3 s; `nombre` se añade cuando el canal tenga nombre.
export const LogoCanal: React.FC<{dur: number; nombre?: string}> = ({dur, nombre}) => {
  const f = useCurrentFrame();
  const R = 120;
  const anillo = rango(f, 0, 16);
  const abre = rango(f, 8, 20, 0, 1, suave);
  const pupila = rango(f, 14, 24);
  const destello = rango(f, 18, 22) * (1 - rango(f, 22, 34));
  const salida = 1 - rango(f, dur - 8, dur);
  const escala = 0.94 + 0.06 * rango(f, 0, dur);
  const ojo = (k: number) => `M ${-80} 0 Q 0 ${-58 * k} 80 0 Q 0 ${58 * k} ${-80} 0 Z`;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: salida, flexDirection: 'column'}}>
      <svg width={360} height={360} viewBox="-180 -180 360 360" style={{transform: `scale(${escala})`, overflow: 'visible'}}>
        <defs>
          <filter id="logoHalo" x="-1" y="-1" width="3" height="3">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>
        <circle r={R} fill="none" stroke={C.oro} strokeWidth={3} strokeDasharray={2 * Math.PI * R} strokeDashoffset={2 * Math.PI * R * (1 - anillo)} transform="rotate(-90)" />
        {Array.from({length: 12}, (_, i) => {
          const a = (i / 12) * 2 * Math.PI;
          const t = rango(f, 4 + i * 0.8, 10 + i * 0.8);
          return <line key={i} x1={Math.sin(a) * (R - 14)} y1={-Math.cos(a) * (R - 14)} x2={Math.sin(a) * (R - 4)} y2={-Math.cos(a) * (R - 4)} stroke={C.oro} strokeWidth={i % 3 === 0 ? 3 : 1.5} opacity={t * 0.8} />;
        })}
        <path d={ojo(Math.max(0.02, abre))} fill="none" stroke={C.luz} strokeWidth={2.5} opacity={rango(f, 6, 12)} />
        <circle r={22 * pupila} fill={C.oro} filter="url(#logoHalo)" opacity={0.6 + destello * 0.4} />
        <circle r={14 * pupila} fill={C.oro} />
        <circle r={5 * pupila} cx={-4} cy={-4} fill={C.luz} opacity={0.8} />
      </svg>
      {nombre && (
        <div style={{fontFamily: SERIF, fontSize: 44, letterSpacing: 10, color: C.luz, marginTop: 10}}>
          <Teclea texto={nombre.toUpperCase()} desde={12} cps={60} cursor="transparent" />
        </div>
      )}
    </AbsoluteFill>
  );
};
