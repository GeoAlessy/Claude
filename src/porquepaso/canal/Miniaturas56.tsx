import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, MONO, TITULAR} from '../estilo';
import {Simbolo} from './Marca';

// Miniaturas de los videos 05 (helicópteros en el Everest) y 06 (camión de nitrato de amonio)
const R5 = staticFile('porquepaso/canal/p05_real.png'); // 1080×810: el roce de las aspas
const H5 = staticFile('porquepaso/canal/p05_holo.png'); // 1080×1920: los discos rojos "Se tocan"
const H5T = staticFile('porquepaso/canal/p05_holo_torre.png'); // 1080×1920: torre de Lukla que no alcanza
const R6 = staticFile('porquepaso/canal/p06_real.png'); // 1080×1448: la explosión desde el auto de atrás
const R6L = staticFile('porquepaso/canal/p06_lejos.png'); // 1080×1448: la bola de fuego de lejos
const H6 = staticFile('porquepaso/canal/p06_holo.png'); // 1080×1920: la carga derretida + termómetro
const H6R = staticFile('porquepaso/canal/p06_holo_rombo.png'); // 1080×1920: rombo 5.1

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
const Corte: React.FC<{top: number}> = ({top}) => <div style={{position: 'absolute', top: top - 5, left: 0, right: 0, height: 10, background: C.cian, boxShadow: `0 0 40px 14px ${C.cian}99`}} />;
const Fondo: React.FC<{src: string}> = ({src}) => (
  <div style={{position: 'absolute', inset: -80, filter: 'blur(40px) brightness(0.45)'}}>
    <Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  </div>
);
const Lugar: React.FC<{top: number; children: React.ReactNode}> = ({top, children}) => (
  <div style={{position: 'absolute', top, left: 64, fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: 2, color: C.blanco, textShadow: '0 2px 8px #000'}}>{children}</div>
);

// ===================== VIDEO 05 · helicópteros en el Everest =====================
// A (recomendada): el roce real + "¿MALA SUERTE?"
export const M5A: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Fondo src={R5} />
    <Img src={R5} style={{position: 'absolute', top: 520, left: -135, width: 1350, height: 1012, boxShadow: `0 0 0 3px ${C.cian}88`}} />
    <Titulo top={170} tam={100}>
      ¿Por qué <span style={{color: C.cian}}>chocaron</span>
      <br />
      en el Everest?
    </Titulo>
    <Lugar top={480}>● PHERICHE, NEPAL · 4,200 m</Lugar>
    <Grande top={1575} color={C.rojo} tam={112}>¿MALA SUERTE?</Grande>
    <Abajo bottom={110} tam={56}>
      Aquí <span style={{color: C.ambar}}>no llega la torre</span>
    </Abajo>
  </AbsoluteFill>
);
// B: mitad real, mitad holograma de los discos de las aspas
export const M5B: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', top: 0, left: 0, width: 1080, height: 960, overflow: 'hidden'}}>
      <Img src={R5} style={{position: 'absolute', width: 1440, left: -200, top: 0}} />
    </div>
    <div style={{position: 'absolute', top: 960, left: 0, width: 1080, height: 960, overflow: 'hidden', background: '#01040a'}}>
      <Img src={H5} style={{position: 'absolute', width: 1300, left: -110, top: -700}} />
    </div>
    <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 420, background: 'linear-gradient(180deg, rgba(1,4,10,0.85) 0%, rgba(1,4,10,0) 100%)'}} />
    <Corte top={960} />
    <Titulo top={60} tam={92}>
      Las aspas
      <br />
      <span style={{color: C.rojo}}>se tocaron</span>
    </Titulo>
    <Abajo bottom={150} tam={60}>
      ¿Por <span style={{color: C.cian}}>qué?</span>
    </Abajo>
  </AbsoluteFill>
);
// C: holograma de la torre que no alcanza
export const M5C: React.FC = () => (
  <AbsoluteFill style={{background: '#01040a'}}>
    <Img src={H5T} style={{position: 'absolute', width: 1080, height: 1920}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(1,4,10,0.95) 0%, rgba(1,4,10,0.1) 30%, rgba(1,4,10,0) 60%, rgba(1,4,10,0.9) 100%)'}} />
    <Grande top={170} color={C.ambar} tam={110}>SIN TORRE</Grande>
    <Grande top={300} color={C.blanco} tam={80}>de control</Grande>
    <Grande bottom={300} color={C.blanco} tam={100}>
      a 4,200 <span style={{color: C.cian}}>metros</span>
    </Grande>
  </AbsoluteFill>
);
export const M5H: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 760, height: 720, overflow: 'hidden'}}>
      <Img src={R5} style={{position: 'absolute', height: 720, left: -140}} />
    </div>
    <div style={{position: 'absolute', left: 760, top: 0, width: 520, height: 720, overflow: 'hidden', background: '#01040a'}}>
      <Img src={H5} style={{position: 'absolute', width: 820, left: -150, top: -460}} />
    </div>
    <div style={{position: 'absolute', left: 755, top: 0, width: 8, height: 720, background: C.cian, boxShadow: `0 0 30px 10px ${C.cian}99`}} />
    <div style={{position: 'absolute', left: 44, top: 40, fontFamily: TITULAR, fontWeight: 900, fontSize: 84, lineHeight: 0.98, color: C.blanco, textShadow: sombra}}>
      ¿Por qué
      <br />
      <span style={{color: C.cian}}>chocaron?</span>
    </div>
    <div style={{position: 'absolute', left: 44, bottom: 50}}>
      <Cita tam={46}>
        Everest · <span style={{color: C.ambar}}>4,200 m</span>
      </Cita>
    </div>
    <Sello tam={96} />
  </AbsoluteFill>
);

