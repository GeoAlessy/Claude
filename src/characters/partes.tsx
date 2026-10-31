import React from 'react';
import {C, LINEA} from '../estilo';

export type P = [number, number];

/** Extremidad tipo "manguera": curva con codo como control, contorno grueso. */
export const Extremidad: React.FC<{
  a: P;
  codo: P;
  b: P;
  ancho: number;
  color: string;
}> = ({a, codo, b, ancho, color}) => {
  const d = `M${a[0]},${a[1]} Q${codo[0]},${codo[1]} ${b[0]},${b[1]}`;
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={C.linea} strokeWidth={ancho + LINEA * 2} />
      <path d={d} stroke={color} strokeWidth={ancho} />
    </g>
  );
};

/** Punto sobre la curva cuadrática (para colocar mangas). */
export const puntoQ = (a: P, c: P, b: P, t: number): P => [
  (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
  (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1],
];

export const Mano: React.FC<{p: P; color: string; r?: number}> = ({p, color, r = 21}) => (
  <circle cx={p[0]} cy={p[1]} r={r} fill={color} stroke={C.linea} strokeWidth={LINEA} />
);

/** Ojo expresivo con brillo. cierre 0..1; dir = desplazamiento de pupila. */
export const Ojo: React.FC<{
  x: number;
  y: number;
  rx?: number;
  ry?: number;
  cierre: number;
  dir: P;
  piel: string;
  parpadoSup?: number; // 0..1 párpado caído (cansancio/aburrimiento)
  pupila?: number;
}> = ({x, y, rx = 26, ry = 31, cierre, dir, piel, parpadoSup = 0, pupila = 13}) => {
  const id = `ojo-${Math.round(x * 10)}-${Math.round(y * 10)}-${Math.round(rx)}`;
  if (cierre > 0.92) {
    return (
      <path
        d={`M${x - rx},${y + 4} Q${x},${y + 14} ${x + rx},${y + 4}`}
        stroke={C.linea}
        strokeWidth={LINEA}
        fill="none"
        strokeLinecap="round"
      />
    );
  }
  const ryEf = ry * (1 - cierre);
  const caida = Math.max(parpadoSup, 0);
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <ellipse cx={x} cy={y} rx={rx} ry={ryEf} />
        </clipPath>
      </defs>
      <ellipse cx={x} cy={y} rx={rx} ry={ryEf} fill={C.ojo} />
      <g clipPath={`url(#${id})`}>
        <circle cx={x + dir[0]} cy={y + dir[1]} r={pupila} fill={C.pupila} />
        <circle cx={x + dir[0] + pupila * 0.35} cy={y + dir[1] - pupila * 0.4} r={pupila * 0.38} fill="#fff" />
        <circle cx={x + dir[0] - pupila * 0.4} cy={y + dir[1] + pupila * 0.35} r={pupila * 0.16} fill="#fff" />
        {caida > 0 && (
          <rect x={x - rx - 2} y={y - ryEf - 2} width={rx * 2 + 4} height={ryEf * 2 * caida + 2} fill={piel} />
        )}
      </g>
      {caida > 0 && (
        <line
          x1={x - rx}
          x2={x + rx}
          y1={y - ryEf + ryEf * 2 * caida}
          y2={y - ryEf + ryEf * 2 * caida}
          stroke={C.linea}
          strokeWidth={LINEA * 0.8}
          strokeLinecap="round"
        />
      )}
      <ellipse cx={x} cy={y} rx={rx} ry={ryEf} fill="none" stroke={C.linea} strokeWidth={LINEA * 0.8} />
    </g>
  );
};

export type Boca = 'cerrada' | 'abierta' | 'sonrisa' | 'o' | 'grito' | 'triste' | 'plana' | 'sonrisaLado';

/** Boca: forma base + apertura animable 0..1 */
export const BocaSVG: React.FC<{x: number; y: number; forma: Boca; abre?: number; ancho?: number}> = ({
  x,
  y,
  forma,
  abre = 0,
  ancho = 30,
}) => {
  const s = {stroke: C.linea, strokeWidth: LINEA, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  if (forma === 'cerrada' && abre < 0.1) return <path d={`M${x - ancho * 0.6},${y} Q${x},${y + 10} ${x + ancho * 0.6},${y}`} fill="none" {...s} />;
  if (forma === 'plana') return <path d={`M${x - ancho * 0.6},${y + 2} L${x + ancho * 0.6},${y}`} fill="none" {...s} />;
  if (forma === 'sonrisaLado')
    return <path d={`M${x - ancho * 0.7},${y - 2} Q${x + ancho * 0.1},${y + 16} ${x + ancho * 0.85},${y - 12}`} fill="none" {...s} />;
  if (forma === 'triste' && abre < 0.1) return <path d={`M${x - ancho * 0.6},${y + 8} Q${x},${y - 8} ${x + ancho * 0.6},${y + 8}`} fill="none" {...s} />;
  if (forma === 'sonrisa' && abre < 0.1) return <path d={`M${x - ancho},${y - 6} Q${x},${y + 26} ${x + ancho},${y - 6}`} fill="none" {...s} />;
  // bocas abiertas
  let w = ancho;
  let h = 10 + abre * 30;
  if (forma === 'o') {
    w = ancho * 0.55;
    h = 16 + abre * 18;
  }
  if (forma === 'grito') {
    w = ancho * 1.25;
    h = 26 + abre * 34;
  }
  if (forma === 'sonrisa') {
    return (
      <g>
        <path d={`M${x - w},${y - 6} Q${x},${y + 30 + abre * 18} ${x + w},${y - 6} Z`} fill="#7A1F1F" {...s} />
        <path d={`M${x - w * 0.55},${y + 4 + abre * 8} Q${x},${y + 20 + abre * 16} ${x + w * 0.55},${y + 4 + abre * 8}`} fill="#F07878" stroke="none" />
      </g>
    );
  }
  return (
    <g>
      <ellipse cx={x} cy={y + h * 0.35} rx={w} ry={h / 2} fill="#7A1F1F" {...s} />
      <ellipse cx={x} cy={y + h * 0.35 + h * 0.22} rx={w * 0.55} ry={h * 0.18} fill="#F07878" />
      {forma === 'grito' && <rect x={x - w * 0.6} y={y + h * 0.35 - h / 2 + 3} width={w * 1.2} height={h * 0.18} rx={3} fill="#fff" />}
    </g>
  );
};
