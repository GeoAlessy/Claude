import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';

// =====================================================================
// 20 reglas para medir el acantilado + 20 etiquetas "100 M ≈ 30 FLOORS".
// Las reglas se ven en su lugar real: sobre el sendero, con la misma perspectiva del Short.
// =====================================================================
['LuckiestGuy', 'Bangers', 'Chewy'].forEach((f) => loadFont({family: f, url: staticFile(`fonts/${f}-latin.woff2`), weight: '400'}));

const OL = '#2B1A10';
const AM = '#FFD90F';
const LARGO = 1220;
const PASO = LARGO / 100;
const MONO = '"DejaVu Sans Mono", "Courier New", monospace';

type Tick = {m: number; y: number; largo: number; grueso: number};
const ticks = (cada = 1): Tick[] =>
  Array.from({length: 101})
    .map((_, m) => m)
    .filter((m) => m % cada === 0)
    .map((m) => ({m, y: m * PASO, largo: m % 10 === 0 ? 1 : m % 5 === 0 ? 0.62 : 0.34, grueso: m % 10 === 0 ? 5 : 3}));
const DECENAS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

/** Rayitas a la izquierda de una cinta de ancho w */
const Rayas: React.FC<{w: number; color: string; desde?: 'izq' | 'der' | 'ambos'; max?: number; glow?: string; cada?: number}> = ({w, color, desde = 'izq', max = 0.55, glow, cada = 1}) => (
  <>
    {ticks(cada).map((t) => {
      const l = w * max * t.largo;
      const st: React.CSSProperties = {position: 'absolute', top: t.y - t.grueso / 2, height: t.grueso, width: l, background: color, boxShadow: glow ? `0 0 8px ${glow}` : undefined};
      return (
        <React.Fragment key={t.m}>
          {(desde === 'izq' || desde === 'ambos') && <div style={{...st, left: 0}} />}
          {(desde === 'der' || desde === 'ambos') && <div style={{...st, right: 0}} />}
        </React.Fragment>
      );
    })}
  </>
);

/** Números de las decenas, girados a lo largo de la cinta */
const Numeros: React.FC<{left: number; estilo: React.CSSProperties; sufijo?: string; girar?: boolean; prefijo?: string}> = ({left, estilo, sufijo = ' M', girar = true, prefijo = ''}) => (
  <>
    {DECENAS.map((n) => (
      <div key={n} style={{position: 'absolute', top: n * PASO - (girar ? 34 : 22), left, whiteSpace: 'nowrap', transform: girar ? 'rotate(-90deg)' : undefined, transformOrigin: 'left top', ...estilo}}>
        {prefijo}
        {n}
        {sufijo}
      </div>
    ))}
  </>
);

const Tira: React.FC<{w: number; style: React.CSSProperties; children?: React.ReactNode}> = ({w, style, children}) => (
  <div style={{position: 'relative', width: w, height: LARGO, ...style}}>{children}</div>
);

// ---------------------------------------------------------------- REGLAS
const R1: React.FC = () => (
  <>
    <div style={{position: 'absolute', left: -60, top: -96, width: 190, height: 130, borderRadius: 34, background: '#D6312B', border: `6px solid ${OL}`, boxShadow: `0 10px 0 ${OL}`}}>
      <div style={{position: 'absolute', right: 0, top: 0, width: 60, height: '100%', borderRadius: '0 28px 28px 0', background: '#A82420'}} />
      <div style={{position: 'absolute', left: 64, top: 32, width: 54, height: 54, borderRadius: 27, background: '#F5F1E6', border: `5px solid ${OL}`}} />
    </div>
    <Tira w={80} style={{background: `linear-gradient(90deg, ${AM} 72%, #E0B800 72%)`, borderLeft: `5px solid ${OL}`, borderRight: `5px solid ${OL}`}}>
      <Rayas w={80} color={OL} />
      <Numeros left={30} estilo={{fontFamily: 'LuckiestGuy', fontSize: 30, color: OL}} />
    </Tira>
  </>
);

const R2: React.FC = () => (
  <Tira w={86} style={{}}>
    {Array.from({length: 10}).map((_, i) => (
      <div key={i} style={{position: 'absolute', top: i * 10 * PASO, left: 0, width: 86, height: 10 * PASO - 3, background: 'linear-gradient(90deg,#F2C27E 0%,#E3A458 70%,#B97B36 100%)', border: `4px solid ${OL}`, borderRadius: 6, boxSizing: 'border-box'}}>
        <div style={{position: 'absolute', left: 30, bottom: -11, width: 18, height: 18, borderRadius: 9, background: '#E8C24A', border: `3px solid ${OL}`}} />
      </div>
    ))}
    <Rayas w={86} color="#3B2414" />
    <Numeros left={36} estilo={{fontFamily: 'Chewy', fontSize: 32, color: '#3B2414'}} />
  </Tira>
);

