import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, TITULAR} from '../estilo';
import {Simbolo} from './Marca';

// Miniaturas del video 14 (la moto que se sacude sola: bamboleo de velocidad)
const R14 = staticFile('porquepaso/canal/p14_real.png'); // 1080×1920: la moto se tumba en plena sacudida
const H14V = staticFile('porquepaso/canal/p14_holo_vaiven.png'); // 1080×1920: el manubrio golpea de lado a lado (rojo)
const H14P = staticFile('porquepaso/canal/p14_holo_peso.png'); // 1080×1920: rueda delantera casi flotando

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

// A (recomendada): la moto en plena sacudida + "¿SE ROMPIÓ?"
export const M14A: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Img src={R14} style={{position: 'absolute', width: 1080, height: 1920, top: 0}} />
    <Degradado />
    <Titulo top={170} tam={96}>
      ¿Por qué se
      <br />
      <span style={{color: C.cian}}>sacudió sola?</span>
    </Titulo>
    <Grande bottom={420} color={C.rojo} tam={110}>¿SE ROMPIÓ?</Grande>
    <Abajo bottom={280} tam={60}>
      No: <span style={{color: C.ambar}}>bamboleo</span>
    </Abajo>
  </AbsoluteFill>
);
// B: arriba el video real, abajo el holograma del vaivén
export const M14B: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', top: 0, left: 0, width: 1080, height: 960, overflow: 'hidden'}}>
      <Img src={R14} style={{position: 'absolute', width: 1080, left: 0, top: -620}} />
    </div>
    <div style={{position: 'absolute', top: 960, left: 0, width: 1080, height: 960, overflow: 'hidden', background: '#01040a'}}>
      <Img src={H14V} style={{position: 'absolute', width: 1080, left: 0, top: -480}} />
    </div>
    <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 420, background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)'}} />
    <Corte top={960} />
    <Titulo top={60} tam={92}>
      A fondo…
      <br />
      <span style={{color: C.rojo}}>y se sacude</span>
    </Titulo>
    <Abajo bottom={130} tam={60}>
      ¿Por <span style={{color: C.cian}}>qué?</span>
    </Abajo>
  </AbsoluteFill>
);
// C: holograma de la rueda delantera casi flotando
export const M14C: React.FC = () => (
  <AbsoluteFill style={{background: '#01040a'}}>
    <Img src={H14P} style={{position: 'absolute', width: 1080, height: 1920, top: 60}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(1,4,10,0.97) 0%, rgba(1,4,10,0.6) 20%, rgba(1,4,10,0) 36%, rgba(1,4,10,0) 62%, rgba(1,4,10,0.95) 100%)'}} />
    <Grande top={130} color={C.blanco} tam={90}>La rueda delantera</Grande>
    <Grande top={240} color={C.rojo} tam={100}>CASI FLOTA</Grande>
    <Grande bottom={330} color={C.cian} tam={84}>el bamboleo</Grande>
    <Grande bottom={230} color={C.blanco} tam={64}>explicado en 3D</Grande>
  </AbsoluteFill>
);
export const M14H: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 760, height: 720, overflow: 'hidden'}}>
      <Img src={R14} style={{position: 'absolute', width: 760, left: 0, top: -520}} />
    </div>
    <div style={{position: 'absolute', left: 760, top: 0, width: 520, height: 720, overflow: 'hidden', background: '#01040a'}}>
      <Img src={H14V} style={{position: 'absolute', width: 900, left: -190, top: -420}} />
    </div>
    <div style={{position: 'absolute', left: 755, top: 0, width: 8, height: 720, background: C.cian, boxShadow: `0 0 30px 10px ${C.cian}99`}} />
    <div style={{position: 'absolute', left: 44, top: 40, fontFamily: TITULAR, fontWeight: 900, fontSize: 80, lineHeight: 0.98, color: C.blanco, textShadow: sombra}}>
      ¿Por qué se
      <br />
      <span style={{color: C.cian}}>sacudió?</span>
    </div>
    <div style={{position: 'absolute', left: 44, bottom: 50}}>
      <Cita tam={46}>
        Es <span style={{color: C.ambar}}>bamboleo</span>
      </Cita>
    </div>
    <Sello tam={96} />
  </AbsoluteFill>
);
