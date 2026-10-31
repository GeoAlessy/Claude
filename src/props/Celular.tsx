import React from 'react';
import {C, LINEA} from '../estilo';

/** Celular genérico (sin marcas). vista 'atras' = lo que ve la cámara cuando el Chato lo mira. */
export const Celular: React.FC<{
  x: number;
  y: number;
  rot?: number;
  escala?: number;
  vista?: 'atras' | 'pantalla';
  bateria?: number; // % para la vista pantalla
  brilloPantalla?: number;
}> = ({x, y, rot = 0, escala = 1, vista = 'atras', bateria = 80, brilloPantalla = 1}) => {
  const w = 78;
  const h = 140;
  return (
    <g transform={`translate(${x},${y}) rotate(${rot}) scale(${escala})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill="#3A3F4B" stroke={C.linea} strokeWidth={LINEA} />
      {vista === 'atras' ? (
        <g>
          <rect x={-w / 2 + 10} y={-h / 2 + 10} width={26} height={30} rx={8} fill="#22252C" />
          <circle cx={-w / 2 + 23} cy={-h / 2 + 19} r={6} fill="#5B6A82" />
          <circle cx={-w / 2 + 23} cy={-h / 2 + 32} r={4} fill="#5B6A82" />
          <circle cx={0} cy={8} r={9} fill="none" stroke="#565C6B" strokeWidth={3} />
        </g>
      ) : (
        <g>
          <rect x={-w / 2 + 6} y={-h / 2 + 8} width={w - 12} height={h - 16} rx={9} fill={bateria <= 5 ? '#2A0E12' : '#1E3A5F'} />
          <rect x={-10} y={-h / 2 + 12} width={20} height={5} rx={2.5} fill="#11141A" />
        </g>
      )}
      {vista === 'pantalla' && (
        <g>
          {/* ícono de batería */}
          <rect x={-22} y={-22} width={40} height={22} rx={4} fill="none" stroke={C.blanco} strokeWidth={3.5} />
          <rect x={18} y={-15} width={5} height={8} rx={1.5} fill={C.blanco} />
          <rect x={-19} y={-19} width={Math.max(2, (34 * bateria) / 100)} height={16} rx={2} fill={bateria <= 15 ? C.rojo : '#4CD964'} />
        </g>
      )}
    </g>
  );
};
