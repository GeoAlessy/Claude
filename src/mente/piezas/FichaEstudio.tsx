import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, MONO, SANS, SERIF, rango} from '../estilo';
import {Escribe, Teclea} from './TextoAnimado';

// Ficha de estudio: cita la fuente en pantalla y anima los datos.
// Datos aproximados del estudio de Mangan (1996): tres grupos de edad cuentan "3 minutos".
const BARRAS = [
  {grupo: 'AGES 19–24', seg: 180, txt: '≈ 3:00'},
  {grupo: 'AGES 45–50', seg: 196, txt: '≈ 3:16'},
  {grupo: 'AGES 60–70', seg: 220, txt: '≈ 3:40'},
];

export const FichaEstudio: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const entrada = rango(f, 0, 20);
  const max = 240;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: entrada * (1 - rango(f, dur - 15, dur))}}>
      <div
        style={{
          width: 1300,
          padding: '56px 72px',
          border: `1px solid ${C.nieblaSuave}`,
          background: 'rgba(11, 16, 36, 0.72)',
          borderRadius: 14,
          transform: `translateY(${(1 - entrada) * 30}px)`,
        }}
      >
        <div style={{fontFamily: MONO, fontSize: 20, letterSpacing: 6, color: C.oro}}>
          <Teclea texto="THE STUDY" desde={8} />
        </div>
        <div style={{fontFamily: SERIF, fontSize: 56, color: C.luz, margin: '10px 0 6px'}}>
          <Escribe texto={'"Count *three minutes* in your head."'} desde={14} ritmo={4} />
        </div>
        <div style={{fontFamily: SANS, fontSize: 22, color: C.niebla, marginBottom: 46}}>
          <Teclea texto="What each age group actually counted, on average" desde={30} cps={60} cursor="transparent" />
        </div>
        {BARRAS.map((b, i) => {
          const t = rango(f, 30 + i * 22, 75 + i * 22);
          const pasado = b.seg > 180;
          return (
            <div key={b.grupo} style={{display: 'flex', alignItems: 'center', marginBottom: 26}}>
              <div style={{width: 230, fontFamily: MONO, fontSize: 22, color: C.niebla}}>{b.grupo}</div>
              <div style={{flex: 1, position: 'relative', height: 34}}>
                <div style={{position: 'absolute', left: `${(180 / max) * 100}%`, top: -10, bottom: -10, width: 2, background: C.luz, opacity: 0.5}} />
                <div
                  style={{
                    width: `${(b.seg / max) * 100 * t}%`,
                    height: 34,
                    borderRadius: 6,
                    background: pasado && t > 0.85 ? `linear-gradient(90deg, ${C.oro} ${(180 / b.seg) * 100}%, ${C.rojo} ${(180 / b.seg) * 100}%)` : C.oro,
                  }}
                />
              </div>
              <div style={{width: 130, textAlign: 'right', fontFamily: MONO, fontSize: 26, color: pasado ? C.rojo : C.luz, opacity: rango(f, 60 + i * 22, 80 + i * 22)}}>
                {b.txt}
              </div>
            </div>
          );
        })}
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 30, fontFamily: SANS, fontSize: 18, color: C.gris}}>
          <Teclea texto="Source: Mangan, P. (1996) · small study, approximate values" desde={90} cps={70} cursor="transparent" />
          <span style={{color: C.niebla}}>│ real 3:00</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
