import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {loadFont} from '@remotion/fonts';

// =====================================================================
// 5 alarmas "dibujadas como en la serie": colores planos, contorno marrón oscuro,
// una sola sombra dura (cel), objetos de Springfield. Texto: W8 4 IT.
// Cada una tiene estado encendido / apagado (parpadeo).
// =====================================================================
loadFont({family: 'LuckiestGuy', url: staticFile('fonts/LuckiestGuy-latin.woff2'), weight: '400'});

const OL = '#2B1A10'; // contorno estilo serie (marrón casi negro, no negro puro)
const W = 5; // grosor de línea
const AM = '#FFD90F';
const TXT = 'W8 4 IT';
export const CICLO = 14;
export const ENC = 9;
const encendida = (f: number) => f % CICLO < ENC;

type P = {on: boolean; f: number};

// Resplandor suave (degradado radial) alrededor de una luz encendida
let nGlow = 0;
const Glow: React.FC<{cx: number; cy: number; r: number; color: string}> = ({cx, cy, r, color}) => {
  const id = React.useMemo(() => `glow${nGlow++}`, []);
  return (
    <>
      <defs>
        <radialGradient id={id}>
          <stop offset="0%" stopColor={color} stopOpacity={0.75} />
          <stop offset="45%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
    </>
  );
};

// Texto con contorno dentro de un SVG
const Letras: React.FC<{x: number; y: number; size: number; fill: string; stroke?: string; sw?: number; children: string; rot?: number}> = ({x, y, size, fill, stroke = OL, sw = 8, children, rot = 0}) => (
  <text x={x} y={y} textAnchor="middle" fontFamily="LuckiestGuy" fontSize={size} fill={fill} stroke={stroke} strokeWidth={sw} paintOrder="stroke" strokeLinejoin="round" transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}>
    {children}
  </text>
);

// Rayitas de "está sonando" (como dibujan el movimiento en la serie)
const Rayas: React.FC<{x: number; y: number; lado: 1 | -1; on: boolean}> = ({x, y, lado, on}) =>
  on ? (
    <g stroke={OL} strokeWidth={W} strokeLinecap="round">
      <line x1={x} y1={y - 26} x2={x + 26 * lado} y2={y - 40} />
      <line x1={x + 4 * lado} y1={y} x2={x + 34 * lado} y2={y} />
      <line x1={x} y1={y + 26} x2={x + 26 * lado} y2={y + 40} />
    </g>
  ) : null;