const R3: React.FC = () => (
  <Tira w={84} style={{border: `5px solid ${OL}`, boxSizing: 'border-box', background: '#fff'}}>
    {Array.from({length: 10}).map((_, i) => (
      <div key={i} style={{position: 'absolute', top: i * 10 * PASO, left: 0, right: 0, height: 10 * PASO, background: i % 2 ? '#fff' : '#E23B2E'}}>
        {[0, 1].map((j) => (
          <div key={j} style={{position: 'absolute', left: 6, top: j * 5 * PASO + 6, width: 26, height: 5 * PASO - 12, background: i % 2 ? '#E23B2E' : '#fff', clipPath: 'polygon(0 0,100% 0,100% 20%,40% 20%,40% 40%,100% 40%,100% 60%,40% 60%,40% 80%,100% 80%,100% 100%,0 100%)'}} />
        ))}
      </div>
    ))}
    <Numeros left={40} estilo={{fontFamily: 'Bangers', fontSize: 34, color: OL, background: '#fff', padding: '0 6px', borderRadius: 4}} />
  </Tira>
);

const R4: React.FC = () => {
  const pts = Array.from({length: 61}).map((_, i) => {
    const y = (i / 60) * LARGO;
    return [50 + 14 * Math.sin(y / 110), y];
  });
  const izq = pts.map(([x, y]) => `${x - 34},${y}`).join(' ');
  const der = pts.map(([x, y]) => `${x + 34},${y}`).reverse().join(' ');
  return (
    <svg width={140} height={LARGO} style={{position: 'absolute', left: -20, top: 0, overflow: 'visible'}}>
      <polygon points={`${izq} ${der}`} fill="#FFF3B0" stroke={OL} strokeWidth={4} strokeLinejoin="round" />
      {ticks().map((t) => {
        const x = 50 + 14 * Math.sin(t.y / 110) - 34;
        return <line key={t.m} x1={x} y1={t.y} x2={x + 36 * t.largo} y2={t.y} stroke="#D6312B" strokeWidth={t.grueso - 1} />;
      })}
      {DECENAS.map((n) => {
        const y = n * PASO;
        const x = 50 + 14 * Math.sin(y / 110) + 6;
        return (
          <text key={n} x={x} y={y - 6} fontFamily="Chewy" fontSize={26} fill="#D6312B" transform={`rotate(-90 ${x} ${y - 6})`}>
            {n} M
          </text>
        );
      })}
      <rect x={10} y={-14} width={80} height={16} rx={4} fill="#C9CED6" stroke={OL} strokeWidth={3} />
    </svg>
  );
};

const R5: React.FC = () => (
  <Tira w={70} style={{}}>
    <div style={{position: 'absolute', left: 32, top: 0, width: 6, height: LARGO, background: '#7DF9FF', boxShadow: '0 0 12px #00E5FF, 0 0 28px #00B8FF'}} />
    {ticks(1).map((t) => (
      <div key={t.m} style={{position: 'absolute', top: t.y - 1.5, left: 35 - 30 * t.largo, width: 60 * t.largo, height: t.m % 10 === 0 ? 4 : 2, background: '#7DF9FF', boxShadow: '0 0 6px #00E5FF', opacity: t.m % 10 === 0 ? 1 : 0.7}} />
    ))}
    {DECENAS.map((n) => (
      <div key={n} style={{position: 'absolute', top: n * PASO - 14, left: 76, fontFamily: MONO, fontWeight: 700, fontSize: 24, color: '#BFFCFF', textShadow: '0 0 8px #00E5FF', whiteSpace: 'nowrap'}}>
        {n}m
      </div>
    ))}
    <div style={{position: 'absolute', left: 21, top: LARGO * 0.62 - 14, width: 28, height: 28, borderRadius: 14, background: '#fff', boxShadow: '0 0 20px 8px #00E5FF'}} />
  </Tira>
);

const R6: React.FC = () => (
  <Tira w={96} style={{background: 'linear-gradient(90deg, rgba(0,229,255,0.28), rgba(0,229,255,0.08))', border: '3px solid #67F2FF', boxShadow: '0 0 18px rgba(0,229,255,0.8), inset 0 0 22px rgba(0,229,255,0.5)', backgroundImage: 'repeating-linear-gradient(0deg, rgba(103,242,255,0.25) 0 2px, transparent 2px 8px), linear-gradient(90deg, rgba(0,229,255,0.28), rgba(0,229,255,0.08))'}}>
    <Rayas w={96} color="#B6FBFF" glow="#00E5FF" />
    <Numeros left={44} estilo={{fontFamily: MONO, fontWeight: 700, fontSize: 24, color: '#E6FEFF', textShadow: '0 0 8px #00E5FF'}} />
  </Tira>
);

const R7: React.FC = () => (
  <>
    <div style={{position: 'absolute', left: -62, top: -100, width: 196, height: 134, borderRadius: 30, background: 'linear-gradient(145deg,#F4F6F8,#9AA3AE 55%,#5D6670)', border: '3px solid #2E343B', boxShadow: '0 14px 22px rgba(0,0,0,0.5), inset 0 3px 0 rgba(255,255,255,0.8)'}}>
      <div style={{position: 'absolute', left: 64, top: 34, width: 56, height: 56, borderRadius: 28, background: 'radial-gradient(circle at 35% 30%, #fff, #8A939D 60%, #3D444C)', border: '3px solid #2E343B'}} />
    </div>
    <Tira w={84} style={{background: 'linear-gradient(90deg,#8C969F 0%,#F5F7F9 22%,#C3CAD1 50%,#EEF1F4 72%,#7A848E 100%)', boxShadow: '14px 0 22px rgba(0,0,0,0.45)', borderLeft: '2px solid #3A4048', borderRight: '2px solid #3A4048'}}>
      <Rayas w={84} color="#1D2228" />
      <Numeros left={34} estilo={{fontFamily: 'Bangers', fontSize: 32, color: '#1D2228', letterSpacing: 1, textShadow: '0 1px 0 rgba(255,255,255,0.8)'}} />
    </Tira>
  </>
);

