import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, MONO, TITULAR} from '../estilo';
import {Simbolo} from './Marca';

// Miniaturas de los videos 03 (pump foil) y 04 (tren)
const R3 = staticFile('porquepaso/canal/p03_real.png'); // 1080×1920
const R3B = staticFile('porquepaso/canal/p03_real2.png'); // 1080×1920
const H3 = staticFile('porquepaso/canal/p03_holo.png'); // 1080×1920
const R4 = staticFile('porquepaso/canal/p04_real.png'); // 1080×1074
const H4 = staticFile('porquepaso/canal/p04_holo.png'); // 1080×1920
const H4Z = staticFile('porquepaso/canal/p04_holo_zonas.png'); // 1080×1920

const sombra = '0 6px 0 rgba(0,0,0,0.75), 0 0 40px rgba(0,0,0,0.6)';

const Cita: React.FC<{tam?: number; children: React.ReactNode}> = ({tam = 64, children}) => (
  <div
    style={{
      display: 'inline-block',
      fontFamily: TITULAR,
      fontWeight: 900,
      fontSize: tam,
      color: C.blanco,
      padding: `${tam * 0.22}px ${tam * 0.5}px`,
      background: 'rgba(4,10,18,0.82)',
      border: `4px solid ${C.cian}`,
      borderRadius: tam * 0.4,
      boxShadow: `0 0 40px ${C.cian}88`,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </div>
);

const Sello: React.FC<{tam?: number}> = ({tam = 120}) => (
  <div style={{position: 'absolute', right: 40, top: 40, width: tam, height: tam, borderRadius: tam / 2, background: 'rgba(6,17,29,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <Simbolo tam={tam * 0.92} trazo={1.3} />
  </div>
);

const Titulo: React.FC<{top: number; tam: number; children: React.ReactNode}> = ({top, tam, children}) => (
  <div style={{position: 'absolute', top, left: 60, right: 60, fontFamily: TITULAR, fontWeight: 900, fontSize: tam, lineHeight: 1.02, color: C.blanco, textShadow: sombra}}>{children}</div>
);
const Grande: React.FC<{top?: number; bottom?: number; color: string; tam: number; children: React.ReactNode}> = ({top, bottom, color, tam, children}) => (
  <div style={{position: 'absolute', top, bottom, width: '100%', textAlign: 'center', fontFamily: TITULAR, fontWeight: 900, fontSize: tam, lineHeight: 1, color, textShadow: `0 0 50px ${color}aa, ${sombra}`}}>{children}</div>
);
const Abajo: React.FC<{bottom: number; children: React.ReactNode; tam?: number}> = ({bottom, children, tam = 60}) => (
  <div style={{position: 'absolute', bottom, width: '100%', textAlign: 'center'}}>
    <Cita tam={tam}>{children}</Cita>
  </div>
);
const Degradado = () => <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.85) 100%)'}} />;
const Corte: React.FC<{top: number}> = ({top}) => <div style={{position: 'absolute', top: top - 5, left: 0, right: 0, height: 10, background: C.cian, boxShadow: `0 0 40px 14px ${C.cian}99`}} />;

// ===================== VIDEO 03 · pump foil =====================
export const M3A: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Img src={R3B} style={{position: 'absolute', width: 1080, height: 1920}} />
    <Degradado />
    <Titulo top={170} tam={100}>
      ¿Por qué <span style={{color: C.cian}}>vuela</span>
      <br />
      sobre el agua?
    </Titulo>
    <Grande bottom={380} color={C.rojo} tam={130}>¿EDITADO?</Grande>
    <Abajo bottom={260}>
      Sin motor · <span style={{color: C.cian}}>sin olas</span>
    </Abajo>
  </AbsoluteFill>
);
export const M3B: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', top: 0, left: 0, width: 1080, height: 960, overflow: 'hidden'}}>
      <Img src={R3} style={{position: 'absolute', width: 1080, top: -560}} />
    </div>
    <div style={{position: 'absolute', top: 960, left: 0, width: 1080, height: 960, overflow: 'hidden', background: '#01040a'}}>
      <Img src={H3} style={{position: 'absolute', width: 1500, left: -160, top: -620}} />
    </div>
    <Corte top={960} />
    <Titulo top={120} tam={100}>
      El secreto está
      <br />
      <span style={{color: C.cian}}>bajo el agua</span>
    </Titulo>
    <Abajo bottom={150} tam={64}>
      Un <span style={{color: C.ambar}}>ala</span> escondida
    </Abajo>
  </AbsoluteFill>
);
export const M3C: React.FC = () => (
  <AbsoluteFill style={{background: '#01040a'}}>
    <Img src={H3} style={{position: 'absolute', width: 1080, height: 1920, top: 0}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(1,4,10,0.95) 0%, rgba(1,4,10,0.1) 30%, rgba(1,4,10,0) 60%, rgba(1,4,10,0.9) 100%)'}} />
    <Grande top={170} color={C.ambar} tam={150}>SIN MOTOR</Grande>
    <Grande top={330} color={C.blanco} tam={80}>el motor es ella</Grande>
    <Grande bottom={300} color={C.blanco} tam={120}>
      ¿Cómo <span style={{color: C.cian}}>vuela?</span>
    </Grande>
  </AbsoluteFill>
);
export const M3H: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 760, height: 720, overflow: 'hidden'}}>
      <Img src={R3B} style={{position: 'absolute', width: 760, top: -380}} />
    </div>
    <div style={{position: 'absolute', left: 760, top: 0, width: 520, height: 720, overflow: 'hidden', background: '#01040a'}}>
      <Img src={H3} style={{position: 'absolute', width: 800, left: -140, top: -430}} />
    </div>
    <div style={{position: 'absolute', left: 755, top: 0, width: 8, height: 720, background: C.cian, boxShadow: `0 0 30px 10px ${C.cian}99`}} />
    <div style={{position: 'absolute', left: 44, top: 40, fontFamily: TITULAR, fontWeight: 900, fontSize: 84, lineHeight: 0.98, color: C.blanco, textShadow: sombra}}>
      ¿Por qué
      <br />
      <span style={{color: C.cian}}>vuela?</span>
    </div>
    <div style={{position: 'absolute', left: 44, bottom: 50}}>
      <Cita tam={46}>
        Sin motor · <span style={{color: C.cian}}>sin olas</span>
      </Cita>
    </div>
    <Sello tam={96} />
  </AbsoluteFill>
);

