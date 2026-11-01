import React from 'react';
import {
  AbsoluteFill,
  Freeze,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion';
import {C, MONO, TEXTO, TITULAR, Clave, Punto, seguirPunto} from '../estilo';
import {FlujoChevrones, Pastilla, Reticula} from '../hud';

// Gancho del piloto 01: "¿Por qué se detuvo la escalera de Trump?"
// Clip: r/LiveNews_24H (recortado a 9:16 y escalado con Real-ESRGAN).
// Los tiempos salen de la narración (tiempos.ts)
import {SEG, DURACION_GANCHO} from './tiempos';
export {SEG, DURACION_GANCHO};

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// Seguimiento manual (coordenadas en el lienzo 1080x1920)
const OBJETIVO_A: Clave<Punto>[] = [
  [0, [586, 660]],
  [10, [586, 660]],
  [30, [661, 698]],
  [45, [628, 680]],
  [55, [597, 718]],
  [65, [624, 680]],
  [75, [495, 755]],
  [81, [393, 775]],
];
const ESCALERA_A_DESDE: Clave<Punto>[] = [
  [0, [820, 800]],
  [40, [900, 840]],
  [81, [720, 900]],
];
const ESCALERA_A_HASTA: Clave<Punto>[] = [
  [0, [1050, 260]],
  [40, [1065, 330]],
  [81, [1050, 220]],
];
const OBJETIVO_D: Clave<Punto>[] = [
  [123, [620, 1150]],
  [189, [700, 1100]],
  [243, [640, 1050]],
];

// Velocidad de la escalera: 1 = en movimiento, 0 = detenida.
// Se frena durante el plano C, como indica la investigación de la ONU.
const FRENO_INICIO = SEG.C.desde + 10;
const FRENO_FIN = SEG.C.desde + 26;
function velocidad(f: number) {
  return interpolate(f, [FRENO_INICIO, FRENO_FIN], [1, 0], {...clamp, easing: Easing.out(Easing.quad)});
}
function avanceAcumulado(f: number) {
  let s = 0;
  for (let i = 0; i < f; i++) s += velocidad(i);
  return s * 0.022;
}

const Clip: React.FC<{archivo: string}> = ({archivo}) => (
  <OffthreadVideo src={staticFile(`porquepaso/p01/${archivo}`)} muted style={{width: 1080, height: 1920}} />
);

export const Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const detenida = frame >= FRENO_FIN;
  const colorEstado = frame < FRENO_INICIO ? C.verde : detenida ? C.rojo : C.ambar;
  const textoEstado = frame < FRENO_INICIO ? 'Escalera en movimiento' : detenida ? 'Escalera detenida' : 'Se está frenando…';
  const avance = avanceAcumulado(frame);

  // Congelado final
  const tc = frame - SEG.CONGELADO.desde;
  const enCongelado = tc >= 0;
  const zoom = enCongelado ? interpolate(tc, [0, SEG.CONGELADO.dur], [1, 1.07], clamp) : 1;
  const flash = enCongelado ? interpolate(tc, [0, 2, 8], [0, 0.7, 0], clamp) : 0;
  const oscuro = enCongelado ? interpolate(tc, [0, 10], [0, 0.45], clamp) : 0;
  const barrido = interpolate(tc, [SEG.CONGELADO.dur - 14, SEG.CONGELADO.dur], [-80, 2000], clamp);

  // Pregunta superior
  const entradaPregunta = 1; // visible desde el fotograma 0: es la miniatura en el feed
  const destelloRojo = frame >= FRENO_FIN && frame < FRENO_FIN + 12 && Math.floor(frame / 3) % 2 === 0;

  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* ---------- VIDEO ---------- */}
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <Sequence from={SEG.A.desde} durationInFrames={SEG.A.dur}>
          <Clip archivo="A.mp4" />
        </Sequence>
        <Sequence from={SEG.C.desde} durationInFrames={SEG.C.dur}>
          <Clip archivo="C.mp4" />
        </Sequence>
        <Sequence from={SEG.D.desde} durationInFrames={SEG.D.dur}>
          <Clip archivo="D.mp4" />
        </Sequence>
        <Sequence from={SEG.E.desde} durationInFrames={SEG.E.dur}>
          <Clip archivo="E.mp4" />
        </Sequence>
        <Sequence from={SEG.F.desde} durationInFrames={SEG.CONGELADO.desde - SEG.F.desde}>
          <Clip archivo="F.mp4" />
        </Sequence>
        <Sequence from={SEG.CONGELADO.desde} durationInFrames={SEG.CONGELADO.dur}>
          <Freeze frame={Math.max(0, SEG.CONGELADO.desde - SEG.F.desde - 1)}>
            <Clip archivo="F.mp4" />
          </Freeze>
        </Sequence>
      </AbsoluteFill>

      {/* viñeta sutil para que el HUD resalte */}
      <AbsoluteFill
        style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)'}}
      />

      {/* ---------- INDICADORES ---------- */}
      {frame < SEG.C.desde && (
        <>
          <FlujoChevrones
            desde={seguirPunto(frame, ESCALERA_A_DESDE)}
            hasta={seguirPunto(frame, ESCALERA_A_HASTA)}
            avance={avance}
            color={C.verde}
            opacidad={interpolate(frame, [4, 12], [0, 1], clamp)}
          />
          <Reticula centro={seguirPunto(frame, OBJETIVO_A)} radio={150} inicio={6} fin={SEG.A.dur - 6} etiqueta="Trump y Melania" />
        </>
      )}

      {frame >= SEG.C.desde && frame < SEG.D.desde && (
        <FlujoChevrones desde={[1000, 1760]} hasta={[120, 1060]} avance={avance} color={colorEstado} n={6} />
      )}

      {frame >= SEG.D.desde && frame < SEG.F.desde && (
        <Reticula
          centro={seguirPunto(frame, OBJETIVO_D)}
          radio={230}
          color={C.rojo}
          inicio={SEG.D.desde + 4}
          fin={SEG.F.desde - 2}
          etiqueta="Sube a pie"
          ladoEtiqueta="izq"
        />
      )}

      {/* estado de la escalera */}
      {frame >= SEG.F.desde && !enCongelado && (
        <div style={{position: 'absolute', left: 60, top: 1240}}>
          <Pastilla color={C.blanco} tam={30}>
            Donald Trump
          </Pastilla>
        </div>
      )}
      {frame < SEG.F.desde && (
        <div style={{position: 'absolute', left: 60, top: 1240, opacity: interpolate(frame, [6, 14], [0, 1], clamp)}}>
          <Pastilla color={colorEstado} punto tam={32}>
            {textoEstado}
          </Pastilla>
        </div>
      )}

      {/* ---------- CONGELADO ---------- */}
      <AbsoluteFill style={{background: `rgba(0,0,0,${oscuro})`}} />
      <AbsoluteFill style={{background: `rgba(255,255,255,${flash})`}} />
      {enCongelado && (
        <>
          <div
            style={{
              position: 'absolute',
              top: 860,
              width: '100%',
              textAlign: 'center',
              fontFamily: TITULAR,
              fontWeight: 900,
              fontSize: 116,
              color: C.rojo,
              textShadow: `0 0 40px ${C.rojo}88, 0 6px 0 rgba(0,0,0,0.6)`,
              transform: `scale(${spring({frame: tc - 3, fps, config: {damping: 12, stiffness: 180}})})`,
            }}
          >
            ¿SABOTAJE?
          </div>

          {/* barrido de escaneo: anticipa la transición al holograma 3D */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: barrido,
              width: '100%',
              height: 6,
              background: C.cian,
              boxShadow: `0 0 40px 18px ${C.cian}88`,
            }}
          />
        </>
      )}

      {/* ---------- TEXTO FIJO ---------- */}
      <div
        style={{
          position: 'absolute',
          top: 230,
          left: 60,
          right: 60,
          fontFamily: TITULAR,
          fontWeight: 900,
          fontSize: 78,
          lineHeight: 1.05,
          color: C.blanco,
          textShadow: '0 4px 24px rgba(0,0,0,0.85), 0 2px 0 rgba(0,0,0,0.9)',
          opacity: entradaPregunta,
          transform: `translateY(${(1 - entradaPregunta) * -30}px)`,
        }}
      >
        ¿Por qué{' '}
        <span style={{color: destelloRojo ? C.rojo : C.cian}}>se detuvo</span>
        <br />
        la escalera de Trump?
      </div>
      <div
        style={{
          position: 'absolute',
          top: 170,
          left: 62,
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: 1.5,
          color: 'rgba(248,250,252,0.75)',
          textShadow: '0 2px 8px rgba(0,0,0,0.9)',
        }}
      >
        VIDEO · r/LiveNews_24H
      </div>
    </AbsoluteFill>
  );
};