// ===================== VIDEO 06 · camión de nitrato de amonio =====================
// A (recomendada): la explosión real + "¿UNA BOMBA?"
export const M6A: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Img src={R6} style={{position: 'absolute', top: 236, width: 1080, height: 1448}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.2) 26%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.85) 100%)'}} />
    <Titulo top={150} tam={100}>
      ¿Por qué <span style={{color: C.cian}}>explotó</span>
      <br />
      este camión?
    </Titulo>
    <Grande top={1180} color={C.rojo} tam={140}>¿UNA BOMBA?</Grande>
    <Abajo bottom={170} tam={62}>
      No: <span style={{color: C.verde}}>fertilizante</span>
    </Abajo>
  </AbsoluteFill>
);
// B: mitad real (bola de fuego) y mitad holograma (la carga que se derrite)
export const M6B: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', top: 0, left: 0, width: 1080, height: 960, overflow: 'hidden'}}>
      <Img src={R6L} style={{position: 'absolute', width: 1440, left: -260, top: -380}} />
    </div>
    <div style={{position: 'absolute', top: 960, left: 0, width: 1080, height: 960, overflow: 'hidden', background: '#01040a'}}>
      <Img src={H6} style={{position: 'absolute', width: 1080, left: 0, top: -230}} />
    </div>
    <Corte top={960} />
    <Titulo top={60} tam={92}>
      Llevaba
      <br />
      <span style={{color: C.verde}}>fertilizante</span>
    </Titulo>
    <Abajo bottom={130} tam={60}>
      ¿Por qué <span style={{color: C.rojo}}>explotó?</span>
    </Abajo>
  </AbsoluteFill>
);
// C: el rombo 5.1 (útil y compartible)
export const M6C: React.FC = () => (
  <AbsoluteFill style={{background: '#01040a'}}>
    <Img src={H6R} style={{position: 'absolute', width: 1080, height: 1920}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(1,4,10,0.2) 0%, rgba(1,4,10,0) 40%, rgba(1,4,10,0.2) 60%, rgba(1,4,10,0.92) 100%)'}} />
    <Grande top={110} color={C.ambar} tam={96}>SI VES ESTE ROMBO</Grande>
    <Grande bottom={420} color={C.blanco} tam={120}>
      <span style={{color: C.verde}}>aléjate</span>
    </Grande>
    <Grande bottom={300} color={C.blanco} tam={70}>más de 1.5 km</Grande>
  </AbsoluteFill>
);
export const M6H: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 760, height: 720, overflow: 'hidden'}}>
      <Img src={R6} style={{position: 'absolute', width: 760, top: 0}} />
    </div>
    <div style={{position: 'absolute', left: 760, top: 0, width: 520, height: 720, overflow: 'hidden', background: '#01040a'}}>
      <Img src={H6R} style={{position: 'absolute', width: 1000, left: -240, top: -110}} />
    </div>
    <div style={{position: 'absolute', left: 755, top: 0, width: 8, height: 720, background: C.cian, boxShadow: `0 0 30px 10px ${C.cian}99`}} />
    <div style={{position: 'absolute', left: 44, top: 40, fontFamily: TITULAR, fontWeight: 900, fontSize: 96, lineHeight: 0.98, color: C.rojo, textShadow: `0 0 40px ${C.rojo}aa, ${sombra}`}}>
      ¿UNA BOMBA?
    </div>
    <div style={{position: 'absolute', left: 44, bottom: 50}}>
      <Cita tam={48}>
        No: <span style={{color: C.verde}}>fertilizante</span>
      </Cita>
    </div>
    <Sello tam={96} />
  </AbsoluteFill>
);
