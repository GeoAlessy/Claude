import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {MARCADOR, MANO, S} from './estilo';

// =====================================================================
// Piezas "a plumón": trazos que se dibujan solos, letras escritas a mano,
// tarjetas de cuaderno y sellos. Todo en SVG/CSS (nada generado con IA).
// =====================================================================

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Avance 0→1 de un trazo que empieza en `desde` y dura `dur` fotogramas. */
export function avance(f: number, desde: number, dur: number) {
  return interpolate(f, [desde, desde + dur], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
}

/** Trazo SVG que se dibuja solo (usar dentro de un <svg>). */
export const Trazo: React.FC<{d: string; desde: number; dur?: number; color?: string; ancho?: number; hasta?: number; relleno?: string}> = ({
  d,
  desde,
  dur = 8,
  color = S.blanco,
  ancho = 10,
  hasta,
  relleno = 'none',
}) => {
  const f = useCurrentFrame();
  if (f < desde || (hasta !== undefined && f >= hasta)) return null;
  const p = avance(f, desde, dur);
  return (
    <>
      {/* sombra negra para que se lea sobre cualquier fondo */}
      <path d={d} pathLength={1} fill="none" stroke="rgba(0,0,0,0.75)" strokeWidth={ancho + 7} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={1} strokeDashoffset={1 - p} />
      <path d={d} pathLength={1} fill={p >= 1 ? relleno : 'none'} stroke={color} strokeWidth={ancho} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={1} strokeDashoffset={1 - p} />
    </>
  );
};

/** Círculo hecho a mano (óvalo que se pasa un poco de largo, como un plumón real). */
export function circuloMano(cx: number, cy: number, rx: number, ry: number) {
  const pts: string[] = [];
  for (let i = 0; i <= 26; i++) {
    const a = -Math.PI / 2 - 0.4 + (i / 24) * Math.PI * 2;
    const w = 1 + 0.06 * Math.sin(i * 1.7);
    pts.push(`${(cx + Math.cos(a) * rx * w).toFixed(1)},${(cy + Math.sin(a) * ry * w).toFixed(1)}`);
  }
  return 'M' + pts.join(' L');
}

/** Flecha a mano de (x1,y1) a (x2,y2), con una pequeña curva. */
export function flechaMano(x1: number, y1: number, x2: number, y2: number, curva = 0.15) {
  const mx = (x1 + x2) / 2 - (y2 - y1) * curva;
  const my = (y1 + y2) / 2 + (x2 - x1) * curva;
  const ang = Math.atan2(y2 - my, x2 - mx);
  const L = 42;
  const a1 = ang + Math.PI * 0.8;
  const a2 = ang - Math.PI * 0.8;
  return `M${x1},${y1} Q${mx},${my} ${x2},${y2} M${x2 + Math.cos(a1) * L},${y2 + Math.sin(a1) * L} L${x2},${y2} L${x2 + Math.cos(a2) * L},${y2 + Math.sin(a2) * L}`;
}

/** Texto escrito a mano: aparece de izquierda a derecha con un pequeño rebote. */
export const Letra: React.FC<{
  texto: React.ReactNode;
  x: number;
  y: number;
  desde: number;
  hasta?: number;
  tam?: number;
  color?: string;
  rot?: number;
  fuente?: string;
  centro?: boolean;
  dur?: number;
  contorno?: number;
}> = ({texto, x, y, desde, hasta, tam = 80, color = S.amarillo, rot = -4, fuente = MARCADOR, centro = true, dur = 7, contorno = 9}) => {
  const f = useCurrentFrame();
  if (f < desde || (hasta !== undefined && f >= hasta)) return null;
  const p = avance(f, desde, dur);
  const salida = hasta !== undefined ? interpolate(f, [hasta - 4, hasta], [1, 0], clamp) : 1;
  const esc = interpolate(f - desde, [0, 4, 8], [0.7, 1.12, 1], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(${centro ? '-50%' : '0'}, -50%) rotate(${rot}deg) scale(${esc})`,
        fontFamily: fuente,
        fontSize: tam,
        lineHeight: 1,
        color,
        whiteSpace: 'nowrap',
        clipPath: `inset(-30% ${(1 - p) * 100}% -30% -10%)`,
        opacity: salida,
        WebkitTextStroke: `${contorno}px ${S.tinta}`,
        paintOrder: 'stroke fill',
        textShadow: '0 6px 0 rgba(0,0,0,0.35)',
      }}
    >
      {texto}
    </div>
  );
};

/** Tarjeta de cuaderno (la "segunda pantalla" que entra encima del clip). */
export const Tarjeta: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  desde: number;
  hasta?: number;
  rot?: number;
  children: React.ReactNode;
}> = ({x, y, w, h, desde, hasta, rot = -2.5, children}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (f < desde || (hasta !== undefined && f >= hasta)) return null;
  const s = spring({frame: f - desde, fps, config: {damping: 13, stiffness: 220, mass: 0.6}});
  const fuera = hasta !== undefined ? interpolate(f, [hasta - 5, hasta], [0, 1], clamp) : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        transform: `translateY(${(1 - s) * 260 + fuera * 220}px) rotate(${rot + (1 - s) * 6}deg) scale(${0.85 + 0.15 * s})`,
        opacity: Math.min(1, s * 1.5) * (1 - fuera),
        background: S.papelClaro,
        backgroundImage: `linear-gradient(90deg, transparent 58px, ${S.margen} 58px, ${S.margen} 61px, transparent 61px), repeating-linear-gradient(0deg, transparent 0 43px, ${S.linea} 43px 45px)`,
        borderRadius: 14,
        boxShadow: '0 22px 44px rgba(0,0,0,0.45), 0 0 0 5px rgba(27,27,31,0.9)',
        overflow: 'hidden',
      }}
    >
      {/* cinta adhesiva */}
      <div style={{position: 'absolute', top: -6, left: w / 2 - 70, width: 140, height: 38, background: 'rgba(255, 230, 140, 0.75)', transform: 'rotate(3deg)'}} />
      {children}
    </div>
  );
};

/** Sello de goma que cae de golpe (para el veredicto). */
export const Sello: React.FC<{texto: string; x: number; y: number; desde: number; color?: string; tam?: number; rot?: number}> = ({texto, x, y, desde, color = S.rojo, tam = 190, rot = -12}) => {
  const f = useCurrentFrame();
  if (f < desde) return null;
  const k = f - desde;
  const esc = interpolate(k, [0, 4, 7], [2.6, 0.92, 1], {...clamp, easing: Easing.out(Easing.quad)});
  const op = interpolate(k, [0, 3], [0, 1], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${esc})`,
        opacity: op,
        fontFamily: MARCADOR,
        fontSize: tam,
        lineHeight: 1,
        color,
        padding: '10px 40px 18px',
        border: `14px solid ${color}`,
        borderRadius: 28,
        background: 'rgba(255,255,255,0.12)',
        textShadow: '0 4px 0 rgba(0,0,0,0.3)',
        boxShadow: '0 0 0 6px rgba(0,0,0,0.25)',
        whiteSpace: 'nowrap',
      }}
    >
      {texto}
    </div>
  );
};

