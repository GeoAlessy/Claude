import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, H, W, semilla} from '../estilo';

// Fondo común del canal: noche profunda, polvo de estrellas que respira, grano de película y viñeta.
export const Fondo: React.FC<{estrellas?: number; brillo?: number}> = ({estrellas = 260, brillo = 1}) => {
  const f = useCurrentFrame();
  const puntos = useMemo(() => {
    const r = semilla(7);
    return Array.from({length: estrellas}, () => ({
      x: r() * W,
      y: r() * H,
      t: 0.4 + r() * 1.6,
      fase: r() * Math.PI * 2,
      vel: 0.02 + r() * 0.05,
    }));
  }, [estrellas]);

  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, ${C.nocheMedia} 0%, ${C.noche} 70%)`}}>
      <svg width={W} height={H} style={{position: 'absolute'}}>
        {puntos.map((p, i) => {
          const a = (0.25 + 0.35 * (0.5 + 0.5 * Math.sin(f * p.vel + p.fase))) * brillo;
          return <circle key={i} cx={p.x + Math.sin(f * 0.003 + p.fase) * 6} cy={p.y} r={p.t} fill={C.luz} opacity={a} />;
        })}
      </svg>
      {/* grano de película */}
      <svg width={W} height={H} style={{position: 'absolute', opacity: 0.07, mixBlendMode: 'screen'}}>
        <filter id="grano">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f % 12} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter="url(#grano)" />
      </svg>
      {/* viñeta */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.75) 100%)'}} />
    </AbsoluteFill>
  );
};