// ---------- 1 · Baliza de la planta nuclear ----------
export const Alarma1: React.FC<P> = ({on, f}) => {
  const giro = (f * 30) % 360;
  const hx = 50 * Math.cos((giro * Math.PI) / 180);
  return (
    <svg width={560} height={330} viewBox="0 0 560 330" overflow="visible">
      {/* haz de luz */}
      {on && <Glow cx={280} cy={56} r={130} color="#FF3B2F" />}
      {on && (
        <g opacity={0.35}>
          <path d={`M280 56 L${280 - 200 + hx} ${20 - Math.abs(hx) * 0.4} L${280 - 200 + hx} ${92 + Math.abs(hx) * 0.4} Z`} fill="#FF5A3C" />
          <path d={`M280 56 L${280 + 200 + hx} ${20 - Math.abs(hx) * 0.4} L${280 + 200 + hx} ${92 + Math.abs(hx) * 0.4} Z`} fill="#FF5A3C" />
        </g>
      )}
      {/* base de la baliza */}
      <rect x={232} y={92} width={96} height={30} rx={6} fill="#6F7A6B" stroke={OL} strokeWidth={W} />
      {/* cúpula */}
      <path d="M244 94 L244 52 Q244 14 280 14 Q316 14 316 52 L316 94 Z" fill={on ? '#FF4632' : '#8E2A20'} stroke={OL} strokeWidth={W} />
      <path d="M296 94 L296 30 Q312 38 316 52 L316 94 Z" fill={on ? '#D9261A' : '#6A1C15'} />
      {on && <ellipse cx={262} cy={42} rx={8} ry={14} fill="#FFE1D6" />}
      {/* rejilla */}
      {[258, 280, 302].map((x) => (
        <line key={x} x1={x} y1={18} x2={x} y2={94} stroke={OL} strokeWidth={4} />
      ))}
      <line x1={244} y1={60} x2={316} y2={60} stroke={OL} strokeWidth={4} />
      {/* placa verde de la planta, con remaches */}
      <rect x={40} y={118} width={480} height={190} rx={18} fill="#8FC9A5" stroke={OL} strokeWidth={W} />
      <rect x={40} y={262} width={480} height={46} rx={0} fill="#74AE8A" />
      <rect x={40} y={118} width={480} height={190} rx={18} fill="none" stroke={OL} strokeWidth={W} />
      {/* franja de peligro */}
      <clipPath id="a1c">
        <rect x={62} y={252} width={436} height={36} rx={6} />
      </clipPath>
      <g clipPath="url(#a1c)">
        <rect x={62} y={252} width={436} height={36} fill={AM} />
        {Array.from({length: 16}).map((_, i) => (
          <path key={i} d={`M${50 + i * 34} 288 L${68 + i * 34} 252 L${84 + i * 34} 252 L${66 + i * 34} 288 Z`} fill={OL} />
        ))}
      </g>
      <rect x={62} y={252} width={436} height={36} rx={6} fill="none" stroke={OL} strokeWidth={W} />
      {[[62, 140], [498, 140], [62, 236], [498, 236]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={6} fill="#C9D6C6" stroke={OL} strokeWidth={3} />
      ))}
      {/* letrero luminoso */}
      <rect x={88} y={138} width={384} height={104} rx={12} fill={on ? '#3A1410' : '#2A2622'} stroke={OL} strokeWidth={W} />
      <Letras x={280} y={222} size={88} fill={on ? '#FFB23F' : '#5B4A3A'} sw={0}>
        {TXT}
      </Letras>
    </svg>
  );
};

// ---------- 2 · Despertador de campanas (como el de la mesita de luz) ----------
export const Alarma2: React.FC<P> = ({on, f}) => {
  const tiembla = on ? Math.sin(f * 2.2) * 6 : 0;
  const martillo = on ? (f % 2 ? -14 : 14) : 0;
  return (
    <svg width={560} height={340} viewBox="0 0 560 340" overflow="visible">
      <Rayas x={128} y={150} lado={-1} on={on} />
      <Rayas x={432} y={150} lado={1} on={on} />
      <g transform={`rotate(${tiembla} 280 190)`}>
        {/* patas */}
        <path d="M200 280 L176 322" stroke={OL} strokeWidth={14} strokeLinecap="round" />
        <path d="M360 280 L384 322" stroke={OL} strokeWidth={14} strokeLinecap="round" />
        {/* campanas: cúpulas inclinadas encima del reloj */}
        {[-1, 1].map((s) => (
          <g key={s} transform={`rotate(${s * 32} ${280 + s * 78} 92)`}>
            <path d={`M${280 + s * 78 - 50} 96 Q${280 + s * 78 - 50} 34 ${280 + s * 78} 34 Q${280 + s * 78 + 50} 34 ${280 + s * 78 + 50} 96 Z`} fill="#D6DCE6" stroke={OL} strokeWidth={W} strokeLinejoin="round" />
            <path d={`M${280 + s * 78 + 14} 40 Q${280 + s * 78 + 50} 44 ${280 + s * 78 + 50} 96 L${280 + s * 78 + 22} 96 Z`} fill="#AEB6C4" />
            <circle cx={280 + s * 78} cy={30} r={8} fill="#D6DCE6" stroke={OL} strokeWidth={4} />
          </g>
        ))}
        {/* martillo */}
        <g transform={`rotate(${martillo} 280 92)`}>
          <line x1={280} y1={92} x2={280} y2={22} stroke={OL} strokeWidth={6} />
          <circle cx={280} cy={20} r={11} fill="#D6DCE6" stroke={OL} strokeWidth={4} />
        </g>
        {/* cuerpo rojo */}
        <circle cx={280} cy={190} r={118} fill="#E8402F" stroke={OL} strokeWidth={W} />
        <path d="M330 84 A118 118 0 0 1 280 308 A124 124 0 0 0 330 84 Z" fill="#B92C20" />
        {/* esfera */}
        <circle cx={280} cy={190} r={92} fill={on ? '#FFF6D8' : '#D8CFB6'} stroke={OL} strokeWidth={W} />
        {[0, 1, 2, 3].map((i) => {
          const a = (i * Math.PI) / 2;
          return <line key={i} x1={280 + Math.cos(a) * 78} y1={190 + Math.sin(a) * 78} x2={280 + Math.cos(a) * 88} y2={190 + Math.sin(a) * 88} stroke={OL} strokeWidth={4} />;
        })}
        <Letras x={280} y={182} size={64} fill={on ? '#E8402F' : '#9C7A6E'} sw={0}>
          W8
        </Letras>
        <Letras x={280} y={240} size={56} fill={on ? '#E8402F' : '#9C7A6E'} sw={0}>
          4 IT
        </Letras>
      </g>
    </svg>
  );
};

