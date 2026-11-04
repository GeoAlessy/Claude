import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, FPS, MONO, SANS, SERIF, rango, suave} from '../estilo';
import {Escribe, Teclea} from './TextoAnimado';

// Prueba 01 del capítulo 1: "cierra los ojos y cuenta hasta 30".
// Izquierda: el cronómetro y la consigna. Derecha: una ventana con alguien haciendo la prueba (stock real)
// y, cuando el narrador habla de los fallos, tarjetas de resultados (ilustrativos) que invitan a comentar.
// La voz guía toda la prueba: este gráfico solo acompaña cada fase.
// Fotogramas relativos al inicio de la pieza:
//   cerrar   → consigna + pulso de 1 s + entra la ventana
//   crono    → el cronómetro empieza a correr
//   fallos   → tarjetas de resultados
//   comentar → "Comment your result"

type Props = {cerrar: number; crono: number; fallos: number; comentar: number};

const RESULTADOS = [
  {t: '26.4 s', nota: 'clock running fast', color: C.luna},
  {t: '30.0 s', nota: 'almost perfect', color: C.oro},
  {t: '35.1 s', nota: 'clock running slow', color: C.luna},
];

const VENTANA = {x: 1020, y: 170, w: 760, h: 428};

export const PruebaContar: React.FC<Props> = ({cerrar, crono, fallos, comentar}) => {
  const f = useCurrentFrame();
  const entrada = rango(f, 0, 18, 0, 1, suave);
  const tVentana = rango(f, 8, 30, 0, 1, suave);
  const tComentar = rango(f, comentar, comentar + 18, 0, 1, suave);

  // pulso de un segundo (como el latido de la cuenta)
  const desdeCerrar = Math.max(0, f - cerrar);
  const pulso = f >= cerrar ? Math.exp(-((desdeCerrar % FPS) / 6)) : 0;
  const latidos = f >= cerrar ? Math.floor(desdeCerrar / FPS) + 1 : 0;

  const segundos = f >= crono ? (f - crono) / FPS : 0;
  const cronoTxt = `${(Math.floor(segundos) < 10 ? '0' : '') + Math.floor(segundos)}.${Math.floor((segundos % 1) * 10)}`;

  // la ventana sube un poco cuando llegan las tarjetas
  const subeVentana = rango(f, fallos, fallos + 20, 0, 1, suave) * -40;
  const primerVideo = Math.round((7.6 / 0.8) * 30);

  return (
    <AbsoluteFill style={{opacity: entrada}}>
      {/* ---------- izquierda: cronómetro ---------- */}
      <div style={{position: 'absolute', left: 140, top: 120, fontFamily: MONO, fontSize: 22, letterSpacing: 8, color: C.oro}}>
        <Teclea texto="TEST 01 · YOUR INTERNAL CLOCK" desde={4} />
      </div>
      <div style={{position: 'absolute', left: 120, top: 210, width: 820, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{position: 'relative', width: 400, height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <svg width={400} height={400} style={{position: 'absolute'}}>
            <circle cx={200} cy={200} r={180} fill="none" stroke={C.nieblaSuave} strokeWidth={3} />
            {Array.from({length: 30}, (_, i) => {
              const a = (i / 30) * 2 * Math.PI;
              const encendido = segundos >= i + 1;
              return (
                <line
                  key={i}
                  x1={200 + Math.sin(a) * 158}
                  y1={200 - Math.cos(a) * 158}
                  x2={200 + Math.sin(a) * 168}
                  y2={200 - Math.cos(a) * 168}
                  stroke={encendido ? C.oro : C.nieblaSuave}
                  strokeWidth={i % 5 === 0 ? 3 : 1.5}
                />
              );
            })}
            <circle
              cx={200}
              cy={200}
              r={180}
              fill="none"
              stroke={C.oro}
              strokeWidth={5}
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 180}
              strokeDashoffset={2 * Math.PI * 180 * (1 - Math.min(1, segundos / 30))}
              transform="rotate(-90 200 200)"
            />
            <circle cx={200} cy={200} r={140 + pulso * 14} fill="none" stroke={C.oro} strokeOpacity={pulso * 0.6} strokeWidth={2} />
          </svg>
          <div style={{fontFamily: MONO, fontSize: 96, color: C.luz}}>{cronoTxt}</div>
        </div>
        <div style={{fontFamily: SERIF, fontSize: 66, color: C.luz, marginTop: 44, textAlign: 'center', minHeight: 80}}>
          {f >= cerrar - 2 && <Escribe texto="Close your eyes. *Count to 30.*" desde={cerrar} ritmo={5} />}
        </div>
        <div style={{fontFamily: SANS, fontSize: 26, color: C.niebla, marginTop: 14, opacity: rango(f, cerrar + 20, cerrar + 35)}}>
          {latidos > 0 ? `one second per beat · ${latidos}` : ''}
        </div>
      </div>

      {/* ---------- derecha: ventana con alguien haciendo la prueba ---------- */}
      <div
        style={{
          position: 'absolute',
          left: VENTANA.x,
          top: VENTANA.y + subeVentana,
          width: VENTANA.w,
          height: VENTANA.h,
          borderRadius: 18,
          overflow: 'hidden',
          border: `1px solid ${C.oroSuave}`,
          boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
          opacity: tVentana,
          transform: `translateY(${(1 - tVentana) * 40}px) scale(${0.96 + 0.04 * tVentana})`,
        }}
      >
        {f >= 8 && (
          <Sequence from={8} layout="none">
            <Sequence durationInFrames={primerVideo} layout="none">
              <OffthreadVideo src={staticFile('mente/clips/s09_ojos_mano_pecho.mp4')} playbackRate={0.8} muted style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.8) contrast(1.05)'}} />
            </Sequence>
            <Sequence from={primerVideo} layout="none">
              <OffthreadVideo src={staticFile('mente/clips/s10_ojos_respira.mp4')} playbackRate={0.7} muted style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.8) contrast(1.05)'}} />
            </Sequence>
          </Sequence>
        )}
        <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(5,7,15,0.0) 55%, rgba(5,7,15,0.75) 100%)'}} />
        <div style={{position: 'absolute', left: 24, bottom: 20, display: 'flex', alignItems: 'center', gap: 12}}>
          <div style={{width: 10, height: 10, borderRadius: 5, background: C.oro, opacity: 0.5 + 0.5 * pulso}} />
          <div style={{fontFamily: MONO, fontSize: 18, letterSpacing: 5, color: C.luz}}>
            <Teclea texto="TRY IT WITH ME" desde={30} cursor="transparent" />
          </div>
        </div>
      </div>

      {/* ---------- derecha abajo: resultados ---------- */}
      <div style={{position: 'absolute', left: VENTANA.x, top: VENTANA.y + VENTANA.h + 20, width: VENTANA.w, display: 'flex', flexDirection: 'column', gap: 14}}>
        {RESULTADOS.map((r, i) => {
          const t = rango(f, fallos + i * 10, fallos + i * 10 + 16, 0, 1, suave);
          return (
            <div
              key={r.t}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 22,
                padding: '12px 22px',
                borderRadius: 12,
                background: 'rgba(11, 16, 36, 0.85)',
                border: `1px solid ${r.color === C.oro ? C.oroSuave : C.nieblaSuave}`,
                opacity: t,
                transform: `translateX(${(1 - t) * 60}px)`,
              }}
            >
              <div style={{fontFamily: MONO, fontSize: 34, color: r.color, width: 140}}>{r.t}</div>
              <div style={{fontFamily: SANS, fontSize: 22, color: C.niebla}}>{r.nota}</div>
            </div>
          );
        })}
        <div style={{fontFamily: SANS, fontSize: 18, color: C.gris, marginTop: 2}}>
          {f >= fallos && <Teclea texto="illustrative results · most people miss by several seconds" desde={fallos + 30} cps={60} cursor="transparent" />}
        </div>
      </div>

      {/* ---------- invitación a comentar ---------- */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 70,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 34,
            color: C.noche,
            background: C.oro,
            borderRadius: 40,
            padding: '14px 36px',
            opacity: tComentar,
            transform: `scale(${0.9 + 0.1 * tComentar})`,
          }}
        >
          {f >= comentar && <Escribe texto="Comment your result ↓" desde={comentar + 4} ritmo={4} colorBase={C.noche} />}
        </div>
      </div>
    </AbsoluteFill>
  );
};
