import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, MONO, TITULAR} from '../estilo';
import {Simbolo} from './Marca';

// Miniaturas del video 02 (jet de Florida)
const FUEGO = staticFile('porquepaso/canal/p02_fuego.png'); // 3430×1920
const HOLO = staticFile('porquepaso/canal/p02_holo_820.png'); // 1080×1920

const sombra = '0 6px 0 rgba(0,0,0,0.75), 0 0 40px rgba(0,0,0,0.6)';

const Cita: React.FC<{tam?: number}> = ({tam = 64}) => (
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
    “¡Tenemos <span style={{color: C.cian}}>HIELO</span>!”
  </div>
);

const Sello: React.FC<{tam?: number}> = ({tam = 120}) => (
  <div style={{position: 'absolute', right: 40, top: 40, width: tam, height: tam, borderRadius: tam / 2, background: 'rgba(6,17,29,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <Simbolo tam={tam * 0.92} trazo={1.3} />
  </div>
);

// A · Fuego real + pregunta + cita
export const MiniA: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Img src={FUEGO} style={{position: 'absolute', height: 1920, left: -1500, top: 0}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8) 100%)'}} />
    <div style={{position: 'absolute', top: 210, left: 60, right: 60, fontFamily: TITULAR, fontWeight: 900, fontSize: 150, lineHeight: 0.98, color: C.blanco, textShadow: sombra}}>
      ¿Por qué
      <br />
      <span style={{color: C.cian}}>cayó?</span>
    </div>
    <div style={{position: 'absolute', bottom: 330, width: '100%', textAlign: 'center'}}>
      <Cita tam={78} />
    </div>
    <div style={{position: 'absolute', bottom: 240, width: '100%', textAlign: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 36, letterSpacing: 3, color: C.blanco, textShadow: sombra}}>
      FLORIDA · LEARJET 60
    </div>
  </AbsoluteFill>
);

// B · Mitad real / mitad holograma
export const MiniB: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', top: 0, left: 0, width: 1080, height: 960, overflow: 'hidden'}}>
      <Img src={FUEGO} style={{position: 'absolute', height: 1250, left: -1100, top: -160}} />
    </div>
    <div style={{position: 'absolute', top: 960, left: 0, width: 1080, height: 960, overflow: 'hidden'}}>
      <Img src={HOLO} style={{position: 'absolute', width: 1080, top: -380}} />
    </div>
    <div style={{position: 'absolute', top: 955, left: 0, right: 0, height: 10, background: C.cian, boxShadow: `0 0 40px 14px ${C.cian}99`}} />
    <div style={{position: 'absolute', top: 120, left: 60, right: 60, fontFamily: TITULAR, fontWeight: 900, fontSize: 120, lineHeight: 1, color: C.blanco, textShadow: sombra}}>
      ¿Por qué cayó
      <br />
      <span style={{color: C.cian}}>este jet?</span>
    </div>
    <div style={{position: 'absolute', top: 1030, width: '100%', textAlign: 'center'}}>
      <Cita tam={72} />
    </div>
  </AbsoluteFill>
);

// C · Holograma en picada + dato de impacto
export const MiniC: React.FC = () => (
  <AbsoluteFill style={{background: '#01040a'}}>
    <Img src={HOLO} style={{position: 'absolute', width: 1080, height: 1920, top: -150}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(1,4,10,0.95) 0%, rgba(1,4,10,0.2) 30%, rgba(1,4,10,0) 60%, rgba(1,4,10,0.9) 100%)'}} />
    <div style={{position: 'absolute', top: 170, width: '100%', textAlign: 'center', fontFamily: TITULAR, fontWeight: 900, fontSize: 210, lineHeight: 0.95, color: C.rojo, textShadow: `0 0 60px ${C.rojo}99, ${sombra}`}}>
      −8 KM
    </div>
    <div style={{position: 'absolute', top: 390, width: '100%', textAlign: 'center', fontFamily: TITULAR, fontWeight: 900, fontSize: 96, color: C.blanco, textShadow: sombra}}>
      en 1 minuto
    </div>
    <div style={{position: 'absolute', bottom: 300, width: '100%', textAlign: 'center', fontFamily: TITULAR, fontWeight: 900, fontSize: 130, color: C.blanco, textShadow: sombra}}>
      ¿Por <span style={{color: C.cian}}>qué?</span>
    </div>
  </AbsoluteFill>
);

// H · Horizontal 1280×720 (búsquedas y página principal)
export const MiniH: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 760, height: 720, overflow: 'hidden'}}>
      <Img src={FUEGO} style={{position: 'absolute', height: 900, left: -760, top: -90}} />
    </div>
    <div style={{position: 'absolute', left: 760, top: 0, width: 520, height: 720, overflow: 'hidden', background: '#01040a'}}>
      <Img src={HOLO} style={{position: 'absolute', width: 620, left: -60, top: -260}} />
    </div>
    <div style={{position: 'absolute', left: 755, top: 0, width: 8, height: 720, background: C.cian, boxShadow: `0 0 30px 10px ${C.cian}99`}} />
    <div style={{position: 'absolute', left: 44, top: 40, fontFamily: TITULAR, fontWeight: 900, fontSize: 92, lineHeight: 0.98, color: C.blanco, textShadow: sombra}}>
      ¿Por qué
      <br />
      <span style={{color: C.cian}}>cayó?</span>
    </div>
    <div style={{position: 'absolute', left: 44, bottom: 50}}>
      <Cita tam={52} />
    </div>
    <Sello tam={96} />
  </AbsoluteFill>
);
