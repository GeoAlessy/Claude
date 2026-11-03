import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, FPS, MONO, SANS, SERIF, rango, suave} from '../estilo';
import {Escribe, Teclea} from './TextoAnimado';

// Prueba 01 del capítulo 1: "cierra los ojos y cuenta hasta 30".
// La voz guía toda la prueba (nunca hay silencio): este gráfico solo acompaña cada fase.
// Fotogramas relativos al inicio de la pieza:
//   cerrar   → aparece la consigna "Close your eyes. Count to 30." y el pulso de 1 s
//   crono    → el cronómetro empieza a correr
//   fallos   → ejemplos de resultados (ilustrativos) alrededor de 30 s
//   comentar → "Comment your result"

type Props = {cerrar: number; crono: number; fallos: number; comentar: number};

const Chip: React.FC<{texto: string; color: string; t: number}> = ({texto, color, t}) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: 40,
      color,
      border: `2px solid ${color}`,
      borderRadius: 14,
      padding: '14px 28px',
      opacity: t,
      transform: `translateY(${(1 - t) * 30}px)`,
    }}
  >
    {texto}
  </div>
);

export const PruebaContar: React.FC<Props> = ({cerrar, crono, fallos, comentar}) => {
  const f = useCurrentFrame();
  const entrada = rango(f, 0, 18, 0, 1, suave);
  const tConsigna = rango(f, cerrar, cerrar + 15, 0, 1, suave);
  const tFallos = rango(f, fallos, fallos + 20, 0, 1, suave);
  const tComentar = rango(f, comentar, comentar + 18, 0, 1, suave);

  // pulso de un segundo (como el latido de la cuenta)
  const desdeCerrar = Math.max(0, f - cerrar);
  const pulso = f >= cerrar ? Math.exp(-((desdeCerrar % FPS) / 6)) : 0;
  const latidos = f >= cerrar ? Math.floor(desdeCerrar / FPS) + 1 : 0;

  const segundos = f >= crono ? (f - crono) / FPS : 0;
  const crono_txt = `${(Math.floor(segundos) < 10 ? '0' : '') + Math.floor(segundos)}.${Math.floor((segundos % 1) * 10)}`;

  // el bloque central sube cuando aparecen los resultados
  const subir = interpolate(tFallos, [0, 1], [0, -110]);

  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: entrada}}>
      <div style={{position: 'absolute', top: 120, fontFamily: MONO, fontSize: 22, letterSpacing: 8, color: C.oro}}>
        <Teclea texto="TEST 01 · YOUR INTERNAL CLOCK" desde={4} />
      </div>

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `translateY(${subir}px)`}}>
        {/* anillo del cronómetro con el pulso */}
        <div style={{position: 'relative', width: 380, height: 380, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <svg width={380} height={380} style={{position: 'absolute'}}>
            <circle cx={190} cy={190} r={170} fill="none" stroke={C.nieblaSuave} strokeWidth={3} />
            <circle
              cx={190}
              cy={190}
              r={170}
              fill="none"
              stroke={C.oro}
              strokeWidth={5}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 170}
              strokeDashoffset={2 * Math.PI * 170 * (1 - Math.min(1, segundos / 30))}
              transform="rotate(-90 190 190)"
            />
            <circle cx={190} cy={190} r={150 + pulso * 14} fill="none" stroke={C.oro} strokeOpacity={pulso * 0.6} strokeWidth={2} />
          </svg>
          <div style={{fontFamily: MONO, fontSize: 92, color: C.luz}}>{crono_txt}</div>
        </div>

        <div style={{fontFamily: SERIF, fontSize: 64, color: C.luz, marginTop: 40, textAlign: 'center'}}>
          {f >= cerrar - 2 && <Escribe texto="Close your eyes. *Count to 30.*" desde={cerrar} ritmo={5} />}
        </div>
        <div style={{fontFamily: SANS, fontSize: 26, color: C.niebla, marginTop: 14, opacity: tConsigna * (1 - tFallos)}}>
          {latidos > 0 ? `one second per beat · ${latidos}` : ''}
        </div>
      </div>

      <div style={{position: 'absolute', bottom: 250, display: 'flex', gap: 36, alignItems: 'center'}}>
        <Chip texto="26.4 s" color={C.niebla} t={rango(f, fallos, fallos + 15, 0, 1, suave)} />
        <Chip texto="30.0 s" color={C.oro} t={rango(f, fallos + 8, fallos + 23, 0, 1, suave)} />
        <Chip texto="35.1 s" color={C.rojo} t={rango(f, fallos + 16, fallos + 31, 0, 1, suave)} />
      </div>
      <div style={{position: 'absolute', bottom: 205, fontFamily: SANS, fontSize: 20, color: C.gris}}>
        {f >= fallos && <Teclea texto="illustrative results · most people miss by several seconds" desde={fallos + 20} cps={60} cursor="transparent" />}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 100,
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 34,
          color: C.noche,
          background: C.oro,
          borderRadius: 40,
          padding: '14px 36px',
          opacity: tComentar,
          transform: `scale(${0.9 + 0.1 * tComentar})`,
        }}
      >
        {f >= comentar && <Escribe texto="Comment your result ↓" desde={comentar + 4} ritmo={4} colorBase={C.noche} />}
      </div>
    </AbsoluteFill>
  );
};