// ---------- 3 · Barra de luces de la patrulla ----------
export const Alarma3: React.FC<P> = ({on, f}) => {
  const fase = Math.floor(f / CICLO) % 2; // alterna rojo / azul
  const rojo = on && fase === 0;
  const azul = on && fase === 1;
  return (
    <svg width={620} height={250} viewBox="0 0 620 250" overflow="visible">
      {rojo && <Glow cx={115} cy={135} r={170} color="#FF2B2B" />}
      {azul && <Glow cx={505} cy={135} r={170} color="#3B8BFF" />}
      {/* soporte */}
      <path d="M150 196 L130 236 M470 196 L490 236" stroke={OL} strokeWidth={10} strokeLinecap="round" />
      {/* cuerpo de la barra */}
      <rect x={20} y={70} width={580} height={130} rx={60} fill="#2F3A4F" stroke={OL} strokeWidth={W} />
      {/* domo rojo */}
      <path d="M40 135 Q40 80 95 80 L190 80 L190 190 L95 190 Q40 190 40 135 Z" fill={rojo ? '#FF3A2E' : '#7A1E18'} stroke={OL} strokeWidth={W} />
      {rojo && <ellipse cx={86} cy={112} rx={22} ry={10} fill="#FFD3CC" />}
      {/* domo azul */}
      <path d="M580 135 Q580 80 525 80 L430 80 L430 190 L525 190 Q580 190 580 135 Z" fill={azul ? '#3D8BFF' : '#1C3666'} stroke={OL} strokeWidth={W} />
      {azul && <ellipse cx={534} cy={112} rx={22} ry={10} fill="#D6E6FF" />}
      {/* placa central cromada */}
      <rect x={196} y={86} width={228} height={98} rx={12} fill="#E4E8EE" stroke={OL} strokeWidth={W} />
      <rect x={196} y={150} width={228} height={34} rx={0} fill="#C3CAD4" />
      <rect x={196} y={86} width={228} height={98} rx={12} fill="none" stroke={OL} strokeWidth={W} />
      <Letras x={310} y={162} size={66} fill={on ? (rojo ? '#E8302A' : '#2D6FE0') : '#5D6676'} sw={0}>
        {TXT}
      </Letras>
    </svg>
  );
};

