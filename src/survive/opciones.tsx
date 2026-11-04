import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';

// =====================================================================
// Hojas de opciones para que el usuario elija: 5 medidores + tipografías
// y 5 indicadores de daño estilo Medabots. Se muestran sobre cuadros reales.
// =====================================================================
const FUENTES = ['LuckiestGuy', 'TitanOne', 'Chewy', 'LilitaOne', 'Bangers'];
FUENTES.forEach((f) => loadFont({family: f, url: staticFile(`fonts/${f}-latin.woff2`), weight: '400'}));

const AM = '#FFD90F';
const NEG = '#111';
const contorno = (px: number, color = NEG): React.CSSProperties => ({WebkitTextStroke: `${px}px ${color}`, paintOrder: 'stroke fill'});

const Fondo: React.FC<{img: string}> = ({img}) => <Img src={staticFile(`survive/s01/clips/${img}.png`)} style={{position: 'absolute', inset: 0, width: 1080, height: 1920}} />;

const Etiqueta: React.FC<{n: number; nombre: string}> = ({n, nombre}) => (
  <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, textAlign: 'center'}}>
    <span style={{fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 46, color: '#fff', background: 'rgba(0,0,0,0.75)', padding: '12px 28px', borderRadius: 16}}>
      OPCIÓN {n} · {nombre}
    </span>
  </div>
);

// Título + subtítulo de muestra en la tipografía de cada opción
const Textos: React.FC<{fuente: string; color?: string; titulo?: string}> = ({fuente, color = AM}) => (
  <>
    <div style={{position: 'absolute', top: 560, width: '100%', textAlign: 'center', fontFamily: fuente, lineHeight: 0.95, transform: 'rotate(-3deg)'}}>
      <div style={{fontSize: 112, color: '#fff', ...contorno(16)}}>COULD A HUMAN</div>
      <div style={{fontSize: 138, color, ...contorno(18)}}>SURVIVE THIS?</div>
    </div>
    <div style={{position: 'absolute', top: 1330, width: '100%', textAlign: 'center', fontFamily: fuente, fontSize: 92, ...contorno(16)}}>
      <span style={{color: '#fff'}}>HIT ONE: </span>
      <span style={{color}}>RIBS.</span>
    </div>
  </>
);

// ---------------- 5 MEDIDORES ----------------

// 1 · Rosquilla: el glaseado rosado se va comiendo
export const Medidor1: React.FC = () => {
  const v = 38;
  const R = 92;
  const C = 2 * Math.PI * R;
  return (
    <AbsoluteFill>
      <Fondo img="op_gancho" />
      <div style={{position: 'absolute', left: 50, top: 150, display: 'flex', alignItems: 'center', gap: 24}}>
        <svg width={250} height={250} viewBox="0 0 250 250">
          <circle cx={125} cy={125} r={112} fill="#E9A85A" stroke={NEG} strokeWidth={9} />
          <circle cx={125} cy={125} r={R} fill="none" stroke="#FF6FB5" strokeWidth={44} strokeDasharray={`${(C * v) / 100} ${C}`} transform="rotate(-90 125 125)" strokeLinecap="round" />
          {Array.from({length: 14}).map((_, i) => {
            const a = (i / 14) * Math.PI * 2 * (v / 100) - Math.PI / 2 + 0.15;
            const cols = ['#fff', '#4FC3F7', '#FFD90F', '#7CFC00'];
            return <rect key={i} x={125 + Math.cos(a) * R - 9} y={125 + Math.sin(a) * R - 3} width={18} height={6} rx={3} fill={cols[i % 4]} transform={`rotate(${(a * 180) / Math.PI + 40} ${125 + Math.cos(a) * R} ${125 + Math.sin(a) * R})`} />;
          })}
          <circle cx={125} cy={125} r={52} fill="#7EC8F2" stroke={NEG} strokeWidth={9} />
          <text x={125} y={140} textAnchor="middle" fontFamily="LuckiestGuy" fontSize={46} fill="#fff" stroke={NEG} strokeWidth={8} paintOrder="stroke">{v}%</text>
        </svg>
        <div style={{fontFamily: 'LuckiestGuy', fontSize: 66, color: '#fff', lineHeight: 0.95, ...contorno(12)}}>
          SURVIVAL
          <br />
          <span style={{color: '#FF6FB5'}}>CHANCE</span>
        </div>
      </div>
      <Textos fuente="LuckiestGuy" />
      <Etiqueta n={1} nombre="ROSQUILLA · Luckiest Guy" />
    </AbsoluteFill>
  );
};

