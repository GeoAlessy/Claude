import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {C, MONO, Punto} from './estilo';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * Retícula de seguimiento: círculo que se dibuja, arco exterior que gira,
 * esquinas tipo visor y una línea guía hacia la etiqueta.
 */
export const Reticula: React.FC<{
  centro: Punto;
  radio: number;
  color?: string;
  inicio: number; // fotograma en que aparece
  fin?: number; // fotograma en que desaparece
  etiqueta?: string;
  ladoEtiqueta?: 'izq' | 'der';
}> = ({centro, radio, color = C.cian, inicio, fin = 1e9, etiqueta, ladoEtiqueta = 'izq'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < inicio || frame > fin + 8) return null;

  const t = frame - inicio;
  const entrada = spring({frame: t, fps, config: {damping: 18, stiffness: 140}});
  const salida = interpolate(frame, [fin, fin + 8], [1, 0], clamp);
  const op = Math.min(entrada, salida);
  const r = radio * interpolate(entrada, [0, 1], [1.35, 1]);
  const circ = 2 * Math.PI * r;
  const dibujo = interpolate(t, [0, 14], [circ, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const giro = t * 2.2;
  const pulso = 0.5 + 0.5 * Math.sin(t / 5);
  const [cx, cy] = centro;
  const esquina = r * 0.32;
  const R = r + 22;

  // Línea guía y etiqueta
  const dir = ladoEtiqueta === 'izq' ? -1 : 1;
  const p1: Punto = [cx + dir * r * 0.71, cy - r * 0.71];
  const p2: Punto = [p1[0] + dir * 60, p1[1] - 60];
  // la etiqueta nunca se sale de la pantalla (ancho aprox. de la pastilla: 340 px)
  const p3: Punto = [
    dir < 0 ? Math.max(p2[0] - 70, 370) : Math.min(p2[0] + 70, 1080 - 370),
    p2[1],
  ];
  const largoGuia = interpolate(t, [8, 20], [0, 1], clamp);

  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: op}}>
      <defs>
        <filter id="brillo" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#brillo)">
        {/* círculo principal que se dibuja */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={4} strokeDasharray={circ} strokeDashoffset={dibujo} />
        {/* arco exterior giratorio */}
        <circle
          cx={cx}
          cy={cy}
          r={R}
          fill="none"
          stroke={color}
          strokeOpacity={0.55}
          strokeWidth={2}
          strokeDasharray={`${R * 0.5} ${R * 0.35} ${R * 0.12} ${R * 0.35}`}
          transform={`rotate(${giro} ${cx} ${cy})`}
        />
        {/* esquinas tipo visor */}
        {[
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
        ].map(([sx, sy], i) => {
          const x = cx + sx * (r + 44);
          const y = cy + sy * (r + 44);
          return (
            <path
              key={i}
              d={`M ${x} ${y - sy * esquina} L ${x} ${y} L ${x - sx * esquina} ${y}`}
              fill="none"
              stroke={color}
              strokeWidth={3}
              strokeLinecap="round"
              opacity={0.85}
            />
          );
        })}
        {/* punto central que late */}
        <circle cx={cx} cy={cy} r={5 + pulso * 3} fill={color} opacity={0.9} />
        {/* línea guía */}
        {etiqueta && (
          <polyline
            points={`${p1[0]},${p1[1]} ${p2[0]},${p2[1]} ${p3[0]},${p3[1]}`}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - largoGuia}
          />
        )}
      </g>
      {etiqueta && (
        <foreignObject
          x={ladoEtiqueta === 'izq' ? p3[0] - 520 : p3[0]}
          y={p3[1] - 30}
          width={520}
          height={60}
          opacity={interpolate(t, [16, 24], [0, 1], clamp)}
        >
          <div style={{display: 'flex', justifyContent: ladoEtiqueta === 'izq' ? 'flex-end' : 'flex-start'}}>
            <Pastilla color={color}>{etiqueta}</Pastilla>
          </div>
        </foreignObject>
      )}
    </svg>
  );
};

/** Etiqueta tipo "pastilla" de vidrio oscuro con borde de color. */
export const Pastilla: React.FC<{color?: string; children: React.ReactNode; tam?: number; punto?: boolean}> = ({
  color = C.cian,
  children,
  tam = 30,
  punto = false,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 14,
        padding: `${tam * 0.35}px ${tam * 0.7}px`,
        background: C.vidrio,
        border: `2px solid ${color}`,
        borderRadius: 999,
        color: C.blanco,
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: tam,
        letterSpacing: tam * 0.06,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        boxShadow: `0 0 24px ${color}55`,
      }}
    >
      {punto && (
        <span
          style={{
            width: tam * 0.42,
            height: tam * 0.42,
            borderRadius: '50%',
            background: color,
            boxShadow: `0 0 ${10 + 8 * Math.sin(frame / 4)}px ${color}`,
            opacity: 0.6 + 0.4 * Math.sin(frame / 4),
          }}
        />
      )}
      {children}
    </div>
  );
};

/**
 * Flechas (chevrones) que avanzan a lo largo de una línea para indicar movimiento.
 * velocidad = 1 → flujo normal; 0 → detenidas.
 */
export const FlujoChevrones: React.FC<{
  desde: Punto;
  hasta: Punto;
  avance: number; // desplazamiento acumulado (0..1 por ciclo), lo calcula el padre
  color: string;
  opacidad?: number;
  n?: number;
  tam?: number;
}> = ({desde, hasta, avance, color, opacidad = 1, n = 5, tam = 34}) => {
  const dx = hasta[0] - desde[0];
  const dy = hasta[1] - desde[1];
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: opacidad}}>
      <defs>
        <filter id="brilloChev" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <line x1={desde[0]} y1={desde[1]} x2={hasta[0]} y2={hasta[1]} stroke={color} strokeOpacity={0.25} strokeWidth={2} strokeDasharray="6 10" />
      <g filter="url(#brilloChev)">
        {Array.from({length: n}).map((_, i) => {
          const u = (((i / n + avance) % 1) + 1) % 1;
          const x = desde[0] + dx * u;
          const y = desde[1] + dy * u;
          const op = Math.sin(u * Math.PI); // aparecen y desaparecen en los extremos
          return (
            <path
              key={i}
              d={`M ${-tam * 0.45} ${-tam * 0.6} L ${tam * 0.35} 0 L ${-tam * 0.45} ${tam * 0.6}`}
              transform={`translate(${x} ${y}) rotate(${ang})`}
              fill="none"
              stroke={color}
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={op}
            />
          );
        })}
      </g>
    </svg>
  );
};
