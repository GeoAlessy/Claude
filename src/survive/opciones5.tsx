import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';

// =====================================================================
// Opciones v5 (solo imágenes): 5 barras estilo Simpsons + 5 estilo videojuego.
// Todas muestran el mismo valor (38%) sobre el mismo cuadro.
// =====================================================================
['LuckiestGuy', 'TitanOne', 'Chewy', 'PressStart2P', 'Bungee', 'Teko', 'BlackOpsOne', 'LilitaOne'].forEach((f) =>
  loadFont({family: f, url: staticFile(`fonts/${f}-latin.woff2`), weight: '400'}),
);

const V = 38;
const AM = '#FFD90F';
const NEG = '#0E0E12';
const SOMBRA = 'drop-shadow(0 8px 0 rgba(0,0,0,0.3)) drop-shadow(0 16px 28px rgba(0,0,0,0.35))';
const trazo = (px: number, c = NEG): React.CSSProperties => ({WebkitTextStroke: `${px}px ${c}`, paintOrder: 'stroke fill'});

const Marco: React.FC<{n: number; nombre: string; fuente: string; acento: string; children: React.ReactNode; tamSub?: number}> = ({n, nombre, fuente, acento, children, tamSub = 100}) => (
  <AbsoluteFill>
    <Img src={staticFile('survive/s01/clips/op_gancho.png')} style={{position: 'absolute', inset: 0, width: 1080, height: 1920}} />
    {children}
    <div style={{position: 'absolute', top: 1270, width: '100%', textAlign: 'center', fontFamily: fuente, fontSize: tamSub, transform: 'rotate(-2deg)', filter: SOMBRA}}>
      <span style={{color: '#fff', ...trazo(17)}}>HIT ONE: </span>
      <span style={{color: acento, ...trazo(17)}}>RIBS.</span>
    </div>
    <div style={{position: 'absolute', bottom: 70, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: 'rgba(10,10,14,0.85)', borderRadius: 18, padding: '14px 28px', fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 40, color: '#fff'}}>
        {n}. {nombre}
      </div>
    </div>
  </AbsoluteFill>
);

// ===================== ESTILO SIMPSONS =====================

// S1 · Vidas en rosquillas: cada golpe se come una
const Rosquilla: React.FC<{lleno: number; t?: number}> = ({lleno, t = 150}) => (
  <svg width={t} height={t} viewBox="0 0 100 100">
    <defs>
      <radialGradient id="mz" cx="40%" cy="35%">
        <stop offset="0" stopColor="#F7C989" />
        <stop offset="1" stopColor="#B86B25" />
      </radialGradient>
      <clipPath id={`mord${lleno}`}>
        {lleno >= 1 ? (
          <rect x={0} y={0} width={100} height={100} />
        ) : (
          <path d={`M0,0 H${100 * lleno + 8} q-10,12 0,22 q-12,10 0,22 q-12,10 0,22 q-12,10 0,22 V100 H0Z`} />
        )}
      </clipPath>
    </defs>
    {lleno > 0 && (
      <g clipPath={`url(#mord${lleno})`}>
        <circle cx={50} cy={50} r={46} fill="url(#mz)" stroke={NEG} strokeWidth={6} />
        <path d="M50,10 a40,40 0 1 1 -0.1,0 M50,32 a18,18 0 1 0 0.1,0" fill="#FF8CC6" stroke={NEG} strokeWidth={3} fillRule="evenodd" />
        {[[30, 22, 20], [68, 24, -30], [80, 50, 60], [70, 76, 10], [40, 80, -50], [20, 58, 80], [24, 36, -10]].map(([x, y, r], i) => (
          <rect key={i} x={x - 6} y={y - 2.5} width={12} height={5} rx={2.5} fill={['#fff', '#38BDF8', '#FDE047', '#4ADE80'][i % 4]} transform={`rotate(${r} ${x} ${y})`} />
        ))}
        <circle cx={50} cy={50} r={16} fill="none" stroke={NEG} strokeWidth={5} />
      </g>
    )}
    {lleno <= 0 && <circle cx={50} cy={50} r={44} fill="rgba(14,14,18,0.35)" stroke="rgba(255,255,255,0.5)" strokeWidth={4} strokeDasharray="8 7" />}
  </svg>
);
export const BS1: React.FC = () => (
  <Marco n={1} nombre="VIDAS EN ROSQUILLAS · Luckiest Guy" fuente="LuckiestGuy" acento="#FF8CC6">
    <div style={{position: 'absolute', left: 50, top: 120, filter: SOMBRA}}>
      <div style={{fontFamily: 'LuckiestGuy', fontSize: 72, color: '#fff', ...trazo(12)}}>
        SURVIVAL <span style={{color: '#FF8CC6'}}>{V}%</span>
      </div>
      <div style={{display: 'flex', gap: 6, marginTop: 4}}>
        {Array.from({length: 5}).map((_, i) => (
          <Rosquilla key={i} lleno={Math.max(0, Math.min(1, V / 20 - i))} />
        ))}
      </div>
    </div>
  </Marco>
);