// 2 · Medidor de la planta nuclear (aguja analógica)
export const Medidor2: React.FC = () => {
  const v = 38;
  const ang = -90 + (v / 100) * 180;
  return (
    <AbsoluteFill>
      <Fondo img="op_gancho" />
      <div style={{position: 'absolute', left: 290, top: 120, width: 500, height: 330, background: '#2E3B2F', border: `10px solid ${NEG}`, borderRadius: 30, boxShadow: '0 12px 0 rgba(0,0,0,0.35)'}}>
        <svg width={480} height={260} viewBox="0 0 480 260" style={{position: 'absolute', left: 0, top: 10}}>
          <path d="M60,230 A180,180 0 0 1 120,96" fill="none" stroke="#E53935" strokeWidth={36} />
          <path d="M120,96 A180,180 0 0 1 360,96" fill="none" stroke={AM} strokeWidth={36} />
          <path d="M360,96 A180,180 0 0 1 420,230" fill="none" stroke="#43A047" strokeWidth={36} />
          {Array.from({length: 11}).map((_, i) => {
            const a = Math.PI + (i / 10) * Math.PI;
            return <line key={i} x1={240 + Math.cos(a) * 150} y1={230 + Math.sin(a) * 150} x2={240 + Math.cos(a) * 128} y2={230 + Math.sin(a) * 128} stroke="#fff" strokeWidth={6} />;
          })}
          <g transform={`rotate(${ang} 240 230)`}>
            <polygon points="232,230 248,230 240,70" fill="#fff" stroke={NEG} strokeWidth={5} />
          </g>
          <circle cx={240} cy={230} r={22} fill={NEG} stroke="#fff" strokeWidth={5} />
        </svg>
        <div style={{position: 'absolute', bottom: 8, width: '100%', textAlign: 'center', fontFamily: 'TitanOne', fontSize: 40, color: AM, ...contorno(7)}}>
          ☢ SURVIVAL {v}%
        </div>
      </div>
      <Textos fuente="TitanOne" />
      <Etiqueta n={2} nombre="PLANTA NUCLEAR · Titan One" />
    </AbsoluteFill>
  );
};

