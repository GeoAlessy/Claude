import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {loadFont} from '@remotion/fonts';

// =====================================================================
// 20 diseños para el veredicto final: FALL #1 → MAYBE (sobrevive)  ·  FALL #2 → DEAD
// Estilo de la serie: colores planos, contorno marrón oscuro, sombra dura.
// =====================================================================
['LuckiestGuy', 'Bangers', 'Chewy'].forEach((f) => loadFont({family: f, url: staticFile(`fonts/${f}-latin.woff2`), weight: '400'}));

const OL = '#2B1A10';
const AM = '#FFD90F';
const VERDE = '#2FB84F';
const ROJO = '#E0302A';
const CREMA = '#FFF6DF';
const MONO = '"DejaVu Sans Mono", "Courier New", monospace';
const trz = (px: number, c = OL): React.CSSProperties => ({WebkitTextStroke: `${px}px ${c}`, paintOrder: 'stroke fill'});
const sombra = (px = 8): React.CSSProperties => ({boxShadow: `0 ${px}px 0 ${OL}`});
const LG = (size: number, color: string, extra: React.CSSProperties = {}): React.CSSProperties => ({fontFamily: 'LuckiestGuy', fontSize: size, color, lineHeight: 1, whiteSpace: 'nowrap', ...extra});
const Col: React.FC<{gap?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({gap = 34, children, style}) => <div style={{display: 'flex', flexDirection: 'column', gap, ...style}}>{children}</div>;
const Fila: React.FC<{gap?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({gap = 20, children, style}) => <div style={{display: 'flex', alignItems: 'center', gap, ...style}}>{children}</div>;

const Chip: React.FC<{t: string; bg?: string; color?: string}> = ({t, bg = CREMA, color = OL}) => (
  <div style={{...LG(64, color), background: bg, border: `6px solid ${OL}`, borderRadius: 20, padding: '14px 26px 6px', ...sombra(7)}}>{t}</div>
);

// 1 · Sellos de goma
const V1: React.FC = () => {
  const Sello: React.FC<{t: string; c: string; rot: number}> = ({t, c, rot}) => (
    <div style={{...LG(92, c), border: `9px solid ${c}`, borderRadius: 18, padding: '14px 26px 4px', transform: `rotate(${rot}deg)`, background: 'rgba(255,246,223,0.9)', WebkitMaskImage: 'radial-gradient(circle at 30% 40%, #000 60%, rgba(0,0,0,0.75) 61%, #000 75%)', boxShadow: `0 0 0 4px ${CREMA}`}}>{t}</div>
  );
  return (
    <Col>
      <Fila><Chip t="FALL #1" /><Sello t="MAYBE ✓" c={VERDE} rot={-7} /></Fila>
      <Fila><Chip t="FALL #2" /><Sello t="DEAD ☠" c={ROJO} rot={6} /></Fila>
    </Col>
  );
};

// 2 · Curita (sobrevive) y lápida (muere)
const V2: React.FC = () => (
  <Col gap={40}>
    <Fila>
      <Chip t="FALL #1" />
      <div style={{position: 'relative', background: '#F2B98A', border: `6px solid ${OL}`, borderRadius: 60, padding: '16px 70px 6px', transform: 'rotate(-6deg)', ...sombra(7)}}>
        <div style={{position: 'absolute', left: '50%', top: 8, bottom: 8, width: 110, marginLeft: -55, background: '#FBD6B4', borderRadius: 10, backgroundImage: 'radial-gradient(#D99A6C 3px, transparent 4px)', backgroundSize: '18px 18px'}} />
        <div style={{position: 'relative', ...LG(74, VERDE, trz(8))}}>MAYBE</div>
      </div>
    </Fila>
    <Fila>
      <Chip t="FALL #2" />
      <div style={{background: '#9AA0A8', border: `6px solid ${OL}`, borderRadius: '90px 90px 10px 10px', padding: '34px 40px 14px', textAlign: 'center', ...sombra(7)}}>
        <div style={{...LG(40, '#5A6068')}}>R.I.P.</div>
        <div style={{...LG(84, '#fff', trz(9))}}>DEAD</div>
      </div>
    </Fila>
  </Col>
);

// 3 · Semáforo
const V3: React.FC = () => {
  const Luz: React.FC<{c: string; on: boolean}> = ({c, on}) => (
    <div style={{width: 74, height: 74, borderRadius: 37, background: on ? c : '#3A3530', border: `5px solid ${OL}`, boxShadow: on ? `0 0 26px ${c}` : undefined}} />
  );
  const Sema: React.FC<{v: boolean}> = ({v}) => (
    <div style={{display: 'flex', gap: 8, background: '#2E2B28', border: `6px solid ${OL}`, borderRadius: 22, padding: 10, ...sombra(6)}}>
      <Luz c={ROJO} on={!v} />
      <Luz c={AM} on={false} />
      <Luz c={VERDE} on={v} />
    </div>
  );
  return (
    <Col>
      <Fila><Chip t="FALL #1" /><Sema v /><div style={LG(74, VERDE, trz(9))}>MAYBE</div></Fila>
      <Fila><Chip t="FALL #2" /><Sema v={false} /><div style={LG(74, ROJO, trz(9))}>DEAD</div></Fila>
    </Col>
  );
};

// 4 · Portapapeles del médico
const V4: React.FC = () => (
  <div style={{position: 'relative', background: '#C98A4B', border: `6px solid ${OL}`, borderRadius: 24, padding: '50px 26px 26px', width: 720, ...sombra(10)}}>
    <div style={{position: 'absolute', left: '50%', top: -26, width: 200, height: 60, marginLeft: -100, background: '#B8BEC6', border: `6px solid ${OL}`, borderRadius: 14}} />
    <div style={{background: CREMA, border: `5px solid ${OL}`, padding: '24px 30px', backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 58px, #A9C7E8 58px 61px)'}}>
      <div style={{...LG(40, '#2F6FD0'), marginBottom: 18}}>PATIENT: H. SIMPSON</div>
      <Fila style={{marginBottom: 14}}><div style={LG(56, OL)}>FALL #1</div><div style={{...LG(56, VERDE), fontFamily: 'Chewy'}}>☑ MAYBE</div></Fila>
      <Fila><div style={LG(56, OL)}>FALL #2</div><div style={{...LG(56, ROJO), fontFamily: 'Chewy'}}>☒ DEAD</div></Fila>
    </div>
  </div>
);

// 5 · Monitor cardíaco: late vs línea plana
const V5: React.FC = () => {
  const Monitor: React.FC<{vivo: boolean}> = ({vivo}) => (
    <div style={{background: '#0D1A14', border: `6px solid ${OL}`, borderRadius: 18, padding: '10px 18px', width: 470, ...sombra(7)}}>
      <svg width={430} height={90}>
        <polyline points={vivo ? '0,50 90,50 110,50 125,10 140,85 155,50 250,50 270,50 285,10 300,85 315,50 430,50' : '0,50 430,50'} fill="none" stroke={vivo ? '#4BFF8A' : '#FF4040'} strokeWidth={6} style={{filter: `drop-shadow(0 0 6px ${vivo ? '#4BFF8A' : '#FF4040'})`}} />
      </svg>
      <div style={{...LG(54, vivo ? '#4BFF8A' : '#FF4040'), textAlign: 'right', textShadow: `0 0 12px ${vivo ? '#4BFF8A' : '#FF4040'}`}}>{vivo ? 'MAYBE ♥' : 'DEAD ☠'}</div>
    </div>
  );
  return (
    <Col gap={26}>
      <Fila><Chip t="#1" /><Monitor vivo /></Fila>
      <Fila><Chip t="#2" /><Monitor vivo={false} /></Fila>
    </Col>
  );
};

// 6 · Arcade: 1UP / GAME OVER
const V6: React.FC = () => (
  <div style={{background: '#14102E', border: `6px solid ${OL}`, borderRadius: 18, padding: '26px 34px', boxShadow: `0 8px 0 ${OL}, inset 0 0 0 5px #6B4BFF`}}>
    <Fila style={{marginBottom: 22}}><div style={LG(54, '#fff')}>FALL #1</div><div style={LG(60, '#7CFF4F', {textShadow: '4px 4px 0 #000'})}>1UP ♥ MAYBE</div></Fila>
    <Fila><div style={LG(54, '#fff')}>FALL #2</div><div style={LG(60, '#FF3B5C', {textShadow: '4px 4px 0 #000'})}>GAME OVER</div></Fila>
  </div>
);

// 7 · Pulsera del hospital y etiqueta del pie
const V7: React.FC = () => (
  <Col gap={40}>
    <Fila>
      <Chip t="FALL #1" />
      <div style={{position: 'relative', background: '#BFE6FF', border: `6px solid ${OL}`, borderRadius: 40, padding: '14px 40px 6px', ...sombra(6)}}>
        <div style={{position: 'absolute', right: 18, top: '50%', marginTop: -14, width: 28, height: 28, borderRadius: 14, background: '#fff', border: `4px solid ${OL}`}} />
        <div style={{...LG(64, '#1F5FBF'), paddingRight: 30}}>MAYBE ✓</div>
      </div>
    </Fila>
    <Fila>
      <Chip t="FALL #2" />
      <div style={{position: 'relative', transform: 'rotate(8deg)'}}>
        <div style={{background: '#E9C98F', border: `6px solid ${OL}`, borderRadius: '50px 14px 14px 50px', padding: '14px 34px 6px 74px', ...sombra(6)}}>
          <div style={{position: 'absolute', left: 22, top: '50%', marginTop: -16, width: 32, height: 32, borderRadius: 16, background: '#fff', border: `5px solid #9AA0A8`}} />
          <div style={LG(70, ROJO, trz(6))}>DEAD</div>
        </div>
      </div>
    </Fila>
  </Col>
);

// 8 · Señales de tránsito: flecha verde y PARE
const V8: React.FC = () => (
  <Col gap={40}>
    <Fila>
      <Chip t="FALL #1" />
      <div style={{background: '#0E7A3E', border: '6px solid #fff', outline: `5px solid ${OL}`, borderRadius: 14, padding: '14px 30px 6px', ...LG(68, '#fff')}}>MAYBE ➜</div>
    </Fila>
    <Fila>
      <Chip t="FALL #2" />
      <div style={{width: 210, height: 210, background: ROJO, border: '7px solid #fff', outline: `5px solid ${OL}`, clipPath: 'polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={LG(64, '#fff')}>DEAD</div>
      </div>
    </Fila>
  </Col>
);

// 9 · Libreta de notas (boletín escolar)
const V9: React.FC = () => (
  <div style={{background: CREMA, border: `6px solid ${OL}`, borderRadius: 12, padding: '22px 30px', width: 700, transform: 'rotate(-2deg)', ...sombra(9)}}>
    <div style={{...LG(36, '#2F6FD0'), borderBottom: `4px solid ${OL}`, paddingBottom: 10, marginBottom: 16}}>SURVIVAL REPORT CARD</div>
    {[['FALL #1', 'C-', 'MAYBE', VERDE], ['FALL #2', 'F', 'DEAD', ROJO]].map(([a, n, t, c]) => (
      <Fila key={a} style={{justifyContent: 'space-between', marginBottom: 10}}>
        <div style={LG(54, OL)}>{a}</div>
        <div style={{...LG(54, c), fontFamily: 'Chewy'}}>{t}</div>
        <div style={{width: 92, height: 92, borderRadius: 46, border: `6px solid ${ROJO}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...LG(56, ROJO), fontFamily: 'Chewy', transform: 'rotate(-10deg)'}}>{n}</div>
      </Fila>
    ))}
  </div>
);

// 10 · Neón de bar
const V10: React.FC = () => (
  <div style={{background: '#22100F', border: `6px solid ${OL}`, borderRadius: 20, padding: '24px 36px', backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 30px, transparent 30px 34px)'}}>
    <Fila style={{marginBottom: 18}}><div style={{...LG(56, '#FFE9F7'), fontFamily: 'Chewy', textShadow: '0 0 8px #FF2FC0, 0 0 20px #FF2FC0'}}>FALL #1</div><div style={{...LG(70, '#E9FFE9'), fontFamily: 'Chewy', textShadow: '0 0 8px #4BFF8A, 0 0 24px #1FDD5A'}}>MAYBE</div></Fila>
    <Fila><div style={{...LG(56, '#FFE9F7'), fontFamily: 'Chewy', textShadow: '0 0 8px #FF2FC0, 0 0 20px #FF2FC0'}}>FALL #2</div><div style={{...LG(70, '#FFE9E9'), fontFamily: 'Chewy', textShadow: '0 0 8px #FF3030, 0 0 24px #FF1A1A'}}>DEAD</div></Fila>
  </div>
);

// 11 · Marcador de estadio
const V11: React.FC = () => (
  <div style={{background: '#121212', border: `7px solid ${OL}`, borderRadius: 12, padding: 16, boxShadow: `0 10px 0 ${OL}, inset 0 0 0 4px #444`}}>
    {[['FALL 1', 'MAYBE', '#7CFF4F'], ['FALL 2', 'DEAD', '#FF3B2A']].map(([a, t, c]) => (
      <Fila key={a} gap={14} style={{marginBottom: 10}}>
        <div style={{background: '#000', padding: '10px 18px', ...LG(52, AM, {fontFamily: MONO, fontWeight: 700})}}>{a}</div>
        <div style={{background: '#000', padding: '10px 18px', minWidth: 240, textAlign: 'center', ...LG(58, c, {fontFamily: MONO, fontWeight: 700, textShadow: `0 0 12px ${c}`})}}>{t}</div>
      </Fila>
    ))}
  </div>
);

// 12 · Tarjetas de árbitro: verde y roja
const V12: React.FC = () => {
  const Tarjeta: React.FC<{c: string; t: string; rot: number}> = ({c, t, rot}) => (
    <div style={{width: 190, height: 260, background: c, border: `7px solid ${OL}`, borderRadius: 18, transform: `rotate(${rot}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...sombra(9)}}>
      <div style={{...LG(54, '#fff', trz(7)), transform: 'rotate(-90deg)'}}>{t}</div>
    </div>
  );
  return (
    <Fila gap={40}>
      <Col gap={16} style={{alignItems: 'center'}}><Tarjeta c={VERDE} t="MAYBE" rot={-8} /><Chip t="FALL #1" /></Col>
      <Col gap={16} style={{alignItems: 'center'}}><Tarjeta c={ROJO} t="DEAD" rot={7} /><Chip t="FALL #2" /></Col>
    </Fila>
  );
};

// 13 · Botones de arcade 3D
const V13: React.FC = () => {
  const Boton: React.FC<{c: string; o: string; t: string}> = ({c, o, t}) => (
    <div style={{background: c, border: `6px solid ${OL}`, borderRadius: 60, padding: '16px 40px 8px', boxShadow: `inset 0 -12px 0 ${o}, inset 0 8px 0 rgba(255,255,255,0.45), 0 10px 0 ${OL}`, ...LG(70, '#fff', trz(8))}}>{t}</div>
  );
  return (
    <Col>
      <Fila><Chip t="FALL #1" /><Boton c="#47D764" o="#20A040" t="MAYBE" /></Fila>
      <Fila><Chip t="FALL #2" /><Boton c="#FF4B4B" o="#C02020" t="DEAD" /></Fila>
    </Col>
  );
};

// 14 · Holograma HUD
const V14: React.FC = () => (
  <div style={{position: 'relative', border: '3px solid #67F2FF', background: 'rgba(0,229,255,0.12)', padding: '26px 34px', boxShadow: '0 0 24px rgba(0,229,255,0.6), inset 0 0 22px rgba(0,229,255,0.3)'}}>
    <div style={{...LG(28, '#7DF9FF', {fontFamily: MONO, fontWeight: 700, letterSpacing: 3}), marginBottom: 16}}>// SURVIVAL ANALYSIS</div>
    <Fila style={{marginBottom: 14}}><div style={LG(50, '#E6FEFF', {fontFamily: MONO, fontWeight: 700})}>FALL_01</div><div style={LG(56, '#4BFF8A', {fontFamily: MONO, fontWeight: 700, textShadow: '0 0 12px #4BFF8A'})}>[ MAYBE ]</div></Fila>
    <Fila><div style={LG(50, '#E6FEFF', {fontFamily: MONO, fontWeight: 700})}>FALL_02</div><div style={LG(56, '#FF4D6A', {fontFamily: MONO, fontWeight: 700, textShadow: '0 0 12px #FF4D6A'})}>[ DEAD ]</div></Fila>
  </div>
);

// 15 · Stickers troquelados
const V15: React.FC = () => {
  const St: React.FC<{bg: string; t: string; rot: number}> = ({bg, t, rot}) => (
    <div style={{background: '#fff', borderRadius: 34, padding: 9, transform: `rotate(${rot}deg)`, boxShadow: '0 10px 16px rgba(0,0,0,0.4)'}}>
      <div style={{background: bg, borderRadius: 26, padding: '16px 30px 8px', ...LG(72, '#fff', trz(8))}}>{t}</div>
    </div>
  );
  return (
    <Col gap={36}>
      <Fila><St bg="#3D5AFE" t="FALL #1" rot={-4} /><St bg="linear-gradient(135deg,#3BE36B,#14A84A)" t="MAYBE ✓" rot={5} /></Fila>
      <Fila><St bg="#3D5AFE" t="FALL #2" rot={3} /><St bg="linear-gradient(135deg,#FF5A5F,#C4121B)" t="DEAD ☠" rot={-6} /></Fila>
    </Col>
  );
};

// 16 · Onomatopeya de cómic
const V16: React.FC = () => {
  const Estallido: React.FC<{bg: string; t: string; rot: number}> = ({bg, t, rot}) => (
    <div style={{position: 'relative', width: 380, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${rot}deg)`}}>
      <div style={{position: 'absolute', inset: 0, background: OL, clipPath: 'polygon(0 30%,14% 26%,8% 4%,28% 18%,38% 0,50% 18%,64% 2%,70% 22%,92% 8%,86% 32%,100% 42%,88% 56%,100% 78%,78% 74%,72% 100%,58% 80%,44% 98%,36% 78%,14% 94%,18% 70%,0 66%,10% 50%)'}} />
      <div style={{position: 'absolute', inset: 10, background: bg, clipPath: 'polygon(0 30%,14% 26%,8% 4%,28% 18%,38% 0,50% 18%,64% 2%,70% 22%,92% 8%,86% 32%,100% 42%,88% 56%,100% 78%,78% 74%,72% 100%,58% 80%,44% 98%,36% 78%,14% 94%,18% 70%,0 66%,10% 50%)'}} />
      <div style={{position: 'relative', ...LG(68, '#fff', {fontFamily: 'Bangers', letterSpacing: 3, ...trz(8)})}}>{t}</div>
    </div>
  );
  return (
    <Col gap={10}>
      <Fila><Chip t="FALL #1" /><Estallido bg={VERDE} t="MAYBE!" rot={-5} /></Fila>
      <Fila><Chip t="FALL #2" /><Estallido bg={ROJO} t="KAPUT!" rot={5} /></Fila>
    </Col>
  );
};

// 17 · Barra de supervivencia
const V17: React.FC = () => {
  const Barra: React.FC<{p: number; c: string; t: string}> = ({p, c, t}) => (
    <div style={{position: 'relative', width: 480, height: 86, background: '#3A3530', border: `6px solid ${OL}`, borderRadius: 43, overflow: 'hidden', ...sombra(6)}}>
      <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${p}%`, background: c, boxShadow: 'inset 0 -10px 0 rgba(0,0,0,0.2), inset 0 8px 0 rgba(255,255,255,0.35)'}} />
      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', ...LG(52, '#fff', trz(7))}}>{t}</div>
    </div>
  );
  return (
    <Col gap={30}>
      <Fila><Chip t="FALL #1" /><Barra p={50} c={VERDE} t="50% · MAYBE" /></Fila>
      <Fila><Chip t="FALL #2" /><Barra p={0} c={ROJO} t="0% · DEAD" /></Fila>
    </Col>
  );
};

// 18 · Frasco de pastillas y ataúd
const V18: React.FC = () => (
  <Col gap={36}>
    <Fila>
      <Chip t="FALL #1" />
      <div style={{position: 'relative'}}>
        <div style={{width: 250, height: 40, background: '#fff', border: `6px solid ${OL}`, borderRadius: 10, marginLeft: 20}} />
        <div style={{width: 290, background: '#FF9A3C', border: `6px solid ${OL}`, borderRadius: '10px 10px 24px 24px', padding: '14px 0 8px', marginTop: -6, ...sombra(7)}}>
          <div style={{background: CREMA, borderTop: `5px solid ${OL}`, borderBottom: `5px solid ${OL}`, padding: '8px 0 2px', textAlign: 'center', ...LG(52, VERDE)}}>℞ MAYBE</div>
        </div>
      </div>
    </Fila>
    <Fila>
      <Chip t="FALL #2" />
      <div style={{width: 300, height: 170, background: '#6B3E1E', border: `6px solid ${OL}`, clipPath: 'polygon(18% 0,82% 0,100% 30%,86% 100%,14% 100%,0 30%)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={LG(62, CREMA, trz(6))}>DEAD ✝</div>
      </div>
    </Fila>
  </Col>
);

// 19 · Noticiero de la tele (zócalo)
const V19: React.FC = () => (
  <div style={{width: 820, ...sombra(10), border: `6px solid ${OL}`, borderRadius: 10, overflow: 'hidden'}}>
    <div style={{background: ROJO, padding: '10px 22px 4px', ...LG(40, '#fff')}}>⚡ BREAKING NEWS</div>
    <div style={{background: CREMA, padding: '16px 22px 8px'}}>
      <Fila style={{marginBottom: 6}}><div style={LG(52, OL)}>FALL #1:</div><div style={LG(52, VERDE)}>MAN MAYBE OK</div></Fila>
      <Fila><div style={LG(52, OL)}>FALL #2:</div><div style={LG(52, ROJO)}>MAN DEAD</div></Fila>
    </div>
    <div style={{background: '#2F6FD0', padding: '6px 22px 2px', ...LG(28, '#fff', {letterSpacing: 2})}}>SPRINGFIELD GORGE · LIVE</div>
  </div>
);

// 20 · Tragamonedas
const V20: React.FC = () => {
  const Rodillo: React.FC<{t: string; c: string}> = ({t, c}) => (
    <div style={{background: 'linear-gradient(180deg,#bbb,#fff 30%,#fff 70%,#bbb)', border: `5px solid ${OL}`, borderRadius: 10, padding: '14px 18px 6px', minWidth: 110, textAlign: 'center', ...LG(56, c)}}>{t}</div>
  );
  return (
    <div style={{background: '#C4121B', border: `7px solid ${OL}`, borderRadius: 30, padding: '20px 26px', boxShadow: `0 10px 0 ${OL}, inset 0 0 0 6px ${AM}`}}>
      <div style={{...LG(40, AM, trz(6)), textAlign: 'center', marginBottom: 12}}>★ SURVIVAL SLOTS ★</div>
      <Fila gap={10} style={{marginBottom: 12}}><div style={LG(46, '#fff', trz(6))}>#1</div><Rodillo t="♥" c={VERDE} /><Rodillo t="?" c={OL} /><Rodillo t="MAYBE" c={VERDE} /></Fila>
      <Fila gap={10}><div style={LG(46, '#fff', trz(6))}>#2</div><Rodillo t="☠" c={OL} /><Rodillo t="☠" c={OL} /><Rodillo t="DEAD" c={ROJO} /></Fila>
    </div>
  );
};

export const VEREDICTOS = [V1, V2, V3, V4, V5, V6, V7, V8, V9, V10, V11, V12, V13, V14, V15, V16, V17, V18, V19, V20];
export const NOMBRES_VEREDICTO = [
  'Sellos de goma', 'Curita y lápida', 'Semáforo', 'Portapapeles del médico', 'Monitor cardíaco',
  'Arcade: Game Over', 'Pulsera y etiqueta del pie', 'Señales de tránsito', 'Libreta de notas', 'Neón de bar',
  'Marcador de estadio', 'Tarjetas de árbitro', 'Botones 3D', 'Holograma', 'Stickers',
  'Cómic: KAPUT!', 'Barra de supervivencia', 'Pastillas y ataúd', 'Noticiero', 'Tragamonedas',
];

// Hoja: cada opción sobre el cuadro real (Homero con la patineta), recortado a la zona del cartel
export const HojaVeredictos: React.FC = () => (
  <AbsoluteFill style={{background: '#111', display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
    {VEREDICTOS.map((V, i) => (
      <div key={i} style={{width: 540, height: 480, position: 'relative', overflow: 'hidden', outline: '3px solid #111'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 960, transform: 'scale(0.5)', transformOrigin: 'top left'}}>
          <Img src={staticFile('survive/s01/clips/op_veredicto_fondo.png')} style={{position: 'absolute', left: 0, top: -380, width: 1080, height: 1920}} />
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 60}}>
            <V />
          </div>
          <div style={{position: 'absolute', left: 20, top: 20, display: 'flex', alignItems: 'center', gap: 14}}>
            <div style={{width: 100, height: 100, borderRadius: 50, background: '#D6312B', border: `8px solid ${OL}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...LG(60, '#fff'), paddingTop: 8}}>{i + 1}</div>
            <div style={LG(48, '#fff', trz(10))}>{NOMBRES_VEREDICTO[i]}</div>
          </div>
        </div>
      </div>
    ))}
  </AbsoluteFill>
);
