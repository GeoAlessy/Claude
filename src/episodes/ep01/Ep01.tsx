import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, LINEA} from '../../estilo';
import {clamp} from '../../anim';
import {FUENTE} from '../../fuentes';
import {Chato} from '../../characters/Chato';
import {Mama} from '../../characters/Mama';
import {Persona} from '../../characters/Persona';
import {Sala, SalaMarcoPuerta, SALA_PISO} from '../../backgrounds/Sala';
import {Cocina, COCINA_PISO} from '../../backgrounds/Cocina';
import {Calle, CALLE_VEREDA} from '../../backgrounds/Calle';
import {Oficina, OFICINA_PISO} from '../../backgrounds/Oficina';
import {Parque, PARQUE_PISO} from '../../backgrounds/Parque';
import {Sofa} from '../../props/Sofa';
import {OllaSopa} from '../../props/OllaSopa';
import {aPantalla, Cam, Camara} from '../../fx/ShakeCamera';
import {Poof} from '../../fx/Poof';
import {MarcadorEdad, MenosUnAno} from '../../fx/Contador';
import {Brillo} from '../../fx/Brillo';
import {Barrido, Iris} from '../../fx/Transicion';
import {Subtitulos} from '../../subtitles/Subtitulos';
import {GUION} from './guion';
import {DURACION, edadEn, ESC, Escena, GOLPES_OLLA, GUINO, YA_VOY} from './tiempos';

// ------------------------------------------------------------------
// Utilidades
// ------------------------------------------------------------------
const Lienzo: React.FC<{children: React.ReactNode; fondo?: string}> = ({children, fondo = C.fondo}) => (
  <AbsoluteFill style={{backgroundColor: fondo}}>
    <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute'}}>
      {children}
    </svg>
  </AbsoluteFill>
);

const hablaEn = (quien: string, g: number) => GUION.some((l) => l.quien === quien && g >= l.desde && g < l.hasta);
const golpesLocales = (e: Escena) => YA_VOY.filter((y) => y >= ESC[e][0] && y < ESC[e][1]).map((y) => y - ESC[e][0]);

/** Texto grande blanco con borde negro de 10 px. */
const Titulo: React.FC<{x: number; y: number; s: number; children: React.ReactNode; color?: string; pop?: number}> = ({x, y, s, children, color = C.blanco, pop = 1}) => (
  <g transform={`translate(${x},${y}) scale(${pop})`}>
    <text textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={s} fill={color} stroke="#000" strokeWidth={20} paintOrder="stroke" strokeLinejoin="round">
      {children}
    </text>
  </g>
);

/** POOF + −1 AÑO sobre la cabeza (en coordenadas de pantalla). */
const EfectoYaVoy: React.FC<{f: number; golpes: number[]; cabeza: [number, number]; escala?: number}> = ({f, golpes, cabeza, escala = 1}) => {
  const {fps} = useVideoConfig();
  return (
    <g>
      {golpes.map((g) => (
        <g key={g}>
          <Poof x={cabeza[0]} y={cabeza[1]} t={f - g} escala={escala} seed={g} />
          <MenosUnAno x={Math.min(cabeza[0], 640)} y={Math.max(cabeza[1] - 230 * escala, 470)} t={f - g - 2} fps={fps} escala={Math.min(1, escala)} />
        </g>
      ))}
    </g>
  );
};

// Posiciones del mundo de la sala
const CHATO_SOFA = {x: 640, y: 1440};
const SOFA = {x: 640, y: 1420};

// ------------------------------------------------------------------
// ESCENAS
// ------------------------------------------------------------------