// S2 · Cielo de la intro: píldora celeste con nubes y letras amarillas
export const BS2: React.FC = () => (
  <Marco n={2} nombre="CIELO DE LA INTRO · Titan One" fuente="TitanOne" acento={AM}>
    <div style={{position: 'absolute', left: 50, right: 50, top: 120, height: 190, borderRadius: 95, overflow: 'hidden', border: `9px solid ${NEG}`, background: 'linear-gradient(180deg,#4FA9F5 0%,#8FD0FF 100%)', filter: SOMBRA}}>
      {[[60, 40, 1], [300, 110, 0.8], [620, 30, 1.1], [820, 120, 0.7]].map(([x, y, s], i) => (
        <svg key={i} width={200 * s} height={90 * s} viewBox="0 0 200 90" style={{position: 'absolute', left: x, top: y, opacity: 0.95}}>
          <path d="M20,80 q-20,0 -14,-22 q4,-18 26,-14 q6,-30 40,-26 q24,-24 54,-4 q30,-10 40,16 q30,2 22,30 q-4,20 -26,20Z" fill="#fff" />
        </svg>
      ))}
      <div style={{position: 'absolute', left: 50, top: 28, fontFamily: 'TitanOne', fontSize: 52, color: AM, ...trazo(10)}}>SURVIVAL</div>
      <div style={{position: 'absolute', left: 50, right: 50, bottom: 34, height: 52, borderRadius: 26, background: 'rgba(255,255,255,0.6)', border: `6px solid ${NEG}`, overflow: 'hidden'}}>
        <div style={{width: `${V}%`, height: '100%', background: `linear-gradient(180deg,#FFE766,${AM} 60%,#E3B600)`}} />
      </div>
      <div style={{position: 'absolute', right: 56, top: 20, fontFamily: 'TitanOne', fontSize: 64, color: '#fff', ...trazo(11)}}>{V}%</div>
    </div>
  </Marco>
);

