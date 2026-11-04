import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {Clip} from './opciones2';

// =====================================================================
// Medidor elegido: VIDAS EN ROSQUILLAS (Luckiest Guy).
// Cada vida perdida se come en 3 mordiscos, con migas y sonido de mordida.
// =====================================================================
loadFont({family: 'LuckiestGuy', url: staticFile('fonts/LuckiestGuy-latin.woff2'), weight: '400'});

const NEG = '#0E0E12';
const ROSA = '#FF8CC6';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const trazo = (px: number): React.CSSProperties => ({WebkitTextStroke: `${px}px ${NEG}`, paintOrder: 'stroke fill'});

/** Fotogramas desde que empieza a comerse cada mordisco. */
export const MORDISCOS = [0, 4, 8];
export const DUR_COMER = 12;

// Forma de un mordisco: varios círculos en arco = borde con marcas de dientes.
function mordida(cx: number, cy: number, r: number, ang: number) {
  const out: [number, number, number][] = [[cx, cy, r]];
  for (let i = -2; i <= 2; i++) {
    const a = ang + Math.PI + i * 0.38;
    out.push([cx + Math.cos(a) * r * 0.92, cy + Math.sin(a) * r * 0.92, r * 0.28]);
  }
  return out;
}
// Tres mordiscos: derecha, arriba, y el último se lleva el resto
const BOCADOS = [mordida(94, 38, 34, -0.3), mordida(44, 4, 36, -Math.PI / 2 - 0.3), mordida(30, 64, 62, Math.PI * 0.8)];

const Rosquilla: React.FC<{id: string; comida: number; t?: number}> = ({id, comida, t = 150}) => {
  // comida: fotogramas desde que empezó a comérsela (<0 = intacta)
  const n = comida < 0 ? 0 : MORDISCOS.filter((m) => comida >= m).length;
  const ultimo = n > 0 ? comida - MORDISCOS[n - 1] : 99;
  const aplasta = n > 0 && ultimo < 4 ? 1 - 0.1 * (1 - ultimo / 4) : 1;
  const gira = n > 0 && ultimo < 4 ? Math.sin(ultimo * 3) * 8 : 0;
  const desaparece = comida >= DUR_COMER;
  return (
    <div style={{position: 'relative', width: t, height: t}}>
      {/* hueco que queda cuando ya no está */}
      <svg width={t} height={t} viewBox="0 0 100 100" style={{position: 'absolute', opacity: interpolate(comida, [DUR_COMER - 2, DUR_COMER + 4], [0, 1], clamp)}}>
        <circle cx={50} cy={50} r={42} fill="rgba(14,14,18,0.35)" stroke="rgba(255,255,255,0.55)" strokeWidth={4} strokeDasharray="8 7" />
      </svg>
      {!desaparece && (
        <svg width={t} height={t} viewBox="0 0 100 100" style={{position: 'absolute', transform: `scale(${aplasta}, ${2 - aplasta}) rotate(${gira}deg)`}}>
          <defs>
            <radialGradient id={`mz${id}`} cx="40%" cy="35%">
              <stop offset="0" stopColor="#F7C989" />
              <stop offset="1" stopColor="#B86B25" />
            </radialGradient>
            <clipPath id={`cl${id}`}>
              <circle cx={50} cy={50} r={46} />
            </clipPath>
            <mask id={`mk${id}`}>
              <rect x={-10} y={-10} width={120} height={120} fill="#fff" />
              {BOCADOS.slice(0, n).map((b, i) => b.map(([x, y, r], j) => <circle key={`${i}-${j}`} cx={x} cy={y} r={r} fill="#000" />))}
            </mask>
          </defs>
          <g mask={`url(#mk${id})`}>
            <circle cx={50} cy={50} r={46} fill={`url(#mz${id})`} stroke={NEG} strokeWidth={6} />
            <path d="M50,10 a40,40 0 1 1 -0.1,0 M50,32 a18,18 0 1 0 0.1,0" fill={ROSA} stroke={NEG} strokeWidth={3} fillRule="evenodd" />
            {[[30, 22, 20], [68, 24, -30], [80, 50, 60], [70, 76, 10], [40, 80, -50], [20, 58, 80], [24, 36, -10]].map(([x, y, r], i) => (
              <rect key={i} x={x - 6} y={y - 2.5} width={12} height={5} rx={2.5} fill={['#fff', '#38BDF8', '#FDE047', '#4ADE80'][i % 4]} transform={`rotate(${r} ${x} ${y})`} />
            ))}
            <circle cx={50} cy={50} r={16} fill="none" stroke={NEG} strokeWidth={5} />
          </g>
          {/* borde de la mordida: línea oscura para que se lea el diente */}
          {BOCADOS.slice(0, n).map((b, i) => (
            <g key={i} mask={`url(#mk${id})`} clipPath={`url(#cl${id})`}>
              {b.map(([x, y, r], j) => (
                <circle key={j} cx={x} cy={y} r={r + 2.5} fill="none" stroke="#7A4314" strokeWidth={5} />
              ))}
            </g>
          ))}
        </svg>
      )}
      {/* migas que saltan en cada mordisco */}
      {comida >= 0 &&
        MORDISCOS.map((m, i) =>
          Array.from({length: 6}).map((_, j) => {
            const k = comida - m;
            if (k < 0 || k > 16) return null;
            const ang = -Math.PI / 2 + (j - 2.5) * 0.5 + i;
            const vel = 7 + (j % 3) * 2;
            const x = 50 + Math.cos(ang) * vel * k;
            const y = 40 + Math.sin(ang) * vel * k + 0.9 * k * k;
            return (
              <div
                key={`${i}-${j}`}
                style={{position: 'absolute', left: (x / 100) * t, top: (y / 100) * t, width: 12, height: 9, borderRadius: 4, background: j % 2 ? '#D99A55' : ROSA, border: `2px solid ${NEG}`, opacity: interpolate(k, [10, 16], [1, 0], clamp), transform: `rotate(${k * 40 + j * 30}deg)`}}
              />
            );
          }),
        )}
    </div>
  );
};

