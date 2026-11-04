import React from 'react';
import {AbsoluteFill, Audio, Easing, Freeze, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {PALABRAS} from './subtitulos';
import {CLIPS, DURACION_S01, FIN, FPS, INICIO, M, MEDIDOR, PLANOS, VOZ_ORDEN} from './tiempos';
import {MARCADOR, PANEL, S, SUB} from '../estilo';
import {Contador, Letra, Mano, Sello, Tarjeta, Trazo, circuloMano, flechaMano} from '../dibujo';

// =====================================================================
// Survive 01 · "Could a human survive Homer's fall into Springfield Gorge?"
// Clips mudos de la serie + voz + dibujos a plumón + tarjetas de cuaderno.
// =====================================================================
export {DURACION_S01};

// Clips escalados con Real-ESRGAN (fuentes_video/escalar_s01.sh). Para trabajar rápido: 'clips_previa'.
export const CARPETA_CLIPS: string = 'clips';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- Clip ----------
function archivoDe(src: number) {
  let mejor = 'caida';
  for (const n of Object.keys(CLIPS)) if (src >= CLIPS[n] && CLIPS[n] >= CLIPS[mejor]) mejor = n;
  return mejor;
}

const Clip: React.FC<{p: (typeof PLANOS)[number]}> = ({p}) => {
  const f = useCurrentFrame(); // relativo al plano
  const dur = p.hasta - p.desde;
  const archivo = archivoDe(p.src);
  const trim = Math.round((p.src - CLIPS[archivo]) * FPS);
  // zoom lento + "golpe" de zoom en el impacto
  let zoom = interpolate(f, [0, dur], p.zoom, clamp);
  let dx = 0;
  let dy = 0;
  if (p.sacudir) {
    const k = f - 8;
    if (k >= 0) {
      zoom *= 1 + 0.16 * Math.exp(-k / 5);
      const a = 34 * Math.exp(-k / 3.5);
      dx = Math.sin(k * 2.7) * a;
      dy = Math.cos(k * 3.3) * a;
    }
  }
  const H = PANEL.h * zoom;
  const W = (H * 16) / 9;
  const left = Math.min(0, Math.max(PANEL.w - W, PANEL.w / 2 - p.cx * W)) + dx;
  const top = Math.min(0, Math.max(PANEL.h - H, PANEL.h / 2 - (p.cy ?? 0.5) * H)) + dy;
  const video = (
    <OffthreadVideo
      src={staticFile(`survive/s01/${CARPETA_CLIPS}/${archivo}.mp4`)}
      muted
      trimBefore={trim}
      playbackRate={p.vel}
      style={{position: 'absolute', left, top, width: W, height: H}}
    />
  );
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      {p.congela !== undefined ? (
        <Freeze frame={p.congela} active={(fr) => fr >= p.congela!}>
          {video}
        </Freeze>
      ) : (
        video
      )}
      {/* destello blanco en el impacto */}
      {p.sacudir && <AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [7, 8, 12], [0, 0.75, 0], clamp)}} />}
      {/* destello corto en cada corte */}
      <AbsoluteFill style={{background: '#fff', opacity: interpolate(f, [0, 3], [0.25, 0], clamp)}} />
    </AbsoluteFill>
  );
};

const Panel: React.FC = () => (
  <div style={{position: 'absolute', left: PANEL.x, top: PANEL.y, width: PANEL.w, height: PANEL.h, overflow: 'hidden', background: '#000'}}>
    {PLANOS.map((p, i) => (
      <Sequence key={i} from={p.desde} durationInFrames={p.hasta - p.desde}>
        <Clip p={p} />
      </Sequence>
    ))}
    <Dibujos />
    {/* bordes del panel, como recortado a plumón */}
    <div style={{position: 'absolute', inset: 0, boxShadow: `inset 0 10px 0 ${S.tinta}, inset 0 -10px 0 ${S.tinta}`}} />
  </div>
);

// ---------- Fondo de cuaderno ----------
const Fondo: React.FC = () => (
  <AbsoluteFill
    style={{
      background: S.papel,
      backgroundImage: `repeating-linear-gradient(0deg, transparent 0 46px, ${S.linea} 46px 48px)`,
    }}
  />
);

