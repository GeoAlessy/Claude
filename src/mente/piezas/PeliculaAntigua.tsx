import React, {useMemo} from 'react';
import {AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import {C, MONO, SANS, semilla} from '../estilo';

// Filtro "película antigua / recuerdo": convierte cualquier clip (archivo de dominio público o stock gratis)
// a la estética del canal: color cálido gastado, parpadeo, temblor de proyector, grano, polvo, rayas y viñeta.
// Si el clip todavía no existe en public/, muestra una ranura con la descripción para poder montar el vídeo igual.

type Props = {
  src?: string; // ruta dentro de public/, p. ej. 'mente/clips/playa_1960.mp4' o una imagen .jpg/.png
  descripcion: string; // qué clip va aquí (se ve solo si falta el archivo)
  inicio?: number; // segundo del clip donde empezar
  intensidad?: number; // 0 = limpio · 1 = recuerdo muy gastado
  rotulo?: string; // texto pequeño tipo archivo: "HOME MOVIE · 1962"
  children?: React.ReactNode; // alternativa: una escena dibujada por código
};

export const PeliculaAntigua: React.FC<Props> = ({src, descripcion, inicio = 0, intensidad = 0.8, rotulo, children}) => {
  const f = useCurrentFrame();
  const azar = useMemo(() => semilla(99), []);
  const rayas = useMemo(() => Array.from({length: 40}, () => ({x: azar() * 1920, vida: 2 + Math.floor(azar() * 5), cuando: Math.floor(azar() * 400)})), [azar]);
  const motas = useMemo(() => Array.from({length: 60}, () => ({x: azar() * 1920, y: azar() * 1080, r: 1 + azar() * 3, cuando: Math.floor(azar() * 400)})), [azar]);

  // temblor de proyector y parpadeo (deterministas por fotograma)
  const tx = Math.sin(f * 1.7) * 1.5 * intensidad + Math.sin(f * 0.31) * 2 * intensidad;
  const ty = Math.sin(f * 2.3) * 1.2 * intensidad;
  const parpadeo = 1 - intensidad * 0.08 * (0.5 + 0.5 * Math.sin(f * 3.1) * Math.sin(f * 0.7));
  const filtroColor = `sepia(${0.55 * intensidad}) saturate(${1 - 0.35 * intensidad}) contrast(${1 + 0.12 * intensidad}) brightness(${parpadeo})`;

  const esVideo = src && /\.(mp4|webm|mov)$/i.test(src);
  const ciclo = f % 400;

  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${tx}px, ${ty}px) scale(1.03)`, filter: filtroColor}}>
        {src ? (
          esVideo ? (
            <OffthreadVideo src={staticFile(src)} startFrom={Math.round(inicio * 30)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          ) : (
            <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          )
        ) : children ? (
          children
        ) : (
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', background: C.tinta}}>
            <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: 6, color: C.oro}}>CLIP PENDIENTE</div>
            <div style={{fontFamily: SANS, fontSize: 34, color: C.luz, marginTop: 16, maxWidth: 1200, textAlign: 'center'}}>{descripcion}</div>
          </AbsoluteFill>
        )}
      </AbsoluteFill>

      {/* tinte cálido del recuerdo */}
      <AbsoluteFill style={{background: 'rgba(233, 194, 123, 0.10)', mixBlendMode: 'overlay', opacity: intensidad}} />

      <svg width={1920} height={1080} style={{position: 'absolute', opacity: intensidad}}>
        {/* rayas verticales que duran unos fotogramas */}
        {rayas.map((r, i) =>
          ciclo >= r.cuando && ciclo < r.cuando + r.vida ? (
            <line key={`r${i}`} x1={r.x} x2={r.x + 3} y1={0} y2={1080} stroke="rgba(255,250,235,0.35)" strokeWidth={1.2} />
          ) : null,
        )}
        {/* motas de polvo de un solo fotograma */}
        {motas.map((m, i) => (ciclo === m.cuando ? <circle key={`m${i}`} cx={m.x} cy={m.y} r={m.r} fill="rgba(20,15,10,0.8)" /> : null))}
      </svg>

      {/* grano */}
      <svg width={1920} height={1080} style={{position: 'absolute', opacity: 0.16 * intensidad, mixBlendMode: 'overlay'}}>
        <filter id="granoPeli">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 24} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={1920} height={1080} filter="url(#granoPeli)" />
      </svg>

      {/* viñeta de proyector, más marcada */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.85) 100%)', opacity: 0.6 + 0.4 * intensidad}} />

      {rotulo && (
        <div style={{position: 'absolute', left: 80, top: 60, fontFamily: MONO, fontSize: 20, letterSpacing: 6, color: 'rgba(244,239,230,0.7)'}}>{rotulo}</div>
      )}
    </AbsoluteFill>
  );
};
