import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, MONO, SERIF, rango, semilla} from '../estilo';

// El cerebro como una galaxia: cada punto es un recuerdo. Los recuerdos nuevos se encienden en oro.
// Fase 1 (infancia): casi todo se enciende. Fase 2 (rutina adulta): las luces se apagan y casi nada nuevo se graba.
// Es una ilustración del concepto, no un dato: por eso el medidor no lleva números.

type Estrella = {x: number; y: number; r: number; enciende: number; adulto: boolean; fase: number};

function dentroDelCerebro(x: number, y: number) {
  // vista lateral: cerebro (elipse grande con frente redondeada) + cerebelo + tronco
  const cx = 960, cy = 470;
  const e1 = ((x - cx) / 520) ** 2 + ((y - cy) / 330) ** 2 < 1 && y < cy + 250;
  const e2 = ((x - (cx + 300)) / 190) ** 2 + ((y - (cy + 250)) / 110) ** 2 < 1;
  const tronco = x > cx + 60 && x < cx + 150 && y > cy + 220 && y < cy + 400;
  return e1 || e2 || tronco;
}

export const CerebroGalaxia: React.FC<{dur: number; cambio: number}> = ({dur, cambio}) => {
  const f = useCurrentFrame();
  const estrellas = useMemo(() => {
    const r = semilla(42);
    const out: Estrella[] = [];
    while (out.length < 1400) {
      const x = 400 + r() * 1120;
      const y = 120 + r() * 720;
      if (!dentroDelCerebro(x, y)) continue;
      // bandas tipo circunvoluciones: más densidad en ondas
      const onda = 0.5 + 0.5 * Math.sin(x * 0.035 + Math.sin(y * 0.03) * 3);
      if (r() > 0.35 + 0.65 * onda) continue;
      out.push({x, y, r: 1 + r() * 2.2, enciende: 20 + r() * 120, adulto: r() < 0.07, fase: r() * 6.28});
    }
    return out;
  }, []);

  const tAdulto = rango(f, cambio, cambio + 45);
  const etiqueta = tAdulto < 0.5 ? 'AGE 8 · EVERYTHING IS NEW' : 'AGE 40 · SAME WEEK, AGAIN';
  const medidor = interpolate(tAdulto, [0, 1], [rango(f, 20, 140), 0.08]);

  return (
    <AbsoluteFill style={{opacity: 1 - rango(f, dur - 15, dur)}}>
      <svg width={1920} height={1080}>
        <defs>
          <filter id="brilloOro" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#brilloOro)">
          {estrellas.map((e, i) => {
            const encendida = rango(f, e.enciende, e.enciende + 18);
            // en la fase adulta solo unas pocas siguen grabándose
            const vivo = e.adulto ? 1 : 1 - tAdulto;
            const nuevo = encendida * vivo;
            const titileo = 0.85 + 0.15 * Math.sin(f * 0.08 + e.fase);
            return (
              <g key={i}>
                <circle cx={e.x} cy={e.y} r={e.r * 0.8} fill={C.niebla} opacity={0.22} />
                {nuevo > 0.01 && <circle cx={e.x} cy={e.y} r={e.r * (1 + nuevo * 0.6)} fill={C.oro} opacity={nuevo * titileo} />}
              </g>
            );
          })}
        </g>
      </svg>
      {/* etiqueta de fase */}
      <div style={{position: 'absolute', top: 70, left: 120, fontFamily: MONO, fontSize: 24, letterSpacing: 6, color: C.oro, opacity: rango(f, 10, 30)}}>
        {etiqueta}
      </div>
      {/* medidor de recuerdos nuevos */}
      <div style={{position: 'absolute', top: 120, left: 120, width: 360}}>
        <div style={{fontFamily: MONO, fontSize: 18, letterSpacing: 4, color: C.niebla, marginBottom: 10}}>NEW MEMORIES RECORDED</div>
        <div style={{height: 6, background: C.nieblaSuave, borderRadius: 3}}>
          <div style={{width: `${medidor * 100}%`, height: 6, background: tAdulto > 0.5 ? C.rojo : C.oro, borderRadius: 3}} />
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 170,
          width: '100%',
          textAlign: 'center',
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontSize: 50,
          color: C.luz,
          opacity: rango(f, cambio + 50, cambio + 75),
        }}
      >
        Weeks collapse into a single blur.
      </div>
    </AbsoluteFill>
  );
};
