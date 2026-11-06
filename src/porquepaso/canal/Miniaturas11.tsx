import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, TITULAR} from '../estilo';
import {Simbolo} from './Marca';

// Miniaturas del video 11 (el inflable que salió volando: efecto látigo)
const R11 = staticFile('porquepaso/canal/p11_real.png'); // 1620×1836: el inflable vuela sobre la gente
const H11C = staticFile('porquepaso/canal/p11_holo_curva.png'); // 1080×1920: el círculo más grande
const H11A = staticFile('porquepaso/canal/p11_holo_ala.png'); // 1080×1920: el aire lo levanta

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

// A (recomendada): el inflable volando + "¿MALA SUERTE?"
export const M11A: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Img src={R11} style={{position: 'absolute', height: 1920, left: -307, top: 0}} />
    <Degradado />
    <Titulo top={170} tam={96}>
      ¿Por qué salió
      <br />
      <span style={{color: C.cian}}>volando?</span>
    </Titulo>
    <Grande bottom={420} color={C.rojo} tam={108}>¿MALA SUERTE?</Grande>
    <Abajo bottom={280} tam={60}>
      No: <span style={{color: C.ambar}}>efecto látigo</span>
    </Abajo>
  </AbsoluteFill>
);
// B: arriba el video real, abajo el holograma de la curva
export const M11B: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', top: 0, left: 0, width: 1080, height: 960, overflow: 'hidden'}}>
      <Img src={R11} style={{position: 'absolute', width: 1200, left: -60, top: -40}} />
    </div>
    <div style={{position: 'absolute', top: 960, left: 0, width: 1080, height: 960, overflow: 'hidden', background: '#01040a'}}>
      <Img src={H11C} style={{position: 'absolute', width: 1080, left: 0, top: -480}} />
    </div>
    <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 420, background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)'}} />
    <Corte top={960} />
    <Titulo top={60} tam={92}>
      Más rápido
      <br />
      <span style={{color: C.ambar}}>que la lancha</span>
    </Titulo>
    <Abajo bottom={130} tam={60}>
      ¿Por <span style={{color: C.cian}}>qué?</span>
    </Abajo>
  </AbsoluteFill>
);
// C: holograma del inflable que se levanta
export const M11C: React.FC = () => (
  <AbsoluteFill style={{background: '#01040a'}}>
    <Img src={H11A} style={{position: 'absolute', width: 1080, height: 1920, top: 60}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(1,4,10,0.97) 0%, rgba(1,4,10,0.6) 20%, rgba(1,4,10,0) 36%, rgba(1,4,10,0) 62%, rgba(1,4,10,0.95) 100%)'}} />
    <Grande top={130} color={C.blanco} tam={90}>EFECTO</Grande>
    <Grande top={240} color={C.ambar} tam={110}>LÁTIGO</Grande>
    <Grande bottom={330} color={C.cian} tam={90}>el aire lo levanta</Grande>
    <Grande bottom={230} color={C.blanco} tam={64}>como un ala</Grande>
  </AbsoluteFill>
);
export const M11H: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 760, height: 720, overflow: 'hidden'}}>
      <Img src={R11} style={{position: 'absolute', width: 820, left: -30, top: -60}} />
    </div>
    <div style={{position: 'absolute', left: 760, top: 0, width: 520, height: 720, overflow: 'hidden', background: '#01040a'}}>
      <Img src={H11C} style={{position: 'absolute', width: 900, left: -260, top: -380}} />
    </div>
    <div style={{position: 'absolute', left: 755, top: 0, width: 8, height: 720, background: C.cian, boxShadow: `0 0 30px 10px ${C.cian}99`}} />
    <div style={{position: 'absolute', left: 44, top: 40, fontFamily: TITULAR, fontWeight: 900, fontSize: 80, lineHeight: 0.98, color: C.blanco, textShadow: sombra}}>
      ¿Por qué
      <br />
      <span style={{color: C.cian}}>voló?</span>
    </div>
    <div style={{position: 'absolute', left: 44, bottom: 50}}>
      <Cita tam={46}>
        Efecto <span style={{color: C.ambar}}>látigo</span>
      </Cita>
    </div>
    <Sello tam={96} />
  </AbsoluteFill>
);