// ---------- 4 · Cruce de tren (luces que se alternan) ----------
export const Alarma4: React.FC<P> = ({on, f}) => {
  const izq = on && Math.floor(f / 5) % 2 === 0;
  const der = on && !izq;
  const Luz: React.FC<{x: number; prendida: boolean}> = ({x, prendida}) => (
    <g>
      {prendida && <Glow cx={x} cy={210} r={120} color="#FF3524" />}
      <circle cx={x} cy={210} r={52} fill="#1E1A1A" stroke={OL} strokeWidth={W} />
      <circle cx={x} cy={210} r={36} fill={prendida ? '#FF3B2A' : '#5E1B14'} stroke={OL} strokeWidth={4} />
      {prendida && <ellipse cx={x - 10} cy={198} rx={10} ry={6} fill="#FFD6CC" />}
      {/* visera */}
      <path d={`M${x - 52} 186 Q${x} 140 ${x + 52} 186`} fill="none" stroke={OL} strokeWidth={10} />
    </g>
  );
  return (
    <svg width={600} height={300} viewBox="0 0 600 300" overflow="visible">
      {/* cruz de San Andrés con el texto */}
      <g transform="translate(300 76)">
        {[-22, 22].map((r) => (
          <g key={r} transform={`rotate(${r})`}>
            <rect x={-170} y={-24} width={340} height={48} rx={6} fill="#FFFDF3" stroke={OL} strokeWidth={W} />
          </g>
        ))}
        <g transform="rotate(-22)">
          <text x={-86} y={14} textAnchor="middle" fontFamily="LuckiestGuy" fontSize={46} fill={OL}>W8</text>
        </g>
        <g transform="rotate(22)">
          <text x={86} y={14} textAnchor="middle" fontFamily="LuckiestGuy" fontSize={46} fill={OL}>4 IT</text>
        </g>
        <circle r={10} fill="#9AA0A8" stroke={OL} strokeWidth={3} />
      </g>
      {/* barra de las luces */}
      <rect x={110} y={196} width={380} height={28} rx={6} fill="#2E2E33" stroke={OL} strokeWidth={W} />
      <rect x={285} y={130} width={30} height={160} fill="#9AA0A8" stroke={OL} strokeWidth={W} />
      <Luz x={160} prendida={izq} />
      <Luz x={440} prendida={der} />
    </svg>
  );
};

// ---------- 5 · Tele vieja con "boletín de emergencia" ----------
export const Alarma5: React.FC<P> = ({on, f}) => (
  <svg width={520} height={380} viewBox="0 0 520 380" overflow="visible">
    {/* antena de conejo */}
    <line x1={260} y1={76} x2={190} y2={6} stroke={OL} strokeWidth={6} strokeLinecap="round" />
    <line x1={260} y1={76} x2={340} y2={10} stroke={OL} strokeWidth={6} strokeLinecap="round" />
    <circle cx={190} cy={6} r={8} fill="#C9CED6" stroke={OL} strokeWidth={4} />
    <circle cx={340} cy={10} r={8} fill="#C9CED6" stroke={OL} strokeWidth={4} />
    <ellipse cx={260} cy={80} rx={34} ry={14} fill="#6B5848" stroke={OL} strokeWidth={W} />
    {/* mueble de madera */}
    <rect x={20} y={84} width={480} height={270} rx={30} fill="#A0673A" stroke={OL} strokeWidth={W} />
    <rect x={20} y={300} width={480} height={54} fill="#83512B" />
    <rect x={20} y={84} width={480} height={270} rx={30} fill="none" stroke={OL} strokeWidth={W} />
    {/* patas */}
    <path d="M90 352 L80 378 M430 352 L440 378" stroke={OL} strokeWidth={10} strokeLinecap="round" />
    {/* pantalla */}
    <rect x={48} y={110} width={330} height={218} rx={36} fill={on ? '#C8231A' : '#3A403F'} stroke={OL} strokeWidth={W} />
    {on && <path d="M70 130 Q120 118 170 124" stroke="#FF8A7A" strokeWidth={8} fill="none" strokeLinecap="round" />}
    {!on &&
      Array.from({length: 26}).map((_, i) => {
        const x = 66 + ((i * 97 + f * 53) % 290);
        const y = 128 + ((i * 61 + f * 31) % 180);
        return <rect key={i} x={x} y={y} width={18} height={4} fill="#8A918F" />;
      })}
    {on && (
      <>
        <path d="M213 140 L246 196 L180 196 Z" fill={AM} stroke={OL} strokeWidth={4} strokeLinejoin="round" />
        <Letras x={213} y={190} size={32} fill={OL} sw={0}>!</Letras>
        <Letras x={213} y={282} size={76} fill="#FFF4E0" sw={9}>{TXT}</Letras>
      </>
    )}
    {/* perillas */}
    <circle cx={440} cy={150} r={22} fill="#E2C89A" stroke={OL} strokeWidth={W} />
    <line x1={440} y1={150} x2={452} y2={134} stroke={OL} strokeWidth={4} />
    <circle cx={440} cy={216} r={22} fill="#E2C89A" stroke={OL} strokeWidth={W} />
    <line x1={440} y1={216} x2={426} y2={202} stroke={OL} strokeWidth={4} />
    {[262, 278, 294].map((y) => (
      <line key={y} x1={414} y1={y} x2={466} y2={y} stroke={OL} strokeWidth={4} />
    ))}
  </svg>
);