/** 0:00–0:02.5 · Primer plano con zoom-in rápido + título. */
export const S1: React.FC<{f: number; conTexto?: boolean}> = ({f, conTexto = true}) => {
  const {fps} = useVideoConfig();
  const zoom = spring({frame: f, fps, config: {damping: 18, stiffness: 90}});
  const cam: Cam = {z: interpolate(zoom, [0, 1], [1.35, 1.8]), cx: 640, cy: 905};
  const p1 = spring({frame: f - 3, fps, config: {damping: 9, stiffness: 160}});
  const p2 = spring({frame: f - 13, fps, config: {damping: 9, stiffness: 160}});
  const p3 = spring({frame: f - 21, fps, config: {damping: 9, stiffness: 160}});
  return (
    <Lienzo>
      <Camara cam={cam} f={f}>
        <Sala frame={f} />
        <SalaMarcoPuerta />
        <Sofa {...SOFA} />
        <Chato {...CHATO_SOFA} pose="sentado" brazos="celular" mirada="celular" boca="sonrisa" edad={19} seed={1} />
      </Camara>
      {conTexto && (
        <g>
          <Titulo x={470} y={300} s={112} pop={p1}>
            EN ESTE MUNDO…
          </Titulo>
          <g transform={`translate(470,425) scale(${p2})`}>
            <text textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={92} stroke="#000" strokeWidth={20} paintOrder="stroke" strokeLinejoin="round" fill={C.blanco}>
              cada <tspan fill={C.rojo} fontSize={116}>“YA VOY”</tspan>
            </text>
          </g>
          <Titulo x={470} y={530} s={92} pop={p3}>
            te quita 1 año
          </Titulo>
        </g>
      )}
    </Lienzo>
  );
};

/** 0:02.5–0:05 · Plano general: la Mamá se asoma desde la cocina. */
const S2: React.FC<{f: number}> = ({f}) => {
  const {fps} = useVideoConfig();
  const g = f + ESC.s2[0];
  const asoma = spring({frame: f - 2, fps, config: {damping: 11, stiffness: 120}});
  const mx = interpolate(asoma, [0, 1], [-60, 226]);
  return (
    <Lienzo>
      <Camara cam={{z: 1.02, cx: 540, cy: 990}} f={f}>
        <Sala frame={g} />
        <g transform={`rotate(${interpolate(asoma, [0, 1], [-14, -5])},${mx},${SALA_PISO})`}>
          <Mama x={mx} y={SALA_PISO - 4} escala={0.8} brazos="asomar" expresion="grito" hablando={hablaEn('MAMÁ', g)} mirada={[10, 4]} squash={interpolate(asoma, [0, 0.6, 1], [1, 1.06, 1])} />
        </g>
        <SalaMarcoPuerta />
        <Sofa {...SOFA} />
        <Chato {...CHATO_SOFA} pose="sentado" brazos="celular" mirada="celular" edad={19} seed={1} />
      </Camara>
    </Lienzo>
  );
};

/** Primer plano del Chato diciendo "¡Ya voy!" (S3 y S5). */
const PrimerPlanoYaVoy: React.FC<{f: number; esc: Escena; cam: Cam; expresion?: 'normal' | 'aburrido'}> = ({f, esc, cam, expresion = 'normal'}) => {
  const {fps} = useVideoConfig();
  const g = f + ESC[esc][0];
  const golpes = golpesLocales(esc);
  const linea = GUION.find((l) => l.quien === 'CHATO' && g >= l.desde - 2 && g < l.hasta);
  const grito = linea ? spring({frame: g - linea.desde, fps, config: {damping: 6, stiffness: 200}}) : 1;
  const edad = edadEn(g);
  const head = aPantalla(cam, [CHATO_SOFA.x, CHATO_SOFA.y - 598]);
  return (
    <Lienzo>
      <Camara cam={cam} f={f} golpes={golpes}>
        <Sala frame={g} />
        <SalaMarcoPuerta />
        <Sofa {...SOFA} />
        <Chato
          {...CHATO_SOFA}
          pose="sentado"
          brazos="celular"
          mirada="celular"
          expresion={expresion}
          boca={linea ? 'grito' : 'cerrada'}
          hablando={!!linea}
          squash={linea ? interpolate(grito, [0, 1], [0.92, 1]) : 1}
          edad={edad}
          seed={1}
        />
      </Camara>
      <EfectoYaVoy f={f} golpes={golpes} cabeza={[head[0], head[1] - 40]} escala={1.5} />
    </Lienzo>
  );
};

