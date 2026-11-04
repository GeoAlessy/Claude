import React from 'react';
import {AbsoluteFill, Easing, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {Clip, Rotulo, SOMBRA, trazo} from './opciones2';
import {DanoPantalla, GOLPES, NIVELES, SEG3, Textos, desdeGolpe, sacude, valor} from './opciones3';

// =====================================================================
// Opciones v4 (tanda C): 5 barras más, cada una con su letra.
// =====================================================================
['Anton', 'VT323', 'Teko', 'Creepster', 'RubikMonoOne'].forEach((f) => loadFont({family: f, url: staticFile(`fonts/${f}-latin.woff2`), weight: '400'}));

const AM = '#FFD90F';
const NEG = '#0E0E12';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------------- 6 · Termómetro de peligro (vertical, sube hacia la calavera) ----------------
const Termometro: React.FC = () => {
  const f = useCurrentFrame();
  const riesgo = 100 - valor(f);
  const k = desdeGolpe(f);
  const alto = 420;
  const lleno = (alto * riesgo) / 100;
  const color = riesgo < 50 ? '#F59E0B' : riesgo < 75 ? '#F97316' : '#EF4444';
  return (
    <div style={{position: 'absolute', left: 40, top: 130, width: 190, height: 620, transform: `translateX(${sacude(k, 10)}px)`, filter: SOMBRA}}>
      <div style={{position: 'absolute', left: 52, top: 0, fontSize: 86, transform: `scale(${riesgo > 75 ? 1 + 0.1 * Math.sin(f / 2) : 1})`}}>💀</div>
      <div style={{position: 'absolute', left: 58, top: 104, width: 74, height: alto + 20, borderRadius: 37, background: 'rgba(255,255,255,0.92)', border: `8px solid ${NEG}`, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 10, right: 10, bottom: 10, height: lleno, borderRadius: 20, background: `linear-gradient(0deg, ${color}, #FDE047)`, boxShadow: `0 0 20px ${color}`}} />
        {Array.from({length: 9}).map((_, i) => <div key={i} style={{position: 'absolute', right: 0, top: 30 + i * 46, width: 20, height: 5, background: NEG}} />)}
      </div>
      <div style={{position: 'absolute', left: 40, top: alto + 100, width: 110, height: 110, borderRadius: 55, background: color, border: `8px solid ${NEG}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Anton', fontSize: 44, color: '#fff', ...trazo(6)}}>
        {Math.round(riesgo)}%
      </div>
      <div style={{position: 'absolute', left: 160, top: 260, fontFamily: 'Anton', fontSize: 52, lineHeight: 1, color: '#fff', whiteSpace: 'nowrap', ...trazo(10)}}>
        DANGER
        <br />
        <span style={{color}}>LEVEL</span>
      </div>
    </div>
  );
};

// ---------------- 7 · "Homer.exe" cargando (ventana de computadora vieja) ----------------
const Exe: React.FC = () => {
  const f = useCurrentFrame();
  const v = valor(f);
  const k = desdeGolpe(f);
  const bloques = Math.round(v / 5);
  const error = v < 15;
  return (
    <div style={{position: 'absolute', left: 50, top: 130, width: 680, transform: `translate(${sacude(k, 12)}px, 0)`, filter: SOMBRA}}>
      <div style={{background: '#C0C0C0', border: '4px solid', borderColor: '#fff #404040 #404040 #fff', boxShadow: `0 0 0 4px ${NEG}`}}>
        <div style={{background: 'linear-gradient(90deg,#000080,#1084D0)', color: '#fff', fontFamily: 'VT323', fontSize: 40, padding: '2px 12px', display: 'flex', justifyContent: 'space-between'}}>
          <span>Survival.exe</span>
          <span>✕</span>
        </div>
        <div style={{padding: '14px 18px 18px'}}>
          <div style={{fontFamily: 'VT323', fontSize: 40, color: NEG}}>{error ? 'Homer.exe has stopped responding' : 'Running homer_body.exe...'}</div>
          <div style={{marginTop: 10, height: 48, background: '#fff', border: '3px solid', borderColor: '#404040 #fff #fff #404040', padding: 4, display: 'flex', gap: 4}}>
            {Array.from({length: 20}).map((_, i) => (
              <div key={i} style={{width: 25, background: i < bloques ? (error ? '#C00000' : '#000080') : 'transparent'}} />
            ))}
          </div>
          <div style={{fontFamily: 'VT323', fontSize: 44, color: error ? '#C00000' : NEG, marginTop: 6}}>{Math.round(v)}% alive</div>
        </div>
      </div>
    </div>
  );
};

// ---------------- 8 · Nivel de peligro por franjas (tipo alerta de sirena) ----------------
const NIV = [
  ['SAFE', '#22C55E'],
  ['OUCH', '#A3E635'],
  ['BAD', '#FACC15'],
  ['VERY BAD', '#F97316'],
  ['DEADLY', '#EF4444'],
] as const;
const Alerta: React.FC = () => {
  const f = useCurrentFrame();
  const riesgo = 100 - valor(f);
  const nivel = Math.min(4, Math.floor((riesgo - 20) / 16));
  const k = desdeGolpe(f);
  const sirena = nivel >= 3 && Math.floor(f / 5) % 2 === 0;
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 130, transform: `translateX(${sacude(k, 10)}px)`, filter: SOMBRA}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10}}>
        <div style={{width: 64, height: 64, borderRadius: '32px 32px 8px 8px', background: sirena ? '#FF2D2D' : '#7F1D1D', border: `6px solid ${NEG}`, boxShadow: sirena ? '0 0 40px #FF2D2D' : 'none'}} />
        <div style={{fontFamily: 'Teko', fontSize: 72, lineHeight: 0.9, color: '#fff', letterSpacing: 2, ...trazo(9)}}>
          DANGER: <span style={{color: NIV[Math.max(0, nivel)][1]}}>{NIV[Math.max(0, nivel)][0]}</span>
        </div>
      </div>
      <div style={{display: 'flex', gap: 8}}>
        {NIV.map(([n, c], i) => (
          <div key={n} style={{flex: 1, height: 54, transform: 'skewX(-14deg)', background: i <= nivel ? c : 'rgba(14,14,18,0.6)', border: `5px solid ${NEG}`, boxShadow: i === nivel ? `0 0 26px ${c}` : 'none', scale: i === nivel ? `${1 + 0.06 * Math.max(0, Math.sin(f / 2))}` : '1'}} />
        ))}
      </div>
    </div>
  );
};

// ---------------- 9 · Contador de calaveras (se llenan con cada golpe) ----------------
const Calaveras: React.FC = () => {
  const f = useCurrentFrame();
  const k = desdeGolpe(f);
  const llenas = GOLPES.filter((g) => f >= g).length;
  return (
    <div style={{position: 'absolute', left: 50, top: 130, filter: SOMBRA}}>
      <div style={{fontFamily: 'Creepster', fontSize: 68, color: '#fff', letterSpacing: 3, ...trazo(9)}}>
        DEATH METER <span style={{color: '#A3E635'}}>{llenas}/5</span>
      </div>
      <div style={{display: 'flex', gap: 14, marginTop: 6}}>
        {Array.from({length: 5}).map((_, i) => {
          const activa = i < llenas;
          const nueva = i === llenas - 1 && k >= 0 && k < 10;
          return (
            <div
              key={i}
              style={{
                width: 120,
                height: 120,
                borderRadius: 30,
                border: `7px solid ${NEG}`,
                background: activa ? 'radial-gradient(circle at 40% 35%, #BEF264, #4D7C0F)' : 'rgba(14,14,18,0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 74,
                filter: activa ? 'none' : 'grayscale(1) opacity(0.35)',
                transform: `scale(${nueva ? 1 + 0.35 * (1 - k / 10) : 1}) rotate(${nueva ? sacude(k, 20) : 0}deg)`,
                boxShadow: activa ? '0 0 26px rgba(163,230,53,0.7)' : 'none',
              }}
            >
              💀
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------- 10 · Probabilidades como marcador deportivo (dígitos que giran) ----------------
const Digito: React.FC<{d: number}> = ({d}) => (
  <div style={{width: 74, height: 108, overflow: 'hidden', background: 'linear-gradient(180deg,#1F2937 0%,#111827 50%,#1F2937 100%)', borderRadius: 10, border: `5px solid ${NEG}`, position: 'relative'}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: -d * 98 + 2, transition: 'none'}}>
      {Array.from({length: 10}).map((_, i) => (
        <div key={i} style={{height: 98, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'RubikMonoOne', fontSize: 70, color: AM}}>
          {i}
        </div>
      ))}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 49, height: 4, background: 'rgba(0,0,0,0.6)'}} />
  </div>
);
const Odometro: React.FC = () => {
  const f = useCurrentFrame();
  // "1 en N" de sobrevivir: N crece con cada golpe y los dígitos ruedan
  const v = valor(f);
  const n = Math.round(interpolate(v, [NIVELES[4], NIVELES[0]], [9999, 2], {...clamp, easing: Easing.in(Easing.exp)}));
  const txt = ('0000' + String(n)).slice(-4);
  const k = desdeGolpe(f);
  return (
    <div style={{position: 'absolute', left: 50, top: 130, transform: `translateX(${sacude(k, 10)}px)`, filter: SOMBRA}}>
      <div style={{fontFamily: 'RubikMonoOne', fontSize: 36, color: '#fff', ...trazo(8)}}>ODDS OF SURVIVING</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 10}}>
        <div style={{fontFamily: 'RubikMonoOne', fontSize: 56, color: '#fff', ...trazo(9)}}>1 IN</div>
        {txt.split('').map((c: string, i: number) => (
          <Digito key={i} d={Number(c)} />
        ))}
      </div>
    </div>
  );
};

const OPCIONES4: {nombre: string; fuentes: string; barra: React.FC; fuente: string; acento: string; escala?: number}[] = [
  {nombre: 'TERMÓMETRO DE PELIGRO', fuentes: 'Barra, títulos y subtítulos: Anton', barra: Termometro, fuente: 'Anton', acento: '#F97316'},
  {nombre: 'HOMER.EXE (WINDOWS 95)', fuentes: 'Barra, títulos y subtítulos: VT323', barra: Exe, fuente: 'VT323', acento: '#1084D0', escala: 1.05},
  {nombre: 'NIVEL DE PELIGRO CON SIRENA', fuentes: 'Barra, títulos y subtítulos: Teko', barra: Alerta, fuente: 'Teko', acento: '#FACC15', escala: 1.1},
  {nombre: 'CONTADOR DE CALAVERAS', fuentes: 'Barra, títulos y subtítulos: Creepster', barra: Calaveras, fuente: 'Creepster', acento: '#A3E635'},
  {nombre: 'PROBABILIDADES (1 EN N)', fuentes: 'Barra, títulos y subtítulos: Rubik Mono One', barra: Odometro, fuente: 'RubikMonoOne', acento: AM, escala: 0.7},
];

export const DUR_BARRAS4 = SEG3 * OPCIONES4.length;

export const DemoBarras4: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {OPCIONES4.map((o, i) => {
      const B = o.barra;
      return (
        <Sequence key={i} from={i * SEG3} durationInFrames={SEG3}>
          <AbsoluteFill style={{overflow: 'hidden'}}>
            <Sequence durationInFrames={46}>
              <Clip src={1221.8} vel={1.1} cx={0.5} zoom={[1.0, 1.15]} dur={46} />
            </Sequence>
            <Sequence from={46}>
              <Clip src={1229.5} vel={1.0} cx={0.45} zoom={[1.05, 1.2]} dur={SEG3 - 46} />
            </Sequence>
          </AbsoluteFill>
          <DanoPantalla />
          <B />
          <Textos fuente={o.fuente} acento={o.acento} escala={o.escala} />
          <Rotulo n={i + 6} nombre={o.nombre} fuentes={o.fuentes} />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