// ---------- Medidor de supervivencia (arriba) ----------
const Medidor: React.FC = () => {
  const f = useCurrentFrame();
  const v = interpolate(f, MEDIDOR.map((m) => m[0]), MEDIDOR.map((m) => m[1]), {...clamp, easing: Easing.inOut(Easing.cubic)});
  const color = v > 45 ? S.verde : v > 20 ? '#F59E0B' : S.rojo;
  const latido = 1 + 0.06 * Math.max(0, Math.sin(f / 3)) * (v < 15 ? 1 : 0);
  const muerto = f >= M.KILLS;
  return (
    <div style={{position: 'absolute', left: 60, top: 70, width: 960}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontFamily: MARCADOR, color: S.tinta}}>
        <span style={{fontSize: 46, transform: 'rotate(-2deg)'}}>SURVIVAL CHANCE</span>
        <span style={{fontSize: 74, color: muerto ? S.rojo : S.tinta, transform: `scale(${latido})`}}>{muerto ? '☠ 0%' : `${Math.round(v)}%`}</span>
      </div>
      <div style={{marginTop: 10, height: 64, borderRadius: 18, border: `7px solid ${S.tinta}`, background: S.papelClaro, overflow: 'hidden', transform: 'rotate(-0.6deg)'}}>
        <div
          style={{
            width: `${v}%`,
            height: '100%',
            background: color,
            backgroundImage: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.25) 0 14px, transparent 14px 28px)',
            borderRight: v > 0 ? `6px solid ${S.tinta}` : 'none',
          }}
        />
      </div>
    </div>
  );
};

// ---------- Cuerpo (tarjeta de los golpes) ----------
const PARTES = [
  {nombre: 'RIBS', x: 100, y: 128, rx: 44, ry: 26},
  {nombre: 'SPLEEN', x: 128, y: 160, rx: 22, ry: 18},
  {nombre: 'LUNGS', x: 100, y: 108, rx: 48, ry: 30},
  {nombre: 'SKULL', x: 100, y: 44, rx: 36, ry: 36},
];

const Cuerpo: React.FC = () => {
  const f = useCurrentFrame();
  let activa = -1;
  M.PARTE.forEach((m, i) => {
    if (f >= m - 2) activa = i;
  });
  const golpes = M.HIT.filter((h) => f >= h).length;
  return (
    <Tarjeta x={650} y={30} w={390} h={560} desde={M.HIT[0] - 2} hasta={INICIO['06_twist'] + 6} rot={3}>
      <Mano tam={58} style={{position: 'absolute', left: 78, top: 20}}>
        HIT <span style={{color: S.rojo}}>{golpes}</span>/4
      </Mano>
      <svg viewBox="0 0 200 300" style={{position: 'absolute', left: 30, top: 90, width: 330, height: 460}}>
        <g fill="none" stroke={S.tinta} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx={100} cy={44} r={30} />
          <path d="M88,74 L88,84 L60,92 Q48,96 46,112 L40,190 M112,74 L112,84 L140,92 Q152,96 154,112 L160,190" />
          <path d="M62,96 L64,196 L136,196 L138,96" />
          <path d="M72,196 L74,290 M128,196 L126,290 M100,200 L100,240" />
          {/* costillas */}
          <path d="M76,112 Q100,104 124,112 M74,126 Q100,118 126,126 M74,140 Q100,132 126,140" strokeWidth={3} opacity={0.5} />
        </g>
        {PARTES.map((p, i) =>
          i <= activa ? (
            <g key={i} opacity={i === activa ? 1 : 0.45}>
              <ellipse cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} fill="rgba(244,63,63,0.35)" stroke={S.rojo} strokeWidth={5} />
              <path d={`M${p.x - 10},${p.y - 10} L${p.x + 10},${p.y + 10} M${p.x + 10},${p.y - 10} L${p.x - 10},${p.y + 10}`} stroke={S.rojo} strokeWidth={6} strokeLinecap="round" />
            </g>
          ) : null,
        )}
      </svg>
    </Tarjeta>
  );
};