/** 0:07–0:09.5 · Plano medio: la Mamá golpea la olla. */
const S4: React.FC<{f: number}> = ({f}) => {
  const g = f + ESC.s4[0];
  const golpe = Math.max(
    0,
    ...GOLPES_OLLA.map((h) => {
      const d = g - h;
      if (d < -6 || d > 8) return 0;
      return d < 0 ? interpolate(d, [-6, 0], [0, 1], {easing: Easing.in(Easing.quad)}) : interpolate(d, [0, 8], [1, 0]);
    }),
  );
  const golpesLoc = GOLPES_OLLA.map((h) => h - ESC.s4[0]);
  const vibra = Math.max(0, ...golpesLoc.map((h) => (f >= h && f < h + 14 ? 1 - (f - h) / 14 : 0)));
  const cam: Cam = {z: 1.32, cx: 560, cy: 1040};
  return (
    <Lienzo>
      <Camara cam={cam} f={f} golpes={golpesLoc} fuerza={12}>
        <Cocina frame={g} />
        <OllaSopa x={725} y={1128} escala={0.9} frame={g} vibra={vibra} />
        <Mama x={380} y={COCINA_PISO + 70} escala={0.95} brazos="golpe" golpe={golpe} expresion={hablaEn('MAMÁ', g) ? 'grito' : 'enojada'} hablando={hablaEn('MAMÁ', g)} mirada={[-6, 0]} />
      </Camara>
      {golpesLoc.map((h, i) => {
        const t = f - h;
        if (t < 0 || t > 14) return null;
        const s = interpolate(t, [0, 3, 14], [0.4, 1.15, 1], clamp);
        return (
          <g key={h} opacity={interpolate(t, [10, 14], [1, 0], clamp)}>
            <Titulo x={[700, 620, 760][i]} y={[620, 560, 650][i]} s={96} color={C.brillo} pop={s}>
              ¡CLANG!
            </Titulo>
          </g>
        );
      })}
    </Lienzo>
  );
};