// S3 · Barra de uranio: tubo verde radiactivo con franjas de peligro
export const BS3: React.FC = () => (
  <Marco n={3} nombre="BARRA DE URANIO · Chewy" fuente="Chewy" acento="#7CFF4F">
    <div style={{position: 'absolute', left: 50, right: 50, top: 130, filter: SOMBRA}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: 'Chewy', color: '#fff', ...trazo(10)}}>
        <span style={{fontSize: 60}}>☢ SURVIVAL</span>
        <span style={{fontSize: 72, color: '#7CFF4F'}}>{V}%</span>
      </div>
      <div style={{position: 'relative', height: 100, marginTop: 6, borderRadius: 50, border: `9px solid ${NEG}`, background: 'repeating-linear-gradient(-45deg,#FACC15 0 26px,#111 26px 52px)', padding: 10}}>
        <div style={{position: 'relative', height: '100%', borderRadius: 32, background: 'rgba(10,30,10,0.9)', overflow: 'hidden'}}>
          <div style={{width: `${V}%`, height: '100%', background: 'linear-gradient(180deg,#C6FF8A 0%,#5BFF2E 45%,#1FA80F 100%)', boxShadow: '0 0 30px #5BFF2E, inset 0 0 18px rgba(255,255,255,0.6)'}} />
          {[60, 140, 210].map((x, i) => <div key={i} style={{position: 'absolute', left: x, top: 12 + i * 8, width: 14, height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.7)'}} />)}
          <div style={{position: 'absolute', left: 0, right: 0, top: 6, height: 12, background: 'rgba(255,255,255,0.3)', borderRadius: 6}} />
        </div>
      </div>
    </div>
  </Marco>
);

// S4 · Tele de la sala: televisor de madera con el porcentaje en pantalla
export const BS4: React.FC = () => (
  <Marco n={4} nombre="LA TELE DE LA SALA · Titan One" fuente="TitanOne" acento={AM}>
    <div style={{position: 'absolute', left: 60, top: 110, filter: SOMBRA}}>
      <svg width={180} height={70} viewBox="0 0 180 70" style={{position: 'absolute', left: 160, top: -54}}>
        <path d="M90,66 L30,6 M90,66 L150,6" stroke={NEG} strokeWidth={7} strokeLinecap="round" />
        <circle cx={30} cy={6} r={7} fill={NEG} />
        <circle cx={150} cy={6} r={7} fill={NEG} />
      </svg>
      <div style={{width: 520, height: 300, borderRadius: 34, background: 'linear-gradient(180deg,#B5733A,#7A4A22)', border: `9px solid ${NEG}`, padding: 22, display: 'flex', gap: 18}}>
        <div style={{flex: 1, borderRadius: 40, background: 'radial-gradient(circle at 50% 45%, #7DD3FC, #1E6FB8 75%)', border: `7px solid ${NEG}`, position: 'relative', overflow: 'hidden'}}>
          <div style={{position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 3px, transparent 3px 6px)'}} />
          <div style={{position: 'absolute', top: 24, width: '100%', textAlign: 'center', fontFamily: 'TitanOne', fontSize: 34, color: '#fff', ...trazo(7)}}>SURVIVAL</div>
          <div style={{position: 'absolute', top: 66, width: '100%', textAlign: 'center', fontFamily: 'TitanOne', fontSize: 84, color: AM, ...trazo(10)}}>{V}%</div>
          <div style={{position: 'absolute', left: 30, right: 30, bottom: 26, height: 26, borderRadius: 13, background: 'rgba(0,0,0,0.4)', border: `4px solid ${NEG}`}}>
            <div style={{width: `${V}%`, height: '100%', borderRadius: 9, background: AM}} />
          </div>
        </div>
        <div style={{width: 70, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center', paddingTop: 20}}>
          {[0, 1].map((i) => <div key={i} style={{width: 46, height: 46, borderRadius: 23, background: '#D6D3D1', border: `6px solid ${NEG}`}} />)}
          {[0, 1, 2].map((i) => <div key={i} style={{width: 50, height: 6, background: NEG, borderRadius: 3}} />)}
        </div>
      </div>
    </div>
  </Marco>
);

// S5 · Glaseado que gotea: barra rosada con chorreo y chispas
export const BS5: React.FC = () => (
  <Marco n={5} nombre="GLASEADO QUE GOTEA · Luckiest Guy" fuente="LuckiestGuy" acento="#FF8CC6">
    <div style={{position: 'absolute', left: 50, right: 50, top: 130, filter: SOMBRA}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: 'LuckiestGuy', color: '#fff', ...trazo(11)}}>
        <span style={{fontSize: 60}}>SURVIVAL</span>
        <span style={{fontSize: 70, color: '#FF8CC6'}}>{V}%</span>
      </div>
      <div style={{position: 'relative', height: 90, marginTop: 6, borderRadius: 45, background: 'linear-gradient(180deg,#F2B76A,#C47A30)', border: `9px solid ${NEG}`}}>
        <svg width="100%" height={150} viewBox="0 0 960 150" preserveAspectRatio="none" style={{position: 'absolute', left: -9, top: -9, width: 'calc(100% + 18px)'}}>
          <path
            d={`M44,9 H${(960 * V) / 100} q20,0 20,30 v20 q0,26 -14,26 q-14,0 -14,-26 v-6 q-10,40 -26,40 q-16,0 -16,-30 V60 q-30,48 -50,48 q-20,0 -20,-30 L${(960 * V) / 100 - 160},80 q-20,40 -40,40 q-20,0 -20,-34 q-30,10 -40,10 L120,90 q-20,30 -40,30 q-20,0 -20,-26 Q9,90 9,50 Q9,9 44,9Z`}
            fill="#FF8CC6"
            stroke={NEG}
            strokeWidth={6}
          />
          {[70, 130, 190, 250, 310].filter((x) => x < (960 * V) / 100 - 20).map((x, i) => (
            <rect key={i} x={x} y={26 + (i % 2) * 18} width={22} height={8} rx={4} fill={['#fff', '#38BDF8', '#FDE047', '#4ADE80', '#A78BFA'][i]} transform={`rotate(${(i * 53) % 90 - 45} ${x} ${30})`} />
          ))}
        </svg>
      </div>
    </div>
  </Marco>
);

// ===================== ESTILO VIDEOJUEGO =====================

// G1 · Combate de bolsillo (cuadro de batalla con HP y nivel)
export const BG1: React.FC = () => (
  <Marco n={6} nombre="CUADRO DE BATALLA · Press Start 2P" fuente="PressStart2P" acento="#F8C820" tamSub={58}>
    <div style={{position: 'absolute', left: 50, top: 130, width: 640, background: '#F8F8D8', border: `8px solid ${NEG}`, borderRadius: '16px 16px 16px 60px', padding: '20px 28px 22px', boxShadow: '10px 10px 0 rgba(0,0,0,0.35)'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: 'PressStart2P', fontSize: 34, color: NEG}}>
        <span>HOMER</span>
        <span>Lv39</span>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, marginTop: 18}}>
        <div style={{fontFamily: 'PressStart2P', fontSize: 26, color: '#F8B000', background: NEG, padding: '6px 10px', borderRadius: 8}}>HP</div>
        <div style={{flex: 1, height: 26, background: '#506858', border: `5px solid ${NEG}`, borderRadius: 13, padding: 3}}>
          <div style={{width: `${V}%`, height: '100%', borderRadius: 8, background: V > 50 ? '#48D058' : V > 20 ? '#F8C820' : '#F83820'}} />
        </div>
      </div>
      <div style={{textAlign: 'right', fontFamily: 'PressStart2P', fontSize: 32, color: NEG, marginTop: 14}}>{V}/100</div>
    </div>
  </Marco>
);

// G2 · Arcade: marcador de 1UP con vidas y "CONTINUE?"
export const BG2: React.FC = () => (
  <Marco n={7} nombre="MARCADOR DE ARCADE · Press Start 2P" fuente="PressStart2P" acento="#FF3B3B" tamSub={58}>
    <div style={{position: 'absolute', left: 40, right: 40, top: 120, padding: '22px 30px', background: 'rgba(0,0,0,0.82)', border: '6px solid #fff', outline: `6px solid ${NEG}`, borderRadius: 12}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: 'PressStart2P', fontSize: 32}}>
        <span style={{color: '#FF3B3B'}}>1UP</span>
        <span style={{color: '#fff'}}>HI-SCORE</span>
      </div>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: 'PressStart2P', fontSize: 40, color: '#fff', marginTop: 12}}>
        <span>{V}%</span>
        <span style={{color: AM}}>100%</span>
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 18}}>
        <span style={{fontFamily: 'PressStart2P', fontSize: 26, color: '#fff'}}>LIVES</span>
        {[1, 1, 0].map((l, i) => (
          <svg key={i} width={54} height={50} viewBox="0 0 11 10" style={{imageRendering: 'pixelated'}}>
            <path d="M2,0h2v1h1v1h1v-1h1v-1h2v1h1v4h-1v1h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-1h-1v-4h1z" fill={l ? '#FF3B3B' : '#444'} />
          </svg>
        ))}
        <span style={{marginLeft: 'auto', fontFamily: 'PressStart2P', fontSize: 24, color: AM}}>CONTINUE? 9</span>
      </div>
    </div>
  </Marco>
);