/** Número que cuenta (velocímetro, metros…). */
export const Contador: React.FC<{claves: [number, number][]; x: number; y: number; desde: number; hasta?: number; sufijo: string; tam?: number; color?: string; rot?: number}> = ({
  claves,
  x,
  y,
  desde,
  hasta,
  sufijo,
  tam = 150,
  color = S.amarillo,
  rot = -5,
}) => {
  const f = useCurrentFrame();
  if (f < desde || (hasta !== undefined && f >= hasta)) return null;
  const v = interpolate(f, claves.map((c) => c[0]), claves.map((c) => c[1]), {...clamp, easing: Easing.out(Easing.cubic)});
  const esc = interpolate(f - desde, [0, 4, 8], [0.6, 1.1, 1], clamp);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${esc})`,
        fontFamily: MARCADOR,
        fontSize: tam,
        lineHeight: 1,
        color,
        whiteSpace: 'nowrap',
        WebkitTextStroke: `12px ${S.tinta}`,
        paintOrder: 'stroke fill',
        textShadow: '0 8px 0 rgba(0,0,0,0.35)',
      }}
    >
      {Math.round(v)}
      <span style={{fontSize: tam * 0.42, marginLeft: 12}}>{sufijo}</span>
    </div>
  );
};

export const Mano: React.FC<{children: React.ReactNode; tam?: number; color?: string; style?: React.CSSProperties}> = ({children, tam = 64, color = S.tinta, style}) => (
  <div style={{fontFamily: MANO, fontSize: tam, color, lineHeight: 1.05, ...style}}>{children}</div>
);
