import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, MONO, TITULAR} from '../estilo';

// =====================================================================
// Identidad del canal "¿Por qué pasó?": logo, banner y marca de agua.
// Mismo lenguaje que los videos: azul noche, cian holográfico, HUD.
// =====================================================================
const FONDO = 'radial-gradient(ellipse at 50% 45%, #0f2a40 0%, #06111d 55%, #01040a 100%)';

const Rejilla: React.FC<{paso?: number; op?: number}> = ({paso = 40, op = 0.08}) => (
  <AbsoluteFill
    style={{
      backgroundImage: `linear-gradient(rgba(34,211,238,${op}) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,${op}) 1px, transparent 1px)`,
      backgroundSize: `${paso}px ${paso}px`,
    }}
  />
);
const Escaneo: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundImage: 'repeating-linear-gradient(0deg, rgba(34,211,238,0.06) 0px, rgba(34,211,238,0.06) 2px, transparent 2px, transparent 6px)',
    }}
  />
);

// Retícula + signo de pregunta holográfico (el símbolo del canal)
export const Simbolo: React.FC<{tam: number; trazo?: number}> = ({tam, trazo = 1}) => {
  const r = tam / 2;
  const w = 6 * trazo * (tam / 400);
  return (
    <svg width={tam} height={tam} viewBox={`0 0 ${tam} ${tam}`}>
      <defs>
        <filter id="b" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={tam / 60} result="g" />
          <feMerge>
            <feMergeNode in="g" />
            <feMergeNode in="g" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#b)" fill="none" stroke={C.cian} strokeLinecap="round">
        {/* círculo de la retícula */}
        <circle cx={r} cy={r} r={r * 0.78} strokeWidth={w} />
        {/* arco exterior */}
        <path d={describirArco(r, r, r * 0.92, -50, 50)} strokeWidth={w * 0.7} />
        <path d={describirArco(r, r, r * 0.92, 130, 230)} strokeWidth={w * 0.7} />
        {/* marcas en cruz */}
        {[0, 90, 180, 270].map((a) => {
          const rad = (a * Math.PI) / 180;
          return <line key={a} x1={r + Math.cos(rad) * r * 0.7} y1={r + Math.sin(rad) * r * 0.7} x2={r + Math.cos(rad) * r * 0.86} y2={r + Math.sin(rad) * r * 0.86} strokeWidth={w} />;
        })}
      </g>
      {/* signo de pregunta */}
      <text
        x={r}
        y={r + tam * 0.17}
        textAnchor="middle"
        fontFamily={TITULAR}
        fontWeight={900}
        fontSize={tam * 0.56}
        fill={C.blanco}
        style={{filter: `drop-shadow(0 0 ${tam / 30}px ${C.cian})`}}
      >
        ?
      </text>
    </svg>
  );
};
function describirArco(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p = (a: number) => [cx + r * Math.cos(((a - 90) * Math.PI) / 180), cy + r * Math.sin(((a - 90) * Math.PI) / 180)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}

// ---------- Logo / foto de perfil (800×800; YouTube lo recorta en círculo) ----------
export const Logo: React.FC = () => (
  <AbsoluteFill style={{background: FONDO, alignItems: 'center', justifyContent: 'center'}}>
    <Rejilla paso={50} op={0.07} />
    <Escaneo />
    <Simbolo tam={600} />
  </AbsoluteFill>
);

// ---------- Marca de agua (150×150, fondo transparente) ----------
export const MarcaAgua: React.FC = () => (
  <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
    <div style={{width: 150, height: 150, borderRadius: 75, background: 'rgba(6,17,29,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <Simbolo tam={140} trazo={1.4} />
    </div>
  </AbsoluteFill>
);

// ---------- Banner (2560×1440; zona segura para todos los dispositivos: 1546×423 al centro) ----------
export const Banner: React.FC = () => (
  <AbsoluteFill style={{background: FONDO}}>
    <Rejilla paso={64} op={0.06} />
    {/* hologramas a los lados (se ven en TV y computadora) */}
    <Img
      src={staticFile('porquepaso/canal/holo_escalera.png')}
      style={{position: 'absolute', left: -60, top: 160, height: 1130, opacity: 0.55, mixBlendMode: 'screen', maskImage: 'radial-gradient(ellipse 45% 40% at 40% 50%, black 30%, transparent 100%)'}}
    />
    <Img
      src={staticFile('porquepaso/canal/holo_jet.png')}
      style={{position: 'absolute', right: -60, top: 160, height: 1130, opacity: 0.55, mixBlendMode: 'screen', maskImage: 'radial-gradient(ellipse 45% 40% at 60% 50%, black 30%, transparent 100%)'}}
    />
    <Escaneo />
    {/* Zona segura */}
    <div style={{position: 'absolute', left: (2560 - 1546) / 2, top: (1440 - 423) / 2, width: 1546, height: 423, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 50}}>
      <Simbolo tam={330} />
      <div>
        <div style={{fontFamily: TITULAR, fontWeight: 900, fontSize: 150, lineHeight: 1, color: C.blanco, textShadow: `0 0 40px ${C.cian}66`, whiteSpace: 'nowrap'}}>
          ¿Por qué <span style={{color: C.cian}}>pasó?</span>
        </div>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 42, letterSpacing: 4, color: C.blanco, marginTop: 22, opacity: 0.9, whiteSpace: 'nowrap'}}>
          LO VIRAL, EXPLICADO EN 3D
        </div>
        <div style={{display: 'flex', gap: 18, marginTop: 26}}>
          {['CASOS VIRALES', 'ANIMACIÓN 3D', 'SHORTS'].map((t) => (
            <div key={t} style={{fontFamily: MONO, fontWeight: 700, fontSize: 28, letterSpacing: 2, color: C.blanco, padding: '10px 22px', border: `2px solid ${C.cian}`, borderRadius: 999, background: 'rgba(4,10,18,0.7)', boxShadow: `0 0 20px ${C.cian}55`}}>
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  </AbsoluteFill>
);
