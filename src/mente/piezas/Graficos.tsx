import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, MONO, SANS, SERIF, rango} from '../estilo';
import {Escribe, Teclea, tecla} from './TextoAnimado';

// Piezas de motion graphics del vídeo 01 (todas abstractas: nunca dibujan personas).
// Cada pieza dura lo que diga su <Sequence>; aquí solo se anima con el fotograma local.

const Etiqueta: React.FC<{texto: string; f: number}> = ({texto, f}) => (
  <div style={{position: 'absolute', top: 90, width: '100%', textAlign: 'center', fontFamily: MONO, fontSize: 24, letterSpacing: 8, color: C.oro}}>
    <Teclea texto={texto} desde={4} />
  </div>
);

// `texto` admite marcado: *acento dorado*, !acento rojo!
const Frase: React.FC<{texto: string; f: number; desde: number; abajo?: number}> = ({texto, desde, abajo = 150}) => (
  <div style={{position: 'absolute', bottom: abajo, width: '100%', textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontSize: 52, color: C.luz}}>
    <Escribe texto={texto} desde={desde} ritmo={5} />
  </div>
);

// Cap. 1 · Teoría proporcional (Janet, 1877): un año es una porción cada vez más pequeña de tu vida.
export const ProporcionVida: React.FC = () => {
  const f = useCurrentFrame();
  const edades = [10, 50];
  return (
    <AbsoluteFill>
      <Etiqueta texto="ONE YEAR · AS A SHARE OF YOUR LIFE" f={f} />
      <svg width={1920} height={1080}>
        {edades.map((edad, k) => {
          const cx = k === 0 ? 640 : 1280;
          const cy = 520;
          const r = 230;
          const aparece = rango(f, 15 + k * 40, 60 + k * 40);
          const ang = (2 * Math.PI) / edad;
          const x2 = cx + r * Math.sin(ang * aparece);
          const y2 = cy - r * Math.cos(ang * aparece);
          const grande = ang * aparece > Math.PI ? 1 : 0;
          return (
            <g key={edad} opacity={rango(f, 5 + k * 40, 25 + k * 40)}>
              <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.nieblaSuave} strokeWidth={2} />
              {Array.from({length: edad}, (_, i) => {
                const a = (2 * Math.PI * i) / edad;
                return <line key={i} x1={cx + r * 0.94 * Math.sin(a)} y1={cy - r * 0.94 * Math.cos(a)} x2={cx + r * Math.sin(a)} y2={cy - r * Math.cos(a)} stroke={C.nieblaSuave} />;
              })}
              <path d={`M${cx} ${cy} L${cx} ${cy - r} A${r} ${r} 0 ${grande} 1 ${x2} ${y2} Z`} fill={k === 0 ? C.oro : C.rojo} opacity={0.85} />
              <text x={cx} y={cy + r + 70} textAnchor="middle" fill={C.luz} fontFamily={SERIF} fontSize={46}>
                {tecla(`Age ${edad}`, f, 30 + k * 40, 24)}
              </text>
              <text x={cx} y={cy + r + 115} textAnchor="middle" fill={C.niebla} fontFamily={MONO} fontSize={24}>
                {tecla(`1 year = 1/${edad} of your life`, f, 50 + k * 40)}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', fontFamily: SANS, fontSize: 18, color: C.gris}}>
        <Teclea texto="Proportional theory · Paul Janet, 1877" desde={24} cps={70} cursor="transparent" />
      </div>
    </AbsoluteFill>
  );
};

// Cap. 1 · Wittmann & Lehnhoff (2005): sensación de velocidad de la última década según la edad (forma cualitativa).
export const CurvaDecada: React.FC = () => {
  const f = useCurrentFrame();
  const x0 = 360, x1 = 1560, y0 = 780, y1 = 300;
  const t = rango(f, 15, 110);
  const puntos = Array.from({length: 60}, (_, i) => {
    const u = i / 59;
    const v = 1 - Math.exp(-u * 3.2); // sube y se aplana
    return [x0 + u * (x1 - x0), y0 - v * (y0 - y1)];
  });
  const visibles = puntos.slice(0, Math.max(2, Math.round(t * puntos.length)));
  return (
    <AbsoluteFill>
      <Etiqueta texto="HOW FAST DID THE LAST 10 YEARS FEEL?" f={f} />
      <svg width={1920} height={1080}>
        <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={C.nieblaSuave} strokeWidth={2} />
        <line x1={x0} y1={y0} x2={x0} y2={y1 - 40} stroke={C.nieblaSuave} strokeWidth={2} />
        <text x={x0} y={y0 + 50} fill={C.niebla} fontFamily={MONO} fontSize={22}>{tecla('YOUNGER', f, 12)}</text>
        <text x={x1} y={y0 + 50} textAnchor="end" fill={C.niebla} fontFamily={MONO} fontSize={22}>{tecla('OLDER', f, 100)}</text>
        <text x={x0 - 20} y={y1 - 50} fill={C.niebla} fontFamily={MONO} fontSize={22}>{tecla('FASTER ↑', f, 20)}</text>
        <polyline points={visibles.map((p) => p.join(',')).join(' ')} fill="none" stroke={C.oro} strokeWidth={5} strokeLinecap="round" />
      </svg>
      <div style={{position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', fontFamily: SANS, fontSize: 18, color: C.gris}}>
        <Teclea texto="Shape based on Wittmann & Lehnhoff (2005) · illustrative" desde={24} cps={70} cursor="transparent" />
      </div>
    </AbsoluteFill>
  );
};

// Cap. 3 · Experimento de la caída (Stetson, Fiesta & Eagleman, 2007).
export const ExperimentoCaida: React.FC = () => {
  const f = useCurrentFrame();
  const caida = rango(f, 40, 130, 0, 1, (x) => x * x); // aceleración
  const yCaja = 250 + caida * 520;
  const altura = Math.round(31 * (1 - caida));
  const parpadeo = Math.floor(f / 2) % 10;
  return (
    <AbsoluteFill>
      <Etiqueta texto="THE EXPERIMENT · 2007" f={f} />
      <svg width={1920} height={1080}>
        {/* torre */}
        <rect x={760} y={200} width={20} height={640} fill={C.nieblaSuave} />
        <rect x={980} y={200} width={20} height={640} fill={C.nieblaSuave} />
        <line x1={760} y1={220} x2={1000} y2={220} stroke={C.niebla} strokeWidth={3} />
        {/* red */}
        <path d={`M760 ${850} Q880 ${880 + caida * 30} 1000 850`} fill="none" stroke={C.niebla} strokeWidth={3} strokeDasharray="8 8" />
        {/* volunteer: un punto de luz, no una figura humana */}
        <circle cx={880} cy={yCaja} r={22} fill={C.oro} />
        <circle cx={880} cy={yCaja} r={44} fill={C.oro} opacity={0.18} />
        <text x={1060} y={yCaja + 10} fill={C.luz} fontFamily={MONO} fontSize={30}>{altura} m</text>
      </svg>
      {/* cronómetro de muñeca: dígitos demasiado rápidos */}
      <div style={{position: 'absolute', left: 1240, top: 380, width: 330, padding: 26, border: `1px solid ${C.nieblaSuave}`, borderRadius: 14, background: 'rgba(11,16,36,0.7)', opacity: rango(f, 140, 160)}}>
        <div style={{fontFamily: MONO, fontSize: 18, letterSpacing: 4, color: C.niebla}}>WRIST DISPLAY</div>
        <div style={{fontFamily: MONO, fontSize: 110, color: C.rojo, textAlign: 'center', filter: 'blur(1.2px)'}}>{parpadeo}</div>
        <div style={{fontFamily: SANS, fontSize: 20, color: C.niebla, textAlign: 'center'}}>too fast to read</div>
      </div>
      <Frase f={f} desde={200} texto="Not one of them could *read* it." />
      <div style={{position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', fontFamily: SANS, fontSize: 18, color: C.gris}}>
        <Teclea texto="Stetson, Fiesta & Eagleman · PLoS ONE, 2007" desde={24} cps={70} cursor="transparent" />
      </div>
    </AbsoluteFill>
  );
};

// Cap. 4 · Modelo de la compuerta atencional: pulsos que entran o no según la atención al tiempo.
export const CompuertaAtencion: React.FC = () => {
  const f = useCurrentFrame();
  const abierta = f < 150; // primero aburrido (abierta), luego absorto (cerrada)
  const apertura = abierta ? 1 : interpolate(f, [150, 175], [1, 0.12], {extrapolateRight: 'clamp'});
  const contados = Math.floor(Math.min(f, 150) / 6) + Math.floor(Math.max(0, f - 175) / 40);
  return (
    <AbsoluteFill>
      <Etiqueta texto={abierta ? 'BORED · WATCHING THE CLOCK' : 'ABSORBED · FORGETTING THE CLOCK'} f={f} />
      <svg width={1920} height={1080}>
        {Array.from({length: 14}, (_, i) => {
          const x = ((f * 9 + i * 120) % 1680) + 120;
          const pasa = x < 900 || Math.abs(Math.sin(i * 7.3)) < apertura;
          if (x > 900 && !pasa) return null;
          return <circle key={i} cx={x} cy={540} r={12} fill={x > 900 ? C.oro : C.niebla} opacity={x > 1500 ? 0.3 : 0.9} />;
        })}
        {/* compuerta */}
        <rect x={895} y={540 - 160} width={12} height={160 * (1 - apertura)} fill={C.luz} />
        <rect x={895} y={540} width={12} height={160 * (1 - apertura)} fill={C.luz} />
      </svg>
      <div style={{position: 'absolute', right: 160, top: 300, textAlign: 'right'}}>
        <div style={{fontFamily: MONO, fontSize: 20, letterSpacing: 4, color: C.niebla}}>TICKS COUNTED</div>
        <div style={{fontFamily: MONO, fontSize: 90, color: abierta ? C.rojo : C.oro}}>{contados}</div>
      </div>
      <Frase f={f} desde={190} texto="Watching time makes it *longer.*" />
      <div style={{position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', fontFamily: SANS, fontSize: 18, color: C.gris}}>
        <Teclea texto="Attentional-gate model · Zakay & Block (1997)" desde={24} cps={70} cursor="transparent" />
      </div>
    </AbsoluteFill>
  );
};

// Cap. 5 · Michel Siffre (1962): lo que creía frente a la realidad.
export const CalendariosSiffre: React.FC = () => {
  const f = useCurrentFrame();
  const Mes: React.FC<{titulo: string; dia: number; diasMes: number; rojo: boolean; x: number; aparece: number}> = ({titulo, dia, diasMes, rojo, x, aparece}) => (
    <div style={{position: 'absolute', left: x, top: 230, width: 560, opacity: aparece}}>
      <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: 6, color: rojo ? C.rojo : C.oro, marginBottom: 18}}>
        <Teclea texto={titulo} desde={rojo ? 72 : 17} cursor={rojo ? C.rojo : C.oro} />
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8}}>
        {Array.from({length: diasMes}, (_, i) => (
          <div
            key={i}
            style={{
              height: 58,
              borderRadius: 6,
              fontFamily: MONO,
              fontSize: 20,
              color: i + 1 === dia ? C.noche : C.niebla,
              background: i + 1 === dia ? (rojo ? C.rojo : C.oro) : 'rgba(160,178,230,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <AbsoluteFill>
      <Etiqueta texto="58 DAYS UNDERGROUND · NO CLOCKS · 1962" f={f} />
      <Mes titulo="WHAT HE BELIEVED · AUGUST" dia={20} diasMes={31} rojo={false} x={330} aparece={rango(f, 15, 35)} />
      <Mes titulo="REALITY · SEPTEMBER" dia={14} diasMes={30} rojo x={1030} aparece={rango(f, 70, 90)} />
      <Frase f={f} desde={130} texto="Almost a month of his life, !gone.!" />
      <div style={{position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', fontFamily: SANS, fontSize: 18, color: C.gris}}>
        <Teclea texto="Michel Siffre · Scarasson cave, 1962" desde={24} cps={70} cursor="transparent" />
      </div>
    </AbsoluteFill>
  );
};

// Cap. 7 · Cronostasis: reloj analógico; el primer salto del segundero parece durar más.
export const RelojCronostasis: React.FC = () => {
  const f = useCurrentFrame();
  const seg = Math.floor(f / 30);
  const ang = seg * 6;
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <Etiqueta texto="LOOK AT THE SECOND HAND" f={f} />
      <svg width={700} height={700} viewBox="-350 -350 700 700">
        <circle r={320} fill="rgba(11,16,36,0.8)" stroke={C.niebla} strokeWidth={3} />
        {Array.from({length: 60}, (_, i) => (
          <line key={i} x1={0} y1={-300} x2={0} y2={i % 5 === 0 ? -265 : -285} stroke={i % 5 === 0 ? C.luz : C.nieblaSuave} strokeWidth={i % 5 === 0 ? 5 : 2} transform={`rotate(${i * 6})`} />
        ))}
        <line x1={0} y1={30} x2={0} y2={-180} stroke={C.luz} strokeWidth={10} strokeLinecap="round" transform="rotate(300)" />
        <line x1={0} y1={30} x2={0} y2={-250} stroke={C.luz} strokeWidth={7} strokeLinecap="round" transform="rotate(48)" />
        <line x1={0} y1={50} x2={0} y2={-290} stroke={C.rojo} strokeWidth={3} transform={`rotate(${ang})`} />
        <circle r={10} fill={C.rojo} />
      </svg>
    </AbsoluteFill>
  );
};

// Cap. 7 · Efecto flash-lag: un destello alineado con un punto en movimiento parece quedarse atrás.
export const PruebaFlashLag: React.FC = () => {
  const f = useCurrentFrame();
  const ciclo = 75;
  const local = f % ciclo;
  const x = 260 + (local / ciclo) * 1400;
  const destello = local >= 36 && local <= 38 && f < ciclo * 2;
  const congela = f >= ciclo * 2;
  const xc = 260 + (37 / ciclo) * 1400;
  return (
    <AbsoluteFill>
      <Etiqueta texto="KEEP YOUR EYES ON THE DOT" f={f} />
      <svg width={1920} height={1080}>
        <circle cx={congela ? xc : x} cy={540} r={26} fill={C.luz} />
        {(destello || congela) && <rect x={(congela ? xc : x) - 14} y={420} width={28} height={60} fill={C.oro} />}
        {congela && <line x1={xc} x2={xc} y1={380} y2={600} stroke={C.rojo} strokeWidth={2} strokeDasharray="6 6" opacity={rango(f, ciclo * 2, ciclo * 2 + 15)} />}
      </svg>
      {congela && <Frase f={f} desde={ciclo * 2 + 10} texto="They were *perfectly* lined up." />}
    </AbsoluteFill>
  );
};

// Cap. 4 / 8 · Paradoja de las vacaciones: dos relojes que nunca coinciden.
export const DosRelojes: React.FC = () => {
  const f = useCurrentFrame();
  const fila = (y: number, titulo: string, vivir: number, recordar: number, color: string, k: number) => (
    <div style={{position: 'absolute', left: 260, top: y, width: 1400, opacity: rango(f, 10 + k * 30, 30 + k * 30)}}>
      <div style={{fontFamily: SERIF, fontSize: 46, color: C.luz, marginBottom: 18}}>
        <Escribe texto={titulo} desde={12 + k * 30} ritmo={4} />
      </div>
      {[
        ['LIVING IT', vivir],
        ['REMEMBERING IT', recordar],
      ].map(([etq, v], i) => (
        <div key={i} style={{display: 'flex', alignItems: 'center', marginBottom: 14}}>
          <div style={{width: 260, fontFamily: MONO, fontSize: 20, letterSpacing: 3, color: C.niebla}}>
            <Teclea texto={etq as string} desde={30 + k * 30 + i * 15} cursor={C.niebla} />
          </div>
          <div style={{height: 26, borderRadius: 6, background: color, width: `${(v as number) * 100 * rango(f, 40 + k * 30 + i * 15, 90 + k * 30 + i * 15)}%`, maxWidth: 1100}} />
        </div>
      ))}
    </div>
  );
  return (
    <AbsoluteFill>
      <Etiqueta texto="THE TWO CLOCKS IN YOUR HEAD" f={f} />
      {fila(250, 'A night you loved', 0.15, 0.85, C.oro, 0)}
      {fila(560, 'An hour in a waiting room', 0.85, 0.06, C.rojo, 1)}
      <div style={{position: 'absolute', bottom: 40, width: '100%', textAlign: 'center', fontFamily: SANS, fontSize: 18, color: C.gris}}>
        <Teclea texto="The holiday paradox · Claudia Hammond (2012) · illustrative" desde={24} cps={70} cursor="transparent" />
      </div>
    </AbsoluteFill>
  );
};