// G3 · Battle royale: escudo + vida con números
export const BG3: React.FC = () => (
  <Marco n={8} nombre="ESCUDO + VIDA (BATTLE ROYALE) · Bungee" fuente="Bungee" acento="#4ADE80" tamSub={82}>
    <div style={{position: 'absolute', left: 50, top: 140, width: 760, filter: SOMBRA}}>
      {[
        ['🛡', 'SHIELD', 0, '#38BDF8'],
        ['✚', 'HEALTH', V, '#4ADE80'],
      ].map(([ic, n, val, c], i) => (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14}}>
          <div style={{width: 64, height: 64, borderRadius: 14, background: c as string, border: `6px solid ${NEG}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#fff'}}>{ic}</div>
          <div style={{flex: 1, height: 52, transform: 'skewX(-12deg)', background: 'rgba(14,14,18,0.7)', border: `5px solid ${NEG}`, overflow: 'hidden'}}>
            <div style={{width: `${val}%`, height: '100%', background: `linear-gradient(180deg, #fff 0%, ${c} 35%, ${c} 100%)`}} />
          </div>
          <div style={{width: 160, fontFamily: 'Bungee', fontSize: 52, color: '#fff', ...trazo(8)}}>
            {val}
            <span style={{fontSize: 26, color: c as string}}> {n}</span>
          </div>
        </div>
      ))}
    </div>
  </Marco>
);

// G4 · Corazones de aventura con marco dorado (contenedores)
const CorazonOro: React.FC<{lleno: number}> = ({lleno}) => (
  <svg width={110} height={100} viewBox="0 0 110 100">
    <defs>
      <clipPath id={`co${lleno}`}>
        <rect x={0} y={0} width={110 * lleno} height={100} />
      </clipPath>
    </defs>
    <path d="M55,92 C10,62 4,40 4,28 C4,12 18,4 32,4 C44,4 52,12 55,20 C58,12 66,4 78,4 C92,4 106,12 106,28 C106,40 100,62 55,92Z" fill="rgba(14,14,18,0.6)" stroke="#E8B923" strokeWidth={9} />
    <path d="M55,92 C10,62 4,40 4,28 C4,12 18,4 32,4 C44,4 52,12 55,20 C58,12 66,4 78,4 C92,4 106,12 106,28 C106,40 100,62 55,92Z" fill="none" stroke={NEG} strokeWidth={3} />
    <g clipPath={`url(#co${lleno})`}>
      <path d="M55,84 C16,58 12,40 12,29 C12,17 22,11 32,11 C43,11 51,19 55,28 C59,19 67,11 78,11 C88,11 98,17 98,29 C98,40 94,58 55,84Z" fill="#E8222B" />
      <ellipse cx={34} cy={27} rx={11} ry={7} fill="#FFB3B3" />
    </g>
  </svg>
);
export const BG4: React.FC = () => (
  <Marco n={9} nombre="CORAZONES DE AVENTURA · Lilita One" fuente="LilitaOne" acento="#E8B923" tamSub={96}>
    <div style={{position: 'absolute', left: 46, top: 130, filter: SOMBRA}}>
      <div style={{fontFamily: 'LilitaOne', fontSize: 50, color: '#fff', marginBottom: 8, ...trazo(9)}}>
        – SURVIVAL – <span style={{color: '#E8B923'}}>{V}%</span>
      </div>
      <div style={{display: 'flex', gap: 4}}>
        {Array.from({length: 5}).map((_, i) => (
          <CorazonOro key={i} lleno={Math.max(0, Math.min(1, V / 20 - i))} />
        ))}
      </div>
    </div>
  </Marco>
);

// G5 · Pantalla de "PLAYER 1" con retrato, vidas y barra (juego de peleas callejeras)
export const BG5: React.FC = () => (
  <Marco n={10} nombre="PLAYER 1 · Teko + Black Ops One" fuente="BlackOpsOne" acento="#FF8A1F" tamSub={92}>
    <div style={{position: 'absolute', left: 40, right: 40, top: 130, display: 'flex', alignItems: 'center', filter: SOMBRA}}>
      <div style={{width: 150, height: 150, borderRadius: 18, border: `8px solid ${NEG}`, background: 'linear-gradient(160deg,#FDE047,#F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'BlackOpsOne', fontSize: 92, color: NEG, zIndex: 2}}>H</div>
      <div style={{flex: 1, marginLeft: -12}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 10px 6px 30px'}}>
          <span style={{fontFamily: 'Teko', fontSize: 64, lineHeight: 0.8, color: '#fff', letterSpacing: 2, ...trazo(8)}}>P1 · HOMER</span>
          <span style={{fontFamily: 'Teko', fontSize: 52, lineHeight: 0.8, color: '#FF8A1F', ...trazo(7)}}>×2 LIVES</span>
        </div>
        <div style={{height: 64, background: NEG, padding: 6, clipPath: 'polygon(0 0, 100% 0, 96% 100%, 0 100%)'}}>
          <div style={{height: '100%', background: '#3F0A0A', position: 'relative'}}>
            <div style={{position: 'absolute', inset: 0, width: `${V + 14}%`, background: '#FFF1C2'}} />
            <div style={{position: 'absolute', inset: 0, width: `${V}%`, background: 'linear-gradient(180deg,#FFE14D,#FF8A1F)'}} />
          </div>
        </div>
        <div style={{fontFamily: 'BlackOpsOne', fontSize: 40, color: '#fff', padding: '6px 30px 0', ...trazo(7)}}>{V}% SURVIVAL</div>
      </div>
    </div>
  </Marco>
);