// ---------- La azafata que sobrevivió (tarjeta) ----------
const Azafata: React.FC = () => {
  const f = useCurrentFrame();
  const d0 = M.ATTENDANT;
  return (
    <Tarjeta x={80} y={170} w={920} h={700} desde={d0 - 4} hasta={FIN['07_alive'] + 3} rot={-2}>
      <Mano tam={64} style={{position: 'absolute', left: 90, top: 30}}>
        REAL CASE · 1972
      </Mano>
      <svg viewBox="0 0 920 700" style={{position: 'absolute', inset: 0}}>
        {/* avión */}
        <g transform="translate(120,150)" fill="none" stroke={S.tinta} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
          <path d="M0,40 L190,40 Q225,40 225,58 Q225,74 190,74 L20,74 Q0,74 0,58 Z" />
          <path d="M90,40 L130,-10 L150,-10 L130,40 M90,74 L130,124 L150,124 L130,74 M10,40 L0,0 L22,0 L40,40" />
        </g>
        {/* caída punteada */}
        <path d="M260,250 Q300,420 300,630" fill="none" stroke={S.azul} strokeWidth={8} strokeDasharray="4 22" strokeLinecap="round" opacity={interpolate(f, [d0 + 2, d0 + 10], [0, 1], clamp)} />
        <Trazo d={flechaMano(300, 560, 300, 640, 0)} desde={d0 + 8} dur={6} color={S.azul} ancho={8} />
      </svg>
      <Letra texto="10 km" x={620} y={300} desde={M.SIXMILE - 4} tam={130} color={S.amarillo} rot={-6} />
      <Letra texto="(6.3 miles)" x={620} y={410} desde={M.SIXMILE + 2} tam={58} color={S.blanco} rot={-4} contorno={7} />
      <Letra texto="SURVIVED ✓" x={600} y={560} desde={M.SIXMILE + 8} tam={96} color={S.verde} rot={-5} />
      <Mano tam={40} color="rgba(27,27,31,0.65)" style={{position: 'absolute', left: 90, bottom: 26}}>
        Vesna Vulović, flight attendant
      </Mano>
    </Tarjeta>
  );
};

// ---------- Veredicto ----------
const Veredicto: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      <Tarjeta x={90} y={150} w={900} h={470} desde={M.FIRST - 6} rot={-2}>
        <Mano tam={92} style={{position: 'absolute', left: 90, top: 70}}>
          FALL #1 → {f >= M.MAYBE ? <span style={{color: '#16A34A'}}>MAYBE ✓</span> : '…'}
        </Mano>
        <Mano tam={92} style={{position: 'absolute', left: 90, top: 230}}>
          FALL #2 → {f >= M.KILLS ? <span style={{color: S.rojo}}>DEAD ☠</span> : f >= M.SECOND ? '…' : ''}
        </Mano>
      </Tarjeta>
      <Sello texto="DEAD" x={540} y={860} desde={M.KILLS} tam={200} />
    </>
  );
};

