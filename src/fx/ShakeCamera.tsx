import React from 'react';
import {random, useCurrentFrame} from 'remotion';

export type Cam = {z: number; cx: number; cy: number; rot?: number};

/** Desplazamiento de sacudida (4 frames) para una lista de frames locales. */
export const sacudida = (frame: number, golpes: number[], fuerza = 22): [number, number] => {
  for (const g of golpes) {
    const d = frame - g;
    if (d >= 0 && d < 4) {
      const k = (1 - d / 4) * fuerza;
      return [(random(`sx${g}-${d}`) - 0.5) * 2 * k, (random(`sy${g}-${d}`) - 0.5) * 2 * k];
    }
  }
  return [0, 0];
};

/** Mundo → pantalla (para colocar efectos en coordenadas de pantalla). */
export const aPantalla = (cam: Cam, p: [number, number]): [number, number] => [540 + (p[0] - cam.cx) * cam.z, 960 + (p[1] - cam.cy) * cam.z];

/** Cámara virtual: zoom/encuadre + micro-zoom lento continuo + sacudidas. */
export const Camara: React.FC<{cam: Cam; f?: number; golpes?: number[]; fuerza?: number; children: React.ReactNode}> = ({cam, f: fProp, golpes = [], fuerza, children}) => {
  const fActual = useCurrentFrame();
  const f = fProp ?? fActual;
  const [dx, dy] = sacudida(f, golpes, fuerza);
  const z = cam.z * (1 + f * 0.0007); // micro-zoom: algo siempre se mueve
  return (
    <g transform={`translate(${540 + dx},${960 + dy}) rotate(${cam.rot ?? 0}) scale(${z}) translate(${-cam.cx},${-cam.cy})`}>{children}</g>
  );
};