const R8: React.FC = () => (
  <Tira w={110} style={{background: '#E9D7B0', border: `5px solid ${OL}`, boxSizing: 'border-box'}}>
    {Array.from({length: 30}).map((_, i) => (
      <div key={i} style={{position: 'absolute', top: (i * LARGO) / 30, left: 0, right: 0, height: LARGO / 30, borderBottom: `3px solid ${OL}`, background: i % 2 ? '#E9D7B0' : '#DCC596', display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 8}}>
        {[0, 1, 2].map((j) => (
          <div key={j} style={{width: 18, height: 18, background: '#7EC8F2', border: `2px solid ${OL}`}} />
        ))}
      </div>
    ))}
    {[10, 20, 30].map((n) => (
      <div key={n} style={{position: 'absolute', top: (n * LARGO) / 30 - 36, right: -96, fontFamily: 'LuckiestGuy', fontSize: 30, color: '#fff', WebkitTextStroke: `6px ${OL}`, paintOrder: 'stroke fill', whiteSpace: 'nowrap'}}>
        {n}F
      </div>
    ))}
  </Tira>
);

const R9: React.FC = () => (
  <Tira w={104} style={{background: 'rgba(10,14,22,0.78)', border: '3px solid #E8EEF5', borderRadius: 10}}>
    <Rayas w={104} color="#E8EEF5" desde="der" max={0.32} />
    {DECENAS.map((n) => (
      <div key={n} style={{position: 'absolute', top: n * PASO - 14, left: 10, fontFamily: MONO, fontWeight: 700, fontSize: 24, color: '#fff'}}>
        {n}
      </div>
    ))}
    <div style={{position: 'absolute', left: -12, top: LARGO - 30, padding: '6px 10px', background: '#000', border: '3px solid #FFD400', color: '#FFD400', fontFamily: MONO, fontWeight: 700, fontSize: 28, borderRadius: 6}}>100m</div>
  </Tira>
);