// 3 · Barra de vida de caricatura (bloques + corazón)
export const Medidor3: React.FC = () => {
  const v = 38;
  return (
    <AbsoluteFill>
      <Fondo img="op_gancho" />
      <div style={{position: 'absolute', left: 60, top: 170, width: 960, display: 'flex', alignItems: 'center'}}>
        <svg width={150} height={140} viewBox="0 0 150 140" style={{marginRight: -20, zIndex: 2}}>
          <path d="M75,128 C20,90 8,62 8,42 C8,20 26,8 44,8 C58,8 70,16 75,28 C80,16 92,8 106,8 C124,8 142,20 142,42 C142,62 130,90 75,128Z" fill="#F43F3F" stroke={NEG} strokeWidth={10} />
          <ellipse cx={44} cy={40} rx={14} ry={9} fill="#fff" opacity={0.8} />
        </svg>
        <div style={{flex: 1, height: 92, background: '#fff', border: `10px solid ${NEG}`, borderRadius: 50, padding: 8, display: 'flex', gap: 6, boxShadow: '0 10px 0 rgba(0,0,0,0.35)'}}>
          {Array.from({length: 10}).map((_, i) => (
            <div key={i} style={{flex: 1, borderRadius: 14, background: i < Math.round(v / 10) ? AM : '#E5E7EB', border: `4px solid ${i < Math.round(v / 10) ? '#C9A400' : '#D1D5DB'}`}} />
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', left: 190, top: 280, fontFamily: 'Chewy', fontSize: 64, color: '#fff', ...contorno(12)}}>
        SURVIVAL: <span style={{color: AM}}>{v}%</span>
      </div>
      <Textos fuente="Chewy" />
      <Etiqueta n={3} nombre="BARRA DE VIDA · Chewy" />
    </AbsoluteFill>
  );
};

// 4 · Letrero de carretera de Springfield (verde) con termómetro
export const Medidor4: React.FC = () => {
  const v = 38;
  return (
    <AbsoluteFill>
      <Fondo img="op_gancho" />
      <div style={{position: 'absolute', left: 230, top: 110, transform: 'rotate(-3deg)'}}>
        <div style={{width: 620, background: '#1E7B45', border: '8px solid #fff', outline: `8px solid ${NEG}`, borderRadius: 22, padding: '18px 30px 26px', boxShadow: '0 14px 0 rgba(0,0,0,0.35)'}}>
          <div style={{fontFamily: 'LilitaOne', fontSize: 50, color: '#fff', display: 'flex', justifyContent: 'space-between', letterSpacing: 2}}>
            <span>SURVIVAL CHANCE</span>
            <span style={{color: AM}}>{v}%</span>
          </div>
          <div style={{marginTop: 12, height: 54, background: '#0E3F24', borderRadius: 30, border: '5px solid #fff', overflow: 'hidden'}}>
            <div style={{width: `${v}%`, height: '100%', background: 'linear-gradient(90deg,#F43F3F,#FFB020)'}} />
          </div>
        </div>
        <div style={{position: 'absolute', left: 140, top: '100%', width: 22, height: 70, background: '#9CA3AF', border: `5px solid ${NEG}`}} />
        <div style={{position: 'absolute', right: 140, top: '100%', width: 22, height: 70, background: '#9CA3AF', border: `5px solid ${NEG}`}} />
      </div>
      <Textos fuente="LilitaOne" />
      <Etiqueta n={4} nombre="LETRERO · Lilita One" />
    </AbsoluteFill>
  );
};

// 5 · Monitor de hospital (latido + porcentaje digital)
export const Medidor5: React.FC = () => {
  const v = 38;
  return (
    <AbsoluteFill>
      <Fondo img="op_gancho" />
      <div style={{position: 'absolute', left: 200, top: 120, width: 680, height: 230, background: '#0B1410', border: `10px solid ${NEG}`, outline: '6px solid #9CA3AF', borderRadius: 28, overflow: 'hidden', boxShadow: '0 14px 0 rgba(0,0,0,0.35)'}}>
        <svg width={680} height={230} viewBox="0 0 680 230" style={{position: 'absolute'}}>
          {Array.from({length: 12}).map((_, i) => <line key={i} x1={i * 60} y1={0} x2={i * 60} y2={230} stroke="rgba(52,211,153,0.12)" strokeWidth={2} />)}
          <path d="M0,150 L120,150 L145,150 L160,60 L180,210 L200,120 L215,150 L330,150 L355,150 L370,70 L390,200 L410,130 L425,150 L470,150" fill="none" stroke="#34D399" strokeWidth={7} strokeLinejoin="round" style={{filter: 'drop-shadow(0 0 8px #34D399)'}} />
          <circle cx={470} cy={150} r={9} fill="#ECFDF5" />
        </svg>
        <div style={{position: 'absolute', right: 26, top: 18, textAlign: 'right'}}>
          <div style={{fontFamily: 'Bangers', fontSize: 40, color: '#34D399', letterSpacing: 3}}>SURVIVAL</div>
          <div style={{fontFamily: 'Bangers', fontSize: 110, lineHeight: 0.9, color: '#ECFDF5', textShadow: '0 0 18px #34D399'}}>{v}%</div>
        </div>
      </div>
      <Textos fuente="Bangers" />
      <Etiqueta n={5} nombre="MONITOR DE HOSPITAL · Bangers" />
    </AbsoluteFill>
  );
};

// ---------------- 5 INDICADORES DE DAÑO (estilo Medabots) ----------------
// Muñeco genérico (no es Homero dibujado): cabeza, torso, brazos, piernas.
const PIEZAS = {
  cabeza: 'M70,10 h60 a14,14 0 0 1 14,14 v46 a14,14 0 0 1 -14,14 h-60 a14,14 0 0 1 -14,-14 v-46 a14,14 0 0 1 14,-14Z',
  torso: 'M55,92 h90 a12,12 0 0 1 12,12 v84 a12,12 0 0 1 -12,12 h-90 a12,12 0 0 1 -12,-12 v-84 a12,12 0 0 1 12,-12Z',
  brazoI: 'M14,96 h22 v100 h-22Z',
  brazoD: 'M164,96 h22 v100 h-22Z',
  piernaI: 'M58,208 h34 v112 h-34Z',
  piernaD: 'M108,208 h34 v112 h-34Z',
};

const Golpe: React.FC = () => (
  <>
    <Fondo img="op_golpe" />
    <div style={{position: 'absolute', top: 1330, width: '100%', textAlign: 'center', fontFamily: 'LuckiestGuy', fontSize: 92, ...contorno(16)}}>
      <span style={{color: '#fff'}}>HIT ONE: </span>
      <span style={{color: AM}}>RIBS.</span>
    </div>
  </>
);

// A · Medabot: esquema con barras de vida por pieza; la dañada palpita en rojo
export const Dano1: React.FC = () => {
  const partes: [string, number][] = [['HEAD', 100], ['TORSO', 35], ['L-ARM', 100], ['R-ARM', 100], ['LEGS', 100]];
  return (
    <AbsoluteFill>
      <Golpe />
      <div style={{position: 'absolute', right: 40, top: 170, width: 440, height: 560, background: 'rgba(8,18,40,0.88)', border: '6px solid #38BDF8', borderRadius: 24, boxShadow: '0 0 30px rgba(56,189,248,0.6)'}}>
        <div style={{fontFamily: 'Bangers', fontSize: 44, color: '#38BDF8', letterSpacing: 3, padding: '14px 24px'}}>DAMAGE REPORT</div>
        <svg viewBox="0 0 200 330" style={{position: 'absolute', left: 20, top: 80, width: 200, height: 330}}>
          {(Object.keys(PIEZAS) as (keyof typeof PIEZAS)[]).map((k) => [k, PIEZAS[k]] as const).map(([k, d]) => (
            <path key={k} d={d} fill={k === 'torso' ? 'rgba(244,63,63,0.85)' : 'rgba(56,189,248,0.25)'} stroke={k === 'torso' ? '#FCA5A5' : '#38BDF8'} strokeWidth={5} style={k === 'torso' ? {filter: 'drop-shadow(0 0 14px #F43F3F)'} : {}} />
          ))}
          <path d="M70,120 l20,22 l-12,10 l26,30" stroke="#fff" strokeWidth={5} fill="none" />
        </svg>
        <div style={{position: 'absolute', left: 230, top: 100, width: 190}}>
          {partes.map(([n, hp]) => (
            <div key={n} style={{marginBottom: 22}}>
              <div style={{fontFamily: 'Bangers', fontSize: 30, color: hp < 50 ? '#F87171' : '#BAE6FD', letterSpacing: 2}}>{n}</div>
              <div style={{height: 18, background: 'rgba(255,255,255,0.15)', borderRadius: 9, overflow: 'hidden'}}>
                <div style={{width: `${hp}%`, height: '100%', background: hp < 50 ? '#F43F3F' : '#38BDF8'}} />
              </div>
            </div>
          ))}
        </div>
        <div style={{position: 'absolute', bottom: 18, width: '100%', textAlign: 'center', fontFamily: 'Bangers', fontSize: 52, color: '#F43F3F', letterSpacing: 4, textShadow: '0 0 14px #F43F3F'}}>⚠ RIBS −65%</div>
      </div>
      <Etiqueta n={1} nombre="ESQUEMA MEDABOT" />
    </AbsoluteFill>
  );
};

// B · Radiografía: esqueleto de caricatura; el hueso roto brilla en rojo con grieta
export const Dano2: React.FC = () => (
  <AbsoluteFill>
    <Golpe />
    <div style={{position: 'absolute', right: 40, top: 170, width: 400, height: 580, background: '#0A1A33', border: `8px solid ${NEG}`, outline: '5px solid #93C5FD', borderRadius: 20, overflow: 'hidden'}}>
      <div style={{fontFamily: 'Bangers', fontSize: 40, color: '#93C5FD', padding: '10px 20px', letterSpacing: 3}}>X-RAY</div>
      <svg viewBox="0 0 200 300" style={{position: 'absolute', left: 50, top: 60, width: 300, height: 450}}>
        <g fill="none" stroke="#E0F2FE" strokeWidth={6} strokeLinecap="round" style={{filter: 'drop-shadow(0 0 6px #93C5FD)'}}>
          <circle cx={100} cy={34} r={24} fill="rgba(224,242,254,0.15)" />
          <line x1={100} y1={60} x2={100} y2={190} />
          <line x1={60} y1={78} x2={140} y2={78} />
          <path d="M100,180 L72,200 L66,290 M100,180 L128,200 L134,290 M60,78 L40,170 M140,78 L160,170" />
        </g>
        <g fill="none" stroke="#F43F3F" strokeWidth={7} strokeLinecap="round" style={{filter: 'drop-shadow(0 0 10px #F43F3F)'}}>
          <path d="M70,98 Q100,88 130,98 M68,114 Q100,104 132,114 M68,130 Q100,120 132,130 M70,146 Q100,136 130,146" />
          <path d="M112,92 l8,14 l-10,8 l12,20" stroke="#fff" strokeWidth={4} />
        </g>
      </svg>
      <div style={{position: 'absolute', bottom: 16, width: '100%', textAlign: 'center', fontFamily: 'Bangers', fontSize: 50, color: '#F43F3F', letterSpacing: 3}}>RIBS: CRACKED</div>
    </div>
    <Etiqueta n={2} nombre="RADIOGRAFÍA" />
  </AbsoluteFill>
);

// C · Muñeco de pruebas de caricatura con "-HP" que salta (estilo videojuego)
export const Dano3: React.FC = () => (
  <AbsoluteFill>
    <Golpe />
    <div style={{position: 'absolute', right: 50, top: 170, width: 380, height: 560}}>
      <svg viewBox="0 0 200 330" style={{width: 300, height: 495, marginLeft: 40}}>
        <g stroke={NEG} strokeWidth={7} strokeLinejoin="round">
          <path d={PIEZAS.cabeza} fill={AM} />
          <path d={PIEZAS.brazoI} fill={AM} />
          <path d={PIEZAS.brazoD} fill={AM} />
          <path d={PIEZAS.piernaI} fill="#3B6FD6" />
          <path d={PIEZAS.piernaD} fill="#3B6FD6" />
          <path d={PIEZAS.torso} fill="#F43F3F" style={{filter: 'drop-shadow(0 0 16px #F43F3F)'}} />
        </g>
        <g fill="#fff" stroke={NEG} strokeWidth={4}>
          <circle cx={85} cy={44} r={11} />
          <circle cx={115} cy={44} r={11} />
        </g>
        <g fill={NEG}>
          <circle cx={85} cy={44} r={3} />
          <circle cx={115} cy={44} r={3} />
        </g>
      </svg>
      <div style={{position: 'absolute', right: -10, top: 150, fontFamily: 'LuckiestGuy', fontSize: 84, color: '#F43F3F', transform: 'rotate(12deg)', ...contorno(12)}}>−40 HP</div>
    </div>
    <Etiqueta n={3} nombre="MUÑECO DE VIDEOJUEGO" />
  </AbsoluteFill>
);

// D · Holograma escáner verde (estructura de alambre + línea de barrido)
export const Dano4: React.FC = () => (
  <AbsoluteFill>
    <Golpe />
    <div style={{position: 'absolute', right: 40, top: 170, width: 400, height: 580, background: 'radial-gradient(circle at 50% 40%, rgba(16,60,40,0.92), rgba(2,14,8,0.95))', border: '5px solid #4ADE80', borderRadius: 26, overflow: 'hidden', boxShadow: '0 0 30px rgba(74,222,128,0.5)'}}>
      <svg viewBox="0 0 200 330" style={{position: 'absolute', left: 50, top: 60, width: 300, height: 495}}>
        {(Object.keys(PIEZAS) as (keyof typeof PIEZAS)[]).map((k) => [k, PIEZAS[k]] as const).map(([k, d]) => (
          <path key={k} d={d} fill={k === 'torso' ? 'rgba(248,113,113,0.6)' : 'rgba(74,222,128,0.08)'} stroke={k === 'torso' ? '#F87171' : '#4ADE80'} strokeWidth={3} strokeDasharray={k === 'torso' ? undefined : '6 4'} />
        ))}
        {Array.from({length: 16}).map((_, i) => <line key={i} x1={0} y1={i * 21} x2={200} y2={i * 21} stroke="rgba(74,222,128,0.12)" strokeWidth={1.5} />)}
        <rect x={0} y={140} width={200} height={8} fill="rgba(74,222,128,0.6)" />
      </svg>
      <div style={{position: 'absolute', top: 14, left: 20, fontFamily: 'Bangers', fontSize: 36, color: '#4ADE80', letterSpacing: 3}}>BODY SCAN</div>
      <div style={{position: 'absolute', bottom: 16, width: '100%', textAlign: 'center', fontFamily: 'Bangers', fontSize: 46, color: '#F87171', letterSpacing: 3}}>RIBS · CRITICAL</div>
    </div>
    <Etiqueta n={4} nombre="HOLOGRAMA ESCÁNER" />
  </AbsoluteFill>
);

// E · Órganos de caricatura: el órgano golpeado palpita y se agrieta
export const Dano5: React.FC = () => (
  <AbsoluteFill>
    <Golpe />
    <div style={{position: 'absolute', right: 40, top: 170, width: 410, height: 590, background: '#FFF8E7', border: `9px solid ${NEG}`, borderRadius: 34, boxShadow: '0 14px 0 rgba(0,0,0,0.35)'}}>
      <svg viewBox="0 0 200 300" style={{position: 'absolute', left: 30, top: 20, width: 350, height: 525}}>
        <path d="M100,8 a30,30 0 1 1 -0.1,0 M70,70 h60 q24,0 28,24 l10,110 h-136 l10,-110 q4,-24 28,-24 M62,204 h76 l-6,90 h-22 l-10,-60 l-10,60 h-22Z" fill="#FDE68A" stroke={NEG} strokeWidth={6} strokeLinejoin="round" />
        <g stroke={NEG} strokeWidth={4}>
          <ellipse cx={82} cy={110} rx={18} ry={28} fill="#F9A8D4" />
          <ellipse cx={118} cy={110} rx={18} ry={28} fill="#F9A8D4" />
          <path d="M100,120 c-10,-12 -26,-2 -18,12 l18,18 l18,-18 c8,-14 -8,-24 -18,-12Z" fill="#EF4444" />
          <ellipse cx={128} cy={162} rx={12} ry={9} fill="#A855F7" />
          <path d="M80,175 q20,14 40,0 q-6,20 -20,22 q-14,-2 -20,-22Z" fill="#FB923C" />
        </g>
        <g fill="none" stroke="#F43F3F" strokeWidth={6} strokeLinecap="round" style={{filter: 'drop-shadow(0 0 8px #F43F3F)'}}>
          <path d="M60,96 Q100,84 140,96 M58,112 Q100,100 142,112 M58,128 Q100,116 142,128" />
        </g>
      </svg>
      <div style={{position: 'absolute', bottom: 14, width: '100%', textAlign: 'center', fontFamily: 'LuckiestGuy', fontSize: 50, color: '#F43F3F', ...contorno(8)}}>RIBS! 💥</div>
    </div>
    <Etiqueta n={5} nombre="ÓRGANOS DE CARICATURA" />
  </AbsoluteFill>
);