// ---------- Todos los dibujos sobre el clip (coordenadas del panel 1080x1350) ----------
const Dibujos: React.FC = () => {
  const f = useCurrentFrame();
  const fin01 = FIN['01_hook'];
  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${PANEL.w} ${PANEL.h}`} style={{position: 'absolute', inset: 0}}>
        {/* 01 · círculo alrededor de Homer */}
        <Trazo d={circuloMano(540, 700, 300, 330)} desde={40} dur={10} color={S.amarillo} hasta={fin01 + 2} />
        {/* 02 · subrayado */}
        <Trazo d="M300,300 Q540,280 790,296" desde={INICIO['02_math'] + 6} dur={6} hasta={FIN['02_math'] + 2} />
        {/* 03 · regla de altura */}
        <Trazo d="M140,150 L140,1180 M100,150 L180,150 M100,1180 L180,1180" desde={INICIO['03_deep']} dur={10} hasta={FIN['03_deep'] + 2} />
        {/* 04 · líneas de velocidad */}
        {[0, 1, 2].map((i) => (
          <Trazo key={i} d={`M${110 + i * 70},${200 + i * 40} L${110 + i * 70},${580 + i * 40}`} desde={INICIO['04_speed'] + 4 + i * 2} dur={5} hasta={FIN['04_speed'] + 2} ancho={8} />
        ))}
        {/* 05 · flecha hacia abajo desde el borde */}
        <Trazo d={flechaMano(540, 380, 540, 1000, 0.1)} desde={INICIO['05_hits'] + 6} dur={9} hasta={M.HIT[0] - 8} color={S.amarillo} />
        {/* 05 · un círculo rojo en cada golpe */}
        {M.HIT.map((h, i) => (
          <Trazo key={i} d={circuloMano(430, 680, 250, 220)} desde={h + 1} dur={6} hasta={M.HIT[i + 1] ? M.HIT[i + 1] - 8 : INICIO['06_twist'] - 3} color={S.rojo} ancho={12} />
        ))}
        {/* 07 · latido (sigue vivo) */}
        <Trazo d="M40,960 L300,960 L340,880 L380,1060 L420,900 L450,960 L1040,960" desde={M.ALIVE - 2} dur={10} hasta={M.ATTENDANT - 4} color={S.verde} ancho={11} />
        {/* 09 · segunda caída */}
        <Trazo d={flechaMano(780, 300, 700, 900, -0.2)} desde={M.SAME} dur={8} hasta={FIN['09_again'] + 2} color={S.rojo} />
      </svg>

      {/* 01 · titular del gancho */}
      <Letra texto="COULD A HUMAN" x={540} y={140} desde={0} hasta={fin01 + 2} tam={104} color={S.blanco} rot={-3} dur={1} />
      <Letra texto="SURVIVE THIS?" x={540} y={268} desde={0} hasta={fin01 + 2} tam={124} color={S.amarillo} rot={-3} dur={1} />
      {/* 02 */}
      <Letra texto="LET'S DO THE MATH ✏" x={540} y={230} desde={INICIO['02_math']} hasta={FIN['02_math'] + 2} tam={84} color={S.blanco} rot={-3} />
      {/* 03 */}
      <Letra texto="≈ 100 m" x={420} y={560} desde={INICIO['03_deep'] + 2} hasta={FIN['03_deep'] + 2} tam={120} rot={-6} />
      <Letra texto="= 30 FLOORS" x={430} y={700} desde={M.DEEP} hasta={FIN['03_deep'] + 2} tam={92} color={S.blanco} rot={-4} />
      {/* 04 */}
      <Contador claves={[[INICIO['04_speed'], 0], [M.HUNDRED + 6, 100]]} x={500} y={860} desde={INICIO['04_speed']} hasta={FIN['04_speed'] + 2} sufijo="MPH" tam={190} />
      <Letra texto="(160 km/h)" x={500} y={1000} desde={M.HUNDRED + 6} hasta={FIN['04_speed'] + 2} tam={64} color={S.blanco} rot={-5} contorno={7} />
      {/* 05 */}
      <Letra texto="NOT CLEAN…" x={540} y={250} desde={INICIO['05_hits'] + 8} hasta={M.HIT[0] - 8} tam={100} color={S.blanco} rot={-4} />
      {M.PARTE.map((m, i) => (
        <Letra key={i} texto={`${PARTES[i].nombre}!`} x={330} y={330} desde={m - 1} hasta={M.HIT[i + 1] ? M.HIT[i + 1] - 8 : INICIO['06_twist'] - 3} tam={120} color={S.rojo} rot={-8} dur={3} />
      ))}
      {/* 06 */}
      <Letra texto="TWIST!" x={330} y={240} desde={M.TWIST - 1} hasta={M.EVERY - 2} tam={150} color={S.amarillo} rot={-9} dur={3} />
      <Contador claves={[[M.STEALS, 100], [M.ROCKS, 70], [FIN['06_twist'], 45]]} x={540} y={300} desde={M.STEALS - 2} hasta={FIN['06_twist'] + 3} sufijo="MPH" tam={160} color={S.verde} rot={-4} />
      <Letra texto="ROCKS = BRAKES" x={540} y={470} desde={M.BRAKING - 2} hasta={FIN['06_twist'] + 3} tam={88} color={S.blanco} rot={-3} />
      {/* 07 */}
      <Letra texto="ALIVE?!" x={540} y={300} desde={M.ALIVE} hasta={M.ATTENDANT - 4} tam={150} color={S.verde} rot={-6} dur={3} />
      <Azafata />
      {/* 08 */}
      <Letra texto="BUT THEN…" x={540} y={620} desde={INICIO['08_but']} hasta={FIN['08_but'] + 3} tam={150} color={S.blanco} rot={-4} dur={4} />
      {/* 09 */}
      <Letra texto="SAME ROCKS" x={420} y={260} desde={M.SAME} hasta={M.ALL - 2} tam={110} color={S.rojo} rot={-6} dur={3} />
      <Letra texto="FALL #2" x={540} y={300} desde={M.ALL} hasta={FIN['09_again'] + 3} tam={150} color={S.rojo} rot={-7} dur={3} />
      <Cuerpo />
      {/* 10 */}
      <Veredicto />
    </AbsoluteFill>
  );
};

// ---------- Subtítulos palabra por palabra ----------
const SIN_SUB = new Set(['01_hook', '08_but']);
type Palabra = [string, number, number];
function bloques(ps: Palabra[]): Palabra[][] {
  const out: Palabra[][] = [];
  let a: Palabra[] = [];
  for (const p of ps) {
    a.push(p);
    if (a.length >= 3 || /[.,:;?!…]$/.test(p[0])) {
      out.push(a);
      a = [];
    }
  }
  if (a.length) out.push(a);
  return out;
}

const Subtitulos: React.FC = () => {
  const f = useCurrentFrame();
  for (const id of VOZ_ORDEN) {
    if (SIN_SUB.has(id)) continue;
    const t = (f - INICIO[id]) / FPS;
    const ps = PALABRAS[id];
    if (t < 0 || t > ps[ps.length - 1][2] + 0.1) continue;
    const bs = bloques(ps);
    const b = bs.find((bl, i) => t < (bs[i + 1]?.[0][1] ?? Infinity) && t >= bl[0][1] - 0.05) ?? bs[bs.length - 1];
    let activa = 0;
    b.forEach(([, a], i) => {
      if (t >= a - 0.02) activa = i;
    });
    const esc = interpolate((t - b[0][1]) * FPS, [0, 3], [0.8, 1], {...clamp, easing: Easing.out(Easing.back(2.5))});
    return (
      <div style={{position: 'absolute', top: 1390, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            transform: `scale(${esc})`,
            fontFamily: SUB,
            fontWeight: 800,
            fontSize: 84,
            textAlign: 'center',
            padding: '0 70px',
            lineHeight: 1.05,
            WebkitTextStroke: `14px ${S.tinta}`,
            paintOrder: 'stroke fill',
            textShadow: '0 7px 0 rgba(0,0,0,0.5)',
          }}
        >
          {b.map(([w, a], i) => (
            <span key={i} style={{color: i === activa ? S.amarillo : t >= a - 0.02 ? S.blanco : 'rgba(255,255,255,0.6)'}}>
              {w.toUpperCase()}{' '}
            </span>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const Firma: React.FC = () => (
  <div style={{position: 'absolute', left: 0, right: 0, top: 1676, textAlign: 'center', fontFamily: MARCADOR, fontSize: 44, color: S.tinta, transform: 'rotate(-1.5deg)'}}>
    COULD YOU SURVIVE IT? <span style={{color: S.rojo}}>#001</span>
  </div>
);

// ---------- Audio ----------
const SFX: [string, number, number][] = [];
PLANOS.forEach((p, i) => {
  if (i > 0 && !p.sacudir) SFX.push(['swish', p.desde - 2, 0.22]);
});
M.HIT.forEach((h) => {
  SFX.push(['bonk', h, 0.75]);
  SFX.push(['impacto', h, 0.35]);
});
SFX.push(
  ['plumon', 38, 0.35],
  ['pop', INICIO['02_math'], 0.4],
  ['plumon', INICIO['03_deep'], 0.4],
  ['ding', M.DEEP, 0.35],
  ['plumon', INICIO['04_speed'] + 2, 0.3],
  ['ding', M.HUNDRED + 6, 0.4],
  ['pop', M.TWIST, 0.5],
  ['ding', M.BRAKING, 0.3],
  ['pop', M.ALIVE, 0.45],
  ['swish', M.ATTENDANT - 5, 0.3],
  ['ding', M.SIXMILE + 8, 0.45],
  ['riser', INICIO['08_but'] - 12, 0.25],
  ['bonk', M.SAME, 0.6],
  ['bonk', M.ALL + 4, 0.6],
  ['swish', M.FIRST - 7, 0.3],
  ['ding', M.MAYBE, 0.35],
  ['sello', M.KILLS, 0.95],
);

function volMusica(f: number) {
  const base = 0.12;
  const pausa = interpolate(f, [INICIO['08_but'] - 4, INICIO['08_but'], FIN['08_but'] + 2, FIN['08_but'] + 8], [1, 0.25, 0.25, 1], clamp);
  const ext = interpolate(f, [0, 4, DURACION_S01 - 12, DURACION_S01], [0, 1, 1, 0], clamp);
  return base * pausa * ext;
}

export const Survive01: React.FC = () => {
  return (
    <AbsoluteFill style={{background: S.papel}}>
      <Fondo />
      <Panel />
      <Medidor />
      <Subtitulos />
      <Firma />

      <Audio src={staticFile('survive/sfx/musica.wav')} volume={volMusica} />
      {VOZ_ORDEN.map((id) => (
        <Sequence key={id} from={INICIO[id]}>
          <Audio src={staticFile(`survive/s01/voz/${id}.mp3`)} volume={1} />
        </Sequence>
      ))}
      {SFX.map(([n, desde, vol], i) => (
        <Sequence key={i} from={Math.max(0, desde)}>
          <Audio src={staticFile(`survive/sfx/${n}.wav`)} volume={vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