const R10: React.FC = () => (
  <Tira w={92} style={{background: 'linear-gradient(180deg,#7FD6FF 0%,#1E88D6 45%,#0B3C7A 100%)', border: '4px solid #E6F6FF', borderRadius: 18, overflow: 'hidden'}}>
    {Array.from({length: 18}).map((_, i) => (
      <div key={i} style={{position: 'absolute', left: 50 + ((i * 37) % 30), top: (i * 71) % LARGO, width: 8 + (i % 3) * 5, height: 8 + (i % 3) * 5, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.8)'}} />
    ))}
    <Rayas w={92} color="#fff" />
    <Numeros left={40} prefijo="-" estilo={{fontFamily: 'Bangers', fontSize: 30, color: '#fff', letterSpacing: 1}} />
  </Tira>
);

const R11: React.FC = () => (
  <Tira w={70} style={{background: 'rgba(255,255,255,0.85)', border: `5px solid ${OL}`, borderRadius: 35}}>
    <div style={{position: 'absolute', left: 18, top: 20, width: 24, bottom: 0, background: '#E5322B', borderRadius: 12}} />
    <div style={{position: 'absolute', left: -22, bottom: -80, width: 104, height: 104, borderRadius: '50%', background: '#E5322B', border: `5px solid ${OL}`}} />
    <Rayas w={70} color={OL} desde="der" max={0.32} />
    {DECENAS.map((n) => (
      <div key={n} style={{position: 'absolute', top: n * PASO - 18, left: 84, fontFamily: 'LuckiestGuy', fontSize: 26, color: '#fff', WebkitTextStroke: `5px ${OL}`, paintOrder: 'stroke fill', whiteSpace: 'nowrap'}}>
        {n} M
      </div>
    ))}
  </Tira>
);

const R12: React.FC = () => (
  <Tira w={80} style={{borderLeft: '5px solid #FF6BD5', borderRight: '5px solid #FF6BD5', boxShadow: '0 0 14px #FF2FC0, inset 0 0 14px #FF2FC0', background: 'rgba(40,0,40,0.35)'}}>
    <Rayas w={70} color="#FFF27A" glow="#FFD400" />
    <Numeros left={34} estilo={{fontFamily: 'Chewy', fontSize: 30, color: '#FFF6B0', textShadow: '0 0 8px #FFD400, 0 0 18px #FF8A00'}} />
  </Tira>
);

const R13: React.FC = () => (
  <Tira w={88} style={{background: `repeating-linear-gradient(-45deg, ${AM} 0 26px, #1A1A1A 26px 52px)`, border: `5px solid ${OL}`, boxSizing: 'border-box'}}>
    {DECENAS.map((n) => (
      <div key={n} style={{position: 'absolute', top: n * PASO - 22, left: 6, width: 66, textAlign: 'center', fontFamily: 'LuckiestGuy', fontSize: 24, color: OL, background: '#fff', border: `3px solid ${OL}`, borderRadius: 8, padding: '4px 0 0'}}>
        {n}M
      </div>
    ))}
  </Tira>
);

const R14: React.FC = () => (
  <Tira w={96} style={{background: 'rgba(170,215,255,0.35)', border: '3px solid rgba(255,255,255,0.9)', borderRadius: 8, boxShadow: 'inset 6px 0 0 rgba(255,255,255,0.6), 0 8px 20px rgba(0,0,0,0.3)'}}>
    <Rayas w={96} color="#123A7A" />
    <Numeros left={42} estilo={{fontFamily: 'Bangers', fontSize: 30, color: '#123A7A', letterSpacing: 1}} />
  </Tira>
);

const R15: React.FC = () => (
  <Tira w={60} style={{}}>
    {Array.from({length: 120}).map((_, i) => (
      <div key={i} style={{position: 'absolute', left: 26 + Math.sin(i * 1.7) * 6, top: (i / 120) * LARGO, width: 6, height: 6, borderRadius: 3, background: '#9BFF6B', opacity: 0.45 + 0.55 * Math.abs(Math.sin(i * 0.9)), boxShadow: '0 0 6px #6BFF3B'}} />
    ))}
    {[0, LARGO].map((y) => (
      <div key={y} style={{position: 'absolute', left: 0, top: y - 3, width: 60, height: 6, background: '#9BFF6B', boxShadow: '0 0 10px #6BFF3B'}} />
    ))}
    {DECENAS.map((n) => (
      <div key={n} style={{position: 'absolute', top: n * PASO - 14, left: 64, fontFamily: MONO, fontWeight: 700, fontSize: 20, color: '#DFFFD0', background: 'rgba(0,0,0,0.55)', padding: '2px 6px', borderRadius: 4}}>
        {n}.0m
      </div>
    ))}
  </Tira>
);

const R16: React.FC = () => (
  <Tira w={92} style={{background: '#fff', border: '7px solid #000', boxShadow: '12px 12px 0 #000', backgroundImage: 'radial-gradient(#FFB3D9 2.5px, transparent 3px)', backgroundSize: '12px 12px'}}>
    <Rayas w={92} color="#000" />
    <Numeros left={40} estilo={{fontFamily: 'Bangers', fontSize: 36, color: '#E6262B', WebkitTextStroke: '2px #000', letterSpacing: 1}} />
  </Tira>
);

const R17: React.FC = () => (
  <>
    <div style={{position: 'absolute', left: -78, top: -128, width: 170, height: 170, borderRadius: '50%', background: '#FF7A1A', border: `6px solid ${OL}`, boxShadow: `0 10px 0 ${OL}`}}>
      <div style={{position: 'absolute', left: 50, top: 50, width: 58, height: 58, borderRadius: '50%', background: '#3A3330', border: `5px solid ${OL}`}} />
      <div style={{position: 'absolute', left: 140, top: 60, width: 60, height: 20, borderRadius: 10, background: '#3A3330', border: `4px solid ${OL}`}} />
    </div>
    <Tira w={72} style={{background: '#FFE7C2', borderLeft: `4px solid ${OL}`, borderRight: `4px solid ${OL}`}}>
      <Rayas w={72} color="#1A1A1A" />
      {DECENAS.map((n) => (
        <div key={n} style={{position: 'absolute', top: n * PASO - 34, left: 28, transform: 'rotate(-90deg)', transformOrigin: 'left top', fontFamily: 'Bangers', fontSize: 30, color: n % 20 ? '#1A1A1A' : '#D6312B', whiteSpace: 'nowrap'}}>
          {n} M
        </div>
      ))}
    </Tira>
  </>
);

const R18: React.FC = () => (
  <Tira w={100} style={{background: '#1B1D22', border: '5px solid #A7ADB6', borderRadius: 14}}>
    {DECENAS.map((n) => (
      <div key={n} style={{position: 'absolute', top: n * PASO - 30, left: 12, width: 70, height: 46, borderRadius: 8, background: '#0B0B0D', border: '2px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 26, color: '#FF3B2A', textShadow: '0 0 8px #FF3B2A'}}>
        {n / 10 * 3}F
      </div>
    ))}
    <div style={{position: 'absolute', right: -64, top: LARGO - 36, fontFamily: 'Bangers', fontSize: 34, color: '#fff', WebkitTextStroke: '5px #000', paintOrder: 'stroke fill'}}>▼</div>
  </Tira>
);

const R19: React.FC = () => (
  <Tira w={90} style={{background: 'rgba(16,58,122,0.55)', backgroundImage: 'linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
    <div style={{position: 'absolute', left: 44, top: 0, width: 3, height: LARGO, background: '#fff'}} />
    {[0, LARGO].map((y) => (
      <div key={y} style={{position: 'absolute', left: 14, top: y - 1.5, width: 64, height: 3, background: '#fff'}} />
    ))}
    <div style={{position: 'absolute', left: 33, top: 0, width: 0, height: 0, borderLeft: '13px solid transparent', borderRight: '13px solid transparent', borderBottom: '26px solid #fff'}} />
    <div style={{position: 'absolute', left: 33, top: LARGO - 26, width: 0, height: 0, borderLeft: '13px solid transparent', borderRight: '13px solid transparent', borderTop: '26px solid #fff'}} />
    <Rayas w={30} color="rgba(255,255,255,0.8)" cada={5} />
    <div style={{position: 'absolute', left: 10, top: LARGO / 2 + 70, transform: 'rotate(-90deg)', transformOrigin: 'left top', fontFamily: MONO, fontWeight: 700, fontSize: 34, color: '#fff', background: 'rgba(16,58,122,1)', padding: '0 10px', whiteSpace: 'nowrap'}}>100.00 m</div>
  </Tira>
);

const R20: React.FC = () => (
  <Tira w={60} style={{}}>
    <div style={{position: 'absolute', left: 28, top: 0, height: LARGO, borderLeft: '5px dashed #fff', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.6))'}} />
    {DECENAS.slice(0, 9).map((n) => (
      <div key={n} style={{position: 'absolute', left: 22, top: n * PASO - 8, width: 16, height: 16, borderRadius: 8, background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.5)'}} />
    ))}
    {[0, LARGO].map((y) => (
      <div key={y} style={{position: 'absolute', left: 6, top: y - 24, width: 48, height: 48, borderRadius: 24, background: 'rgba(255,255,255,0.35)', border: '6px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.5)'}} />
    ))}
    <div style={{position: 'absolute', left: -30, top: LARGO / 2 - 34, padding: '10px 22px', borderRadius: 40, background: 'rgba(255,255,255,0.92)', fontFamily: 'Bangers', fontSize: 40, color: '#111', letterSpacing: 1, boxShadow: '0 6px 16px rgba(0,0,0,0.4)', whiteSpace: 'nowrap'}}>100 m</div>
  </Tira>
);

export const REGLAS = [R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, R16, R17, R18, R19, R20];
export const NOMBRES_REGLA = [
  'Cinta amarilla (serie)', 'Madera plegable', 'Mira topográfica', 'Cinta de costurera', 'Láser holográfico',
  'Panel holograma', 'Metal 3D cromado', 'Pisos de edificio', 'Altímetro de avión', 'Profundidad (buceo)',
  'Termómetro', 'Neón', 'Cinta de peligro', 'Regla transparente', 'Escáner LiDAR',
  'Cómic', 'Cinta de agrimensor', 'Ascensor LED', 'Plano técnico', 'Medida AR (celular)',
];

// ---------------------------------------------------------------- ETIQUETAS ("100 M ≈ 30 FLOORS")
const Txt: React.FC<{a?: React.CSSProperties; b?: React.CSSProperties; fuente?: string}> = ({a, b, fuente = 'LuckiestGuy'}) => (
  <div style={{textAlign: 'center', lineHeight: 0.95, whiteSpace: 'nowrap'}}>
    <div style={{fontFamily: fuente, fontSize: 68, ...a}}>100 M</div>
    <div style={{fontFamily: fuente, fontSize: 32, ...b}}>≈ 30 FLOORS</div>
  </div>
);
const trz = (px: number, c = OL): React.CSSProperties => ({WebkitTextStroke: `${px}px ${c}`, paintOrder: 'stroke fill'});

const E1: React.FC = () => (
  <div style={{background: AM, border: `6px solid ${OL}`, borderRadius: 18, padding: '14px 26px 6px', boxShadow: `0 9px 0 ${OL}`, transform: 'rotate(-3deg)'}}>
    <Txt a={{color: OL}} b={{color: '#D6312B'}} />
  </div>
);
const E2: React.FC = () => (
  <div style={{position: 'relative', paddingBottom: 90}}>
    <div style={{position: 'absolute', left: '50%', bottom: 0, width: 26, height: 130, marginLeft: -13, background: '#8A5A2B', border: `5px solid ${OL}`}} />
    <div style={{position: 'relative', background: 'repeating-linear-gradient(180deg,#C98A4B 0 34px,#B97A3E 34px 38px)', border: `6px solid ${OL}`, borderRadius: 10, padding: '16px 30px 8px', transform: 'rotate(2deg)', boxShadow: `0 8px 0 ${OL}`}}>
      {[[10, 10], [10, 'auto'], ['auto', 10], ['auto', 'auto']].map(([l, r], i) => (
        <div key={i} style={{position: 'absolute', left: l as any, right: r === 'auto' ? undefined : (r as any), ...(i % 2 ? {bottom: 10} : {top: 10}), ...(l === 'auto' ? {right: 10} : {}), width: 10, height: 10, borderRadius: 5, background: '#555'}} />
      ))}
      <Txt a={{color: '#FFF4D6', ...trz(8)}} b={{color: '#FFF4D6', ...trz(6)}} fuente="Chewy" />
    </div>
  </div>
);
const E3: React.FC = () => (
  <div style={{position: 'relative', paddingBottom: 60}}>
    {[30, 'auto'].map((l, i) => (
      <div key={i} style={{position: 'absolute', bottom: 0, left: i ? undefined : 40, right: i ? 40 : undefined, width: 22, height: 120, background: '#6B4423', border: `4px solid ${OL}`}} />
    ))}
    <div style={{position: 'relative', background: '#5B3A1E', border: `6px solid ${OL}`, borderRadius: 14, padding: 8}}>
      <div style={{border: '5px solid #F2C94C', borderRadius: 8, padding: '12px 30px 4px'}}>
        <Txt a={{color: '#F2C94C'}} b={{color: '#F7E7B4'}} />
      </div>
    </div>
  </div>
);
const E4: React.FC = () => (
  <div style={{position: 'relative', transform: 'rotate(-6deg)'}}>
    <div style={{position: 'absolute', left: -70, top: 40, width: 90, height: 4, background: '#C0392B', transform: 'rotate(-20deg)'}} />
    <div style={{background: '#E9C98F', border: `5px solid ${OL}`, borderRadius: '40px 14px 14px 40px', padding: '14px 30px 6px 64px', position: 'relative'}}>
      <div style={{position: 'absolute', left: 18, top: '50%', marginTop: -14, width: 28, height: 28, borderRadius: 14, background: '#fff', border: `5px solid #B0B6BE`}} />
      <Txt a={{color: OL}} b={{color: '#8A5A2B'}} fuente="Chewy" />
    </div>
  </div>
);
const E5: React.FC = () => (
  <div style={{position: 'relative', background: 'rgba(0,229,255,0.12)', border: '2px solid #67F2FF', padding: '18px 34px 10px', boxShadow: '0 0 24px rgba(0,229,255,0.7), inset 0 0 20px rgba(0,229,255,0.35)', backdropFilter: 'blur(4px)'}}>
    {[[0, 0], [0, 1], [1, 0], [1, 1]].map(([v, h], i) => (
      <div key={i} style={{position: 'absolute', [v ? 'bottom' : 'top']: -6, [h ? 'right' : 'left']: -6, width: 26, height: 26, borderTop: v ? undefined : '5px solid #B6FBFF', borderBottom: v ? '5px solid #B6FBFF' : undefined, borderLeft: h ? undefined : '5px solid #B6FBFF', borderRight: h ? '5px solid #B6FBFF' : undefined} as React.CSSProperties} />
    ))}
    <Txt fuente={MONO} a={{fontWeight: 700, color: '#E6FEFF', textShadow: '0 0 12px #00E5FF', fontSize: 60}} b={{fontWeight: 700, color: '#7DF9FF', fontSize: 26, letterSpacing: 2}} />
  </div>
);
const E6: React.FC = () => (
  <div style={{position: 'relative'}}>
    <div style={{background: '#fff', border: '6px solid #000', borderRadius: '50%', padding: '34px 50px 26px'}}>
      <Txt fuente="Bangers" a={{color: '#000', letterSpacing: 2}} b={{color: '#E6262B', letterSpacing: 2}} />
    </div>
    <div style={{position: 'absolute', left: 50, bottom: -36, width: 0, height: 0, borderLeft: '22px solid transparent', borderRight: '22px solid transparent', borderTop: '48px solid #000', transform: 'rotate(20deg)'}} />
  </div>
);
const E7: React.FC = () => (
  <div style={{position: 'relative', background: 'linear-gradient(160deg,#F2F4F7,#A7AFB9 55%,#717A85)', border: '3px solid #2E343B', borderRadius: 12, padding: '18px 40px 10px', boxShadow: '0 14px 24px rgba(0,0,0,0.5), inset 0 3px 0 rgba(255,255,255,0.9)'}}>
    {[[12, 12], [12, 1], [1, 12], [1, 1]].map(([a, b], i) => (
      <div key={i} style={{position: 'absolute', ...(i < 2 ? {top: 10} : {bottom: 10}), ...(i % 2 ? {right: 12} : {left: 12}), width: 14, height: 14, borderRadius: 7, background: 'radial-gradient(circle at 35% 30%,#fff,#666)'}} />
    ))}
    <Txt fuente="Bangers" a={{color: '#1D2228', letterSpacing: 2, textShadow: '0 2px 0 rgba(255,255,255,0.7)'}} b={{color: '#1D2228', letterSpacing: 2}} />
  </div>
);
const E8: React.FC = () => (
  <div style={{background: '#0E6B3A', border: '5px solid #fff', outline: '4px solid #0E6B3A', borderRadius: 14, padding: '14px 34px 8px', boxShadow: '0 10px 20px rgba(0,0,0,0.4)'}}>
    <Txt fuente="Bangers" a={{color: '#fff', letterSpacing: 3}} b={{color: '#fff', letterSpacing: 3}} />
  </div>
);
const E9: React.FC = () => (
  <div style={{background: 'linear-gradient(180deg,#C9CED6,#8E959F)', border: '4px solid #50565E', borderRadius: 14, padding: 12, boxShadow: '0 10px 20px rgba(0,0,0,0.45)'}}>
    <div style={{background: '#0A0A0C', borderRadius: 8, padding: '10px 26px', display: 'flex', alignItems: 'center', gap: 18}}>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 70, color: '#FF3B2A', textShadow: '0 0 12px #FF3B2A'}}>30F</div>
      <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 26, color: '#FFB3A8', lineHeight: 1.1}}>
        ▼<br />100 M
      </div>
    </div>
  </div>
);
const E10: React.FC = () => (
  <div style={{position: 'relative', background: '#FFD23F', border: `5px solid ${OL}`, borderRadius: 10, padding: '14px 46px 6px', transform: 'rotate(-4deg)', WebkitMaskImage: 'radial-gradient(circle at 0 50%, transparent 18px, #000 19px), radial-gradient(circle at 100% 50%, transparent 18px, #000 19px)', WebkitMaskComposite: 'source-in', maskComposite: 'intersect'}}>
    <div style={{position: 'absolute', left: 38, top: 8, bottom: 8, borderLeft: `4px dashed ${OL}`}} />
    <Txt a={{color: OL}} b={{color: '#D6312B'}} />
  </div>
);
const E11: React.FC = () => (
  <div style={{background: '#2A1416', border: '4px solid #FF6BD5', borderRadius: 16, padding: '16px 34px 8px', boxShadow: '0 0 18px #FF2FC0, inset 0 0 18px #FF2FC0'}}>
    <Txt fuente="Chewy" a={{color: '#FFF6B0', textShadow: '0 0 10px #FFD400, 0 0 24px #FF8A00'}} b={{color: '#FFC6F0', textShadow: '0 0 10px #FF2FC0'}} />
  </div>
);
const E12: React.FC = () => (
  <div style={{background: '#fff', borderRadius: 30, padding: 10, transform: 'rotate(5deg)', boxShadow: '0 10px 18px rgba(0,0,0,0.4)'}}>
    <div style={{background: 'linear-gradient(135deg,#FF5A5F,#FF9A3C)', borderRadius: 22, padding: '14px 30px 6px'}}>
      <Txt a={{color: '#fff', ...trz(7)}} b={{color: AM, ...trz(5)}} />
    </div>
  </div>
);
const E13: React.FC = () => (
  <div style={{position: 'relative', background: '#FFF27A', padding: '30px 34px 16px', transform: 'rotate(-5deg)', boxShadow: '0 12px 16px rgba(0,0,0,0.35)'}}>
    <div style={{position: 'absolute', left: '50%', top: -16, width: 110, height: 34, marginLeft: -55, background: 'rgba(255,255,255,0.65)', transform: 'rotate(4deg)'}} />
    <Txt fuente="Chewy" a={{color: '#1F3B8A'}} b={{color: '#1F3B8A'}} />
  </div>
);
const E14: React.FC = () => (
  <div style={{display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(30,30,36,0.55)', border: '2px solid rgba(255,255,255,0.5)', borderRadius: 40, padding: '12px 30px 12px 16px', backdropFilter: 'blur(10px)', boxShadow: '0 10px 24px rgba(0,0,0,0.4)'}}>
    <div style={{width: 64, height: 64, borderRadius: 32, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38}}>📏</div>
    <Txt fuente="Bangers" a={{color: '#fff', letterSpacing: 2, textAlign: 'left'}} b={{color: 'rgba(255,255,255,0.8)', letterSpacing: 2}} />
  </div>
);
const E15: React.FC = () => (
  <div style={{background: '#123E86', backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '18px 18px', border: '3px solid #fff', padding: '16px 30px 10px'}}>
    <Txt fuente={MONO} a={{fontWeight: 700, color: '#fff', fontSize: 58}} b={{fontWeight: 700, color: '#CFE3FF', fontSize: 24, letterSpacing: 2}} />
  </div>
);
const E16: React.FC = () => (
  <div style={{background: '#3A2C8F', padding: '14px 30px 6px', boxShadow: '0 -6px 0 #000, 0 6px 0 #000, -6px 0 0 #000, 6px 0 0 #000, 12px 12px 0 #000', imageRendering: 'pixelated'}}>
    <Txt a={{color: '#7CFF4F', textShadow: '4px 4px 0 #000'}} b={{color: '#FFD400', textShadow: '3px 3px 0 #000'}} />
  </div>
);
const E17: React.FC = () => (
  <div style={{position: 'relative', background: '#B3121C', border: `6px solid ${OL}`, borderRadius: 16, padding: '26px 40px 18px'}}>
    {Array.from({length: 22}).map((_, i) => {
      const perim = i / 22;
      const top = perim < 0.25 ? 0 : perim < 0.5 ? (perim - 0.25) * 4 : perim < 0.75 ? 1 : 1 - (perim - 0.75) * 4;
      const left = perim < 0.25 ? perim * 4 : perim < 0.5 ? 1 : perim < 0.75 ? 1 - (perim - 0.5) * 4 : 0;
      return <div key={i} style={{position: 'absolute', left: `calc(${left * 100}% - 7px)`, top: `calc(${top * 100}% - 7px)`, width: 14, height: 14, borderRadius: 7, background: '#FFF4B8', boxShadow: '0 0 8px #FFD400'}} />;
    })}
    <Txt a={{color: '#FFF4D6', ...trz(7)}} b={{color: AM, ...trz(5)}} />
  </div>
);
const E18: React.FC = () => (
  <div style={{display: 'flex', alignItems: 'flex-end', gap: 16, background: '#FFF6DF', border: `6px solid ${OL}`, borderRadius: 18, padding: '14px 24px', boxShadow: `0 9px 0 ${OL}`}}>
    <div style={{width: 46, height: 120, background: '#8FB8D8', border: `4px solid ${OL}`, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, padding: 4, boxSizing: 'border-box'}}>
      {Array.from({length: 20}).map((_, i) => (
        <div key={i} style={{background: '#FFF27A'}} />
      ))}
    </div>
    <Txt a={{color: OL}} b={{color: '#2F6FD0'}} />
  </div>
);
const E19: React.FC = () => (
  <div style={{position: 'relative', width: 280, height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <div style={{position: 'absolute', inset: 0, background: '#2F6FD0', border: `6px solid ${OL}`, clipPath: 'polygon(50% 0,100% 18%,100% 62%,50% 100%,0 62%,0 18%)'}} />
    <div style={{position: 'absolute', inset: 14, background: AM, clipPath: 'polygon(50% 0,100% 18%,100% 62%,50% 100%,0 62%,0 18%)'}} />
    <div style={{position: 'relative', marginTop: -20}}>
      <Txt a={{color: OL, fontSize: 60}} b={{color: '#D6312B', fontSize: 26}} />
    </div>
  </div>
);
const E20: React.FC = () => (
  <div style={{position: 'relative', width: 300, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-8deg)'}}>
    <div style={{position: 'absolute', inset: 0, background: '#E5322B', clipPath: 'polygon(50% 0,61% 13%,77% 6%,80% 22%,96% 25%,89% 40%,100% 50%,89% 60%,96% 75%,80% 78%,77% 94%,61% 87%,50% 100%,39% 87%,23% 94%,20% 78%,4% 75%,11% 60%,0 50%,11% 40%,4% 25%,20% 22%,23% 6%,39% 13%)'}} />
    <div style={{position: 'relative'}}>
      <Txt a={{color: AM, ...trz(8), fontSize: 64}} b={{color: '#fff', ...trz(6), fontSize: 28}} />
    </div>
  </div>
);

export const ETIQUETAS = [E1, E2, E3, E4, E5, E6, E7, E8, E9, E10, E11, E12, E13, E14, E15, E16, E17, E18, E19, E20];
export const NOMBRES_ETIQUETA = [
  'Amarilla (serie)', 'Letrero de madera', 'Parque nacional', 'Etiqueta de cartón', 'Holograma',
  'Globo de cómic', 'Placa metálica 3D', 'Señal de carretera', 'Ascensor LED', 'Boleto',
  'Neón', 'Sticker', 'Post-it', 'Pastilla AR', 'Plano técnico',
  'Pixel / videojuego', 'Marquesina con focos', 'Edificio de 30 pisos', 'Escudo', 'Precio de oferta',
];

// ---------------------------------------------------------------- HOJAS
const Fondo: React.FC = () => <Img src={staticFile('survive/s01/clips/op_regla_fondo.png')} style={{position: 'absolute', inset: 0, width: 1080, height: 1920}} />;
const Num: React.FC<{n: number; nombre: string}> = ({n, nombre}) => (
  <div style={{position: 'absolute', left: 24, bottom: 24, display: 'flex', alignItems: 'center', gap: 14}}>
    <div style={{width: 120, height: 120, borderRadius: 60, background: '#D6312B', border: `8px solid ${OL}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'LuckiestGuy', fontSize: 76, color: '#fff', paddingTop: 8}}>{n}</div>
    <div style={{fontFamily: 'LuckiestGuy', fontSize: 54, color: '#fff', WebkitTextStroke: `10px ${OL}`, paintOrder: 'stroke fill'}}>{nombre}</div>
  </div>
);

/** Una regla en su lugar: misma perspectiva que la cinta del Short */
export const EscenaRegla: React.FC<{i: number}> = ({i}) => {
  const R = REGLAS[i];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Fondo />
      <AbsoluteFill style={{perspective: 1300}}>
        <div style={{position: 'absolute', left: 560, top: 100, transformOrigin: 'top center', transform: 'rotateX(32deg) rotateZ(-4deg)', transformStyle: 'preserve-3d'}}>
          <R />
        </div>
      </AbsoluteFill>
      <Num n={i + 1} nombre={NOMBRES_REGLA[i]} />
    </AbsoluteFill>
  );
};

const ESC = 0.4;
const Hoja: React.FC<{desde: number}> = ({desde}) => (
  <AbsoluteFill style={{background: '#111', display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 0}}>
    {Array.from({length: 10}).map((_, k) => (
      <div key={k} style={{width: 1080 * ESC, height: 1920 * ESC, overflow: 'hidden', position: 'relative', outline: '3px solid #111'}}>
        <div style={{width: 1080, height: 1920, transform: `scale(${ESC})`, transformOrigin: 'top left', position: 'relative'}}>
          <EscenaRegla i={desde + k} />
        </div>
      </div>
    ))}
  </AbsoluteFill>
);
export const HojaReglasA: React.FC = () => <Hoja desde={0} />;
export const HojaReglasB: React.FC = () => <Hoja desde={10} />;

/** Etiquetas: cada una sobre un pedazo del cuadro del acantilado */
export const HojaEtiquetas: React.FC = () => (
  <AbsoluteFill style={{background: '#111', display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
    {ETIQUETAS.map((E, i) => (
      <div key={i} style={{width: 540, height: 420, position: 'relative', overflow: 'hidden', outline: '3px solid #111'}}>
        <Img src={staticFile('survive/s01/clips/op_regla_fondo.png')} style={{position: 'absolute', left: -270, top: -900, width: 1080, height: 1920}} />
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'scale(0.85)'}}>
          <E />
        </div>
        <div style={{position: 'absolute', left: 10, top: 10, display: 'flex', alignItems: 'center', gap: 8}}>
          <div style={{width: 56, height: 56, borderRadius: 28, background: '#D6312B', border: `5px solid ${OL}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'LuckiestGuy', fontSize: 34, color: '#fff', paddingTop: 4}}>{i + 1}</div>
          <div style={{fontFamily: 'LuckiestGuy', fontSize: 26, color: '#fff', WebkitTextStroke: `6px ${OL}`, paintOrder: 'stroke fill'}}>{NOMBRES_ETIQUETA[i]}</div>
        </div>
      </div>
    ))}
  </AbsoluteFill>
);
