import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, TITULAR} from '../estilo';
import {Simbolo} from './Marca';

// Miniaturas del video 08 (la casa que flotó por el río San Juan, Pagosa Springs)
const R8 = staticFile('porquepaso/canal/p08_real.png'); // 1080×1920: la casa flotando
const R8C = staticFile('porquepaso/canal/p08_choque.png'); // 1080×1920: la casa contra el puente
const H8 = staticFile('porquepaso/canal/p08_holo.png'); // 1080×1920: el agua empuja la casa hacia arriba
const H8A = staticFile('porquepaso/canal/p08_holo_amarre.png'); // 1080×1920: amarrada contra sin amarre

const sombra = '0 6px 0 rgba(0,0,0,0.75), 0 0 40px rgba(0,0,0,0.6)';
const Cita: React.FC<{tam?: number; children: React.ReactNode}> = ({tam = 64, children}) => (
  <div style={{display: 'inline-block', fontFamily: TITULAR, fontWeight: 900, fontSize: tam, color: C.blanco, padding: `${tam * 0.22}px ${tam * 0.5}px`, background: 'rgba(4,10,18,0.82)', border: `4px solid ${C.cian}`, borderRadius: tam * 0.4, boxShadow: `0 0 40px ${C.cian}88`, whiteSpace: 'nowrap'}}>{children}</div>
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
const Corte: React.FC<{top: number}> = ({top}) => <div style={{position: 'absolute', top: top - 5, left: 0, right: 0, height: 10, background: C.cian, boxShadow: `0 0 40px 14px ${C.cian}99`}} />;
const Degradado = () => <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.85) 100%)'}} />;

// A (recomendada): la casa contra el puente + "¿MAL HECHA?"
export const M8A: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Img src={R8C} style={{position: 'absolute', width: 1500, height: 2667, left: -330, top: -560}} />
    <Degradado />
    <Titulo top={170} tam={100}>
      ¿Por qué <span style={{color: C.cian}}>flotó</span>
      <br />
      esta casa?
    </Titulo>
    <Grande bottom={420} color={C.rojo} tam={140}>¿MAL HECHA?</Grande>
    <Abajo bottom={280} tam={60}>
      No: <span style={{color: C.cian}}>pura física</span>
    </Abajo>
  </AbsoluteFill>
);
// B: arriba la casa real flotando, abajo el holograma del empuje
export const M8B: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', top: 0, left: 0, width: 1080, height: 960, overflow: 'hidden'}}>
      <Img src={R8} style={{position: 'absolute', width: 1500, left: -40, top: -980}} />
    </div>
    <div style={{position: 'absolute', top: 960, left: 0, width: 1080, height: 960, overflow: 'hidden', background: '#01040a'}}>
      <Img src={H8} style={{position: 'absolute', width: 1080, left: 0, top: -520}} />
    </div>
    <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 420, background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)'}} />
    <Corte top={960} />
    <Titulo top={60} tam={96}>
      Flota como
      <br />
      <span style={{color: C.cian}}>un barco</span>
    </Titulo>
    <Abajo bottom={130} tam={60}>
      ¿Por <span style={{color: C.cian}}>qué?</span>
    </Abajo>
  </AbsoluteFill>
);
// C: holograma amarrada contra sin amarre
export const M8C: React.FC = () => (
  <AbsoluteFill style={{background: '#01040a'}}>
    <Img src={H8A} style={{position: 'absolute', width: 1080, height: 1920}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(1,4,10,0.97) 0%, rgba(1,4,10,0.6) 22%, rgba(1,4,10,0) 40%, rgba(1,4,10,0) 60%, rgba(1,4,10,0.9) 100%)'}} />
    <Grande top={150} color={C.rojo} tam={100}>SIN AMARRE</Grande>
    <Grande top={270} color={C.blanco} tam={70}>el río se la lleva</Grande>
    <Grande bottom={330} color={C.verde} tam={100}>AMARRADA</Grande>
    <Grande bottom={230} color={C.blanco} tam={70}>se queda</Grande>
  </AbsoluteFill>
);
export const M8H: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 760, height: 720, overflow: 'hidden'}}>
      <Img src={R8C} style={{position: 'absolute', width: 1300, left: -420, top: -820}} />
    </div>
    <div style={{position: 'absolute', left: 760, top: 0, width: 520, height: 720, overflow: 'hidden', background: '#01040a'}}>
      <Img src={H8} style={{position: 'absolute', width: 900, left: -190, top: -430}} />
    </div>
    <div style={{position: 'absolute', left: 755, top: 0, width: 8, height: 720, background: C.cian, boxShadow: `0 0 30px 10px ${C.cian}99`}} />
    <div style={{position: 'absolute', left: 44, top: 40, fontFamily: TITULAR, fontWeight: 900, fontSize: 84, lineHeight: 0.98, color: C.blanco, textShadow: sombra}}>
      ¿Por qué
      <br />
      <span style={{color: C.cian}}>flotó?</span>
    </div>
    <div style={{position: 'absolute', left: 44, bottom: 50}}>
      <Cita tam={46}>
        Río San Juan · <span style={{color: C.ambar}}>Colorado</span>
      </Cita>
    </div>
    <Sello tam={96} />
  </AbsoluteFill>
);
