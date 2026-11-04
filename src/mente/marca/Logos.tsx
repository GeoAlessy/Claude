import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, MONO, SERIF} from '../estilo';

// Cinco propuestas de logo para el canal ("the unsettling science of your own mind").
// Cada una: símbolo (sirve solo como foto de perfil) + nombre propuesto. Todo vectorial, sin personas.

const LEMA = 'THE UNSETTLING SCIENCE OF YOUR MIND';

// 1 · MINDFOLD — pliegues del cerebro como anillos ondulados (también parece una huella dactilar)
const Pliegues: React.FC<{s: number}> = ({s}) => {
  const anillos = [0.92, 0.74, 0.56, 0.38, 0.2];
  return (
    <svg width={s} height={s} viewBox="-100 -100 200 200">
      {anillos.map((r, i) => {
        const pts = Array.from({length: 241}, (_, k) => {
          const a = (k / 240) * Math.PI * 2;
          const rr = 90 * r + 3.2 * Math.sin(a * (7 + i * 2) + i) * (1 - i * 0.12);
          return `${(Math.cos(a) * rr).toFixed(2)},${(Math.sin(a) * rr).toFixed(2)}`;
        });
        return <polygon key={i} points={pts.join(' ')} fill="none" stroke={i === 2 ? C.luz : C.oro} strokeWidth={i === 2 ? 2.6 : 2} opacity={1 - i * 0.08} />;
      })}
      <circle r={5} fill={C.oro} />
    </svg>
  );
};

// 2 · NEURO NOIR — esfera de reloj con un ojo que mira (la marca provisional actual)
const OjoReloj: React.FC<{s: number}> = ({s}) => (
  <svg width={s} height={s} viewBox="-100 -100 200 200">
    <circle r={88} fill="none" stroke={C.oro} strokeWidth={3} />
    {Array.from({length: 12}, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return <line key={i} x1={Math.sin(a) * 76} y1={-Math.cos(a) * 76} x2={Math.sin(a) * 84} y2={-Math.cos(a) * 84} stroke={C.oro} strokeWidth={i % 3 === 0 ? 3 : 1.4} />;
    })}
    <path d="M -58 0 Q 0 -44 58 0 Q 0 44 -58 0 Z" fill="none" stroke={C.luz} strokeWidth={2.6} />
    <circle r={17} fill={C.oro} />
    <circle r={4} cx={-4} cy={-4} fill={C.luz} />
  </svg>
);

// 3 · THE QUIET CORTEX — media luna (la mente en la sombra) y una sola estrella dorada
const Luna: React.FC<{s: number}> = ({s}) => (
  <svg width={s} height={s} viewBox="-100 -100 200 200">
    <defs>
      <mask id="lunaM">
        <rect x={-100} y={-100} width={200} height={200} fill="#fff" />
        <circle cx={30} cy={-18} r={70} fill="#000" />
      </mask>
      <filter id="lunaH" x="-1" y="-1" width="3" height="3">
        <feGaussianBlur stdDeviation="5" />
      </filter>
    </defs>
    <circle r={78} fill={C.luz} mask="url(#lunaM)" />
    <circle r={78} fill="none" stroke={C.nieblaSuave} strokeWidth={1.5} />
    <circle cx={34} cy={-14} r={9} fill={C.oro} filter="url(#lunaH)" />
    <circle cx={34} cy={-14} r={5.5} fill={C.oro} />
  </svg>
);

// 4 · UNSEEN MIND — una cerradura llena de estrellas: lo que tu mente no te deja ver
const Cerradura: React.FC<{s: number}> = ({s}) => {
  const estrellas = [
    [-8, -38, 1.6], [10, -28, 2.4], [-4, -14, 1.2], [6, 4, 1.8], [-6, 20, 2.6], [4, 38, 1.4], [-12, -24, 1], [12, 22, 1.1],
  ];
  return (
    <svg width={s} height={s} viewBox="-100 -100 200 200">
      <defs>
        <clipPath id="cerr">
          <circle cy={-30} r={34} />
          <path d="M -20 -10 L 20 -10 L 32 70 L -32 70 Z" />
        </clipPath>
      </defs>
      <circle r={88} fill="none" stroke={C.oro} strokeWidth={2.5} />
      <g clipPath="url(#cerr)">
        <rect x={-100} y={-100} width={200} height={200} fill={C.tinta} />
        {estrellas.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={i === 4 ? C.oro : C.luz} />
        ))}
      </g>
      <circle cy={-30} r={34} fill="none" stroke={C.oro} strokeWidth={2.5} />
      <path d="M -20 -4 L -32 70 L 32 70 L 20 -4" fill="none" stroke={C.oro} strokeWidth={2.5} />
    </svg>
  );
};

