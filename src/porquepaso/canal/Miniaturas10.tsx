import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, TITULAR} from '../estilo';
import {Simbolo} from './Marca';

// Miniaturas del video 10 (la nube del Stromboli que corre sobre el mar)
const R10 = staticFile('porquepaso/canal/p10_real.png'); // 1134×1920: la nube corre sobre el mar, el bote huye
const R10N = staticFile('porquepaso/canal/p10_nube.png'); // 1134×1920: la nube gigante
const H10V = staticFile('porquepaso/canal/p10_holo_vapor.png'); // 1080×1920: colchón de vapor
const H10B = staticFile('porquepaso/canal/p10_holo_baja.png'); // 1080×1920: baja por la ladera

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

// A (recomendada): la nube gigante + "¿SOLO HUMO?"
export const M10A: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Img src={R10N} style={{position: 'absolute', height: 1920, left: -27, top: 0}} />
    <Degradado />
    <Titulo top={170} tam={96}>
      ¿Por qué corre
      <br />
      <span style={{color: C.cian}}>sobre el mar?</span>
    </Titulo>
    <Grande bottom={420} color={C.rojo} tam={140}>¿SOLO HUMO?</Grande>
    <Abajo bottom={280} tam={60}>
      No: <span style={{color: C.ambar}}>algo peor</span>
    </Abajo>
  </AbsoluteFill>
);
// B: arriba la nube real sobre el mar, abajo el holograma del colchón de vapor
export const M10B: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', top: 0, left: 0, width: 1080, height: 960, overflow: 'hidden'}}>
      <Img src={R10} style={{position: 'absolute', width: 1300, left: -110, top: -250}} />
    </div>
    <div style={{position: 'absolute', top: 960, left: 0, width: 1080, height: 960, overflow: 'hidden', background: '#01040a'}}>
      <Img src={H10V} style={{position: 'absolute', width: 1080, left: 0, top: -420}} />
    </div>
    <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 420, background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)'}} />
    <Corte top={960} />
    <Titulo top={60} tam={96}>
      Se desliza
      <br />
      <span style={{color: C.cian}}>sobre el agua</span>
    </Titulo>
    <Abajo bottom={130} tam={60}>
      ¿Por <span style={{color: C.cian}}>qué?</span>
    </Abajo>
  </AbsoluteFill>
);
// C: holograma: más pesado que el aire, baja por la ladera
export const M10C: React.FC = () => (
  <AbsoluteFill style={{background: '#01040a'}}>
    <Img src={H10B} style={{position: 'absolute', width: 1080, height: 1920, top: 120}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(1,4,10,0.97) 0%, rgba(1,4,10,0.6) 20%, rgba(1,4,10,0) 36%, rgba(1,4,10,0) 62%, rgba(1,4,10,0.95) 100%)'}} />
    <Grande top={130} color={C.blanco} tam={90}>No es humo:</Grande>
    <Grande top={240} color={C.rojo} tam={100}>BAJA</Grande>
    <Grande bottom={330} color={C.ambar} tam={100}>+100 km/h</Grande>
    <Grande bottom={230} color={C.blanco} tam={64}>a cientos de grados</Grande>
  </AbsoluteFill>
);
export const M10H: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 760, height: 720, overflow: 'hidden'}}>
      <Img src={R10} style={{position: 'absolute', width: 900, left: -70, top: -300}} />
    </div>
    <div style={{position: 'absolute', left: 760, top: 0, width: 520, height: 720, overflow: 'hidden', background: '#01040a'}}>
      <Img src={H10V} style={{position: 'absolute', width: 900, left: -240, top: -380}} />
    </div>
    <div style={{position: 'absolute', left: 755, top: 0, width: 8, height: 720, background: C.cian, boxShadow: `0 0 30px 10px ${C.cian}99`}} />
    <div style={{position: 'absolute', left: 44, top: 40, fontFamily: TITULAR, fontWeight: 900, fontSize: 80, lineHeight: 0.98, color: C.blanco, textShadow: sombra}}>
      ¿Corre sobre
      <br />
      <span style={{color: C.cian}}>el mar?</span>
    </div>
    <div style={{position: 'absolute', left: 44, bottom: 50}}>
      <Cita tam={46}>
        Volcán <span style={{color: C.ambar}}>Stromboli</span>
      </Cita>
    </div>
    <Sello tam={96} />
  </AbsoluteFill>
);