/** 0:11–0:13 · "EDAD: 19 → 21" con contador girando. */
const S6: React.FC<{f: number}> = ({f}) => {
  const {fps} = useVideoConfig();
  const edad = interpolate(f, [10, 42], [19, 21], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const entra = spring({frame: f, fps, config: {damping: 10, stiffness: 140}});
  const flecha = spring({frame: f - 40, fps, config: {damping: 9}});
  return (
    <Lienzo fondo={C.pared}>
      <g transform={`translate(470,800) rotate(${f * 0.6})`}>
        {Array.from({length: 16}).map((_, i) => (
          <path key={i} d="M0,0 L-120,-1400 L120,-1400 Z" fill={C.fondo} transform={`rotate(${i * 22.5})`} opacity={0.6} />
        ))}
      </g>
      <MarcadorEdad x={470} y={640} edad={edad} escala={1.3 * entra} />
      <g transform={`translate(470,900) scale(${flecha})`}>
        <text textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={92} fill={C.blanco} stroke="#000" strokeWidth={20} paintOrder="stroke">
          19 <tspan fill={C.brillo}>→</tspan> 21
        </text>
      </g>
      <Chato x={470} y={1900} escala={0.72} edad={21} brazos="celular" mirada="celular" seed={4} />
    </Lienzo>
  );
};

type ConfigMontaje = {
  esc: Escena;
  fondo: (g: number, f: number) => React.ReactNode;
  piso: number;
  otro: React.ReactNode;
  cam: Cam;
  sentado?: boolean;
};

/** Escena del montaje rápido (0:13–0:20). */
const Montaje: React.FC<{f: number; cfg: ConfigMontaje}> = ({f, cfg}) => {
  const g = f + ESC[cfg.esc][0];
  const golpes = golpesLocales(cfg.esc);
  const edad = edadEn(g);
  const chato = cfg.sentado ? CHATO_SOFA : {x: 720, y: cfg.piso + 50};
  const esc = cfg.sentado ? 1 : 0.86;
  const alto = cfg.sentado ? 598 - 62 * interpolate(edad, [40, 78], [0, 1], clamp) : 748;
  const head = aPantalla(cfg.cam, [chato.x, chato.y - alto * esc]);
  return (
    <Lienzo>
      <Camara cam={cfg.cam} f={f} golpes={golpes}>
        {cfg.fondo(g, f)}
        {cfg.otro}
        {cfg.sentado && <Sofa {...SOFA} />}
        <Chato
          x={chato.x}
          y={chato.y}
          escala={esc}
          pose={cfg.sentado ? 'sentado' : 'parado'}
          brazos="celular"
          mirada="celular"
          expresion="aburrido"
          boca="cerrada"
          hablando={hablaEn('CHATO', g)}
          edad={edad}
          seed={2}
        />
      </Camara>
      <EfectoYaVoy f={f} golpes={golpes} cabeza={[head[0], head[1] - 30]} escala={1.1} />
    </Lienzo>
  );
};

const M1: React.FC<{f: number}> = ({f}) => {
  const g = f + ESC.m1[0];
  return (
    <Montaje
      f={f}
      cfg={{
        esc: 'm1',
        piso: CALLE_VEREDA,
        cam: {z: 1.12, cx: 500, cy: 1060},
        fondo: (gg) => <Calle frame={gg} />,
        otro: <Persona tipo="amigo" x={250} y={CALLE_VEREDA + 60} escala={0.84} hablando={hablaEn('AMIGO', g)} gesto={((f % 24) / 24)} />,
      }}
    />
  );
};

const M2: React.FC<{f: number}> = ({f}) => {
  const g = f + ESC.m2[0];
  return (
    <Montaje
      f={f}
      cfg={{
        esc: 'm2',
        piso: OFICINA_PISO,
        cam: {z: 1.1, cx: 510, cy: 1020, rot: 2},
        fondo: (gg, ff) => <Oficina frame={gg} minutos={600 + ff * 25} />,
        otro: <Persona tipo="jefe" x={250} y={OFICINA_PISO + 50} escala={0.86} hablando={hablaEn('JEFE', g)} gesto={(f % 16) / 16} boca="abierta" />,
      }}
    />
  );
};

const M3: React.FC<{f: number}> = ({f}) => {
  const g = f + ESC.m3[0];
  return (
    <Montaje
      f={f}
      cfg={{
        esc: 'm3',
        piso: PARQUE_PISO,
        cam: {z: 1.12, cx: 500, cy: 1040, rot: -2},
        fondo: (gg) => <Parque frame={gg} />,
        otro: <Persona tipo="chica" x={250} y={PARQUE_PISO + 60} escala={0.82} hablando={hablaEn('CHICA', g)} gesto={(f % 30) / 30} />,
      }}
    />
  );
};

const M4: React.FC<{f: number}> = ({f}) => {
  const g = f + ESC.m4[0];
  return (
    <Montaje
      f={f}
      cfg={{
        esc: 'm4',
        piso: SALA_PISO,
        sentado: true,
        cam: {z: 1.18, cx: 470, cy: 980},
        fondo: (gg) => (
          <g>
            <Sala frame={gg} />
            <Mama x={226} y={SALA_PISO - 4} escala={0.8} brazos="jarra" expresion={hablaEn('MAMÁ', g) ? 'grito' : 'enojada'} hablando={hablaEn('MAMÁ', g)} mirada={[10, 4]} />
            <SalaMarcoPuerta />
          </g>
        ),
        otro: null,
      }}
    />
  );
};

/** 0:20–0:22.7 · Plano general con zoom lento: el Chato de 78 años. */
const S8a: React.FC<{f: number}> = ({f}) => {
  const g = f + ESC.s8a[0];
  const edad = edadEn(g);
  const z = interpolate(f, [0, 80], [1.0, 1.14]);
  const telarana = interpolate(f, [10, 50], [0, 1], clamp);
  return (
    <Lienzo>
      <Camara cam={{z, cx: 600, cy: 1000}} f={f}>
        <Sala frame={g} telarana={telarana} />
        <SalaMarcoPuerta />
        <Sofa {...SOFA} />
        <Chato {...CHATO_SOFA} pose="sentado" brazos="baston" mirada="celular" expresion="aburrido" edad={edad} seed={3} />
        {/* polvo flotando */}
        {Array.from({length: 14}).map((_, i) => {
          const t = ((f + i * 11) % 80) / 80;
          return <circle key={i} cx={300 + ((i * 97) % 600) + Math.sin(t * 6 + i) * 20} cy={1300 - t * 600} r={4 + (i % 3)} fill="#fff" opacity={Math.sin(t * Math.PI) * 0.6} />;
        })}
      </Camara>
      {f > 4 && f < 60 && <Brillo x={540} y={760} t={f - 4} escala={0.9} />}
    </Lienzo>
  );
};

/** 0:22.7–0:24 · Inserto: el celular con "Batería 1%". */
const S8b: React.FC<{f: number}> = ({f}) => {
  const {fps} = useVideoConfig();
  const entra = spring({frame: f, fps, config: {damping: 14}});
  const parpadea = Math.floor(f / 6) % 2 === 0;
  const piel = C.chatoPiel;
  return (
    <Lienzo fondo="#E7A86F">
      <rect x={0} y={0} width={1080} height={1920} fill="#D9935A" />
      <g transform={`translate(470,${interpolate(entra, [0, 1], [1000, 760])}) rotate(-4)`}>
        {/* manos ancianas */}
        <ellipse cx={-250} cy={150} rx={90} ry={130} fill={piel} stroke={C.linea} strokeWidth={LINEA} />
        <ellipse cx={250} cy={170} rx={90} ry={130} fill={piel} stroke={C.linea} strokeWidth={LINEA} />
        <rect x={-240} y={-470} width={480} height={900} rx={60} fill="#3A3F4B" stroke={C.linea} strokeWidth={LINEA} />
        <rect x={-214} y={-440} width={428} height={840} rx={40} fill="#2A0E12" />
        <rect x={-50} y={-428} width={100} height={20} rx={10} fill="#11141A" />
        {/* batería */}
        <g transform="translate(0,-90)">
          <rect x={-120} y={-60} width={220} height={120} rx={22} fill="none" stroke="#fff" strokeWidth={14} />
          <rect x={102} y={-24} width={22} height={48} rx={6} fill="#fff" />
          {parpadea && <rect x={-104} y={-44} width={14} height={88} rx={6} fill={C.rojo} />}
        </g>
        <text x={0} y={110} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={86} fill="#fff">
          Batería
        </text>
        <text x={0} y={230} textAnchor="middle" fontFamily={FUENTE} fontWeight={800} fontSize={150} fill={C.rojo}>
          1%
        </text>
        {/* dedos con manchas de la edad */}
        {[-1, 1].map((s) => (
          <g key={s}>
            {[0, 1, 2].map((i) => (
              <ellipse key={i} cx={s * 222} cy={60 + i * 70} rx={44} ry={30} fill={piel} stroke={C.linea} strokeWidth={LINEA} />
            ))}
            <circle cx={s * 270} cy={200} r={10} fill={C.chatoPielSombra} />
            <circle cx={s * 240} cy={240} r={7} fill={C.chatoPielSombra} />
            <path d={`M${s * 200},${110} q${s * 20},6 ${s * 40},0`} stroke={C.chatoPielSombra} strokeWidth={4} fill="none" />
          </g>
        ))}
      </g>
    </Lienzo>
  );
};

/** 0:24–0:26 · Primer plano: baja el celular y mira hacia la cocina con ojos brillosos. */
const S9a: React.FC<{f: number}> = ({f}) => {
  const baja = interpolate(f, [4, 26], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const z = interpolate(f, [0, 60], [2.0, 2.25]);
  return (
    <Lienzo>
      <Camara cam={{z, cx: 620, cy: 960}} f={f}>
        <Sala frame={f + ESC.s9a[0]} telarana={1} />
        <SalaMarcoPuerta />
        <Sofa {...SOFA} />
        <Chato
          {...CHATO_SOFA}
          pose="sentado"
          brazos="baston"
          brazos2="bajarCel"
          mezclaBrazos={baja}
          mirada={f < 24 ? 'celular' : 'izquierda'}
          expresion={f < 24 ? 'aburrido' : 'brilloso'}
          boca={f < 24 ? 'cerrada' : 'triste'}
          edad={78}
          seed={3}
        />
      </Camara>
    </Lienzo>
  );
};

/** 0:26–0:28 · Se levanta con dificultad: "Ya… ya fui." */
const S9b: React.FC<{f: number}> = ({f}) => {
  const g = f + ESC.s9b[0];
  const tiembla = Math.sin(f * 1.7) * 0.03;
  const lev = interpolate(f, [4, 18, 24, 40], [0, 0.35, 0.3, 1], {...clamp, easing: Easing.inOut(Easing.quad)});
  const squash = interpolate(f, [2, 8, 18, 40, 46], [1, 0.93, 1.02, 0.97, 1], clamp) + (lev > 0 && lev < 1 ? tiembla : 0);
  return (
    <Lienzo>
      <Camara cam={{z: 1.3, cx: 600, cy: 1010}} f={f}>
        <Sala frame={g} telarana={1} />
        <SalaMarcoPuerta />
        <Sofa {...SOFA} />
        <Chato
          {...CHATO_SOFA}
          pose="sentado"
          levantarse={lev}
          brazos="soloBaston"
          mirada="izquierda"
          expresion="brilloso"
          boca={hablaEn('CHATO', g) ? 'abierta' : 'triste'}
          hablando={hablaEn('CHATO', g)}
          squash={squash}
          edad={78}
          seed={3}
        />
      </Camara>
    </Lienzo>
  );
};

/** 0:28–0:30.5 · Plano medio en la cocina: la Mamá sirve sopa, igualita. El Chato se queda helado. */
const S10a: React.FC<{f: number}> = ({f}) => {
  const g = f + ESC.s10a[0];
  return (
    <Lienzo>
      <Camara cam={{z: 1.12, cx: 545, cy: 1060}} f={f}>
        <Cocina frame={g} />
        <Mama x={320} y={COCINA_PISO + 70} escala={0.95} brazos="servir" expresion="tierna" mirada={[10, 0]} />
        {/* vapor de la sopa */}
        {[0, 1, 2].map((i) => {
          const t = ((f + i * 18) % 54) / 54;
          return (
            <path
              key={i}
              d={`M${290 + i * 30},${1150 - t * 140} q16,-24 0,-48 q-16,-24 0,-48`}
              stroke="#fff"
              strokeWidth={12}
              fill="none"
              strokeLinecap="round"
              opacity={Math.sin(t * Math.PI) * 0.85}
            />
          );
        })}
        <Chato x={770} y={COCINA_PISO + 90} escala={0.95} brazos="soloBaston" mirada="izquierda" expresion={f < 18 ? 'brilloso' : 'shock'} boca={f < 18 ? 'sonrisa' : 'o'} edad={78} seed={3} squash={f >= 18 && f < 26 ? 1.05 : 1} />
      </Camara>
    </Lienzo>
  );
};

/** 0:30.5–0:33 · Zoom dramático a la cara de shock del Chato. */
const S10b: React.FC<{f: number}> = ({f}) => {
  const {fps} = useVideoConfig();
  const zz = spring({frame: f, fps, config: {damping: 20, stiffness: 140}});
  const z = interpolate(zz, [0, 1], [1.7, 2.6]);
  return (
    <Lienzo>
      <Camara cam={{z, cx: 770, cy: 1110}} f={f} golpes={[0]} fuerza={14}>
        <Cocina frame={f + ESC.s10b[0]} />
        <Chato x={770} y={COCINA_PISO + 90} escala={0.95} brazos="soloBaston" mirada="frente" expresion="shock" boca="o" edad={78} seed={3} />
      </Camara>
      {/* líneas de impacto */}
      <g opacity={0.35}>
        {Array.from({length: 28}).map((_, i) => {
          const a = (i / 28) * Math.PI * 2;
          const r0 = 620 + (i % 3) * 60;
          return (
            <line key={i} x1={540 + Math.cos(a) * r0} y1={960 + Math.sin(a) * r0} x2={540 + Math.cos(a) * 1400} y2={960 + Math.sin(a) * 1400} stroke={C.linea} strokeWidth={10 + (i % 2) * 8} />
          );
        })}
      </g>
    </Lienzo>
  );
};

/** 0:33–0:36 · Primer plano de la Mamá: guiño a cámara + destello. */
const S11: React.FC<{f: number}> = ({f}) => {
  const g = f + ESC.s11[0];
  const t = g - GUINO;
  const cam: Cam = {z: interpolate(f, [0, 90], [2.15, 2.35]), cx: 340, cy: 1025};
  const ojo = aPantalla(cam, [320 + 42 * 0.95, COCINA_PISO + 70 - 735 * 0.95]);
  return (
    <Lienzo>
      <Camara cam={cam} f={f}>
        <Cocina frame={g} />
        <Mama x={320} y={COCINA_PISO + 70} escala={0.95} brazos="jarra" expresion={t >= 0 ? 'guino' : 'tierna'} mirada={[0, 0]} />
      </Camara>
      <Brillo x={ojo[0] + 120} y={ojo[1] - 110} t={t} escala={1.3} />
    </Lienzo>
  );
};

/** 0:36–0:38 · Pantalla final + iris que regresa al inicio (loop). */
const S12: React.FC<{f: number}> = ({f}) => {
  const {fps} = useVideoConfig();
  const p = (d: number) => spring({frame: f - d, fps, config: {damping: 9, stiffness: 170}});
  const sale = interpolate(f, [43, 47], [1, 0], clamp);
  const iris = interpolate(f, [46, 59], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});
  const rebote = Math.abs(Math.sin(f * 0.25)) * 30;
  const fondo = '#2E5EAA';
  return (
    <AbsoluteFill>
      {iris > 0 && <S1 f={0} conTexto={false} />}
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute'}}>
          {iris > 0 ? <Iris p={iris} color={fondo} /> : <rect width={1080} height={1920} fill={fondo} />}
          <g opacity={sale}>
            <Titulo x={470} y={520} s={100} pop={p(0)}>
              ETIQUETA AL
            </Titulo>
            <Titulo x={470} y={640} s={100} pop={p(4)}>
              QUE SIEMPRE DICE
            </Titulo>
            <Titulo x={470} y={830} s={170} color={C.rojo} pop={p(9)}>
              “YA VOY”
            </Titulo>
            {/* mano señalando hacia abajo (👇 dibujado) */}
            <g transform={`translate(470,${1030 + rebote}) scale(${p(14)})`}>
              <path d="M-40,-120 Q-40,-150 -14,-150 Q12,-150 12,-120 L12,-20 L20,-60 Q50,-70 56,-40 L60,-30 Q86,-40 92,-10 L94,0 Q118,-6 120,24 L118,90 Q110,170 30,180 L-30,180 Q-90,170 -100,100 L-110,30 Q-112,0 -84,0 Q-64,2 -54,30 L-40,40 Z" fill="#FFCC4D" stroke={C.linea} strokeWidth={LINEA} strokeLinejoin="round" transform="rotate(180)" />
            </g>
          </g>
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------
// AUDIO
// ------------------------------------------------------------------
const duck = (g: number): number => {
  let d = 0;
  for (const l of GUION) {
    const v = interpolate(g, [l.desde - 6, l.desde, l.hasta, l.hasta + 6], [0, 1, 1, 0], clamp);
    d = Math.max(d, v);
  }
  return d;
};

const Sfx: React.FC<{src: string; en: number; vol?: number; dur?: number}> = ({src, en, vol = 1, dur = 75}) => (
  <Sequence from={en} durationInFrames={dur} layout="none">
    <Audio src={staticFile(`audio/sfx/${src}`)} volume={vol} />
  </Sequence>
);

const Pista: React.FC = () => {
  const cortes = [ESC.m1[0], ESC.m2[0], ESC.m3[0], ESC.m4[0], ESC.s8a[0], ESC.s12[0]];
  return (
    <>
      <Audio src={staticFile('audio/musica/base_ep01.wav')} volume={(f) => 0.55 * (1 - 0.85 * duck(f)) * interpolate(f, [DURACION - 12, DURACION], [1, 0.6], clamp)} />
      {/* Voz real (cuando exista public/audio/voz_ep01.wav, descomentar):
      <Audio src={staticFile('audio/voz_ep01.wav')} /> */}
      <Sfx src="pop.wav" en={3} vol={0.6} />
      <Sfx src="pop.wav" en={13} vol={0.6} />
      <Sfx src="pop.wav" en={21} vol={0.6} />
      <Sfx src="whoosh.wav" en={ESC.s2[0] - 2} vol={0.35} />
      {YA_VOY.map((y) => (
        <React.Fragment key={y}>
          <Sfx src="poof.wav" en={y} vol={0.7} />
          <Sfx src="sacudida.wav" en={y} vol={0.55} />
          <Sfx src="bling.wav" en={y + 3} vol={0.45} />
        </React.Fragment>
      ))}
      {GOLPES_OLLA.map((h) => (
        <Sfx key={h} src="olla.wav" en={h} vol={0.55} />
      ))}
      <Sequence from={ESC.m1[0]} durationInFrames={ESC.m4[1] - ESC.m1[0]} layout="none">
        <Audio src={staticFile('audio/sfx/tictac.wav')} volume={0.55} />
      </Sequence>
      {cortes.map((c) => (
        <Sfx key={c} src="whoosh.wav" en={c - 4} vol={0.5} />
      ))}
      <Sfx src="destello.wav" en={ESC.s8a[0] + 4} vol={0.35} />
      <Sfx src="sacudida.wav" en={ESC.s10b[0]} vol={0.9} />
      <Sfx src="destello.wav" en={GUINO} vol={0.8} />
      <Sfx src="ding.wav" en={ESC.s12[0] + 6} vol={0.9} dur={60} />
    </>
  );
};

// ------------------------------------------------------------------
// COMPOSICIÓN PRINCIPAL
// ------------------------------------------------------------------
const ESCENAS: [Escena, React.FC<{f: number}>][] = [
  ['s1', ({f}) => <S1 f={f} />],
  ['s2', S2],
  ['s3', ({f}) => <PrimerPlanoYaVoy f={f} esc="s3" cam={{z: 2.25, cx: 640, cy: 945}} />],
  ['s4', S4],
  ['s5', ({f}) => <PrimerPlanoYaVoy f={f} esc="s5" expresion="aburrido" cam={{z: 2.6, cx: 610, cy: 930, rot: -4}} />],
  ['s6', S6],
  ['m1', M1],
  ['m2', M2],
  ['m3', M3],
  ['m4', M4],
  ['s8a', S8a],
  ['s8b', S8b],
  ['s9a', S9a],
  ['s9b', S9b],
  ['s10a', S10a],
  ['s10b', S10b],
  ['s11', S11],
  ['s12', S12],
];

const EnEscena: React.FC<{C: React.FC<{f: number}>}> = ({C: Comp}) => {
  const f = useCurrentFrame();
  return <Comp f={f} />;
};

export const Ep01: React.FC<{conAudio?: boolean}> = ({conAudio = true}) => {
  const g = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enMontaje = g >= ESC.m1[0] && g < ESC.m4[1];
  const ocultarSubs = g < ESC.s1[1] || g >= ESC.s12[0];
  const cortesBarrido = [ESC.m1[0], ESC.m2[0], ESC.m3[0], ESC.m4[0], ESC.s8a[0]];
  return (
    <AbsoluteFill style={{backgroundColor: C.fondo}}>
      {ESCENAS.map(([id, Comp]) => (
        <Sequence key={id} from={ESC[id][0]} durationInFrames={ESC[id][1] - ESC[id][0]} name={id}>
          <EnEscena C={Comp} />
        </Sequence>
      ))}
      <AbsoluteFill>
        <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute'}}>
          {enMontaje && <MarcadorEdad x={470} y={300} edad={edadEn(g)} escala={0.8} />}
          {cortesBarrido.map((c, i) => (
            <Barrido key={c} t={g - c} color={[C.polo, C.short, C.delantal, C.polo, C.portada][i]} />
          ))}
          {!ocultarSubs && <Subtitulos lineas={GUION} frame={g} fps={fps} />}
        </svg>
      </AbsoluteFill>
      {conAudio && <Pista />}
    </AbsoluteFill>
  );
};