// 5 · INNER STATIC — una esfera hecha de líneas de escaneo; una línea se desplaza (el fallo, la "mentira")
const Estatica: React.FC<{s: number}> = ({s}) => {
  const n = 15;
  return (
    <svg width={s} height={s} viewBox="-100 -100 200 200">
      {Array.from({length: n}, (_, i) => {
        const y = -80 + (i * 160) / (n - 1);
        const w = Math.sqrt(Math.max(0, 80 * 80 - y * y));
        const fallo = i === 9;
        if (w < 1) return null;
        return (
          <line
            key={i}
            x1={-w + (fallo ? 18 : 0)}
            x2={w + (fallo ? 18 : 0)}
            y1={y}
            y2={y}
            stroke={fallo ? C.luna : i < 4 ? C.luz : C.oro}
            strokeWidth={fallo ? 5 : 3.4}
            strokeLinecap="round"
            opacity={fallo ? 1 : 0.9}
          />
        );
      })}
    </svg>
  );
};

export const OPCIONES = [
  {nombre: 'MINDFOLD', Marca: Pliegues, idea: 'brain folds / fingerprint'},
  {nombre: 'NEURO NOIR', Marca: OjoReloj, idea: 'clock + eye'},
  {nombre: 'QUIET CORTEX', Marca: Luna, idea: 'crescent mind'},
  {nombre: 'UNSEEN MIND', Marca: Cerradura, idea: 'keyhole of stars'},
  {nombre: 'INNER STATIC', Marca: Estatica, idea: 'scanline sphere'},
];

const Fondo: React.FC = () => <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 35%, ${C.nocheMedia} 0%, ${C.noche} 70%)`}} />;

/** Lámina de una opción: logo completo arriba y, abajo, cómo se ve como foto de perfil (círculo). */
export const LaminaLogo: React.FC<{opcion: number}> = ({opcion}) => {
  const o = OPCIONES[opcion];
  return (
    <AbsoluteFill>
      <Fondo />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: 110}}>
        <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: 8, color: C.niebla}}>OPTION {opcion + 1}</div>
        <div style={{marginTop: 40}}>
          <o.Marca s={420} />
        </div>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 104, letterSpacing: 14, color: C.luz, marginTop: 30}}>{o.nombre}</div>
        <div style={{fontFamily: MONO, fontSize: 20, letterSpacing: 7, color: C.oro, marginTop: 10}}>{LEMA}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 40, marginTop: 70}}>
          <div style={{width: 170, height: 170, borderRadius: '50%', overflow: 'hidden', background: C.noche, border: `1px solid ${C.nieblaSuave}`, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <o.Marca s={140} />
          </div>
          <div style={{width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', background: C.noche, border: `1px solid ${C.nieblaSuave}`, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <o.Marca s={46} />
          </div>
          <div style={{fontFamily: MONO, fontSize: 18, letterSpacing: 4, color: C.gris}}>PROFILE PICTURE · LARGE / SMALL</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Las cinco opciones juntas (para comparar). */
export const HojaLogos: React.FC = () => (
  <AbsoluteFill>
    <Fondo />
    <AbsoluteFill style={{flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center'}}>
      {OPCIONES.map((o, i) => (
        <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: 360}}>
          <div style={{fontFamily: MONO, fontSize: 20, letterSpacing: 6, color: C.niebla, marginBottom: 30}}>{i + 1}</div>
          <o.Marca s={260} />
          <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 38, letterSpacing: 4, color: C.luz, marginTop: 34, whiteSpace: 'nowrap'}}>{o.nombre}</div>
          <div style={{width: 110, height: 110, borderRadius: '50%', background: C.noche, border: `1px solid ${C.nieblaSuave}`, display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 40}}>
            <o.Marca s={90} />
          </div>
        </div>
      ))}
    </AbsoluteFill>
  </AbsoluteFill>
);
