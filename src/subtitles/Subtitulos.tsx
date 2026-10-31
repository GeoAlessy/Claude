import React from 'react';
import {spring} from 'remotion';
import {C} from '../estilo';
import {FUENTE} from '../fuentes';

export type Palabra = {texto: string; desde: number; hasta: number; yaVoy: boolean};
export type LineaSub = {texto: string; desde: number; hasta: number};

const RE_YAVOY = /^ya\s+vo+y/i;

/**
 * Divide una línea en palabras con tiempos proporcionales a su largo.
 * ("ya voy" se agrupa como una sola unidad). Si hay tiempos de whisper, se usan esos en su lugar.
 */
export const palabrasDeLinea = (l: LineaSub): Palabra[] => {
  const crudas = l.texto.split(/\s+/).filter(Boolean);
  const unidades: {t: string; yv: boolean}[] = [];
  for (let i = 0; i < crudas.length; i++) {
    const par = `${crudas[i]} ${crudas[i + 1] ?? ''}`.replace(/[¡!¿?'"…,.]/g, '');
    if (RE_YAVOY.test(par)) {
      unidades.push({t: `${crudas[i]} ${crudas[i + 1]}`, yv: true});
      i++;
    } else unidades.push({t: crudas[i], yv: false});
  }
  const pesos = unidades.map((u) => Math.max(2, u.t.replace(/[^\p{L}]/gu, '').length) + 2);
  const total = pesos.reduce((a, b) => a + b, 0);
  let acc = l.desde;
  return unidades.map((u, i) => {
    const d = ((l.hasta - l.desde) * pesos[i]) / total;
    const p = {texto: u.t, desde: Math.round(acc), hasta: Math.round(acc + d), yaVoy: u.yv};
    acc += d;
    return p;
  });
};

/** Agrupa en bloques de 1 a 3 palabras ("YA VOY" va solo). */
export const bloques = (ps: Palabra[]): Palabra[][] => {
  const out: Palabra[][] = [];
  let cur: Palabra[] = [];
  for (const p of ps) {
    if (p.yaVoy) {
      if (cur.length) out.push(cur);
      out.push([p]);
      cur = [];
      continue;
    }
    cur.push(p);
    const fin = /[.,!?…]$/.test(p.texto);
    if (cur.length === 3 || fin) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out;
};

const ANCHO_SEGURO = 860; // 1080 − 140 (franja derecha) − 80 de margen
const CX = 470; // centro de la zona segura horizontal (40..900)
const Y = 1920 * 0.62;

/** Subtítulos karaoke. Palabra activa en amarillo con rebote; "YA VOY" en rojo y más grande. */
export const Subtitulos: React.FC<{lineas: LineaSub[]; frame: number; fps: number}> = ({lineas, frame, fps}) => {
  const linea = lineas.find((l) => frame >= l.desde && frame < l.hasta + 6);
  if (!linea) return null;
  const bs = bloques(palabrasDeLinea(linea));
  const bloque = bs.find((b, i) => frame < (bs[i + 1]?.[0].desde ?? linea.hasta + 6)) ?? bs[bs.length - 1];
  const esYaVoy = bloque.length === 1 && bloque[0].yaVoy;
  const base = esYaVoy ? 150 : 96;
  const largo = bloque.map((p) => p.texto).join(' ').length;
  const tam = Math.min(base, (ANCHO_SEGURO / Math.max(1, largo)) * 1.85);
  const entra = spring({frame: frame - bloque[0].desde, fps, config: {damping: 12, stiffness: 220}});
  return (
    <g transform={`translate(${CX},${Y}) scale(${0.7 + 0.3 * entra})`}>
      <text
        textAnchor="middle"
        fontFamily={FUENTE}
        fontWeight={800}
        fontSize={tam}
        stroke="#000"
        strokeWidth={20}
        paintOrder="stroke"
        strokeLinejoin="round"
      >
        {(() => {
          let prev = 0;
          return bloque.map((p, i) => {
          const activa = frame >= p.desde && frame < p.hasta + 4;
          const rebote = activa ? spring({frame: frame - p.desde, fps, config: {damping: 8, stiffness: 300}}) : 1;
          const color = p.yaVoy ? C.rojo : activa ? C.brillo : C.blanco;
          const off = activa ? -(1 - rebote) * 22 : 0;
          const dy = off - prev;
          prev = off;
          return (
            <tspan key={i} fill={color} dy={dy}>
              {(i ? ' ' : '') + p.texto.toUpperCase()}
            </tspan>
          );
          });
        })()}
      </text>
    </g>
  );
};
