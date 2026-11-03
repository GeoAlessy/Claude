import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, MONO, SERIF, rango, suave} from '../estilo';
import {Escribe, tecla} from './TextoAnimado';

// La línea de vida: cada década tiene el ancho de cómo se SIENTE, no de cuánto dura.
// La infancia ocupa mucho y brilla; a partir de los 20, los años se encogen y se apagan.
// Al final se comprime "como un acordeón".
const DECADAS = [
  {etq: '0', sentido: 3.2},
  {etq: '10', sentido: 2.4},
  {etq: '20', sentido: 1.4},
  {etq: '30', sentido: 0.9},
  {etq: '40', sentido: 0.65},
  {etq: '50', sentido: 0.5},
  {etq: '60', sentido: 0.4},
  {etq: '70', sentido: 0.33},
];

export const LineaVida: React.FC<{dur: number; compresion: number}> = ({dur, compresion}) => {
  const f = useCurrentFrame();
  const total = DECADAS.reduce((s, d) => s + d.sentido, 0);
  const ancho = 1500;
  const x0 = (1920 - ancho) / 2;
  const y = 520;
  // 0 → la línea se dibuja · 1 → compresión de acordeón
  const dibujo = rango(f, 10, 120);
  const comp = rango(f, compresion, compresion + 40, 0, 1, suave);

  let x = x0;
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        <defs>
          <linearGradient id="vida" x1="0" x2="1">
            <stop offset="0%" stopColor={C.oro} />
            <stop offset="45%" stopColor={C.oro} stopOpacity={0.55} />
            <stop offset="100%" stopColor={C.niebla} stopOpacity={0.15} />
          </linearGradient>
          <filter id="halo">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        {DECADAS.map((d, i) => {
          const wBase = (d.sentido / total) * ancho;
          // al comprimirse, los años adultos casi desaparecen
          const factor = i < 2 ? 1 : interpolate(comp, [0, 1], [1, 0.25]);
          const w = wBase * factor;
          const aparece = rango(dibujo, i / DECADAS.length, (i + 1) / DECADAS.length);
          const xi = x;
          x += w;
          const brillo = Math.max(0.12, 1 - i * 0.13) * aparece;
          return (
            <g key={d.etq} opacity={aparece}>
              <rect x={xi + 3} y={y - 22} width={Math.max(2, w - 6)} height={44} rx={6} fill="url(#vida)" opacity={brillo} />
              {i < 2 && <rect x={xi + 3} y={y - 22} width={Math.max(2, w - 6)} height={44} rx={6} fill={C.oro} opacity={0.35 * aparece} filter="url(#halo)" />}
              {/* al comprimirse, solo quedan 0, 10 y 20; el resto se apaga para no amontonarse */}
              <text x={xi + 6} y={y + 72} fill={C.niebla} fontFamily={MONO} fontSize={24} opacity={i <= 2 ? 1 : 1 - comp}>
                {tecla(d.etq, f, 10 + 110 * (i / DECADAS.length), 30)}
              </text>
            </g>
          );
        })}
        <text x={x0} y={y - 70} fill={C.niebla} fontFamily={MONO} fontSize={22} letterSpacing={4} opacity={dibujo}>
          {tecla('YOUR LIFE · AS IT FEELS', f, 6)}
        </text>
        {/* tras la compresión: toda la vida adulta cabe en un trocito */}
        <text x={x + 14} y={y + 9} fill={C.rojo} fontFamily={MONO} fontSize={24} opacity={comp}>
          {tecla('← 20 to 80', f, compresion + 10, 26)}
        </text>
      </svg>
      <div
        style={{
          position: 'absolute',
          top: 720,
          width: '100%',
          textAlign: 'center',
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontSize: 54,
          color: C.luz,
          opacity: 1 - rango(f, dur - 15, dur),
        }}
      >
        <Escribe texto="Your brain is quietly !editing! your life." desde={compresion + 30} ritmo={5} />
      </div>
    </AbsoluteFill>
  );
};
