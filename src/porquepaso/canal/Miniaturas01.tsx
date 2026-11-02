import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, MONO, TITULAR} from '../estilo';
import {Simbolo} from './Marca';

// Miniaturas del video 01 (escalera de Trump)
const TRUMP = staticFile('porquepaso/canal/p01_trump.png'); // 1080×1920
const ESCALERA = staticFile('porquepaso/canal/p01_escalera.png'); // 1080×1920
const HOLO = staticFile('porquepaso/canal/p01_holo_clic.png'); // 1080×1920

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

// A · Trump + "¿SABOTAJE?"
export const MiniA: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Img src={TRUMP} style={{position: 'absolute', width: 1080, height: 1920, top: 330}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.85) 100%)'}} />
    <div style={{position: 'absolute', top: 150, left: 60, right: 60, fontFamily: TITULAR, fontWeight: 900, fontSize: 92, lineHeight: 1.02, color: C.blanco, textShadow: sombra}}>
      ¿Por qué <span style={{color: C.cian}}>se detuvo</span>
      <br />
      la escalera de Trump?
    </div>
    <div style={{position: 'absolute', bottom: 380, width: '100%', textAlign: 'center', fontFamily: TITULAR, fontWeight: 900, fontSize: 150, color: C.rojo, textShadow: `0 0 50px ${C.rojo}aa, ${sombra}`}}>
      ¿SABOTAJE?
    </div>
    <div style={{position: 'absolute', bottom: 250, width: '100%', textAlign: 'center'}}>
      <Cita tam={58}>
        La respuesta: <span style={{color: C.cian}}>1 pieza</span>
      </Cita>
    </div>
  </AbsoluteFill>
);

// B · Escalera real / holograma del sensor
export const MiniB: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', top: 0, left: 0, width: 1080, height: 960, overflow: 'hidden'}}>
      <Img src={ESCALERA} style={{position: 'absolute', width: 1080, top: -420}} />
    </div>
    <div style={{position: 'absolute', top: 960, left: 0, width: 1080, height: 960, overflow: 'hidden', background: '#01040a'}}>
      <Img src={HOLO} style={{position: 'absolute', width: 1300, left: -110, top: -250}} />
    </div>
    <div style={{position: 'absolute', top: 955, left: 0, right: 0, height: 10, background: C.cian, boxShadow: `0 0 40px 14px ${C.cian}99`}} />
    <div style={{position: 'absolute', top: 120, left: 60, right: 60, fontFamily: TITULAR, fontWeight: 900, fontSize: 104, lineHeight: 1, color: C.blanco, textShadow: sombra}}>
      ¿Por qué <span style={{color: C.cian}}>se detuvo</span>
      <br />
      la escalera de Trump?
    </div>
    <div style={{position: 'absolute', top: 1660, width: '100%', textAlign: 'center'}}>
      <Cita tam={66}>
        No fue <span style={{color: C.rojo}}>sabotaje</span>
      </Cita>
    </div>
  </AbsoluteFill>
);

// C · Holograma del clic
export const MiniC: React.FC = () => (
  <AbsoluteFill style={{background: '#01040a'}}>
    <Img src={HOLO} style={{position: 'absolute', width: 1080, height: 1920, top: 60}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(1,4,10,0.95) 0%, rgba(1,4,10,0.15) 30%, rgba(1,4,10,0) 60%, rgba(1,4,10,0.9) 100%)'}} />
    <div style={{position: 'absolute', top: 170, width: '100%', textAlign: 'center', fontFamily: TITULAR, fontWeight: 900, fontSize: 170, lineHeight: 0.95, color: C.rojo, textShadow: `0 0 60px ${C.rojo}99, ${sombra}`}}>
      1 CLIC
    </div>
    <div style={{position: 'absolute', top: 350, width: '100%', textAlign: 'center', fontFamily: TITULAR, fontWeight: 900, fontSize: 84, color: C.blanco, textShadow: sombra}}>
      detuvo a Trump
    </div>
    <div style={{position: 'absolute', bottom: 300, width: '100%', textAlign: 'center', fontFamily: TITULAR, fontWeight: 900, fontSize: 120, color: C.blanco, textShadow: sombra}}>
      ¿Por <span style={{color: C.cian}}>qué?</span>
    </div>
  </AbsoluteFill>
);

// H · Horizontal 1280×720
export const MiniH: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 760, height: 720, overflow: 'hidden'}}>
      <Img src={TRUMP} style={{position: 'absolute', width: 760, top: -40}} />
    </div>
    <div style={{position: 'absolute', left: 760, top: 0, width: 520, height: 720, overflow: 'hidden', background: '#01040a'}}>
      <Img src={HOLO} style={{position: 'absolute', width: 640, left: -70, top: -220}} />
    </div>
    <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 45%)'}} />
    <div style={{position: 'absolute', left: 755, top: 0, width: 8, height: 720, background: C.cian, boxShadow: `0 0 30px 10px ${C.cian}99`}} />
    <div style={{position: 'absolute', left: 44, top: 40, fontFamily: TITULAR, fontWeight: 900, fontSize: 96, lineHeight: 0.98, color: C.rojo, textShadow: `0 0 40px ${C.rojo}aa, ${sombra}`}}>
      ¿SABOTAJE?
    </div>
    <div style={{position: 'absolute', left: 44, bottom: 50}}>
      <Cita tam={50}>
        No: <span style={{color: C.cian}}>esta pieza</span>
      </Cita>
    </div>
    <Sello tam={96} />
  </AbsoluteFill>
);