// ===================== VIDEO 04 · tren =====================
export const M4A: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', inset: -80, filter: 'blur(40px) brightness(0.45)'}}>
      <Img src={R4} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
    <Img src={R4} style={{position: 'absolute', top: 470, width: 1080, height: 1074, boxShadow: `0 0 0 3px ${C.cian}88`}} />
    <Titulo top={170} tam={96}>
      ¿Por qué <span style={{color: C.cian}}>se quedó</span>
      <br />
      en las vías?
    </Titulo>
    <Grande top={1100} color={C.rojo} tam={130}>¿DISTRAÍDO?</Grande>
    <Abajo bottom={150} tam={60}>
      No: <span style={{color: C.ambar}}>lo empujaron</span>
    </Abajo>
  </AbsoluteFill>
);
export const M4B: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', top: 0, left: 0, width: 1080, height: 960, overflow: 'hidden'}}>
      <Img src={R4} style={{position: 'absolute', width: 1080, top: -60}} />
    </div>
    <div style={{position: 'absolute', top: 960, left: 0, width: 1080, height: 960, overflow: 'hidden', background: '#01040a'}}>
      <Img src={H4} style={{position: 'absolute', width: 1400, left: -100, top: -560}} />
    </div>
    <Corte top={960} />
    <Titulo top={60} tam={92}>
      ¿Por qué no
      <br />
      <span style={{color: C.cian}}>se movió?</span>
    </Titulo>
    <Abajo bottom={150} tam={60}>
      La camioneta de <span style={{color: C.ambar}}>atrás</span>
    </Abajo>
  </AbsoluteFill>
);
export const M4C: React.FC = () => (
  <AbsoluteFill style={{background: '#01040a'}}>
    <Img src={H4Z} style={{position: 'absolute', width: 1080, height: 1920}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(1,4,10,0.95) 0%, rgba(1,4,10,0.1) 30%, rgba(1,4,10,0) 60%, rgba(1,4,10,0.9) 100%)'}} />
    <Grande top={170} color={C.verde} tam={110}>SI TE PASA:</Grande>
    <Grande top={310} color={C.blanco} tam={84}>corre hacia el tren</Grande>
    <Grande bottom={300} color={C.blanco} tam={110}>
      ¿Por <span style={{color: C.cian}}>qué?</span>
    </Grande>
  </AbsoluteFill>
);
export const M4H: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 760, height: 720, overflow: 'hidden'}}>
      <Img src={R4} style={{position: 'absolute', width: 760, top: -20}} />
    </div>
    <div style={{position: 'absolute', left: 760, top: 0, width: 520, height: 720, overflow: 'hidden', background: '#01040a'}}>
      <Img src={H4} style={{position: 'absolute', width: 800, left: -40, top: -300}} />
    </div>
    <div style={{position: 'absolute', left: 755, top: 0, width: 8, height: 720, background: C.cian, boxShadow: `0 0 30px 10px ${C.cian}99`}} />
    <div style={{position: 'absolute', left: 44, top: 40, fontFamily: TITULAR, fontWeight: 900, fontSize: 96, lineHeight: 0.98, color: C.rojo, textShadow: `0 0 40px ${C.rojo}aa, ${sombra}`}}>
      ¿DISTRAÍDO?
    </div>
    <div style={{position: 'absolute', left: 44, bottom: 50}}>
      <Cita tam={48}>
        No: <span style={{color: C.ambar}}>lo empujaron</span>
      </Cita>
    </div>
    <Sello tam={96} />
  </AbsoluteFill>
);