export const ALARMAS = [Alarma1, Alarma2, Alarma3, Alarma4, Alarma5];
export const NOMBRES = ['1 · BALIZA DE LA PLANTA', '2 · DESPERTADOR', '3 · PATRULLA', '4 · CRUCE DE TREN', '5 · TELE DE EMERGENCIA'];

// Vista en contexto: la alarma arriba (tamaño real) sobre un cuadro del inicio
const enContexto = (i: number, on: boolean, fFijo = 4) => {
  const C: React.FC = () => {
    const fr = useCurrentFrame();
    const f = on ? fFijo : fr;
    const A = ALARMAS[i];
    const prendida = on || encendida(fr);
    return (
      <AbsoluteFill>
        <Img src={staticFile('survive/s01/clips/op_alarma_fondo.png')} style={{width: 1080, height: 1920}} />
        <div style={{position: 'absolute', top: 110, width: '100%', display: 'flex', justifyContent: 'center', filter: 'drop-shadow(0 10px 0 rgba(0,0,0,0.25))', transform: 'scale(0.82) rotate(-2deg)', transformOrigin: 'top center'}}>
          <A on={prendida} f={f} />
        </div>
      </AbsoluteFill>
    );
  };
  return C;
};
export const AlarmaVista = [0, 1, 2, 3, 4].map((i) => enContexto(i, true));
export const AlarmaAnim = [0, 1, 2, 3, 4].map((i) => enContexto(i, false));

// Hoja: las 5, encendida y apagada lado a lado
export const HojaAlarmas: React.FC = () => (
  <AbsoluteFill style={{background: '#4FA3E0', padding: 30, display: 'flex', flexDirection: 'column', gap: 18}}>
    {ALARMAS.map((A, i) => (
      <div key={i} style={{display: 'flex', alignItems: 'center', gap: 20, height: 360}}>
        <div style={{width: 300, fontFamily: 'LuckiestGuy', fontSize: 40, color: '#fff', WebkitTextStroke: `7px ${OL}`, paintOrder: 'stroke fill'}}>{NOMBRES[i]}</div>
        {[true, false].map((on) => (
          <div key={String(on)} style={{width: 640, height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
            <div style={{transform: 'scale(0.85)'}}>
              <A on={on} f={4} />
            </div>
            <div style={{position: 'absolute', bottom: 0, fontFamily: 'LuckiestGuy', fontSize: 26, color: '#fff', opacity: 0.85}}>{on ? 'ENCENDIDA' : 'APAGADA'}</div>
          </div>
        ))}
      </div>
    ))}
  </AbsoluteFill>
);
