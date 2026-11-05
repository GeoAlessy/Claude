import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, TITULAR} from '../estilo';
import {Simbolo} from './Marca';

// Miniaturas del video 07 (refresco contra un transformador en llamas, Venezuela)
const R7 = staticFile('porquepaso/canal/p07_real.png'); // 1080×1920: la bola de fuego
const R7B = staticFile('porquepaso/canal/p07_botella.png'); // 1080×1920: el trabajador con la botella
const R7L = staticFile('porquepaso/canal/p07_llamarada.png'); // 1080×1920: la llamarada hacia la canasta
const H7 = staticFile('porquepaso/canal/p07_holo.png'); // 1080×1920: el vapor sobre el aceite
const H7S = staticFile('porquepaso/canal/p07_holo_sarten.png'); // 1080×1920: la sartén

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

// A (recomendada): la bola de fuego real + "¿FUNCIONA?"
export const M7A: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Img src={R7} style={{position: 'absolute', width: 1080, height: 1920}} />
    <Degradado />
    <Titulo top={170} tam={100}>
      ¿Refresco <span style={{color: C.cian}}>contra</span>
      <br />
      el fuego?
    </Titulo>
    <Grande bottom={400} color={C.rojo} tam={140}>¿FUNCIONA?</Grande>
    <Abajo bottom={260} tam={60}>
      Le lanzó <span style={{color: C.ambar}}>2 litros</span>
    </Abajo>
  </AbsoluteFill>
);
// B: arriba el trabajador con la botella, abajo la bola de fuego
export const M7B: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', top: 0, left: 0, width: 1080, height: 960, overflow: 'hidden'}}>
      <Img src={R7B} style={{position: 'absolute', width: 1080, top: -560}} />
    </div>
    <div style={{position: 'absolute', top: 960, left: 0, width: 1080, height: 960, overflow: 'hidden'}}>
      <Img src={R7} style={{position: 'absolute', width: 1080, top: -60}} />
    </div>
    <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 420, background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)'}} />
    <Corte top={960} />
    <Titulo top={60} tam={96}>
      Le lanzó
      <br />
      <span style={{color: C.cian}}>refresco…</span>
    </Titulo>
    <Abajo bottom={130} tam={64}>
      ¿Por qué <span style={{color: C.rojo}}>explotó?</span>
    </Abajo>
  </AbsoluteFill>
);
// C: holograma del vapor sobre el aceite
export const M7C: React.FC = () => (
  <AbsoluteFill style={{background: '#01040a'}}>
    <Img src={H7} style={{position: 'absolute', width: 1080, height: 1920, top: 120}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(1,4,10,1) 0%, rgba(1,4,10,0.95) 20%, rgba(1,4,10,0) 36%, rgba(1,4,10,0) 60%, rgba(1,4,10,0.9) 100%)'}} />
    <Grande top={150} color={C.ambar} tam={110}>AGUA + ACEITE</Grande>
    <Grande top={290} color={C.blanco} tam={80}>
      ardiendo = <span style={{color: C.rojo}}>¡BUM!</span>
    </Grande>
    <Grande bottom={300} color={C.blanco} tam={100}>
      ¿Por <span style={{color: C.cian}}>qué?</span>
    </Grande>
  </AbsoluteFill>
);
export const M7H: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 760, height: 720, overflow: 'hidden'}}>
      <Img src={R7} style={{position: 'absolute', width: 760, top: -120}} />
    </div>
    <div style={{position: 'absolute', left: 760, top: 0, width: 520, height: 720, overflow: 'hidden'}}>
      <Img src={R7B} style={{position: 'absolute', width: 900, left: -330, top: -340}} />
    </div>
    <div style={{position: 'absolute', left: 755, top: 0, width: 8, height: 720, background: C.cian, boxShadow: `0 0 30px 10px ${C.cian}99`}} />
    <div style={{position: 'absolute', left: 44, top: 40, fontFamily: TITULAR, fontWeight: 900, fontSize: 96, lineHeight: 0.98, color: C.rojo, textShadow: `0 0 40px ${C.rojo}aa, ${sombra}`}}>¿FUNCIONA?</div>
    <div style={{position: 'absolute', left: 44, bottom: 50}}>
      <Cita tam={48}>
        Refresco <span style={{color: C.cian}}>vs.</span> transformador
      </Cita>
    </div>
    <Sello tam={96} />
  </AbsoluteFill>
);