/**
 * Vidas en rosquillas. `perdidas` = fotograma (de la composición) en que se empieza a comer cada vida.
 * Las vidas se pierden de derecha a izquierda.
 */
export const VidasRosquillas: React.FC<{perdidas: number[]; total?: number; pct?: number}> = ({perdidas, total = 5, pct}) => {
  const f = useCurrentFrame();
  const vivas = total - perdidas.filter((p) => f >= p + DUR_COMER).length;
  const ultimo = perdidas.filter((p) => f >= p).pop();
  const k = ultimo === undefined ? 99 : f - ultimo;
  const valor = pct ?? Math.round((vivas / total) * 100);
  return (
    <div style={{position: 'absolute', left: 46, top: 110, filter: 'drop-shadow(0 8px 0 rgba(0,0,0,0.3)) drop-shadow(0 16px 28px rgba(0,0,0,0.35))'}}>
      <div style={{fontFamily: 'LuckiestGuy', fontSize: 72, color: '#fff', ...trazo(12)}}>
        SURVIVAL <span style={{color: ROSA, display: 'inline-block', transform: `scale(${k < 8 ? 1 + 0.25 * (1 - k / 8) : 1})`}}>{valor}%</span>
      </div>
      <div style={{display: 'flex', gap: 8, marginTop: 4}}>
        {Array.from({length: total}).map((_, i) => {
          const j = total - 1 - i; // se comen de derecha a izquierda
          const p = perdidas[j];
          return <Rosquilla key={i} id={`r${i}`} comida={p === undefined ? -1 : f - p} />;
        })}
      </div>
      {k >= 0 && k < 14 && (
        <div style={{position: 'absolute', left: 120 + (total - perdidas.filter((p) => f >= p).length) * 158 - 40, top: 60 - k * 3, fontFamily: 'LuckiestGuy', fontSize: 64, color: '#fff', transform: `rotate(-10deg) scale(${interpolate(k, [0, 3], [0.5, 1.1], clamp)})`, opacity: interpolate(k, [9, 14], [1, 0], clamp), ...trazo(10), whiteSpace: 'nowrap'}}>
          CHOMP!
        </div>
      )}
    </div>
  );
};

/** Sonidos para colocar en la composición: mordiscos + "glup" de cada vida perdida. */
export const SonidoRosquillas: React.FC<{perdidas: number[]}> = ({perdidas}) => (
  <>
    {perdidas.map((p, i) => (
      <React.Fragment key={i}>
        <Sequence from={p}>
          <Audio src={staticFile('survive/sfx/mordiscos.wav')} volume={0.9} />
        </Sequence>
        <Sequence from={p + DUR_COMER}>
          <Audio src={staticFile('survive/sfx/glup.wav')} volume={0.5} />
        </Sequence>
      </React.Fragment>
    ))}
  </>
);

// ---------- Demo ----------
const PERDIDAS_DEMO = [30, 66, 102];
export const DUR_DEMO_ROSQ = 150;
export const DemoRosquillas: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Clip src={1226.6} vel={1.0} cx={0.5} zoom={[1.05, 1.2]} dur={DUR_DEMO_ROSQ} />
    </AbsoluteFill>
    <VidasRosquillas perdidas={PERDIDAS_DEMO} />
    <SonidoRosquillas perdidas={PERDIDAS_DEMO} />
  </AbsoluteFill>
);
